import { Link } from "@/i18n/navigation";

type Props = {
    /** Numărul paginii curente, 1-indexat. */
    currentPage: number;
    /** Totalul de pagini calculat de caller. Garantăm minim 1. */
    totalPages: number;
    /** Funcție care construiește URL-ul (fără locale prefix — Link-ul next-intl îl adaugă). */
    hrefFor: (page: number) => string;
    /** Etichetă pentru `nav`-ul englez/RO. */
    label: string;
    /** Etichete localizate pentru butoanele prev/next; sr-only pe mobile. */
    prevLabel: string;
    nextLabel: string;
};

// Construiește o secvență compactă: prima, ultima, vecinii curenți, separate prin
// „ellipsis". Pe maxim 7 elemente păstrăm tot, peste asta condensăm — UI-ul nu
// degradează nici pe mobil cu N pagini mari, nici pe desktop cu N mic.
export function pageList(current: number, total: number): (number | "ellipsis")[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    const items: (number | "ellipsis")[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    if (start > 2) items.push("ellipsis");
    for (let p = start; p <= end; p += 1) items.push(p);
    if (end < total - 1) items.push("ellipsis");
    items.push(total);
    return items;
}

export default function Pagination({
    currentPage,
    totalPages,
    hrefFor,
    label,
    prevLabel,
    nextLabel,
}: Props) {
    const safeTotal = Math.max(1, totalPages);
    if (safeTotal === 1) return null;
    const items = pageList(currentPage, safeTotal);

    const disabledStyle =
        "border-velvet-800 text-silk/35 pointer-events-none";
    const activeStyle =
        "border-velvet-700 text-silk hover:border-gold/60 hover:text-gold";

    return (
        <nav
            aria-label={label}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center gap-2 flex-wrap"
        >
            <Link
                href={hrefFor(currentPage - 1)}
                aria-disabled={currentPage <= 1}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[0.72rem] uppercase tracking-[0.18em] transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    currentPage <= 1 ? disabledStyle : activeStyle
                }`}
            >
                ←<span className="sr-only sm:not-sr-only">{prevLabel}</span>
            </Link>
            {items.map((it, idx) => {
                if (it === "ellipsis") {
                    return (
                        <span
                            key={`gap-${idx}`}
                            aria-hidden="true"
                            className="px-2 text-silk/45"
                        >
                            …
                        </span>
                    );
                }
                const active = it === currentPage;
                return (
                    <Link
                        key={it}
                        href={hrefFor(it)}
                        aria-current={active ? "page" : undefined}
                        className={`min-w-[2.5rem] inline-flex items-center justify-center px-3 py-2 rounded-full text-sm transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                            active
                                ? "bg-gold text-velvet-950 font-semibold"
                                : `border ${activeStyle}`
                        }`}
                    >
                        {it}
                    </Link>
                );
            })}
            <Link
                href={hrefFor(currentPage + 1)}
                aria-disabled={currentPage >= safeTotal}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[0.72rem] uppercase tracking-[0.18em] transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    currentPage >= safeTotal ? disabledStyle : activeStyle
                }`}
            >
                <span className="sr-only sm:not-sr-only">{nextLabel}</span>→
            </Link>
        </nav>
    );
}
