import "server-only";
import { withSignatureVerification } from "@/lib/upstash/qstash-receiver";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { maskEmail } from "@/lib/pii/mask";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request: Request) {
    const { orderId } = (await request.json()) as { orderId?: string };

    if (!orderId) {
        return Response.json({ error: "missing orderId" }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
        .from("orders")
        .select("id, customer_email, customer_name, order_number, doll_name, total_label, mode")
        .eq("id", orderId)
        .single();

    if (error || !data) return new Response(null, { status: 200 });

    // Only attempt delivery for orders that captured an email at checkout.
    if (!data.customer_email) {
        return Response.json({ ok: true, skipped: "no-email" });
    }

    // The actual email transport (Resend / Postmark / Brevo) is wired in by the
    // operator. We log + persist a "sent" flag so the cron sweeper does not
    // re-enqueue. Replace the console.info below with the chosen provider call.
    console.info("[order-email] dispatch", {
        to: maskEmail(data.customer_email),
        orderNumber: data.order_number,
        dollName: data.doll_name,
    });

    await supabase
        .from("orders")
        .update({
            confirmation_email_sent_at: new Date().toISOString(),
        })
        .eq("id", data.id)
        .then(({ error: updateError }) => {
            if (updateError && updateError.code !== "PGRST204") {
                // PGRST204 = column missing — fail silently until the migration ships.
                console.warn("[order-email] update failed", updateError);
            }
        });

    return Response.json({ ok: true });
}

export const POST = withSignatureVerification(handler);
