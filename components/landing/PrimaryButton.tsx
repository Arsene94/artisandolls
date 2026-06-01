import { Link } from "@/i18n/navigation";

type PrimaryButtonProps = {
    href: string;
    children: React.ReactNode;
    /** "solid" = filled champagne-gold→ivory gradient (Figma btn-main).
     *  "outline" = transparent gold-bordered pill (Figma btn-secondary). */
    variant?: "solid" | "outline";
    ariaLabel?: string;
    /** Layout-only overrides (alignment, self-*, width). Never restyle here. */
    className?: string;
};

function ArrowIcon() {
    return (
        <span
            aria-hidden="true"
            className="inline-flex h-6 w-6 items-center justify-center"
        >
            <svg
                width="18"
                height="14"
                viewBox="0 0 18 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M1 7h16m0 0L11 1m6 6l-6 6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </span>
    );
}

/**
 * Canonical landing CTA — matches the Figma `btn-main` token: Cormorant
 * Garamond Bold 17, rounded-[20px], solid champagne-gold→ivory gradient with
 * dark text and a plain inline arrow. Modelled on the Hero button.
 */
export default function PrimaryButton({
    href,
    children,
    variant = "solid",
    ariaLabel,
    className = "",
}: PrimaryButtonProps) {
    const base =
        "group inline-flex w-fit items-center justify-center gap-[10px] rounded-[20px] px-6 py-[14px] font-display text-[17px] font-bold tracking-[-0.01em] transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a15a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#12070b] motion-reduce:transition-none motion-reduce:hover:scale-100";

    if (variant === "outline") {
        return (
            <Link
                href={href}
                aria-label={ariaLabel}
                className={`${base} border border-[#c9a15a]/60 text-[#f3eee7] hover:border-[#c9a15a] hover:text-[#c9a15a] ${className}`}
            >
                <span className="whitespace-nowrap">{children}</span>
                <ArrowIcon />
            </Link>
        );
    }

    return (
        <Link
            href={href}
            aria-label={ariaLabel}
            className={`${base} text-[#12070b] shadow-[0_8px_24px_rgba(201,161,90,0.35)] ${className}`}
            style={{
                backgroundImage:
                    "linear-gradient(108.19deg, #c9a15a 0.59%, #daffed 103.75%)",
            }}
        >
            <span className="whitespace-nowrap">{children}</span>
            <ArrowIcon />
        </Link>
    );
}
