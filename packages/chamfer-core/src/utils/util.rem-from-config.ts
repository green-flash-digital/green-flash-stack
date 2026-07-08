import type { ChamferConfig } from "../schemas/schema.js";

export function remFromConfig(config: ChamferConfig, value: number): string {
  return (value / config.sizeAndSpace.baseFontSize).toString();
}
