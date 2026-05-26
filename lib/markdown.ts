import { createElement, type ReactElement, type ReactNode } from "react";

// Markdown minimal cu domeniu strict: blog editorial. Suportă:
//   - paragrafe (separate prin linie goală)
//   - heading-uri ## și ### cu id auto-slug (anchor pentru tabela de cuprins)
//   - liste neordonate (linii care încep cu `- `)
//   - bold `**text**`, italic `*text*`
//   - link-uri `[text](https://url)`
//   - separator `---`
// Nu suportă: tabele, imagini inline, code blocks. Tot conținutul e
// escape-uit întâi prin React (fără dangerouslySetInnerHTML), deci nu
// există vector XSS dinspre date de la admin.

type Block =
    | { kind: "p"; text: string }
    | { kind: "h2" | "h3"; text: string; id: string }
    | { kind: "ul"; items: string[] }
    | { kind: "hr" };

function slugify(text: string): string {
    return text
        .toLocaleLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 80);
}

function parseBlocks(source: string): Block[] {
    const lines = source.replace(/\r\n/g, "\n").split("\n");
    const blocks: Block[] = [];
    let paraBuf: string[] = [];
    let listBuf: string[] = [];

    const flushPara = () => {
        if (paraBuf.length === 0) return;
        blocks.push({ kind: "p", text: paraBuf.join(" ").trim() });
        paraBuf = [];
    };
    const flushList = () => {
        if (listBuf.length === 0) return;
        blocks.push({ kind: "ul", items: listBuf });
        listBuf = [];
    };

    for (const raw of lines) {
        const line = raw.trim();

        if (line === "") {
            flushPara();
            flushList();
            continue;
        }
        if (line === "---") {
            flushPara();
            flushList();
            blocks.push({ kind: "hr" });
            continue;
        }
        if (line.startsWith("### ")) {
            flushPara();
            flushList();
            const text = line.slice(4).trim();
            blocks.push({ kind: "h3", text, id: slugify(text) });
            continue;
        }
        if (line.startsWith("## ")) {
            flushPara();
            flushList();
            const text = line.slice(3).trim();
            blocks.push({ kind: "h2", text, id: slugify(text) });
            continue;
        }
        if (line.startsWith("- ")) {
            flushPara();
            listBuf.push(line.slice(2).trim());
            continue;
        }
        flushList();
        paraBuf.push(line);
    }
    flushPara();
    flushList();
    return blocks;
}

// Inline parser — emite ReactNode[] dintr-o linie. Ordinea contează:
// link-urile au formula mai specifică decât stelele, deci le tratăm prima.
function renderInline(text: string, keyPrefix: string): ReactNode[] {
    const out: ReactNode[] = [];
    let cursor = 0;
    let nodeIndex = 0;
    const pushText = (value: string) => {
        if (value.length === 0) return;
        out.push(value);
    };

    const pattern =
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
        pushText(text.slice(cursor, match.index));
        const key = `${keyPrefix}-${nodeIndex++}`;
        if (match[1] && match[2]) {
            const [, label, href] = match;
            const external = /^https?:\/\//.test(href);
            out.push(
                createElement(
                    "a",
                    {
                        key,
                        href,
                        ...(external
                            ? { rel: "noopener noreferrer", target: "_blank" }
                            : {}),
                        className:
                            "text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                    },
                    label,
                ),
            );
        } else if (match[3]) {
            out.push(createElement("strong", { key }, match[3]));
        } else if (match[4]) {
            out.push(createElement("em", { key }, match[4]));
        }
        cursor = pattern.lastIndex;
    }
    pushText(text.slice(cursor));
    return out;
}

function renderBlock(block: Block, index: number): ReactElement {
    const key = `b-${index}`;
    if (block.kind === "hr") {
        return createElement("hr", {
            key,
            className: "my-10 border-velvet-800",
        });
    }
    if (block.kind === "ul") {
        return createElement(
            "ul",
            {
                key,
                className:
                    "my-6 space-y-2 list-disc pl-6 marker:text-gold/60 text-base sm:text-[1.05rem] text-silk/85 leading-relaxed",
            },
            block.items.map((item, i) =>
                createElement("li", { key: `${key}-${i}` }, renderInline(item, `${key}-${i}`)),
            ),
        );
    }
    if (block.kind === "h2") {
        return createElement(
            "h2",
            {
                key,
                id: block.id,
                className:
                    "scroll-mt-32 mt-12 mb-4 font-display italic text-2xl sm:text-3xl text-silk leading-tight",
            },
            block.text,
        );
    }
    if (block.kind === "h3") {
        return createElement(
            "h3",
            {
                key,
                id: block.id,
                className:
                    "scroll-mt-32 mt-8 mb-3 font-display italic text-xl sm:text-2xl text-silk leading-tight",
            },
            block.text,
        );
    }
    return createElement(
        "p",
        {
            key,
            className: "mb-5 text-base sm:text-[1.05rem] text-silk/85 leading-relaxed",
        },
        renderInline(block.text, key),
    );
}

export function renderMarkdown(source: string): ReactElement[] {
    return parseBlocks(source).map(renderBlock);
}

/** Extrage doar heading-urile h2 — folosit pentru a construi o tabelă de cuprins. */
export function extractHeadings(source: string): { id: string; text: string }[] {
    return parseBlocks(source)
        .filter((b): b is Block & { kind: "h2"; id: string; text: string } => b.kind === "h2")
        .map((b) => ({ id: b.id, text: b.text }));
}

/** Estimare durata de citire în minute (200 cuvinte/min, minim 1). */
export function estimateReadingMinutes(source: string): number {
    const words = source.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}
