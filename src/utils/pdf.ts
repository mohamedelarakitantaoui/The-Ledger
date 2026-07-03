/**
 * Markdown → PDF, rendered as real, selectable text in a single column
 * (ATS-friendly — no canvas rasterisation, no tables, no multi-column layout).
 * Uses jsPDF's built-in Helvetica (WinAnsi), which covers French accents.
 */

interface Word {
  text: string;
  bold: boolean;
}

const FONT = "helvetica";

/**
 * jsPDF's built-in Helvetica is WinAnsi (cp1252): full French coverage
 * (é è ê ë ç à â î ï ô û ù œ « » – — ' ' " ") but anything outside cp1252
 * renders as garbage. Map the common offenders, drop the rest.
 */
const CHAR_MAP: Record<string, string> = {
  " ": " ", // non-breaking space
  " ": " ", // narrow no-break space (common before French punctuation)
  "‑": "-", // non-breaking hyphen
  "−": "-", // minus sign
  "→": "->",
  "←": "<-",
  "✓": "-", // ✓
  "✔": "-", // ✔
  "●": "•",
  "▪": "•",
  "‣": "•",
};

// cp1252's printable extras above U+00FF.
const WINANSI_EXTRA = new Set(
  "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ",
);

function toWinAnsi(text: string): string {
  let out = "";
  for (const ch of text) {
    const mapped = CHAR_MAP[ch];
    if (mapped !== undefined) {
      out += mapped;
    } else if (ch.codePointAt(0)! <= 0xff || WINANSI_EXTRA.has(ch)) {
      out += ch;
    }
    // else: not representable (emoji, ✦, CJK, …) — drop it
  }
  return out;
}

/** Split a markdown line into words, tracking **bold** runs; drops `code` ticks. */
function toWords(text: string): Word[] {
  const clean = toWinAnsi(text)
    .replace(/`/g, "")
    // [label](url) → "label (url)" so links survive as plain text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    // strip single-asterisk *emphasis* markers (bold ** pairs are kept for below)
    .replace(/(?<!\*)\*(?!\*)/g, "");
  const parts = clean.split("**");
  const words: Word[] = [];
  parts.forEach((part, i) => {
    const bold = i % 2 === 1;
    for (const w of part.split(/\s+/)) {
      if (w) words.push({ text: w, bold });
    }
  });
  return words;
}

export async function exportMarkdownToPdf(
  markdown: string,
  filename: string,
): Promise<void> {
  // Lazy-loaded so jsPDF stays out of the initial bundle.
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 54;
  const contentWidth = pageWidth - margin * 2;
  const bottom = pageHeight - margin;
  let y = margin;

  function newLine(lineHeight: number): void {
    if (y + lineHeight > bottom) {
      doc.addPage();
      y = margin;
    }
    y += lineHeight;
  }

  function drawWords(
    words: Word[],
    opts: {
      size: number;
      lineHeight: number;
      hanging?: number;
      color?: [number, number, number];
    },
  ): void {
    if (words.length === 0) {
      y += opts.lineHeight;
      return;
    }
    const hanging = opts.hanging ?? 0;
    const [r, g, b] = opts.color ?? [28, 28, 28];
    doc.setFontSize(opts.size);
    doc.setTextColor(r, g, b);

    newLine(opts.lineHeight);
    let x = margin;
    let lineHasContent = false;

    for (const w of words) {
      doc.setFont(FONT, w.bold ? "bold" : "normal");
      const wWidth = doc.getTextWidth(w.text);
      const spaceW = lineHasContent ? doc.getTextWidth(" ") : 0;
      if (lineHasContent && x + spaceW + wWidth > margin + contentWidth) {
        newLine(opts.lineHeight);
        x = margin + hanging;
        lineHasContent = false;
      }
      if (lineHasContent) x += spaceW;
      doc.text(w.text, x, y);
      x += wWidth;
      lineHasContent = true;
    }
  }

  function rule(): void {
    if (y + 6 > bottom) {
      doc.addPage();
      y = margin;
    }
    y += 6;
    doc.setDrawColor(205, 205, 205);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  }

  const lines = markdown.replace(/\r\n/g, "\n").split("\n");

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.trim() === "") {
      y += 6;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      rule();
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const words = toWords(heading[2]).map((w) => ({ ...w, bold: true }));
      if (level === 1) {
        y += 2;
        drawWords(words, { size: 19, lineHeight: 23, color: [17, 17, 17] });
      } else if (level === 2) {
        y += 9;
        drawWords(words, { size: 12.5, lineHeight: 16, color: [17, 17, 17] });
        rule();
      } else {
        y += 6;
        drawWords(words, { size: 11, lineHeight: 15, color: [25, 25, 25] });
      }
      continue;
    }

    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      const words: Word[] = [
        { text: "•", bold: false },
        ...toWords(bullet[1]),
      ];
      drawWords(words, { size: 10.5, lineHeight: 14.5, hanging: 14 });
      continue;
    }

    drawWords(toWords(line), { size: 10.5, lineHeight: 14.5 });
  }

  doc.save(filename);
}
