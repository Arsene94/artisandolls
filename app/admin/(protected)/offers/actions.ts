"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isAdminUser } from "@/lib/supabase/server";
import { invalidateOffers } from "@/lib/upstash/cache";
import { OFFER_TYPES, type OfferType } from "@/lib/offers/shared";
import { isValidPresetForType } from "@/lib/offers/presets";
import { enqueueEntityTranslations } from "@/lib/translations/queue";

async function requireAdmin() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user || !isAdminUser(user)) redirect("/admin/login");
    return supabase;
}

function getString(formData: FormData, key: string) {
    return String(formData.get(key) ?? "").trim();
}
function getNullableString(formData: FormData, key: string) {
    return getString(formData, key) || null;
}
function getNumber(formData: FormData, key: string, fallback = 0) {
    const raw = getString(formData, key);
    if (!raw) return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
}
function getNullableNumber(formData: FormData, key: string) {
    const raw = getString(formData, key);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
}
function getBoolean(formData: FormData, key: string) {
    return formData.get(key) === "on";
}
function getCheckboxValues(formData: FormData, key: string): string[] {
    return formData
        .getAll(key)
        .map((value) => String(value).trim())
        .filter(Boolean);
}
function getTimestamp(formData: FormData, key: string): string | null {
    const raw = getString(formData, key);
    if (!raw) return null;
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

const SCOPES = ["shop", "dolls", "both"] as const;
type Scope = (typeof SCOPES)[number];

function getType(formData: FormData): OfferType {
    const raw = getString(formData, "type");
    return (OFFER_TYPES as readonly string[]).includes(raw)
        ? (raw as OfferType)
        : "threshold_percent";
}
function getScope(formData: FormData): Scope {
    const raw = getString(formData, "applies_to");
    return (SCOPES as readonly string[]).includes(raw) ? (raw as Scope) : "shop";
}
function getDollModes(formData: FormData): string[] {
    return getCheckboxValues(formData, "doll_modes").filter(
        (m) => m === "rent" || m === "buy",
    );
}

function offerPayload(formData: FormData) {
    const scope = getScope(formData);
    const type = getType(formData);
    return {
        name: getString(formData, "name"),
        type,
        is_active: getBoolean(formData, "is_active"),
        priority: getNumber(formData, "priority", 0),

        starts_at: getTimestamp(formData, "starts_at"),
        expires_at: getTimestamp(formData, "expires_at"),

        applies_to: scope,
        doll_modes: scope === "shop" ? [] : getDollModes(formData),

        threshold_amount: getNullableNumber(formData, "threshold_amount"),

        reward_percent: getNullableNumber(formData, "reward_percent"),
        reward_amount: getNullableNumber(formData, "reward_amount"),
        reward_max_discount: getNullableNumber(formData, "reward_max_discount"),
        gift_product_id: getNullableString(formData, "gift_product_id"),

        buy_quantity: getNullableNumber(formData, "buy_quantity"),
        get_quantity: getNullableNumber(formData, "get_quantity"),
        get_percent: getNullableNumber(formData, "get_percent"),

        applies_to_categories: getCheckboxValues(formData, "applies_to_categories"),
        applies_to_collections: getCheckboxValues(formData, "applies_to_collections"),

        // RO is the only authored copy. EN/NL land in content_translations via
        // the auto-translation pipeline (see offerTranslatableFields below), so
        // we deliberately don't touch the legacy _en/_nl columns on save.
        badge_label: getNullableString(formData, "badge_label"),
        title: getNullableString(formData, "title"),
        subtitle: getNullableString(formData, "subtitle"),
        accent: getNullableString(formData, "accent"),
        preset_key: (() => {
            const raw = getNullableString(formData, "preset_key");
            return isValidPresetForType(type, raw) ? raw : null;
        })(),
        show_on_homepage: getBoolean(formData, "show_on_homepage"),
        show_badge: getBoolean(formData, "show_badge"),

        currency: getString(formData, "currency") || "RON",
    };
}

function offerTranslatableFields(payload: ReturnType<typeof offerPayload>) {
    return [
        { key: "badge_label", value: payload.badge_label },
        { key: "title", value: payload.title },
        { key: "subtitle", value: payload.subtitle },
    ];
}

export async function createOfferAction(formData: FormData) {
    const supabase = await requireAdmin();
    const payload = offerPayload(formData);
    if (!payload.name) throw new Error("Numele ofertei este obligatoriu.");
    const { data: inserted, error } = await supabase
        .from("site_offers")
        .insert(payload)
        .select("id")
        .single();
    if (error) throw new Error(error.message);
    await invalidateOffers();
    if (inserted?.id) {
        await enqueueEntityTranslations({
            entity: "site_offer",
            entityId: inserted.id as string,
            fields: offerTranslatableFields(payload),
        });
    }
    revalidatePath("/admin/offers");
    redirect("/admin/offers");
}

export async function updateOfferAction(id: string, formData: FormData) {
    const supabase = await requireAdmin();
    const payload = offerPayload(formData);
    if (!payload.name) throw new Error("Numele ofertei este obligatoriu.");
    const { error } = await supabase
        .from("site_offers")
        .update(payload)
        .eq("id", id);
    if (error) throw new Error(error.message);
    await invalidateOffers();
    await enqueueEntityTranslations({
        entity: "site_offer",
        entityId: id,
        fields: offerTranslatableFields(payload),
    });
    revalidatePath("/admin/offers");
    redirect("/admin/offers");
}

export async function deleteOfferAction(id: string) {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("site_offers").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await invalidateOffers();
    revalidatePath("/admin/offers");
}
