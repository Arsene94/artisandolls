"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

type ModelInquiryButtonProps = {
    modelName: string;
    label: string;
};

export default function ModelInquiryButton({
    modelName,
    label,
}: ModelInquiryButtonProps) {
    const t = useTranslations("home.contact");
    const [open, setOpen] = useState(false);
    const [contact, setContact] = useState("");
    const [sent, setSent] = useState(false);

    const close = () => {
        setOpen(false);
        window.setTimeout(() => {
            setSent(false);
            setContact("");
        }, 300);
    };

    const submit = () => {
        if (!contact.trim()) {
            return;
        }

        setSent(true);
        window.setTimeout(close, 1200);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="bg-velvet-500 hover:bg-velvet-700 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all inline-flex items-center cursor-pointer"
            >
                {label}
                <svg
                    className="w-3 h-3 ml-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <polyline points="9 6 15 12 9 18" />
                </svg>
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[100] bg-velvet-950/80 backdrop-blur-sm flex justify-center items-center opacity-100 transition-all duration-300"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            close();
                        }
                    }}
                >
                    <div className="bg-velvet-900 text-white p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-gold/20 scale-100 transition-transform duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold font-serif text-white">
                                {t("modalTitleTemplate", { name: modelName })}
                            </h3>
                            <button
                                type="button"
                                onClick={close}
                                className="text-silk/60 hover:text-gold transition focus:outline-none p-1 cursor-pointer"
                                aria-label="Close"
                            >
                                <svg
                                    className="w-5 h-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <p className="text-sm text-silk/70 mb-6">
                            {t("modalDescriptionTemplate", { name: modelName })}
                        </p>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={contact}
                                onChange={(event) => setContact(event.target.value)}
                                className="w-full bg-velvet-950 border border-silk/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition text-sm text-white placeholder-silk/30"
                                placeholder={t("modalPlaceholder")}
                            />
                            <button
                                type="button"
                                onClick={submit}
                                className={`w-full bg-gradient-to-r ${
                                    sent ? "from-green-600 to-green-700 text-white" : "from-gold to-gold-dark text-velvet-900"
                                } font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg cursor-pointer transition-colors`}
                            >
                                {sent ? t("modalSent") : t("modalSubmit")}
                                <svg
                                    className="inline w-3.5 h-3.5 ml-1"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path d="M12 1a5 5 0 00-5 5v4H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2h-2V6a5 5 0 00-5-5zm-3 9V6a3 3 0 016 0v4H9z" />
                                </svg>
                            </button>
                        </div>

                        <p className="text-[10px] text-silk/40 mt-4 text-center">
                            {t("modalFooter")}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
