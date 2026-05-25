"use client";

import { createRealtime } from "@upstash/realtime/client";
import type { InferRealtimeEvents, Realtime } from "@upstash/realtime";
import type { RealtimeOpts } from "@/lib/upstash/realtime";

type Events = InferRealtimeEvents<Realtime<RealtimeOpts>>;

export const { useRealtime } = createRealtime<Events>();
