import { getIntlLocale } from "@/i18n/format";

/** Render a minor-unit integer price using the cart's currency. */
export function formatMoney(
    amountMinor: number,
    locale: string,
    currency: string,
): string {
    const formatter = new Intl.NumberFormat(getIntlLocale(locale), {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    });
    return formatter.format(Math.round(amountMinor));
}
