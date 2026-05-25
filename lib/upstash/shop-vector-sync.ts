import "server-only";
import {
    SHOP_VECTOR_NAMESPACES,
    vectorIndex,
    type VectorLocale,
} from "@/lib/upstash/vector";
import { mapProductRow, type ShopProduct, type ShopProductRow } from "@/lib/shop/shared";

const LOCALES: VectorLocale[] = ["ro", "en", "nl"];

function searchableText(product: ShopProduct): string {
    return [
        product.name,
        product.brand ?? "",
        product.shortDescription ?? "",
        product.description ?? "",
        product.tags?.join(" ") ?? "",
        product.sku ?? "",
    ]
        .filter(Boolean)
        .join(" . ");
}

export async function upsertShopProductVectors(
    input: ShopProduct | ShopProductRow,
): Promise<void> {
    const index = vectorIndex;
    if (!index) return;

    const product: ShopProduct =
        "main_image_path" in input ? mapProductRow(input) : input;
    const text = searchableText(product);

    await Promise.all(
        LOCALES.map((locale) =>
            index
                .upsert(
                    {
                        id: `shop:${product.slug}:${locale}`,
                        data: text,
                        metadata: {
                            slug: product.slug,
                            name: product.name,
                            sku: product.sku,
                            categoryId: product.categoryId,
                            price: product.price,
                            currency: product.currency,
                            tags: product.tags ?? [],
                            dollModes: product.dollModes ?? [],
                            inStock: product.isInStock,
                        },
                    },
                    { namespace: SHOP_VECTOR_NAMESPACES[locale] },
                )
                .catch((err: unknown) => {
                    console.warn(
                        "[shop-vector] upsert failed",
                        product.slug,
                        locale,
                        err,
                    );
                }),
        ),
    );
}

export async function deleteShopProductVectors(slug: string): Promise<void> {
    const index = vectorIndex;
    if (!index) return;
    await Promise.all(
        LOCALES.map((locale) =>
            index
                .delete(`shop:${slug}:${locale}`, {
                    namespace: SHOP_VECTOR_NAMESPACES[locale],
                })
                .catch((err: unknown) =>
                    console.warn("[shop-vector] delete failed", slug, locale, err),
                ),
        ),
    );
}
