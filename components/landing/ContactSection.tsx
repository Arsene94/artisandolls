"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

type ContactSectionProps = {
    contactPhone: string | null;
    whatsappPhone: string | null;
    contactEmail: string | null;
};

type InterestKey = "custom" | "rent" | "buy" | "catalog";

function buildWhatsappHref(rawPhone: string, message: string) {
    const digits = rawPhone.replace(/[^\d]/g, "");
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function buildEmailHref(email: string, subject: string, body: string) {
    const params = new URLSearchParams({ subject, body });
    return `mailto:${email}?${params.toString()}`;
}

function buildTelHref(phone: string) {
    return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export default function ContactSection({
    contactPhone,
    whatsappPhone,
    contactEmail,
}: ContactSectionProps) {
    const t = useTranslations("home.contact");
    const [submitted, setSubmitted] = useState(false);

    const displayPhone = whatsappPhone ?? contactPhone ?? "";
    const displayEmail = contactEmail ?? "";

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const name = (form.elements.namedItem("name") as HTMLInputElement)?.value.trim();
        const contactMethod = (form.elements.namedItem("contact_method") as HTMLInputElement)?.value.trim();
        const interest = (form.elements.namedItem("interest") as HTMLSelectElement)?.value as InterestKey;
        const message = (form.elements.namedItem("message") as HTMLTextAreaElement)?.value.trim();

        const interestLabel = t(
            interest === "custom"
                ? "interestCustom"
                : interest === "rent"
                  ? "interestRent"
                  : interest === "buy"
                    ? "interestBuy"
                    : "interestCatalog"
        );

        const lines = [
            name ? `${t("nameLabel")}: ${name}` : null,
            contactMethod ? `${t("contactLabel")}: ${contactMethod}` : null,
            `${t("interestLabel")}: ${interestLabel}`,
            message ? `${t("messageLabel")}: ${message}` : null,
        ].filter(Boolean) as string[];

        const body = lines.join("\n");

        let href: string | null = null;
        if (whatsappPhone) {
            href = buildWhatsappHref(whatsappPhone, body);
        } else if (contactEmail) {
            href = buildEmailHref(contactEmail, interestLabel, body);
        } else if (contactPhone) {
            href = buildTelHref(contactPhone);
        }

        if (href) {
            window.open(href, "_blank", "noopener,noreferrer");
        }

        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            form.reset();
        }, 7000);
    };

    return (
        <section id="contact" className="py-24 bg-velvet-900 text-white relative">
            <div className="absolute inset-0 bg-gradient-to-t from-velvet-950 to-velvet-900 pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-12 bg-velvet-950/80 rounded-3xl overflow-hidden border border-gold/10 shadow-2xl">
                    <div className="w-full lg:w-5/12 p-8 sm:p-12 bg-gradient-to-br from-velvet-900 to-velvet-950 flex flex-col justify-between lg:border-r border-velvet-800">
                        <div>
                            <span className="text-xs font-bold tracking-widest text-gold uppercase block mb-2">
                                {t("badge")}
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-bold mb-6 font-serif">
                                {t("title")}
                            </h2>
                            <p className="text-silk/70 font-light text-sm sm:text-base leading-relaxed mb-8">
                                {t("description")}
                            </p>

                            <div className="space-y-6">
                                {displayPhone && (
                                    <a
                                        href={
                                            whatsappPhone
                                                ? buildWhatsappHref(whatsappPhone, "")
                                                : buildTelHref(displayPhone)
                                        }
                                        target={whatsappPhone ? "_blank" : undefined}
                                        rel={whatsappPhone ? "noopener noreferrer" : undefined}
                                        className="flex items-center gap-4 group"
                                    >
                                        <div className="w-12 h-12 bg-velvet-800 group-hover:bg-velvet-700 rounded-full flex items-center justify-center text-gold border border-gold/20 transition">
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M20.52 3.48A12 12 0 003.48 20.52L2 22l1.55-4.4A11.97 11.97 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22a9.94 9.94 0 01-5.07-1.38l-.36-.22-3.06.87.81-2.99-.24-.38A9.96 9.96 0 1122 12c0 5.51-4.49 10-10 10zm5.49-7.55c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15s-.78.98-.96 1.18c-.18.2-.36.22-.66.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17 0-.37-.02-.57-.02-.2 0-.52.07-.79.37-.28.3-1.05 1.02-1.05 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.23 5.13 4.53.72.31 1.27.49 1.71.63.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.57-.34z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-silk/40 uppercase tracking-widest mb-0.5">
                                                {t("whatsappSub")}
                                            </p>
                                            <p className="font-bold text-sm sm:text-base text-white group-hover:text-gold transition">
                                                {displayPhone}
                                            </p>
                                        </div>
                                    </a>
                                )}
                                {displayEmail && (
                                    <a
                                        href={`mailto:${displayEmail}`}
                                        className="flex items-center gap-4 group"
                                    >
                                        <div className="w-12 h-12 bg-velvet-800 group-hover:bg-velvet-700 rounded-full flex items-center justify-center text-gold border border-gold/20 transition">
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                <polyline points="22,6 12,13 2,6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-silk/40 uppercase tracking-widest mb-0.5">
                                                {t("emailSub")}
                                            </p>
                                            <p className="font-bold text-sm sm:text-base text-white group-hover:text-gold transition">
                                                {displayEmail}
                                            </p>
                                        </div>
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="mt-12 pt-6 border-t border-velvet-800/80 text-xs text-silk/40 italic">
                            {t("footnote")}
                        </div>
                    </div>

                    <div className="w-full lg:w-7/12 p-8 sm:p-12 bg-velvet-950/40">
                        {!submitted && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label
                                            htmlFor="contact-name"
                                            className="block text-xs font-bold text-silk/80 uppercase tracking-wider mb-2"
                                        >
                                            {t("nameLabel")}
                                        </label>
                                        <input
                                            type="text"
                                            id="contact-name"
                                            name="name"
                                            placeholder={t("namePlaceholder")}
                                            className="w-full bg-velvet-900 border border-silk/10 rounded-xl px-4 py-3.5 text-white placeholder-silk/30 focus:outline-none focus:border-gold transition text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="contact-method"
                                            className="block text-xs font-bold text-silk/80 uppercase tracking-wider mb-2"
                                        >
                                            {t("contactLabel")}
                                        </label>
                                        <input
                                            type="text"
                                            id="contact-method"
                                            name="contact_method"
                                            required
                                            placeholder={t("contactPlaceholder")}
                                            className="w-full bg-velvet-900 border border-silk/10 rounded-xl px-4 py-3.5 text-white placeholder-silk/30 focus:outline-none focus:border-gold transition text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="contact-interest"
                                        className="block text-xs font-bold text-silk/80 uppercase tracking-wider mb-2"
                                    >
                                        {t("interestLabel")}
                                    </label>
                                    <select
                                        id="contact-interest"
                                        name="interest"
                                        defaultValue="custom"
                                        className="w-full bg-velvet-900 border border-silk/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-gold transition text-sm"
                                    >
                                        <option value="custom">{t("interestCustom")}</option>
                                        <option value="rent">{t("interestRent")}</option>
                                        <option value="buy">{t("interestBuy")}</option>
                                        <option value="catalog">{t("interestCatalog")}</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="contact-message"
                                        className="block text-xs font-bold text-silk/80 uppercase tracking-wider mb-2"
                                    >
                                        {t("messageLabel")}
                                    </label>
                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        rows={4}
                                        placeholder={t("messagePlaceholder")}
                                        className="w-full bg-velvet-900 border border-silk/10 rounded-xl px-4 py-3.5 text-white placeholder-silk/30 focus:outline-none focus:border-gold transition text-sm resize-none"
                                    />
                                </div>

                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="contact-age"
                                        name="age"
                                        required
                                        className="h-5 w-5 rounded border-silk/20 text-velvet-500 focus:ring-velvet-500 bg-velvet-900 mt-0.5 cursor-pointer"
                                    />
                                    <label
                                        htmlFor="contact-age"
                                        className="text-xs text-silk/70 leading-relaxed cursor-pointer select-none"
                                    >
                                        {t("ageLabel")}
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-gold via-gold-dark to-gold text-velvet-900 hover:from-white hover:to-silk font-extrabold py-4 rounded-xl shadow-lg transition-all duration-300 tracking-widest uppercase text-xs inline-flex items-center justify-center cursor-pointer"
                                >
                                    <span>{t("submitButton")}</span>
                                    <svg className="w-3.5 h-3.5 ml-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M12 1a5 5 0 00-5 5h2a3 3 0 016 0v4H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2h-2V6a5 5 0 00-5-5z" />
                                    </svg>
                                </button>
                            </form>
                        )}

                        {submitted && (
                            <div className="mt-6 p-5 bg-gradient-to-r from-velvet-800 to-velvet-900 border border-gold/30 rounded-xl text-center">
                                <svg className="w-8 h-8 text-gold mx-auto mb-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                                <p className="font-bold text-white text-base">{t("successTitle")}</p>
                                <p className="text-xs text-silk/60 mt-1">{t("successDescription")}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
