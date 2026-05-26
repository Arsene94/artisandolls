import "server-only";
import { cookies } from "next/headers";

// Lista (FIFO) de UUID-uri pe care browserul curent are voie să le vadă în
// pagina /success. UUID-urile nu se ghicesc prin brute-force, dar se scurg
// trivial prin Referer, istoric sincronizat, screenshot, paste accidental.
// Cookie-ul leagă vizualizarea de actul de cumpărare: nimeni nu vede PII pe
// /success fără să fi trecut prin checkout în browserul respectiv.

const COOKIE_NAME = "ad_recent_orders";
const COOKIE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 zile
const MAX_ENTRIES = 12;

function parse(raw: string | undefined): string[] {
    if (!raw) return [];
    return raw
        .split("|")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length <= 64);
}

function serialise(ids: string[]): string {
    return ids.slice(-MAX_ENTRIES).join("|");
}

/** Adaugă un order id în cookie. Numesc-o din server actions după insert. */
export async function rememberRecentOrder(orderId: string): Promise<void> {
    if (!orderId) return;
    const store = await cookies();
    const current = parse(store.get(COOKIE_NAME)?.value);
    if (current.includes(orderId)) return;
    const updated = [...current, orderId];
    store.set(COOKIE_NAME, serialise(updated), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: COOKIE_TTL_SECONDS,
    });
}

/** True dacă browserul curent are voie să citească comanda. */
export async function ownsRecentOrder(orderId: string): Promise<boolean> {
    if (!orderId) return false;
    const store = await cookies();
    const current = parse(store.get(COOKIE_NAME)?.value);
    return current.includes(orderId);
}
