"use client";

import { createRealtime } from "@upstash/realtime/client";
import type { InferRealtimeEvents, Realtime } from "@upstash/realtime";
import type { RealtimeOpts } from "@/lib/upstash/realtime";

type Events = InferRealtimeEvents<Realtime<RealtimeOpts>>;

export const { useRealtime } = createRealtime<Events>();

// `useRealtime` reads from the package's module-level context, so consumers must
// be wrapped in this provider. Re-exported here (from a "use client" module) so
// it can be mounted from the server-rendered admin shell.
export { RealtimeProvider } from "@upstash/realtime/client";
