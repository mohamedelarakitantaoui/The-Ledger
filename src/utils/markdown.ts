/**
 * Minimal, dependency-free Markdown → HTML for the document preview.
 * Input is escaped first, so the output is safe to inject. Supports the subset
 * the generator produces: headings, bold/italic/code, links, bullet lists,
 * horizontal rules, and paragraphs.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(text: string): string {
  let s = escapeHtml(text);
  // links [text](url)
  s = s.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>',
  );
  // bold **text**
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // italic *text* or _text_
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");
  // inline code `code`
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  return s;
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let inList = false;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${paragraph.map(inline).join("<br/>")}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.trim() === "") {
      flushParagraph();
      closeList();
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      flushParagraph();
      closeList();
      html.push("<hr/>");
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      flushParagraph();
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  closeList();
  return html.join("\n");
}
