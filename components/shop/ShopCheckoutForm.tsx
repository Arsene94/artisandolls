"use client";

import { useId, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

type Props = {
    action: (formData: FormData) => Promise<void>;
    locale: string;
    onlinePaymentEnabled: boolean;
};

export default function ShopCheckoutForm({
    action,
    locale,
    onlinePaymentEnabled,
}: Props) {
    const t = useTranslations("shop");
    const tCheckout = useTranslations("checkout");
    const tCommon = useTranslations("common");
    const tFooter = useTranslations("footer");
    const id = useId();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "card_online">(
        onlinePaymentEnabled ? "card_online" : "cash",
    );

    const submit = (formData: FormData) => {
        setError(null);
        formData.set("_locale", locale);
        formData.set("payment_method", paymentMethod);
        startTransition(async () => {
            try {
                await action(formData);
            } catch (err) {
                if (
                    err instanceof Error &&
                    !err.message.includes("NEXT_REDIRECT")
                ) {
                    setError(err.message);
                }
            }
        });
    };

    const inputBase =
        "w-full bg-velvet-950 border border-velvet-700 rounded-xl px-4 py-3 text-silk placeholder-silk/55 focus:outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold transition text-sm";
    const labelBase =
        "block text-[0.72rem] uppercase tracking-[0.18em] text-silk/80 mb-2";

    return (
        <form
            action={submit}
            noValidate
            className="bg-velvet-900/40 border border-velvet-800/50 rounded-3xl p-6 sm:p-8 space-y-6"
        >
            {error ? (
                <div
                    role="alert"
                    className="rounded-2xl border border-danger/50 bg-danger/10 p-4 text-sm text-silk"
                >
                    <p className="font-semibold text-danger">
                        {t("checkoutErrorTitle")}
                    </p>
                    <p className="mt-1 opacity-90">{error}</p>
                </div>
            ) : null}

            <fieldset className="space-y-5">
                <legend className="sr-only">
                    {tCheckout("contactSectionTitle")}
                </legend>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor={`${id}-name`} className={labelBase}>
                            {tCheckout("fullName")}
                        </label>
                        <input
                            id={`${id}-name`}
                            name="full_name"
                            type="text"
                            required
                            autoComplete="name"
                            className={inputBase}
                            placeholder={tCheckout("fullNamePlaceholder")}
                        />
                    </div>
                    <div>
                        <label htmlFor={`${id}-phone`} className={labelBase}>
                            {tCheckout("phone")}
                        </label>
                        <input
                            id={`${id}-phone`}
                            name="phone"
                            type="tel"
                            required
                            inputMode="tel"
                            autoComplete="tel"
                            className={inputBase}
                            placeholder={tCheckout("phonePlaceholder")}
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor={`${id}-email`} className={labelBase}>
                            {tCheckout("emailLabel")}
                        </label>
                        <input
                            id={`${id}-email`}
                            name="email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            className={inputBase}
                            placeholder={tCheckout("emailPlaceholder")}
                        />
                    </div>
                </div>
            </fieldset>

            <fieldset className="space-y-5">
                <legend className="sr-only">
                    {tCheckout("deliverySectionTitle")}
                </legend>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor={`${id}-county`} className={labelBase}>
                            {tCheckout("county")}
                        </label>
                        <input
                            id={`${id}-county`}
                            name="delivery_county"
                            type="text"
                            autoComplete="address-level1"
                            className={inputBase}
                            placeholder={tCheckout("countyPlaceholder")}
                        />
                    </div>
                    <div>
                        <label htmlFor={`${id}-city`} className={labelBase}>
                            {tCheckout("city")}
                        </label>
                        <input
                            id={`${id}-city`}
                            name="delivery_city"
                            type="text"
                            autoComplete="address-level2"
                            className={inputBase}
                            placeholder={tCheckout("cityPlaceholder")}
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label
                            htmlFor={`${id}-address`}
                            className={labelBase}
                        >
                            {tCheckout("deliveryAddress")}
                        </label>
                        <textarea
                            id={`${id}-address`}
                            name="delivery_address"
                            required
                            rows={3}
                            autoComplete="street-address"
                            className={`${inputBase} resize-y`}
                            placeholder={tCheckout("deliveryAddressPlaceholder")}
                        />
                    </div>
                </div>
            </fieldset>

            <fieldset className="space-y-5">
                <legend className="sr-only">
                    {tCheckout("contactMethod")}
                </legend>
                <div>
                    <label htmlFor={`${id}-cm`} className={labelBase}>
                        {tCheckout("contactMethod")}
                    </label>
                    <select
                        id={`${id}-cm`}
                        name="contact_method"
                        defaultValue="whatsapp"
                        className={inputBase}
                    >
                        <option value="whatsapp">
                            {tCheckout("contactMethodWhatsapp")}
                        </option>
                        <option value="telegram">
                            {tCheckout("contactMethodTelegram")}
                        </option>
                        <option value="call">{tCheckout("contactMethodCall")}</option>
                        <option value="email">{tCheckout("contactMethodEmail")}</option>
                    </select>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor={`${id}-cw-from`}
                            className={labelBase}
                        >
                            {tCheckout("contactWindowFrom")}
                        </label>
                        <input
                            id={`${id}-cw-from`}
                            name="contact_window_start"
                            type="time"
                            className={inputBase}
                        />
                    </div>
                    <div>
                        <label htmlFor={`${id}-cw-to`} className={labelBase}>
                            {tCheckout("contactWindowTo")}
                        </label>
                        <input
                            id={`${id}-cw-to`}
                            name="contact_window_end"
                            type="time"
                            className={inputBase}
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor={`${id}-notes`} className={labelBase}>
                        {tCheckout("notes")}
                    </label>
                    <textarea
                        id={`${id}-notes`}
                        name="notes"
                        rows={2}
                        className={`${inputBase} resize-y`}
                        placeholder={tCheckout("notesPlaceholder")}
                    />
                </div>
            </fieldset>

            <fieldset
                className="space-y-3"
                aria-describedby={`${id}-payment-help`}
            >
                <legend className="block text-[0.72rem] uppercase tracking-[0.18em] text-silk/80 mb-2">
                    {t("paymentMethodLabel")}
                </legend>
                <p
                    id={`${id}-payment-help`}
                    className="text-[0.78rem] text-silk/65"
                >
                    {t("paymentMethodHelp")}
                </p>

                <label
                    htmlFor={`${id}-pm-cash`}
                    className={[
                        "flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors",
                        paymentMethod === "cash"
                            ? "border-gold bg-velvet-900/70"
                            : "border-velvet-800 bg-velvet-950/40 hover:border-velvet-700",
                    ].join(" ")}
                >
                    <input
                        id={`${id}-pm-cash`}
                        type="radio"
                        name="payment_method_ui"
                        value="cash"
                        checked={paymentMethod === "cash"}
                        onChange={() => setPaymentMethod("cash")}
                        className="mt-1 accent-gold"
                    />
                    <span className="flex-1">
                        <span className="block text-sm font-semibold text-silk">
                            {t("paymentMethodCash")}
                        </span>
                        <span className="block text-[0.82rem] text-silk/70 mt-1">
                            {t("paymentMethodCashHelp")}
                        </span>
                    </span>
                </label>

                {onlinePaymentEnabled ? (
                    <label
                        htmlFor={`${id}-pm-online`}
                        className={[
                            "flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors",
                            paymentMethod === "card_online"
                                ? "border-gold bg-velvet-900/70"
                                : "border-velvet-800 bg-velvet-950/40 hover:border-velvet-700",
                        ].join(" ")}
                    >
                        <input
                            id={`${id}-pm-online`}
                            type="radio"
                            name="payment_method_ui"
                            value="card_online"
                            checked={paymentMethod === "card_online"}
                            onChange={() => setPaymentMethod("card_online")}
                            className="mt-1 accent-gold"
                        />
                        <span className="flex-1">
                            <span className="block text-sm font-semibold text-silk">
                                {t("paymentMethodCardOnline")}
                            </span>
                            <span className="block text-[0.82rem] text-silk/70 mt-1">
                                {t("paymentMethodCardOnlineHelp")}
                            </span>
                        </span>
                    </label>
                ) : null}
            </fieldset>

            <fieldset className="space-y-4 bg-velvet-950/40 border border-gold/15 rounded-2xl p-5">
                <legend className="sr-only">
                    {tCheckout("termsSectionTitle")}
                </legend>
                <label
                    className="flex items-start gap-3 cursor-pointer"
                    htmlFor={`${id}-age`}
                >
                    <input
                        id={`${id}-age`}
                        type="checkbox"
                        name="age_confirmed"
                        required
                        className="mt-1 h-5 w-5 rounded border-silk/30 accent-gold bg-velvet-900 cursor-pointer"
                    />
                    <span className="flex-1 text-sm text-silk/85 leading-snug">
                        {tCheckout("ageConfirmDescription")}{" "}
                        <a
                            href={locale === "ro" ? "/age-policy" : `/${locale}/age-policy`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gold-light underline underline-offset-4 hover:text-gold"
                        >
                            {tFooter("ageLimit")} ↗
                        </a>
                    </span>
                </label>
                <label
                    className="flex items-start gap-3 cursor-pointer"
                    htmlFor={`${id}-privacy`}
                >
                    <input
                        id={`${id}-privacy`}
                        type="checkbox"
                        name="privacy_accepted"
                        required
                        className="mt-1 h-5 w-5 rounded border-silk/30 accent-gold bg-velvet-900 cursor-pointer"
                    />
                    <span className="flex-1 text-sm text-silk/85 leading-snug">
                        {tCheckout("privacyConfirmDescription")}{" "}
                        <a
                            href={locale === "ro" ? "/privacy" : `/${locale}/privacy`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gold-light underline underline-offset-4 hover:text-gold"
                        >
                            {tFooter("privacy")} ↗
                        </a>
                    </span>
                </label>
            </fieldset>

            <button
                type="submit"
                disabled={pending}
                className="w-full inline-flex items-center justify-center bg-gold hover:bg-gold-light disabled:bg-velvet-700 disabled:text-silk/55 text-velvet-950 font-semibold py-4 rounded-xl text-sm uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-velvet-950"
            >
                {pending
                    ? t("checkoutSubmitting")
                    : paymentMethod === "card_online"
                      ? t("checkoutPay")
                      : t("checkoutSubmit")}
            </button>

            <p className="text-[0.72rem] text-silk/55 leading-snug text-center">
                {tCommon("required")} · SSL · GDPR ·{" "}
                {paymentMethod === "card_online"
                    ? t("paymentMethodCardOnline")
                    : tCheckout("paymentLineValue")}
            </p>
        </form>
    );
}
