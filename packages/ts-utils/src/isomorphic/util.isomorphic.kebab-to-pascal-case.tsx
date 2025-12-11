export function kebabToPascalCase(str: string): string {
  return str
    .split(/[-\s]/) // Split by hyphens or spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}
