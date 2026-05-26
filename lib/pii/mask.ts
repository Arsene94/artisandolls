// Helper-uri pentru loguri: păstrăm „forma" valorii (suficient pentru a
// recunoaște clientul în debug) și ascundem detaliile. Vercel și CloudWatch
// rețin log-urile pe termen lung — GDPR cere minimizare.

export function maskEmail(value: string | null | undefined): string | null {
    if (!value) return null;
    const at = value.indexOf("@");
    if (at < 1) return "***";
    const local = value.slice(0, at);
    const domain = value.slice(at + 1);
    const visible = local.slice(0, Math.min(2, local.length));
    return `${visible}${"*".repeat(Math.max(1, local.length - visible.length))}@${domain}`;
}

export function maskPhone(value: string | null | undefined): string | null {
    if (!value) return null;
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 4) return "***";
    const last4 = digits.slice(-4);
    return `***${last4}`;
}
