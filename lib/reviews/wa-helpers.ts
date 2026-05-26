/**
 * Helpers pure pentru link-uri WhatsApp și mesaje de invitație review.
 * Trăiesc separat de `invitations.ts` (server-only) ca să poată fi importate
 * dintr-o componentă client fără să tragă în bundle clientul Supabase service.
 */

const REVIEW_PROMPTS: Record<"ro" | "en" | "nl", (productLabel: string) => string> = {
    ro: (label) =>
        `Bună! Am livrat ${label} și speram să ne lași câteva impresii — orice ne ajută la modelele viitoare. E un formular scurt, anonim dacă vrei. Mulțumim 🌹`,
    en: (label) =>
        `Hello! We have delivered ${label} and would love a few impressions — anything helps us refine the next models. The form is short and can stay anonymous. Thank you 🌹`,
    nl: (label) =>
        `Hallo! We hebben ${label} bezorgd en zouden graag een paar indrukken willen — alle feedback helpt ons betere modellen te kiezen. Het formulier is kort en kan anoniem blijven. Dank 🌹`,
};

/** Construiește textul mesajului WhatsApp pe care îl prefixăm în wa.me link. */
export function composeReviewMessage(
    locale: "ro" | "en" | "nl",
    productLabel: string,
    reviewUrl: string,
): string {
    const prompt = REVIEW_PROMPTS[locale](productLabel);
    return `${prompt}\n\n${reviewUrl}`;
}

/** Wa.me deep link — funcționează pe orice device fără Business API. */
export function whatsappDeepLink(phone: string | null, message: string): string {
    const cleaned = (phone ?? "").replace(/[^\d+]/g, "").replace(/^\+/, "");
    const query = `text=${encodeURIComponent(message)}`;
    return cleaned ? `https://wa.me/${cleaned}?${query}` : `https://wa.me/?${query}`;
}
