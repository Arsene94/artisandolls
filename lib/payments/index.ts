import "server-only";
import { getPublicPlatformSettings } from "@/lib/settings";
import { netopiaProvider } from "@/lib/payments/netopia";
import { stripeProvider } from "@/lib/payments/stripe";
import type { PaymentProvider, PaymentProviderId } from "@/lib/payments/types";

const PROVIDERS: Record<PaymentProviderId, PaymentProvider> = {
    stripe: stripeProvider,
    netopia: netopiaProvider,
};

export function getProvider(id: PaymentProviderId): PaymentProvider {
    return PROVIDERS[id];
}

/**
 * Resolve the currently-active provider for new orders. Returns null when
 * online payment is disabled in settings or the toggled provider is not
 * configured (missing env). The caller falls back to "cash on delivery".
 */
export async function getActivePaymentProvider(): Promise<PaymentProvider | null> {
    const settings = await getPublicPlatformSettings().catch(() => null);
    if (!settings || !settings.online_payment_enabled) return null;
    const id = settings.online_payment_provider;
    if (id !== "stripe" && id !== "netopia") return null;
    const provider = PROVIDERS[id];
    if (!provider.isConfigured()) return null;
    return provider;
}

export async function onlinePaymentAvailable(): Promise<boolean> {
    return (await getActivePaymentProvider()) !== null;
}

export { stripeProvider, netopiaProvider };
