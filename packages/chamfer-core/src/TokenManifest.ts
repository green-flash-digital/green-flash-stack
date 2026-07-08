export type TokenManifest = {
  prefix: string;
  baseFontSize: number;
  color: Record<string, string>;
  custom: Record<string, string>;
  font: {
    families: Record<string, string>;
    weights: Record<string, number>;
    variants: Record<
      string,
      { family: string; weight: string; size: number; lineHeight: number; letterSpacing: number }
    >;
  };
  space: readonly number[];
  size: Record<string, number>;
  breakpoints: Record<string, number>;
};
