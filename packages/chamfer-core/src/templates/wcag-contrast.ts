// WCAG 2.1 contrast ratio from oklch strings.
// Conversion path: oklch → oklab → linear sRGB → relative luminance.
// OKLab → linear sRGB matrix from https://bottosson.github.io/posts/oklab/

function oklchToLinearSRGB(oklchStr: string): [number, number, number] | null {
  const m = oklchStr.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!m) return null;

  const L = parseFloat(m[1]);
  const C = parseFloat(m[2]);
  const H = parseFloat(m[3]) * (Math.PI / 180);

  // oklch → oklab
  const a = C * Math.cos(H);
  const b = C * Math.sin(H);

  // oklab → linear sRGB (OKLab M1^-1 then M2^-1)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const lc = l_ * l_ * l_;
  const mc = m_ * m_ * m_;
  const sc = s_ * s_ * s_;

  const r = +4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc;
  const g = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc;
  const bl = -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc;

  return [r, g, bl];
}

function linearToLuminance(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function relativeLuminance(r: number, g: number, b: number): number {
  // linearize gamma-encoded sRGB
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  // sRGB gamma channels from linear sRGB
  const rs = linearToLuminance(Math.max(0, r));
  const gs = linearToLuminance(Math.max(0, g));
  const bs = linearToLuminance(Math.max(0, b));
  // WCAG relative luminance (IEC 61966-2-1)
  return 0.2126 * toLinear(rs) + 0.7152 * toLinear(gs) + 0.0722 * toLinear(bs);
}

/** Returns WCAG 2.1 contrast ratio (1–21) or null if either string is unparseable. */
export function computeWcagContrast(oklch1: string, oklch2: string): number | null {
  const rgb1 = oklchToLinearSRGB(oklch1);
  const rgb2 = oklchToLinearSRGB(oklch2);
  if (!rgb1 || !rgb2) return null;

  const L1 = relativeLuminance(...rgb1);
  const L2 = relativeLuminance(...rgb2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return parseFloat(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/** Returns "AAA" (≥7), "AA" (≥4.5), "AA Large" (≥3), or "Fail". */
export function wcagLevel(ratio: number): "AAA" | "AA" | "AA Large" | "Fail" {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
}
