"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clientIp } from "@/lib/upstash/identify";
import { ageGateLimiter, safeLimit } from "@/lib/upstash/ratelimit";

const AGE_COOKIE = "ad_age_verified";
const AGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function isValidNext(next: string | null): string {
    if (!next) return "/";
    if (!next.startsWith("/")) return "/";
    if (next.startsWith("//")) return "/";
    if (next.startsWith("/age-gate")) return "/";
    return next;
}

export async function confirmAge(formData: FormData) {
    const next = isValidNext(String(formData.get("next") ?? "/"));

    const ip = await clientIp();
    const limited = await safeLimit(ageGateLimiter, ip);
    if (!limited.success) {
        redirect(`/age-gate?next=${encodeURIComponent(next)}&error=rate`);
    }

    const day = Number(formData.get("day") ?? 0);
    const month = Number(formData.get("month") ?? 0);
    const year = Number(formData.get("year") ?? 0);

    if (
        !Number.isFinite(day) ||
        !Number.isFinite(month) ||
        !Number.isFinite(year) ||
        day < 1 ||
        day > 31 ||
        month < 1 ||
        month > 12 ||
        year < 1900
    ) {
        redirect(`/age-gate?next=${encodeURIComponent(next)}&error=invalid`);
    }

    const dob = new Date(Date.UTC(year, month - 1, day));
    if (
        dob.getUTCFullYear() !== year ||
        dob.getUTCMonth() !== month - 1 ||
        dob.getUTCDate() !== day
    ) {
        redirect(`/age-gate?next=${encodeURIComponent(next)}&error=invalid`);
    }

    const now = new Date();
    let age = now.getUTCFullYear() - year;
    const m = now.getUTCMonth() - (month - 1);
    if (m < 0 || (m === 0 && now.getUTCDate() < day)) {
        age -= 1;
    }

    if (age < 18) {
        redirect(`/age-gate?next=${encodeURIComponent(next)}&error=under18`);
    }

    const store = await cookies();
    store.set(AGE_COOKIE, "1", {
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: AGE_COOKIE_MAX_AGE,
    });

    redirect(next);
}
