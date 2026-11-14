/** Lowercase letters/numbers separated by single hyphens, e.g. "newtons-second-law". */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX_LENGTH = 80;

/**
 * Turns a title into a URL slug: "Newton's 2nd Law — F = ma" → "newtons-2nd-law-f-ma".
 * Non-Latin characters are dropped, so the result can be "" (the form then asks for a slug).
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents (é → e)
    .toLowerCase()
    .replace(/['’]/g, "") // "newton's" → "newtons"
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, "");
}
