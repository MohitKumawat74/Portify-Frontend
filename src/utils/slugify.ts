/**
 * Converts a string into a URL-safe slug.
 * e.g. "John Doe's Portfolio" → "john-does-portfolio"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
