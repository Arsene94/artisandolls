import type { ReactNode } from "react";

export type LegalListBlock = {
    type: "list";
    ordered?: boolean;
    items: readonly string[];
};

export type LegalParagraphBlock = string;

export type LegalBlock = LegalParagraphBlock | LegalListBlock;

export type LegalSection = {
    heading: string;
    body: string | readonly LegalBlock[];
};

type LegalPageProps = {
    eyebrow: string;
    title: string;
    intro?: string;
    lastUpdated?: string;
    sections: readonly LegalSection[];
    operatorBlock?: ReactNode;
    tocLabel?: string;
};

function slugify(value: string): string {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function isListBlock(block: LegalBlock): block is LegalListBlock {
    return typeof block === "object" && (block as LegalListBlock).type === "list";
}

function renderBody(body: LegalSection["body"]) {
    if (typeof body === "string") {
        return <p>{body}</p>;
    }
    return body.map((block, idx) => {
        if (typeof block === "string") {
            return <p key={idx}>{block}</p>;
        }
        if (isListBlock(block)) {
            const Tag = block.ordered ? "ol" : "ul";
            return (
                <Tag
                    key={idx}
                    className={
                        block.ordered
                            ? "list-decimal pl-6 space-y-1.5"
                            : "list-disc pl-6 space-y-1.5"
                    }
                >
                    {block.items.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </Tag>
            );
        }
        return null;
    });
}

export default function LegalPage({
    eyebrow,
    title,
    intro,
    lastUpdated,
    sections,
    operatorBlock,
    tocLabel,
}: LegalPageProps) {
    return (
        <article className="legal bg-silk text-silk-800 surface-light">
            <header className="bg-velvet-950 text-silk" data-surface="dark">
                <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-gold">
                        {eyebrow}
                    </p>
                    <h1 className="mt-4 font-display italic font-medium text-3xl leading-tight sm:text-4xl lg:text-5xl">
                        {title}
                    </h1>
                    {intro ? (
                        <p className="mt-6 max-w-2xl text-base text-silk/80 leading-relaxed">
                            {intro}
                        </p>
                    ) : null}
                    {lastUpdated ? (
                        <p className="mt-6 text-[0.72rem] uppercase tracking-[0.18em] text-silk/55">
                            {lastUpdated}
                        </p>
                    ) : null}
                </div>
            </header>

            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-[14rem_1fr]">
                    {tocLabel ? (
                        <aside
                            aria-label={tocLabel}
                            className="hidden lg:block self-start sticky top-32"
                        >
                            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-silk-600 mb-3">
                                {tocLabel}
                            </p>
                            <ol className="space-y-2 text-sm">
                                {sections.map((section) => {
                                    const id = slugify(section.heading);
                                    return (
                                        <li key={id}>
                                            <a
                                                href={`#${id}`}
                                                className="text-silk-800 hover:text-velvet-700 transition-colors motion-reduce:transition-none"
                                            >
                                                {section.heading}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ol>
                        </aside>
                    ) : null}

                    <div className="max-w-3xl">
                        {operatorBlock}
                        <div className="space-y-12 prose">
                            {sections.map((section) => {
                                const id = slugify(section.heading);
                                return (
                                    <section
                                        key={id}
                                        id={id}
                                        className="scroll-mt-28"
                                    >
                                        <h2>{section.heading}</h2>
                                        <div className="mt-3 space-y-3">
                                            {renderBody(section.body)}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
