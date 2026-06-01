import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ImageSize } from "@/lib/supabase/images";

export function isExternalImage(value: string) {
    return value.startsWith("http://") || value.startsWith("https://");
}

// Vezi nota din `lib/supabase/images.ts`: transformările Supabase
// (`/render/image/...`) sunt dezactivate pe acest tenant (403 FeatureNotEnabled
// → 502 prin `/_next/image`), așa că returnăm URL-ul public RAW și lăsăm
// `next/image` să optimizeze. `size` rămâne pentru compatibilitate.
export async function getSupabaseImageUrlServer(
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

    const supabase = await createSupabaseServerClient();

    const { data } = supabase.storage.from(bucket).getPublicUrl(pathOrUrl);

    return data.publicUrl;
}
