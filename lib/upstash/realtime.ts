import "server-only";
import { Realtime } from "@upstash/realtime";
import { z } from "zod";
import { redis } from "@/lib/upstash/redis";

export const REALTIME_SCHEMA = {
    "new-order": z.object({
        orderId: z.string(),
        orderNumber: z.string(),
        dollName: z.string(),
        customerName: z.string(),
        total: z.number(),
        mode: z.enum(["rent", "buy"]),
        createdAt: z.string(),
    }),
} as const;

export type RealtimeOpts = {
    schema: typeof REALTIME_SCHEMA;
    redis: NonNullable<typeof redis>;
};

type RealtimeInstance = Realtime<RealtimeOpts>;

declare global {
    // eslint-disable-next-line no-var
    var __artisanRealtime: RealtimeInstance | null | undefined;
}

function buildRealtime(): RealtimeInstance | null {
    if (!redis) return null;
    return new Realtime<RealtimeOpts>({ schema: REALTIME_SCHEMA, redis });
}

export const realtime: RealtimeInstance | null =
    globalThis.__artisanRealtime !== undefined
        ? globalThis.__artisanRealtime
        : (globalThis.__artisanRealtime = buildRealtime());

export async function emitNewOrder(payload: {
    orderId: string;
    orderNumber: string;
    dollName: string;
    customerName: string;
    total: number;
    mode: "rent" | "buy";
    createdAt: string;
}): Promise<void> {
    if (!realtime) return;
    try {
        await realtime.emit("new-order", payload);
    } catch (err) {
        console.warn("[realtime] failed to emit new-order", err);
    }
}
