#!/usr/bin/env node
/**
 * Static WCAG contrast audit over the Tailwind text-/bg- class combinations
 * we use throughout the app. The script:
 *  1) parses the `--color-*` tokens from app/globals.css
 *  2) greps every component / page for `text-<token>(/alpha)?` and `bg-<token>(/alpha)?`
 *  3) for every section/article/main, infers the local foreground + background
 *     class pair and reports those whose contrast falls below WCAG AA.
 *
 * Run: `node .audit/contrast.mjs`
 *
 * The script is intentionally heuristic — it cannot resolve cascading
 * surfaces perfectly, but it catches the obvious failures.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

const SCAN_DIRS = ["app", "components"];
const SKIP_DIRS = new Set([
    "node_modules",
    ".next",
    ".audit",
    "newdesign",
    "supabase",
]);

const TOKEN_RE = /--color-([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/g;
const CLASS_RE = /(?:text|bg)-(velvet-(?:50|100|200|300|400|500|600|700|800|900|950)|silk(?:-(?:100|200|300|400|600|800))?|gold(?:-(?:light|dark))?|pearl(?:-(?:50|100|200|500|700))?|success|warning|danger|info)(?:\/(\d{1,3}))?/g;

function hexToRgb(hex) {
    const v = hex.replace("#", "");
    return [
        parseInt(v.slice(0, 2), 16),
        parseInt(v.slice(2, 4), 16),
        parseInt(v.slice(4, 6), 16),
    ];
}

function relativeLuminance([r, g, b]) {
    const channel = (c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(hex1, hex2) {
    const L1 = relativeLuminance(hexToRgb(hex1));
    const L2 = relativeLuminance(hexToRgb(hex2));
    const [a, b] = L1 > L2 ? [L1, L2] : [L2, L1];
    return (a + 0.05) / (b + 0.05);
}

function mixOver(fgHex, bgHex, alpha) {
    const fg = hexToRgb(fgHex);
    const bg = hexToRgb(bgHex);
    const a = alpha / 100;
    const r = Math.round(fg[0] * a + bg[0] * (1 - a));
    const g = Math.round(fg[1] * a + bg[1] * (1 - a));
    const b2 = Math.round(fg[2] * a + bg[2] * (1 - a));
    return `#${[r, g, b2]
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("")}`;
}

async function loadTokens() {
    const css = await fs.readFile(path.join(ROOT, "app/globals.css"), "utf8");
    const tokens = {};
    let m;
    while ((m = TOKEN_RE.exec(css))) {
        tokens[m[1]] = m[2];
    }
    return tokens;
}

async function walk(dir, files = []) {
    let entries;
    try {
        entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
        return files;
    }
    for (const entry of entries) {
        if (SKIP_DIRS.has(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await walk(full, files);
        } else if (/\.(tsx|ts|jsx|js|css|module\.css)$/.test(entry.name)) {
            files.push(full);
        }
    }
    return files;
}

function pairsFromLine(line) {
    const fgs = [];
    const bgs = [];
    let m;
    CLASS_RE.lastIndex = 0;
    while ((m = CLASS_RE.exec(line))) {
        const klass = m[0];
        const token = m[1];
        const alpha = m[2] ? Number(m[2]) : 100;
        if (klass.startsWith("text-")) fgs.push({ token, alpha });
        else bgs.push({ token, alpha });
    }
    return { fgs, bgs };
}

function resolve(tokens, name) {
    if (name === "silk") return tokens.silk;
    if (name === "gold") return tokens.gold;
    return tokens[name] ?? null;
}

async function main() {
    const tokens = await loadTokens();
    const files = [];
    for (const dir of SCAN_DIRS) {
        await walk(path.join(ROOT, dir), files);
    }

    const findings = [];
    const seenPairs = new Map();

    for (const file of files) {
        const text = await fs.readFile(file, "utf8");
        const lines = text.split("\n");
        let surfaceStack = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const { fgs, bgs } = pairsFromLine(line);

            // Update the "current background" rolling stack — naive: each line
            // with bg- swaps the top of the stack.
            for (const bg of bgs) {
                const hex = resolve(tokens, bg.token);
                if (hex) surfaceStack.push({ hex, alpha: bg.alpha });
            }

            if (fgs.length === 0) continue;
            const bgEntry =
                surfaceStack[surfaceStack.length - 1] ??
                (file.includes("data-surface=\"dark\"")
                    ? { hex: tokens["velvet-950"], alpha: 100 }
                    : { hex: tokens.silk, alpha: 100 });
            if (!bgEntry) continue;

            for (const fg of fgs) {
                const fgHex = resolve(tokens, fg.token);
                if (!fgHex) continue;
                const effective =
                    fg.alpha === 100
                        ? fgHex
                        : mixOver(fgHex, bgEntry.hex, fg.alpha);
                const ratio = contrast(effective, bgEntry.hex);
                const pairKey = `${fg.token}/${fg.alpha}|${bgEntry.hex}`;
                if (seenPairs.has(pairKey)) continue;
                seenPairs.set(pairKey, true);

                let verdict = "AAA";
                if (ratio < 3) verdict = "FAIL";
                else if (ratio < 4.5) verdict = "AA-large";
                else if (ratio < 7) verdict = "AA";

                if (verdict === "FAIL" || verdict === "AA-large") {
                    findings.push({
                        file: path.relative(ROOT, file),
                        line: i + 1,
                        fg: `text-${fg.token}${fg.alpha < 100 ? `/${fg.alpha}` : ""}`,
                        fgHex: effective,
                        bgHex: bgEntry.hex,
                        ratio: Number(ratio.toFixed(2)),
                        verdict,
                    });
                }
            }
        }
    }

    findings.sort((a, b) => a.ratio - b.ratio);
    const fails = findings.filter((f) => f.verdict === "FAIL");
    const warns = findings.filter((f) => f.verdict === "AA-large");

    console.log(`\nWCAG contrast audit — ${findings.length} flagged combinations\n`);
    console.log(`  ${fails.length}  FAIL (< 3:1 — unreadable)`);
    console.log(`  ${warns.length}  AA-large only (< 4.5:1 — small text fails)\n`);

    if (fails.length > 0) {
        console.log("── FAIL combinations ─────────────────────────────────");
        for (const f of fails) {
            console.log(
                `  ${f.ratio.toString().padEnd(5)}:1  ${f.fg.padEnd(22)} → ${f.bgHex}   ${f.file}:${f.line}`,
            );
        }
    }

    if (warns.length > 0) {
        console.log("\n── AA-large only (acceptable for ≥18pt text) ────────");
        for (const f of warns) {
            console.log(
                `  ${f.ratio.toString().padEnd(5)}:1  ${f.fg.padEnd(22)} → ${f.bgHex}   ${f.file}:${f.line}`,
            );
        }
    }

    process.exit(fails.length > 0 ? 1 : 0);
}

main().catch((err) => {
    console.error(err);
    process.exit(2);
});
