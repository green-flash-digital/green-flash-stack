import type { ConfigurationStateSizeAndSpace_SpaceVariants } from "../studio.state";

export function orderSpaceVariants(
  variants: ConfigurationStateSizeAndSpace_SpaceVariants
): ConfigurationStateSizeAndSpace_SpaceVariants {
  return Object.fromEntries(Object.entries(variants).sort((a, b) => a[1].order - b[1].order));
}
