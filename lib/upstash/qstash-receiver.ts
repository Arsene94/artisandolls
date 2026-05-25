import "server-only";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

type Handler = (request: Request) => Promise<Response>;

let cached: ((request: Request) => Promise<Response>) | null = null;
let cachedFor: string | null = null;

function getVerifier(): ((handler: Handler) => Handler) | null {
    const current = process.env.QSTASH_CURRENT_SIGNING_KEY;
    const next = process.env.QSTASH_NEXT_SIGNING_KEY;
    if (!current || !next) return null;
    return verifySignatureAppRouter;
}

/**
 * Wraps a QStash receiver handler so that the signing-key verifier is only
 * instantiated when the env vars are present. Without this, importing the
 * verifier eagerly during `next build` crashes on machines where QStash is
 * not yet configured.
 */
export function withSignatureVerification(handler: Handler): Handler {
    return async (request: Request) => {
        const fingerprint = `${process.env.QSTASH_CURRENT_SIGNING_KEY ?? ""}|${
            process.env.QSTASH_NEXT_SIGNING_KEY ?? ""
        }`;
        if (!cached || cachedFor !== fingerprint) {
            const verifier = getVerifier();
            if (!verifier) {
                return new Response("QStash signing keys missing", { status: 503 });
            }
            cached = verifier(handler);
            cachedFor = fingerprint;
        }
        return cached(request);
    };
}
