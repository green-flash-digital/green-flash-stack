export function hsbToHsl(h: number, s: number, b: number) {
  // Normalize HSB values
  const hue = h;
  const saturation = s / 100;
  const brightness = b / 100;

  // Calculate Lightness
  let lightness = ((2 - saturation) * brightness) / 2;

  // Calculate Saturation
  let sl: number;
  if (lightness === 0 || lightness === 1) {
    sl = 0;
  } else {
    sl = (brightness - lightness) / Math.min(lightness, 1 - lightness);
  }

  // Convert back to percentages
  sl *= 100;
  lightness *= 100;

  return {
    h: hue,
    s: sl,
    l: lightness
  };
}

export function hslToHex(h: number, s: number, l: number) {
  // Normalize HSL values
  const hue = h / 360;
  const saturation = s / 100;
  const lightness = l / 100;

  let r: number;
  let g: number;
  let b: number;

  if (saturation === 0) {
    // Achromatic color (gray)
    r = g = b = lightness;
  } else {
    const hueToRgb = (p: number, q: number, t: number): number => {
      let tt = t;
      if (tt < 0) tt = tt + 1;
      if (tt > 1) tt = tt - 1;
      if (tt < 1 / 6) return p + (q - p) * 6 * tt;
      if (tt < 1 / 2) return q;
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q =
      lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;

    r = hueToRgb(p, q, hue + 1 / 3);
    g = hueToRgb(p, q, hue);
    b = hueToRgb(p, q, hue - 1 / 3);
  }

  // Convert RGB to HEX
  const toHex = (x: number): string => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hsbToHex(h: number, s: number, b: number) {
  const hsl = hsbToHsl(h, s, b);
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

// Convert HEX to RGB
export function hexToRgb(h: string) {
  let hex = h.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const bigint = Number.parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

// Convert RGB to HSB
function rgbToHsb(r: number, g: number, b: number) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let h = 0; // Hue
  const s = max === 0 ? 0 : (delta / max) * 100; // Saturation
  const v = max * 100; // Brightness

  if (delta !== 0) {
    if (max === red) {
      h = ((green - blue) / delta) % 6;
    } else if (max === green) {
      h = (blue - red) / delta + 2;
    } else if (max === blue) {
      h = (red - green) / delta + 4;
    }
    h *= 60; // Convert to degrees
  }

  // Normalize hue to 0–360
  if (h < 0) {
    h += 360;
  }

  return { h: Math.round(h), s: Math.round(s), b: Math.round(v) };
}

// Convert HEX to HSB
export function hexToHsb(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsb(r, g, b);
}

export function getHueFromHex(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const { h } = rgbToHsb(r, g, b);
  return h;
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // Remove the hash if it's there
  let newHex = hex.replace(/^#/, "");

  // Convert 3-digit hex to 6-digit hex
  if (newHex.length === 3) {
    newHex = newHex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Parse the r, g, b values
  const bigint = Number.parseInt(newHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  // Convert r, g, b to a range of 0 to 1
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  // Convert to degrees
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return { h, s, l };
}
