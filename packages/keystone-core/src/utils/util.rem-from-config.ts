import type { KeystoneConfig } from "../schemas/schema.js";

export function remFromConfig(config: KeystoneConfig, value: number): string {
  return (value / config.sizeAndSpace.baseFontSize).toString();
}
