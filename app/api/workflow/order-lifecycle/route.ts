import "server-only";
import { serve } from "@upstash/workflow/nextjs";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { notifyAdminsAboutOrder } from "@/lib/whatsapp";
import { maskPhone } from "@/lib/pii/mask";
import type { OrderRow } from "@/lib/orders/shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OrderLifecyclePayload = {
    orderId: string;
};

function deliveryStartIso(order: OrderRow): string | null {
    if (!order.start_date) return null;
    const time = order.delivery_time?.match(/^\d{2}:\d{2}$/)
        ? order.delivery_time
        : "12:00";
    const iso = `${order.start_date}T${time}:00`;
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function reminderTimestamp(order: OrderRow): Date | null {
    const start = deliveryStartIso(order);
    if (!start) return null;
    return new Date(new Date(start).getTime() - 24 * 60 * 60 * 1000);
}

export const { POST } = serve<OrderLifecyclePayload>(async (context) => {
    const { orderId } = context.requestPayload;

    const order = await context.run("load-order", async () => {
        const supabase = createSupabaseServiceClient();
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();
        if (error || !data) throw new Error(`order not found: ${orderId}`);
        return data as OrderRow;
    });

    // Step 1 — make sure the operator has been notified, even if the QStash
    // queue route already ran. notifyAdminsAboutOrder is idempotent enough
    // because the receiver checks `whatsapp_notified` first.
    await context.run("notify-operator", async () => {
        const supabase = createSupabaseServiceClient();
        const { data } = await supabase
            .from("orders")
            .select("whatsapp_notified")
            .eq("id", orderId)
            .single();
        if (data?.whatsapp_notified) return { skipped: true };
        const result = await notifyAdminsAboutOrder(order);
        await supabase
            .from("orders")
            .update({
                whatsapp_notified: result.success,
                whatsapp_error: result.error,
            })
            .eq("id", orderId);
        if (!result.success) throw new Error(result.error ?? "WA send failed");
        return { ok: true };
    });

    // Step 2 — 24h-before-delivery reminder (rent only).
    if (order.mode === "rent") {
        const reminderAt = reminderTimestamp(order);
        if (reminderAt && reminderAt.getTime() > Date.now()) {
            await context.sleepUntil("wait-pre-delivery", reminderAt);

            await context.run("send-delivery-reminder", async () => {
                console.info("[workflow] delivery reminder", {
                    orderId,
                    customer: maskPhone(order.customer_phone),
                });
                // operator-owned: drop in your "rent_reminder_24h" template here
            });
        }
    }

    // Step 3 — follow-up 7 days after delivery / completion.
    await context.sleep("wait-followup", "7d");
    await context.run("send-followup", async () => {
        console.info("[workflow] follow-up", { orderId });
        const supabase = createSupabaseServiceClient();
        await supabase
            .from("orders")
            .update({ followup_sent_at: new Date().toISOString() })
            .eq("id", orderId)
            .then(({ error }) => {
                if (error && error.code !== "PGRST204") {
                    console.warn("[workflow] followup persist failed", error);
                }
            });
    });
});
