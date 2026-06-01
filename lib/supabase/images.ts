import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type ImageSize = "avatar" | "thumb" | "card" | "gallery" | "hero";

export function isExternalImage(value: string) {
    return value.startsWith("http://") || value.startsWith("https://");
}

// Returnăm URL-ul public RAW al obiectului, fără transformările Supabase
// (`/render/image/...`). Image Transformations sunt o funcție plătită care nu e
// activată pe acest tenant — endpoint-ul răspunde `403 FeatureNotEnabled`, ceea
// ce face ca optimizatorul Next (`/_next/image`) să întoarcă `502 Bad Gateway`.
// Redimensionarea o face oricum `next/image` la consum, deci nu pierdem nimic.
// `size` rămâne în semnătură pentru compatibilitate cu apelanții existenți.
export function getSupabaseImageUrl(
    pathOrUrl: string,
    size: ImageSize = "card",
    bucket = "doll-images"
) {
    void size;

    if (!pathOrUrl) {
        return "";
    }

    if (isExternalImage(pathOrUrl)) {
        return pathOrUrl;
    }

    const supabase = createSupabaseBrowserClient();

    const { data } = supabase.storage.from(bucket).getPublicUrl(pathOrUrl);

    return data.publicUrl;
}
