import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ImageSize } from "@/lib/supabase/images";

const imagePresets = {
    avatar: { width: 160, height: 160, resize: "cover" as const, quality: 80 },
    thumb: { width: 320, height: 240, resize: "cover" as const, quality: 78 },
    card: { width: 600, height: 400, resize: "cover" as const, quality: 80 },
    gallery: { width: 1200, height: 900, resize: "cover" as const, quality: 82 },
    hero: { width: 1600, height: 900, resize: "cover" as const, quality: 82 },
};

export function isExternalImage(value: string) {
    return value.startsWith("http://") || value.startsWith("https://");
}

export async function getSupabaseImageUrlServer(
    pathOrUrl: string,
    size: ImageSize = "card",
    bucket = "doll-images"
) {
    if (!pathOrUrl) {
        return "";
    }

    if (isExternalImage(pathOrUrl)) {
        return pathOrUrl;
    }

    const supabase = await createSupabaseServerClient();

    const { data } = supabase.storage.from(bucket).getPublicUrl(pathOrUrl, {
        transform: imagePresets[size],
    });

    return data.publicUrl;
}
