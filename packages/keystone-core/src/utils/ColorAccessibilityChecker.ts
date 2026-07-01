type ComplianceResult = {
  contrast: string;
  AA: boolean;
  AAA: boolean;
  sizeNeeded: string;
};

type ColorSuggestion = {
  color: string;
  contrast: string;
};

type AnalysisResult = {
  compliance: ComplianceResult;
  suggestions: {
    AA: ColorSuggestion[];
    AAA: ColorSuggestion[];
  };
};

export class ColorAccessibilityChecker {
  // Calculate luminance for a color
  private getLuminance(hex: string): number {
    const rgb = hex.match(/[a-fA-F0-9]{2}/g)?.map((c) => parseInt(c, 16) / 255) || [];
    if (rgb.length !== 3) throw new Error(`Invalid hex color: ${hex}`);
    return rgb
      .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
      .reduce((lum, val, i) => lum + val * [0.2126, 0.7152, 0.0722][i], 0);
  }

  // Calculate contrast ratio between two colors
  private getContrastRatio(fgHex: string, bgHex: string): number {
    const lum1 = this.getLuminance(fgHex);
    const lum2 = this.getLuminance(bgHex);
    const [lighter, darker] = lum1 > lum2 ? [lum1, lum2] : [lum2, lum1];
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Check WCAG compliance for the provided font size
  public checkCompliance(fgHex: string, bgHex: string, fontSize: number): ComplianceResult {
    const contrast = this.getContrastRatio(fgHex, bgHex);
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontSize >= 700); // Bold ≥ 14pt counts as large

    return {
      contrast: contrast.toFixed(2),
      AA: isLargeText ? contrast >= 3.0 : contrast >= 4.5,
      AAA: isLargeText ? contrast >= 4.5 : contrast >= 7.0,
      sizeNeeded: this.recommendFontSize(contrast, isLargeText)
    };
  }

  // Recommend a font size for compliance
  private recommendFontSize(contrast: number, isLargeText: boolean): string {
    if (isLargeText) {
      if (contrast < 3.0) return "Increase size significantly or adjust colors";
      if (contrast < 4.5) return "Increase to ≥ 18pt (or bold ≥ 14pt)";
    } else {
      if (contrast < 4.5) return "Increase to ≥ 18pt (or bold ≥ 14pt)";
      if (contrast < 7.0) return "Increase to meet AAA standard";
    }
    return "Current size works for selected standard.";
  }

  // Suggest accessible colors by adjusting lightness
  public suggestAccessibleColors(
    fgHex: string,
    bgHex: string,
    targetContrast: number
  ): ColorSuggestion[] {
    const adjustLightness = (hex: string, amount: number): string => {
      const rgb = hex.match(/[a-fA-F0-9]{2}/g)?.map((c) => parseInt(c, 16)) || [];
      if (rgb.length !== 3) throw new Error(`Invalid hex color: ${hex}`);
      const newRgb = rgb.map((c) => Math.max(0, Math.min(255, c + amount)));
      return `#${newRgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
    };

    const suggestions: ColorSuggestion[] = [];
    for (let i = -50; i <= 50; i += 5) {
      const adjustedColor = adjustLightness(fgHex, i);
      const contrast = this.getContrastRatio(fgHex, bgHex);
      if (contrast >= targetContrast) {
        suggestions.push({
          color: adjustedColor,
          contrast: contrast.toFixed(2)
        });
      }
    }

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  // Analyze color pair for compliance and suggestions
  public analyze(fgHex: string, bgHex: string, fontSize = 16): AnalysisResult {
    const compliance = this.checkCompliance(fgHex, bgHex, fontSize);
    const targetContrastAA = fontSize >= 18 ? 3.0 : 4.5;
    const targetContrastAAA = fontSize >= 18 ? 4.5 : 7.0;

    return {
      compliance,
      suggestions: {
        AA: this.suggestAccessibleColors(fgHex, bgHex, targetContrastAA),
        AAA: this.suggestAccessibleColors(fgHex, bgHex, targetContrastAAA)
      }
    };
  }
}
