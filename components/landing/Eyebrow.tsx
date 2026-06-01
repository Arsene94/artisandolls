type EyebrowProps = {
    children: React.ReactNode;
    /** Layout-only overrides (margins, alignment). */
    className?: string;
    id?: string;
};

/**
 * Section eyebrow — matches the Figma `label-tag` token: Inter Medium 15,
 * uppercase, letter-spacing 1px (≈0.067em), champagne-gold. Replaces the old
 * Montserrat 11.5px / 0.22em eyebrows across the landing sections.
 */
export default function Eyebrow({ children, className = "", id }: EyebrowProps) {
    return (
        <p
            id={id}
            className={`font-sans text-[12px] font-medium uppercase leading-[1.2] tracking-[0.083em] text-[#c9a15a] lg:text-[15px] lg:tracking-[0.067em] ${className}`}
        >
            {children}
        </p>
    );
}
