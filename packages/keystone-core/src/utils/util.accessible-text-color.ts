export function getAccessibleTextColor(hex: string): "white" | "black" {
  // Ensure the hex color is in the correct format
  const cleanHex = hex.replace("#", "");
  if (![3, 6].includes(cleanHex.length)) {
    throw new Error("Invalid hex color format");
  }

  // Expand shorthand hex format (e.g., "abc" -> "aabbcc")
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split("")
          .map((char) => char + char)
          .join("")
      : cleanHex;

  // Extract RGB values
  const r = parseInt(fullHex.slice(0, 2), 16) / 255;
  const g = parseInt(fullHex.slice(2, 4), 16) / 255;
  const b = parseInt(fullHex.slice(4, 6), 16) / 255;

  // Convert RGB to relative luminance
  const luminance = (value: number) =>
    value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);

  const relativeLuminance = 0.2126 * luminance(r) + 0.7152 * luminance(g) + 0.0722 * luminance(b);

  // Return black or white based on luminance
  return relativeLuminance > 0.5 ? "black" : "white";
}
