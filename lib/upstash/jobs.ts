import "server-only";
import { Client as WorkflowClient } from "@upstash/workflow";
import { buildCallbackUrl, qstash } from "@/lib/upstash/qstash";

let workflowClient: WorkflowClient | null = null;
function getWorkflowClient(): WorkflowClient | null {
    if (workflowClient) return workflowClient;
    const token = process.env.QSTASH_TOKEN;
    if (!token) return null;
    workflowClient = new WorkflowClient({
        token,
        baseUrl: process.env.QSTASH_URL,
    });
    return workflowClient;
}

/**
 * Hand off a slow side-effect to QStash so the user-facing server action
 * returns immediately. Returns false when the job could not be enqueued —
 * the caller decides whether to fall back to a synchronous attempt or to
 * persist a "pending" marker for the replay sweeper.
 */
export async function enqueueWhatsAppNotification(orderId: string): Promise<boolean> {
    if (!qstash) return false;
    const url = buildCallbackUrl("/api/qstash/whatsapp");
    if (!url) return false;

    try {
        await qstash.publishJSON({
            url,
            body: { orderId },
            deduplicationId: `wa-${orderId}`,
            retries: 5,
        });
        return true;
    } catch (err) {
        console.error("[qstash] failed to enqueue WhatsApp job", orderId, err);
        return false;
    }
}

/**
 * Schedule a confirmation email a short time after the order is committed,
 * giving Supabase replicas a moment to converge before the renderer reads.
 */
export async function enqueueOrderEmail(
    orderId: string,
    delaySeconds = 15,
): Promise<boolean> {
    if (!qstash) return false;
    const url = buildCallbackUrl("/api/qstash/order-email");
    if (!url) return false;

    try {
        await qstash.publishJSON({
            url,
            body: { orderId },
            delay: delaySeconds,
            deduplicationId: `email-${orderId}`,
            retries: 5,
        });
        return true;
    } catch (err) {
        console.error("[qstash] failed to enqueue email job", orderId, err);
        return false;
    }
}

/**
 * Upsert a daily cron that purges expired customer PII. We expose this as a
 * function so the admin can re-run it after deploying to a new env (the
 * Upstash schedule lives outside the codebase, so the upsert is necessary
 * exactly once per deploy target).
 */
export async function ensureGdprPurgeSchedule(): Promise<void> {
    if (!qstash) return;
    const url = buildCallbackUrl("/api/cron/gdpr-purge");
    if (!url) return;
    try {
        await qstash.schedules.create({
            scheduleId: "artisandolls-gdpr-purge-daily",
            destination: url,
            cron: "0 3 * * *",
            body: JSON.stringify({ olderThanDays: 30 }),
            retries: 3,
        });
    } catch (err) {
        console.error("[qstash] failed to upsert GDPR schedule", err);
    }
}

export async function ensureReplaySchedule(): Promise<void> {
    if (!qstash) return;
    const url = buildCallbackUrl("/api/cron/replay-pending");
    if (!url) return;
    try {
        await qstash.schedules.create({
            scheduleId: "artisandolls-replay-pending",
            destination: url,
            cron: "*/5 * * * *",
            retries: 1,
        });
    } catch (err) {
        console.error("[qstash] failed to upsert replay schedule", err);
    }
}

/**
 * Kick off the durable order workflow (operator notify → 24h reminder →
 * 7-day follow-up). `workflowRunId` is deterministic so accidental double
 * calls collapse to one run.
 */
export async function startOrderLifecycleWorkflow(orderId: string): Promise<boolean> {
    const client = getWorkflowClient();
    if (!client) return false;
    const url = buildCallbackUrl("/api/workflow/order-lifecycle");
    if (!url) return false;
    try {
        await client.trigger({
            url,
            body: { orderId },
            workflowRunId: `order-${orderId}`,
            retries: 3,
        });
        return true;
    } catch (err) {
        console.error("[workflow] failed to trigger lifecycle", orderId, err);
        return false;
    }
}
