// JSON.stringify nu escape-eaza `</script>`, `<!--`, `]]>` sau separatorii
// U+2028/U+2029. Cand JSON-LD-ul include continut editorial (descrieri de
// produs, recenzii moderate, titluri de articol), o singura secventa
// `</script>` rupe scriptul JSON-LD si deschide XSS reflectat in pagina.
// Toate cele 35 de injectii `<script type="application/ld+json">` trec
// prin acest helper. Regex-ul pentru separatorii Unicode e construit din
// `RegExp` ca sa evitam literal-uri U+2028/U+2029 in sursa (TS le trateaza
// ca line terminators si rupe regex literalele inline).

const LINE_SEPARATORS = new RegExp("[\\u2028\\u2029]", "g");

function replaceLineSeparator(ch: string): string {
    return ch.charCodeAt(0) === 0x2028 ? "\\u2028" : "\\u2029";
}

export function safeLdJson(value: unknown): string {
    return JSON.stringify(value)
        .replace(/</g, "\\u003c")
        .replace(/>/g, "\\u003e")
        .replace(/&/g, "\\u0026")
        .replace(LINE_SEPARATORS, replaceLineSeparator);
}
