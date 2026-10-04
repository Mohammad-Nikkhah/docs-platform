/**
 * Slug helper that keeps Persian letters and Latin letters/digits.
 * Output matches SLUG_REGEX in validation.ts.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[‌‏‎]/g, "") // ZWNJ / direction marks
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
