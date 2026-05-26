import { Link } from "@/i18n/navigation";
import type { ShopProduct } from "@/lib/shop/shared";

type Props = {
    current: ShopProduct;
    siblings: ShopProduct[];
    label: string;
    outOfStockLabel: string;
};

// Construim axele din uniunea variantelor: dacă un produs are size+color și
// celălalt doar size, axele afișate sunt size (cu valorile disponibile pe ea)
// și color (cu valoarea curentă + n/a pentru frați fără).
function buildAxes(siblings: ShopProduct[]): { name: string; values: string[] }[] {
    const order: string[] = [];
    const seen = new Map<string, Set<string>>();
    for (const sibling of siblings) {
        if (!sibling.variantAxes) continue;
        for (const [name, value] of Object.entries(sibling.variantAxes)) {
            if (!seen.has(name)) {
                seen.set(name, new Set());
                order.push(name);
            }
            seen.get(name)!.add(value);
        }
    }
    return order.map((name) => ({
        name,
        values: Array.from(seen.get(name) ?? []).sort(),
    }));
}

function siblingForAxis(
    siblings: ShopProduct[],
    current: ShopProduct,
    axisName: string,
    targetValue: string,
): ShopProduct | null {
    // Caută varianta care păstrează celelalte axe identice cu produsul curent
    // și schimbă doar `axisName` la `targetValue`. Dacă nu există un match exact,
    // returnăm null și UI-ul afișează valoarea ca disabled.
    const currentAxes = current.variantAxes ?? {};
    return (
        siblings.find((sibling) => {
            if (sibling.id === current.id) return false;
            const axes = sibling.variantAxes ?? {};
            if (axes[axisName] !== targetValue) return false;
            for (const [name, value] of Object.entries(currentAxes)) {
                if (name === axisName) continue;
                if (axes[name] !== value) return false;
            }
            return true;
        }) ?? null
    );
}

export default function VariantSelector({
    current,
    siblings,
    label,
    outOfStockLabel,
}: Props) {
    const axes = buildAxes(siblings);
    if (axes.length === 0) return null;

    return (
        <section
            aria-labelledby="variant-heading"
            className="mt-6 pt-6 border-t border-velvet-800"
        >
            <h2
                id="variant-heading"
                className="text-[0.72rem] uppercase tracking-[0.22em] text-silk/70 mb-4"
            >
                {label}
            </h2>
            <div className="space-y-5">
                {axes.map((axis) => {
                    const currentValue = current.variantAxes?.[axis.name];
                    return (
                        <div key={axis.name}>
                            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-silk/55 mb-2">
                                {axis.name}
                            </p>
                            <ul className="flex flex-wrap gap-2 list-none p-0">
                                {axis.values.map((value) => {
                                    const active = currentValue === value;
                                    const sibling = active
                                        ? null
                                        : siblingForAxis(
                                              siblings,
                                              current,
                                              axis.name,
                                              value,
                                          );
                                    const sharedClass =
                                        "inline-flex items-center px-3 py-1.5 rounded-full text-[0.78rem] uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold";
                                    if (active) {
                                        return (
                                            <li key={value}>
                                                <span
                                                    aria-current="true"
                                                    className={`${sharedClass} bg-gold text-velvet-950 font-semibold`}
                                                >
                                                    {value}
                                                </span>
                                            </li>
                                        );
                                    }
                                    if (!sibling) {
                                        return (
                                            <li key={value}>
                                                <span
                                                    aria-disabled="true"
                                                    title={outOfStockLabel}
                                                    className={`${sharedClass} border border-velvet-800 text-silk/40 line-through cursor-not-allowed`}
                                                >
                                                    {value}
                                                </span>
                                            </li>
                                        );
                                    }
                                    return (
                                        <li key={value}>
                                            <Link
                                                href={`/shop/p/${sibling.slug}`}
                                                className={`${sharedClass} border border-velvet-700 text-silk hover:border-gold/60 hover:text-gold`}
                                            >
                                                {value}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
