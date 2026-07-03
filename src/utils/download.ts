/** Tiny client-side download helpers (no dependencies). */

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadText(
  text: string,
  filename: string,
  mime = "text/plain;charset=utf-8",
): void {
  downloadBlob(new Blob([text], { type: mime }), filename);
}

export function downloadMarkdown(markdown: string, filename: string): void {
  downloadText(markdown, filename, "text/markdown;charset=utf-8");
}

/** Make a filename-safe slug from arbitrary text. */
export function slugify(text: string): string {
  return (
    text
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "") // strip accents
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "document"
  );
}
