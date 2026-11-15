/** Plain-text teaser from Markdown (syntax stripped, length capped). */
export function plainExcerpt(markdown: string, max = 140): string {
  const text = markdown
    .replace(/!\[[^\]]*]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1") // links → their text
    .replace(/^\s*(?:[-+*]|\d+\.)\s+/gm, "") // list markers
    .replace(/[*_`>#~|]/g, "") // emphasis, code, quotes, headings, tables
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
