# Shop module

Shop e-commerce module bolted onto the doll-rental platform — separate tables, Redis cart, full public + admin UI, semantic search, cross-sell on doll detail, image uploader.

---

The site now has two product surfaces:
1. **Dolls** (`/catalog`) — advisor-driven, no online payment, no cart, status timeline with 12+9 statuses.
2. **Shop** (`/shop`) — standard e-commerce with cart, stock, multi-line orders.

Both share customers, settings, WhatsApp notify, Realtime new-order toasts.

**Data model** (migration `20260526120000_create_shop.sql`):
- `shop_categories` — multilingual (RO/EN/NL columns), badge, image, ordered.
- `shop_products` — slug/sku/price/compare_at_price (minor units), `stock_quantity` with CHECK ≥ 0, `track_stock` toggle, `doll_modes text[]` (rent/buy) for cross-sell scoring, gin indexes on tags + doll_modes.
- `shop_orders` — separate enum `shop_order_status` (9 stages: new → in_review → confirmed → packing → shipped → delivered → completed | cancelled | refunded). Order numbers prefixed `VS-`.
- `shop_order_items` — line items with snapshotted product name/sku/image.
- RPC `shop_decrement_stock(p_product_id, p_quantity)` — atomic, used by checkout. Negative `p_quantity` rolls back.

**Cart** (`lib/shop/cart.ts`):
- Redis-backed under key `artisandolls:shop:cart:<uuid>`, TTL 30 days.
- HttpOnly cookie `ad_cart_id` (id) + readable cookie `ad_cart_count` (badge).
- `getCartSummary()` joins live product data, applies the active coupon, and surfaces missing slugs so the UI can reconcile. Returns `subtotal`, `discountAmount`, `total`, `coupon` snapshot.
- Limits: max 20 per item, 30 distinct items.

**Soft stock reservation** (`lib/shop/reservations.ts`):
- Per-cart Redis Hash `artisandolls:shop:reservation:<cart_id>` mapping `<slug>` → `<qty>`, TTL **30 minutes** refreshed on every cart mutation; cleared on cart wipe / checkout success.
- `reservedTotals(slugs?)` sums reservations across all live carts via SCAN — small-scale OK; switch to a global counter if active-cart count grows past a few thousand.
- `withLiveAvailability(products)` overlay subtracts reservations from `stock_quantity` and exposes `availableQuantity`. Callers (`getShopProducts`, `getShopProductBySlug`) apply it automatically.
- Checkout pre-flight uses `stock − reservations from *other* carts` so the buyer is never blocked by their own reservation. Atomic `shop_decrement_stock` still runs at commit; rollback on partial failure.

**Coupons** (`lib/shop/coupons.ts` + migration `20260527_create_shop_coupons.sql`):
- Tables: `shop_coupons` (case-insensitive `code`, type `percentage` / `fixed` / `free_shipping`, value, optional `max_discount` cap, `min_subtotal` floor, optional `starts_at` / `expires_at`, optional `max_redemptions`, optional `applies_to_categories uuid[]`), `shop_coupon_redemptions` (append-only audit trail).
- `shop_orders` gained `coupon_id` + `coupon_code` for traceability.
- Postgres functions: `shop_validate_coupon(code, subtotal, category_ids)` — read-only, granted to anon; `shop_redeem_coupon(coupon_id, order_id, amount, customer_phone)` — `SECURITY DEFINER` with row lock + idempotent insert into redemptions, granted to `service_role` only.
- Cart state extended with `couponCode?: string | null`. Cart actions `applyCouponAction` / `removeCouponAction` revalidate `/shop/cart` and `/shop/checkout`.
- UI `<CartCouponForm>` (cart + checkout summary) — translated error strings for each error class (`not_found`, `expired`, `subtotal_too_low`, etc.).
- Checkout server action re-validates with the trusted Supabase function, never trusts the cart-stored discount; if the redemption RPC fails the order is silently re-priced to the un-discounted total.
- Admin CRUD under `/admin/shop/coupons` with code uppercased on save, multi-category limiter checkboxes, and `redemptions_count / max_redemptions` displayed live.

**Cross-sell** (`lib/shop/cross-sell.ts`):
- Tries Upstash Vector first (`crossSellShopForDoll`) with metadata filter `dollModes CONTAINS '<mode>' AND inStock = true`.
- Falls back to the deterministic tag-scorer when Vector is disabled or returns fewer than 2 hits: doll_modes match required; tag overlap +3; featured +2; rent + care tag +1.
- Mounted on doll detail page above SimilarDolls — returns null if no products.

**Semantic search** (`lib/upstash/shop-vector-{sync,search}.ts`):
- Vector ids: `shop:<slug>:<locale>` in namespaces `shop:ro`, `shop:en`, `shop:nl`.
- Sync hooks in `app/admin/(protected)/shop/actions.ts` mirror doll behavior: upsert on create/update, delete on row delete. Fail-open.
- `shopSemanticSearch(query, locale, topK)` powers the `<ShopSearchBar>` on `/shop`. Result slugs are intersected with the loaded product list; substring fallback applies for sub-2-char queries or when Vector is offline.
- `similarShopProducts(seedSlug, seedText, locale, topK)` replaces the previous "same category" recommendations on `/shop/p/[slug]`. Same-category list is the runtime fallback.
- `crossSellShopForDoll(seedText, mode, locale, topK)` is what `getCrossSellForDoll` calls first.
- Search timeout is 1.2s with degraded fallback. Feature flag `VECTOR_SEARCH_ENABLED=0` disables the calls site-wide.

**Public routes**:
- `/shop` — categories + featured grid + semantic search bar
- `/shop/c/[slug]` — category listing
- `/shop/p/[slug]` — product detail with vector-similar related (same-category fallback)
- `/shop/cart` — Redis-loaded cart with quantity controls
- `/shop/checkout` — same advisor model as dolls (no PSP)
- `/shop/order/[id]/success` — receipt page

**Checkout action** (`app/[locale]/shop/checkout/actions.ts`):
1. Rate limit via `orderLimiter` (shared with doll order)
2. `getCartSummary()` + per-line atomic `shop_decrement_stock`; rollback on partial failure
3. Customer upsert (email or `normalized_phone`)
4. Insert `shop_orders` + `shop_order_items`
5. `emitNewOrder` (Realtime) + `enqueueWhatsAppNotification` (QStash)
6. `clearCart()` then redirect to `/shop/order/[id]/success`

**Admin** under `/admin/shop/`:
- `products` (list + new + edit + delete) with `<AdminImageUploadField>` for main image and the new `<AdminImageGalleryField>` for up to 8 secondary images (reorder, replace, remove). Forms post a JSON-encoded gallery so the existing CSV `image_paths` field is still accepted as a fallback.
- `categories` (list + new + edit + delete) with `<AdminImageUploadField>` for the hero image.
- `orders` (list + detail with status updater).
- All uploads go through the same `optimizeImageBeforeUpload` → Supabase `doll-images` bucket pipeline used by doll/outfit admin, just under the `shop/...` folder prefix.

**Cache invalidation**: every admin mutation calls `invalidateShopCache()` which scans `artisandolls:shop:*` and deletes. Reads are 5-10 min TTL.

**Navbar**: shop link added alongside catalog; cart icon via `<NavbarCartLink>` reads `ad_cart_count` cookie with `useSyncExternalStore` + interval poll, hydration-safe.

**Sitemap**: `/shop`, `/shop/c/<slug>`, `/shop/p/<slug>` all included.

**i18n**: `shop.*` keys in all three locales — landing, cart, checkout, success, cross-sell.

**Online payment** (`lib/payments/*` + migration `20260528_create_shop_payments.sql`):
- Two providers, both behind a `PaymentProvider` interface (`start(input)` + `verifyWebhook(rawBody, headers)`):
  - **Stripe** — `Checkout.Session` with optional Connect destination charge (`STRIPE_CONNECT_ACCOUNT_ID` + `STRIPE_APPLICATION_FEE_MINOR`). RON in **bani** integers. Webhook handles `checkout.session.completed` / `expired` / `payment_intent.payment_failed` / `charge.refunded`.
  - **Netopia v2** — `POST /payment/card/start` on `https://secure.sandbox.netopia-payments.com` (sandbox) or `https://secure.mobilpay.ro/pay` (production toggled via `NETOPIA_LIVE`). Auth is the raw API key in the `Authorization` header. Amounts in **lei float**. IPN is a JWT in the `Verification-Token` header, RS256, verified with the merchant's RSA public key (`NETOPIA_PUBLIC_KEY`).
- Activation is operator-controlled from `Admin → Setări → Plată online`: a toggle plus a provider radio (`stripe` / `netopia`), with sandbox/production switch for Netopia and Stripe Connect ID fields. Secrets stay in env (the admin shows the env-var names).
- `getActivePaymentProvider()` returns null when (a) the global toggle is off or (b) the chosen provider is not fully configured — in either case the checkout silently degrades to cash on delivery.
- `shop_orders` carries `payment_method` (`cash` / `card_online`), `payment_status` (`not_required` / `pending` / `authorised` / `paid` / `failed` / `refunded` / `voided`), `payment_provider`, `payment_external_id`, `payment_redirect_url`, `paid_at`, `payment_failure_reason`.
- `shop_payment_events (provider, external_id)` is the idempotency table for inbound webhooks; duplicate deliveries collapse to a no-op.
- Webhook fires `enqueueWhatsAppNotification` only when `payment_status` transitions to `paid` — operator is not pinged on abandoned card attempts.
- Webhook routes: `/api/payments/stripe/webhook` and `/api/payments/netopia/webhook` (the latter returns Netopia's expected `{ errorCode: 0|1 }` shape so the retry policy is honoured).
- Checkout UI: a radio `Cash la livrare` / `Card online (3D-Secure)`; the online option is rendered only when `onlinePaymentAvailable()` returns true. Submit button label flips to "Plătește acum" when the buyer picks the card option.
- Success page (`/shop/order/[id]/success`) reads `payment_status` and shows a status banner (pending/paid/failed) with the appropriate i18n copy.

**Universal Commerce Protocol (UCP)** (`lib/ucp/*` + migration `20260529_create_ucp.sql`):
- Implementation of the [UCP v2026-04-08](https://ucp.dev/latest/specification/checkout/) REST checkout binding so AI agents (Google AI Mode / Gemini / MCP) can place orders against our shop using the open standard.
- Tables: `ucp_checkout_sessions` (durable mapping `chk_*` → `shop_orders.id`, full session JSONB, 6h expiry) + `ucp_idempotency` (24h response cache for retried POSTs).
- Endpoints, all under `/api/ucp/checkout-sessions`:
  - `POST /` — create session from agent's `line_items`; returns `201` with a fully-populated `CheckoutSession`. Honors `Idempotency-Key`.
  - `GET /{id}` — read state.
  - `PUT /{id}` — full-resource replacement (buyer, fulfillment, line items). Recomputes totals + VAT + coupon.
  - `POST /{id}/complete` — validates buyer + delivery + live stock, runs the same atomic `shop_decrement_stock` + rollback the own checkout uses, inserts `shop_orders` + `shop_order_items`, emits Realtime, enqueues WhatsApp via QStash. Idempotent re-completion returns the original session.
  - `POST /{id}/cancel` — terminal cancel; refuses already-terminal sessions with `409`.
- Discovery: `GET /.well-known/ucp` advertises `bindings.rest.endpoint`, `capabilities`, `payment_handlers`; returns `ucp.status: disabled` when the admin toggle is off.
- Auth: bearer in `Authorization` *or* `X-API-Key`. Plaintext key is shown **exactly once** at generation (`UcpKeyManager` UI in admin); we persist only `sha256(key)` in `platform_settings.ucp_api_key_hash` and compare with `timingSafeEqual`.
- Admin toggle in Setări → Checkout · UCP: `shop_checkout_mode` (`own` only / `own + ucp`) and a separate `ucp_enabled` flag — together they gate every endpoint via `authoriseUcpRequest()`.
- The own-domain shop checkout at `/shop/checkout` continues to work unchanged regardless of UCP state; UCP is strictly an additional protocol surface for agentic clients.

**Romania availability of UCP** (as of 2026-05-26):
- The **spec itself** is open source under Apache 2.0, language- and jurisdiction-agnostic. Any merchant anywhere may expose UCP endpoints — that's exactly what this implementation does.
- The **Google-operated UCP buyer surfaces** (AI Mode in Search, Gemini web app) are currently live only in **US, Canada, Australia** per the [official support article](https://support.google.com/merchants/answer/16837055). Phase 2 (EU + UK) is signalled for later in 2026 but with no firm date.
- Onboarding into the Google-side flow needs a `native_commerce` product feed, a Google Pay & Wallet Console account, and an approved Merchant Center interest form — most of which are not yet open to Romanian entities.
- **Practical answer**: the endpoints we just shipped accept *any* UCP-compatible agent (custom MCP clients, partner-built bots, Shopify Agent Toolkit etc.) — but Romanian buyers cannot yet reach us via Google AI Mode / Gemini purchases. Keep UCP enabled in code, opt-in via admin, run it as a sandbox until the EU surface opens.

**What's not in this MVP** (intentional, future work):
- Wishlist / save-for-later
- Customer accounts (still anonymous, by phone/email upsert)
- Free-shipping coupon type — the enum value exists but the shipping fee is still hard-coded to 0 RON; coupon type effectively no-ops until shipping is priced
- Stripe is restricted from adult content per Stripe ToS — keep Netopia as the production toggle. The Stripe path is wired for accessory-only catalogues / future jurisdictions and verified end-to-end against the sandbox.

**Setup after merging**:
1. Run the migration: `supabase migration up`
2. Add at least one category + a few products via `/admin/shop/categories` and `/admin/shop/products`
3. Optionally mark products as `is_featured = true` to fill the shop landing's featured rail
4. For cross-sell, tag products with same tags the dolls already use (e.g. `silicone`, `care`, `rent-companion`) so both the vector scorer and the tag fallback can match them
5. Make sure the Upstash Vector index is created (Hybrid + `BAAI/bge-m3` recommended) so the new namespaces `shop:ro`, `shop:en`, `shop:nl` accept upserts; otherwise the shop search bar still works via the substring fallback

Related: [[project-artisandolls]], [[upstash-integration]], [[audit-baseline-2026-05]]
