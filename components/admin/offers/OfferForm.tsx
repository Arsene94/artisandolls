"use client";

import { useState, useTransition } from "react";
import type { OfferRow, OfferType } from "@/lib/offers/shared";
import {
    OFFER_PRESETS,
    OFFER_PRESET_ADMIN_LABELS,
    defaultPresetForType,
} from "@/lib/offers/presets";

export type OfferOption = { id: string; name: string };

type Props = {
    action: (formData: FormData) => Promise<void>;
    categories: OfferOption[];
    collections: OfferOption[];
    products: OfferOption[];
    initial?: Partial<OfferRow>;
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

const TYPE_LABELS: Record<OfferType, string> = {
    threshold_percent: "Prag → procentaj",
    threshold_fixed: "Prag → sumă fixă",
    threshold_gift: "Prag → cadou",
    buy_x_get_y: "Cumperi X, primești Y",
    collection_percent: "Procentaj pe colecție/categorie",
    promo: "Promoțional (doar afișare)",
};

// `[color-scheme:dark]` forces native controls (the select popup, the
// datetime picker, the caret) to render in dark mode — otherwise a
// light-mode browser paints their text dark, invisible on the dark field.
const input =
    "w-full bg-velvet-950 border border-velvet-700 rounded-lg px-3 py-2 text-silk placeholder:text-silk/40 [color-scheme:dark] focus:outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold text-sm";
const label = "block text-[0.7rem] uppercase tracking-[0.16em] text-silk/70 mb-1.5";
const help = "mt-1 text-[0.72rem] leading-snug text-silk/50";
const fieldset =
    "rounded-xl border border-velvet-800 bg-velvet-900/30 p-4 space-y-4";
const legend = "px-2 text-[0.7rem] uppercase tracking-[0.16em] text-gold";

export default function OfferForm({
    action,
    categories,
    collections,
    products,
    initial,
    submitLabel,
}: Props) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [type, setType] = useState<OfferType>(initial?.type ?? "threshold_percent");
    const [scope, setScope] = useState<string>(initial?.applies_to ?? "shop");
    const [presetKey, setPresetKey] = useState<string>(
        initial ? initial.preset_key ?? "" : defaultPresetForType("threshold_percent"),
    );

    const appliesToDolls = scope === "dolls" || scope === "both";
    const appliesToShop = scope === "shop" || scope === "both";

    const isThreshold =
        type === "threshold_percent" ||
        type === "threshold_fixed" ||
        type === "threshold_gift";
    const isPercentReward =
        type === "threshold_percent" || type === "collection_percent";
    const isFixedReward = type === "threshold_fixed";
    const isGift = type === "threshold_gift";
    const isBogo = type === "buy_x_get_y";
    const isPromo = type === "promo";
    const showCategoryTargeting =
        appliesToShop && (type === "collection_percent" || type === "buy_x_get_y");
    const showCollectionTargeting = appliesToDolls && type === "collection_percent";

    const submit = (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            try {
                await action(formData);
            } catch (err) {
                if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
                    setError(err.message);
                }
            }
        });
    };

    return (
        <form action={submit} className="space-y-6 max-w-3xl [color-scheme:dark]">
            {error ? (
                <div className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-silk">
                    {error}
                </div>
            ) : null}

            <fieldset className={fieldset}>
                <legend className={legend}>General</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <label className={label} htmlFor="offer-name">
                            Nume (intern)
                        </label>
                        <input
                            id="offer-name"
                            name="name"
                            required
                            defaultValue={initial?.name ?? ""}
                            placeholder="Reducere de vară"
                            className={input}
                            autoComplete="off"
                        />
                        <p className={help}>
                            Nume folosit doar de tine în administrare ca să
                            recunoști oferta. Nu apare nicăieri pe site.
                        </p>
                    </div>
                    <div>
                        <label className={label} htmlFor="offer-type">
                            Tip ofertă
                        </label>
                        <select
                            id="offer-type"
                            name="type"
                            value={type}
                            onChange={(e) => {
                                const next = e.target.value as OfferType;
                                setType(next);
                                setPresetKey(defaultPresetForType(next));
                            }}
                            className={input}
                        >
                            {(Object.keys(TYPE_LABELS) as OfferType[]).map((value) => (
                                <option key={value} value={value}>
                                    {TYPE_LABELS[value]}
                                </option>
                            ))}
                        </select>
                        <p className={help}>
                            Stabilește cum se calculează reducerea și ce câmpuri
                            de condiție apar mai jos.
                        </p>
                    </div>
                    <div>
                        <label className={label} htmlFor="offer-priority">
                            Prioritate (mai mare = câștigă)
                        </label>
                        <input
                            id="offer-priority"
                            name="priority"
                            type="number"
                            defaultValue={initial?.priority ?? 0}
                            className={input}
                        />
                        <p className={help}>
                            Când mai multe oferte se potrivesc în același timp,
                            se aplică cea cu valoarea mai mare.
                        </p>
                    </div>
                </div>
                <div>
                    <label className="flex items-center gap-2 text-sm text-silk/85">
                        <input
                            type="checkbox"
                            name="is_active"
                            defaultChecked={initial?.is_active ?? true}
                            className="accent-gold"
                        />{" "}
                        Activă
                    </label>
                    <p className={help}>
                        Debifează ca să oprești temporar oferta, fără să o
                        ștergi.
                    </p>
                </div>
            </fieldset>

            <fieldset className={fieldset}>
                <legend className={legend}>Aplicabilitate</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className={label} htmlFor="offer-applies-to">
                            Se aplică pe
                        </label>
                        <select
                            id="offer-applies-to"
                            name="applies_to"
                            value={scope}
                            onChange={(e) => setScope(e.target.value)}
                            className={input}
                        >
                            <option value="shop">Doar magazin (shop)</option>
                            <option value="dolls">Doar păpuși (dolls)</option>
                            <option value="both">Ambele</option>
                        </select>
                        <p className={help}>
                            Unde se aplică oferta. Schimbă și opțiunile de
                            targetare (categorii / colecții) disponibile mai jos.
                        </p>
                    </div>
                </div>
                {appliesToDolls ? (
                    <div>
                        <span className={label}>Moduri păpuși</span>
                        <p className="-mt-1 mb-2 text-[0.78rem] text-silk/55">
                            Lasă ambele nebifate pentru orice comandă de păpușă;
                            bifează ca să limitezi la închiriere sau cumpărare.
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
            </fieldset>

            {!isPromo ? (
                <fieldset className={fieldset}>
                    <legend className={legend}>Condiție &amp; recompensă</legend>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {isThreshold ? (
                            <div>
                                <label className={label} htmlFor="offer-threshold">
                                    Prag subtotal (de la)
                                </label>
                                <input
                                    id="offer-threshold"
                                    name="threshold_amount"
                                    type="number"
                                    min={0}
                                    defaultValue={initial?.threshold_amount ?? ""}
                                    className={input}
                                />
                                <p className={help}>
                                    Valoarea minimă a coșului (în RON) de la care
                                    se activează oferta. Apare și în mesajul
                                    afișat.
                                </p>
                            </div>
                        ) : null}

                        {isPercentReward ? (
                            <div>
                                <label className={label} htmlFor="offer-reward-percent">
                                    Reducere (%)
                                </label>
                                <input
                                    id="offer-reward-percent"
                                    name="reward_percent"
                                    type="number"
                                    min={0}
                                    max={100}
                                    defaultValue={initial?.reward_percent ?? ""}
                                    className={input}
                                />
                                <p className={help}>
                                    Procentul reducerii. Ex.: 20 înseamnă −20%
                                    din subtotalul eligibil.
                                </p>
                            </div>
                        ) : null}

                        {isFixedReward ? (
                            <div>
                                <label className={label} htmlFor="offer-reward-amount">
                                    Reducere (sumă)
                                </label>
                                <input
                                    id="offer-reward-amount"
                                    name="reward_amount"
                                    type="number"
                                    min={0}
                                    defaultValue={initial?.reward_amount ?? ""}
                                    className={input}
                                />
                                <p className={help}>
                                    Suma fixă scăzută din total (în RON) când se
                                    atinge pragul.
                                </p>
                            </div>
                        ) : null}

                        {isPercentReward ? (
                            <div>
                                <label className={label} htmlFor="offer-reward-cap">
                                    Plafon reducere (opțional)
                                </label>
                                <input
                                    id="offer-reward-cap"
                                    name="reward_max_discount"
                                    type="number"
                                    min={0}
                                    defaultValue={initial?.reward_max_discount ?? ""}
                                    className={input}
                                />
                                <p className={help}>
                                    Reducerea nu va depăși această sumă,
                                    indiferent de procent. Lasă gol pentru fără
                                    limită.
                                </p>
                            </div>
                        ) : null}

                        {isGift ? (
                            <div className="sm:col-span-2">
                                <label className={label} htmlFor="offer-gift">
                                    Produs cadou
                                </label>
                                <select
                                    id="offer-gift"
                                    name="gift_product_id"
                                    defaultValue={initial?.gift_product_id ?? ""}
                                    className={input}
                                >
                                    <option value="">— alege produs —</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                                <p className={help}>
                                    Produsul adăugat gratuit în coș când se
                                    atinge pragul.
                                </p>
                            </div>
                        ) : null}

                        {isBogo ? (
                            <>
                                <div>
                                    <label className={label} htmlFor="offer-buy-qty">
                                        Cumperi (X bucăți)
                                    </label>
                                    <input
                                        id="offer-buy-qty"
                                        name="buy_quantity"
                                        type="number"
                                        min={1}
                                        defaultValue={initial?.buy_quantity ?? ""}
                                        className={input}
                                    />
                                    <p className={help}>
                                        Câte produse eligibile trebuie în coș ca
                                        să se activeze oferta.
                                    </p>
                                </div>
                                <div>
                                    <label className={label} htmlFor="offer-get-qty">
                                        Primești (Y bucăți reduse)
                                    </label>
                                    <input
                                        id="offer-get-qty"
                                        name="get_quantity"
                                        type="number"
                                        min={1}
                                        defaultValue={initial?.get_quantity ?? ""}
                                        className={input}
                                    />
                                    <p className={help}>
                                        Câte produse primesc reducerea (cele mai
                                        ieftine dintre cele eligibile).
                                    </p>
                                </div>
                                <div>
                                    <label className={label} htmlFor="offer-get-percent">
                                        Reducere pe cele Y (%)
                                    </label>
                                    <input
                                        id="offer-get-percent"
                                        name="get_percent"
                                        type="number"
                                        min={0}
                                        max={100}
                                        defaultValue={initial?.get_percent ?? ""}
                                        className={input}
                                    />
                                    <p className={help}>
                                        Procentul aplicat produselor primite.
                                        Ex.: 100 = gratis.
                                    </p>
                                </div>
                            </>
                        ) : null}
                    </div>
                </fieldset>
            ) : null}

            {showCategoryTargeting && categories.length > 0 ? (
                <fieldset className={fieldset}>
                    <legend className={legend}>Categorii shop vizate</legend>
                    <p className="text-[0.78rem] text-silk/55">
                        Bifează categoriile la care se aplică oferta. Lasă tot
                        nebifat pentru a viza întreg magazinul.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-auto pr-2">
                        {categories.map((cat) => (
                            <label
                                key={cat.id}
                                className="flex items-center gap-2 text-sm text-silk/85 bg-velvet-900/50 border border-velvet-800 rounded-lg px-3 py-2"
                            >
                                <input
                                    type="checkbox"
                                    name="applies_to_categories"
                                    value={cat.id}
                                    defaultChecked={
                                        initial?.applies_to_categories?.includes(cat.id) ??
                                        false
                                    }
                                    className="accent-gold"
                                />
                                {cat.name}
                            </label>
                        ))}
                    </div>
                </fieldset>
            ) : null}

            {showCollectionTargeting && collections.length > 0 ? (
                <fieldset className={fieldset}>
                    <legend className={legend}>Colecții păpuși vizate</legend>
                    <p className="text-[0.78rem] text-silk/55">
                        Bifează colecțiile la care se aplică oferta. Lasă tot
                        nebifat pentru a viza toate păpușile.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-auto pr-2">
                        {collections.map((col) => (
                            <label
                                key={col.id}
                                className="flex items-center gap-2 text-sm text-silk/85 bg-velvet-900/50 border border-velvet-800 rounded-lg px-3 py-2"
                            >
                                <input
                                    type="checkbox"
                                    name="applies_to_collections"
                                    value={col.id}
                                    defaultChecked={
                                        initial?.applies_to_collections?.includes(
                                            col.id,
                                        ) ?? false
                                    }
                                    className="accent-gold"
                                />
                                {col.name}
                            </label>
                        ))}
                    </div>
                </fieldset>
            ) : null}

            <fieldset className={fieldset}>
                <legend className={legend}>Programare</legend>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className={label} htmlFor="offer-starts">
                            Activă de la
                        </label>
                        <input
                            id="offer-starts"
                            name="starts_at"
                            type="datetime-local"
                            defaultValue={toDateTimeLocal(initial?.starts_at)}
                            className={input}
                        />
                        <p className={help}>
                            Data de la care oferta devine activă. Lasă gol ca să
                            pornească imediat.
                        </p>
                    </div>
                    <div>
                        <label className={label} htmlFor="offer-expires">
                            Expiră la
                        </label>
                        <input
                            id="offer-expires"
                            name="expires_at"
                            type="datetime-local"
                            defaultValue={toDateTimeLocal(initial?.expires_at)}
                            className={input}
                        />
                        <p className={help}>
                            Data la care oferta se oprește automat. Lasă gol
                            pentru fără expirare.
                        </p>
                    </div>
                </div>
            </fieldset>

            <fieldset className={fieldset}>
                <legend className={legend}>Afișare</legend>
                <p className="-mt-1 text-[0.78rem] text-silk/55">
                    Alege un mesaj comercial predefinit (deja tradus în toate
                    limbile). Completează câmpurile de mai jos doar dacă vrei să
                    suprascrii presetul — textul propriu, scris în română, se
                    traduce automat în EN și NL după salvare.
                </p>
                <div>
                    <label className={label} htmlFor="offer-preset">
                        Mesaj predefinit
                    </label>
                    <select
                        id="offer-preset"
                        name="preset_key"
                        value={presetKey}
                        onChange={(e) => setPresetKey(e.target.value)}
                        className={input}
                    >
                        <option value="">
                            — fără preset (doar text propriu) —
                        </option>
                        {OFFER_PRESETS[type].map((key) => (
                            <option key={key} value={key}>
                                {OFFER_PRESET_ADMIN_LABELS[type][key]}
                            </option>
                        ))}
                    </select>
                    <p className={help}>
                        Lista de mesaje se schimbă în funcție de tipul ofertei.
                        Textul presetului e gata tradus în RO/EN/NL.
                    </p>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                        <label className={label} htmlFor="offer-badge">
                            Badge (suprascriere)
                        </label>
                        <input
                            id="offer-badge"
                            name="badge_label"
                            defaultValue={initial?.badge_label ?? ""}
                            placeholder="-20%"
                            className={input}
                        />
                        <p className={help}>
                            Eticheta scurtă de pe carduri și din bară. Gol = se
                            folosește textul presetului.
                        </p>
                    </div>
                    <div>
                        <label className={label} htmlFor="offer-title">
                            Titlu banner (suprascriere)
                        </label>
                        <input
                            id="offer-title"
                            name="title"
                            defaultValue={initial?.title ?? ""}
                            placeholder="Reduceri de sezon"
                            className={input}
                        />
                        <p className={help}>
                            Titlul afișat în bara de ofertă. Gol = textul
                            presetului.
                        </p>
                    </div>
                    <div>
                        <label className={label} htmlFor="offer-subtitle">
                            Subtitlu (suprascriere)
                        </label>
                        <input
                            id="offer-subtitle"
                            name="subtitle"
                            defaultValue={initial?.subtitle ?? ""}
                            placeholder="Detaliu scurt despre ofertă"
                            className={input}
                        />
                        <p className={help}>
                            Textul secundar din bară. Gol = textul presetului.
                        </p>
                    </div>
                    <div>
                        <label className={label} htmlFor="offer-accent">
                            Accent (hex, opțional)
                        </label>
                        <input
                            id="offer-accent"
                            name="accent"
                            defaultValue={initial?.accent ?? ""}
                            placeholder="#C9A24A"
                            className={input}
                        />
                        <p className={help}>
                            Culoare personalizată pentru fundalul barei/badge-ului
                            (cod hex). Opțional — gol = auriul implicit.
                        </p>
                    </div>
                    <div>
                        <label className={label} htmlFor="offer-currency">
                            Valută
                        </label>
                        <input
                            id="offer-currency"
                            name="currency"
                            defaultValue={initial?.currency ?? "RON"}
                            className={input}
                        />
                        <p className={help}>
                            Codul valutei afișate la sume (implicit RON).
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-4">
                    <div className="flex-1 min-w-[15rem]">
                        <label className="flex items-center gap-2 text-sm text-silk/85">
                            <input
                                type="checkbox"
                                name="show_on_homepage"
                                defaultChecked={initial?.show_on_homepage ?? true}
                                className="accent-gold"
                            />{" "}
                            Bară de ofertă pe site
                        </label>
                        <p className={help}>
                            Afișează oferta în bara promoțională din partea de
                            sus, pe tot site-ul.
                        </p>
                    </div>
                    <div className="flex-1 min-w-[15rem]">
                        <label className="flex items-center gap-2 text-sm text-silk/85">
                            <input
                                type="checkbox"
                                name="show_badge"
                                defaultChecked={initial?.show_badge ?? true}
                                className="accent-gold"
                            />{" "}
                            Badge pe carduri
                        </label>
                        <p className={help}>
                            Afișează eticheta pe cardurile de produs și de păpușă
                            vizate de ofertă.
                        </p>
                    </div>
                </div>
            </fieldset>

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
