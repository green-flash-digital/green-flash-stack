export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Turns a route segment back into a display label (e.g. "what-is-documints"
 * -> "What Is Documints"). `slugify` is lossy, so this is a best-effort
 * capitalization, not a true inverse - it's only ever used for segments that
 * have no doc (and therefore no `title` frontmatter) to derive a label from.
 */
export function unslugify(segment: string): string {
  return segment
    .split("-")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
