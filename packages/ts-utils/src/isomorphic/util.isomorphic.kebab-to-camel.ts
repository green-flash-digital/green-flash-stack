/**
 * Transforms a kebab case string to camel case
 */
export function kebabToCamel(kebab: string): string {
  return kebab.replace(/-([a-z0-9])/g, (_, match) => match.toUpperCase());
}
