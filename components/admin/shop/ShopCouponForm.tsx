"use client";

import { useState, useTransition } from "react";
import type { ShopCategoryRow, ShopCouponRow } from "@/lib/shop/shared";

type Props = {
    action: (formData: FormData) => Promise<void>;
    categories: ShopCategoryRow[];
    initial?: Partial<ShopCouponRow>;
    submitLabel: string;
};

function toDateTimeLocal(iso: string | null | undefined): string {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
        `T${pad(date.getHours())}:${pad(date.getMinutes())}`
    );
}

export default function ShopCouponForm({
    action,
    categories,
    initial,
    submitLabel,
}: Props) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [type, setType] = useState<string>(initial?.type ?? "percentage");
    const [scope, setScope] = useState<string>(initial?.applies_to ?? "shop");

    const appliesToDolls = scope === "dolls" || scope === "both";
    const appliesToShop = scope === "shop" || scope === "both";

    const submit = (formData: FormData) => {
        setError(null);
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

    const input =
        "w-full bg-velvet-950 border border-velvet-700 rounded-lg px-3 py-2 text-silk focus:outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold text-sm";
    const label =
        "block text-[0.7rem] uppercase tracking-[0.16em] text-silk/70 mb-1.5";

    const valueHelp =
        type === "percentage"
            ? "0–100 (procentaj din subtotal)"
            : type === "fixed"
              ? "Valoare în bani / minor units"
              : "Ignorat pentru free_shipping";

    return (
        <form action={submit} className="space-y-6 max-w-3xl">
            {error ? (
                <div className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-silk">
                    {error}
                </div>
            ) : null}

            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className={label} htmlFor="coupon-code">Cod</label>
                    <input
                        id="coupon-code"
                        name="code"
                        required
                        defaultValue={initial?.code ?? ""}
                        placeholder="VERVET10"
                        className={`${input} font-mono uppercase tracking-wider`}
                        autoComplete="off"
                        spellCheck={false}
                    />
                </div>
                <div>
                    <label className={label} htmlFor="coupon-type">Tip</label>
                    <select
                        id="coupon-type"
                        name="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className={input}
                    >
                        <option value="percentage">Procentaj</option>
                        <option value="fixed">Sumă fixă</option>
                        <option value="free_shipping">Livrare gratuită</option>
                    </select>
                </div>
                <div>
                    <label className={label} htmlFor="coupon-value">Valoare</label>
                    <input
                        id="coupon-value"
                        name="value"
                        type="number"
                        min={0}
                        required
                        defaultValue={initial?.value ?? 0}
                        className={input}
                    />
                    <p className="mt-1 text-[0.72rem] text-silk/55">{valueHelp}</p>
                </div>
                <div>
                    <label className={label} htmlFor="coupon-max-discount">
                        Plafon reducere (opțional)
                    </label>
                    <input
                        id="coupon-max-discount"
                        name="max_discount"
                        type="number"
                        min={0}
                        defaultValue={initial?.max_discount ?? ""}
                        className={input}
                    />
                </div>
                <div>
                    <label className={label} htmlFor="coupon-min">Subtotal minim</label>
                    <input
                        id="coupon-min"
                        name="min_subtotal"
                        type="number"
                        min={0}
                        defaultValue={initial?.min_subtotal ?? 0}
                        className={input}
                    />
                </div>
                <div>
                    <label className={label} htmlFor="coupon-currency">Valută</label>
                    <input
                        id="coupon-currency"
                        name="currency"
                        defaultValue={initial?.currency ?? "RON"}
                        className={input}
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className={label} htmlFor="coupon-desc">
                        Descriere (intern)
                    </label>
                    <input
                        id="coupon-desc"
                        name="description"
                        defaultValue={initial?.description ?? ""}
                        className={input}
                    />
                </div>
            </div>

            <fieldset className="rounded-xl border border-velvet-800 bg-velvet-900/30 p-4 space-y-4">
                <legend className="px-2 text-[0.7rem] uppercase tracking-[0.16em] text-gold">
                    Aplicabilitate
                </legend>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className={label} htmlFor="coupon-applies-to">
                            Se aplică pe
                        </label>
                        <select
                            id="coupon-applies-to"
                            name="applies_to"
                            value={scope}
                            onChange={(e) => setScope(e.target.value)}
                            className={input}
                        >
                            <option value="shop">Doar magazin (shop)</option>
                            <option value="dolls">Doar păpuși (dolls)</option>
                            <option value="both">Ambele</option>
                        </select>
                    </div>

                    {appliesToDolls ? (
                        <div>
                            <label className={label} htmlFor="coupon-doll-base">
                                Reducerea la păpuși se aplică pe
                            </label>
                            <select
                                id="coupon-doll-base"
                                name="doll_discount_base"
                                defaultValue={initial?.doll_discount_base ?? "total"}
                                className={input}
                            >
                                <option value="total">Total (preț bază + extras)</option>
                                <option value="base">Doar prețul de bază</option>
                                <option value="extras">Doar extras (ținute + personalizări)</option>
                            </select>
                        </div>
                    ) : null}
                </div>

                {appliesToDolls ? (
                    <div>
                        <span className={label}>Moduri păpuși</span>
                        <p className="-mt-1 mb-2 text-[0.78rem] text-silk/55">
                            Lasă ambele nebifate pentru a aplica codul la orice
                            comandă de păpușă (închiriere și cumpărare).
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: "rent", label: "Închiriere" },
                                { value: "buy", label: "Cumpărare" },
                            ].map((m) => (
                                <label
                                    key={m.value}
                                    className="flex items-center gap-2 text-sm text-silk/85 bg-velvet-900/50 border border-velvet-800 rounded-lg px-3 py-2"
                                >
                                    <input
                                        type="checkbox"
                                        name="doll_modes"
                                        value={m.value}
                                        defaultChecked={
                                            initial?.doll_modes?.includes(
                                                m.value as "rent" | "buy",
                                            ) ?? false
                                        }
                                        className="accent-gold"
                                    />
                                    {m.label}
                                </label>
                            ))}
                        </div>
                    </div>
                ) : null}

                {appliesToDolls && type === "free_shipping" ? (
                    <p className="text-[0.78rem] text-amber-300/90">
                        „Livrare gratuită” nu are efect la comenzile de păpuși
                        (nu există taxă de livrare) — folosește procentaj sau
                        sumă fixă pentru ele.
                    </p>
                ) : null}
            </fieldset>

            <div className="grid sm:grid-cols-3 gap-4">
                <div>
                    <label className={label} htmlFor="coupon-starts">
                        Activ de la
                    </label>
                    <input
                        id="coupon-starts"
                        name="starts_at"
                        type="datetime-local"
                        defaultValue={toDateTimeLocal(initial?.starts_at)}
                        className={input}
                    />
                </div>
                <div>
                    <label className={label} htmlFor="coupon-expires">
                        Expiră la
                    </label>
                    <input
                        id="coupon-expires"
                        name="expires_at"
                        type="datetime-local"
                        defaultValue={toDateTimeLocal(initial?.expires_at)}
                        className={input}
                    />
                </div>
                <div>
                    <label className={label} htmlFor="coupon-max-red">
                        Utilizări maxime
                    </label>
                    <input
                        id="coupon-max-red"
                        name="max_redemptions"
                        type="number"
                        min={1}
                        defaultValue={initial?.max_redemptions ?? ""}
                        className={input}
                        placeholder="∞"
                    />
                </div>
            </div>

            {categories.length > 0 && appliesToShop ? (
                <fieldset className="space-y-2">
                    <legend className={label}>Limitare pe categorii (shop)</legend>
                    <p className="text-[0.78rem] text-silk/55">
                        Bifează una sau mai multe categorii pentru a restricționa
                        codul în magazin. Lasă gol pentru a-l aplica tuturor
                        produselor. Nu afectează comenzile de păpuși.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-auto pr-2">
                        {categories.map((category) => {
                            const checked =
                                initial?.applies_to_categories?.includes(category.id) ??
                                false;
                            return (
                                <label
                                    key={category.id}
                                    className="flex items-center gap-2 text-sm text-silk/85 bg-velvet-900/50 border border-velvet-800 rounded-lg px-3 py-2"
                                >
                                    <input
                                        type="checkbox"
                                        name="applies_to_categories"
                                        value={category.id}
                                        defaultChecked={checked}
                                        className="accent-gold"
                                    />
                                    {category.name}
                                </label>
                            );
                        })}
                    </div>
                </fieldset>
            ) : null}

            <label className="flex items-center gap-2 text-sm text-silk/85">
                <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={initial?.is_active ?? true}
                    className="accent-gold"
                />{" "}
                Activ
            </label>

            <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center bg-gold hover:bg-gold-light disabled:bg-velvet-700 text-velvet-950 disabled:text-silk/55 font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-[0.16em] transition-colors motion-reduce:transition-none"
            >
                {pending ? "Se salvează…" : submitLabel}
            </button>
        </form>
    );
}
