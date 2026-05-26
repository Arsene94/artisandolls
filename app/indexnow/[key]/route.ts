import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Verificarea de proprietate IndexNow: motorul cere ca `keyLocation` să servească
// un fișier text conținând exact cheia. Îl ținem dinamic ca să putem roti cheia
// din environment fără rebuild.
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ key: string }> },
) {
    const { key } = await params;
    const expected = process.env.INDEXNOW_KEY;

    if (!expected || !key.endsWith(".txt")) {
        return new NextResponse("Not Found", { status: 404 });
    }

    const requested = key.replace(/\.txt$/, "");
    if (requested !== expected) {
        return new NextResponse("Not Found", { status: 404 });
    }

    return new NextResponse(expected, {
        status: 200,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
        },
    });
}
