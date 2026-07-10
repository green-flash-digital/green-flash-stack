import { exhaustiveMatchGuard } from "@green-flash/ts-utils/isomorphic";

import type {
  ChamferConfigSizeAndSpace,
  SpaceAuto,
  SpaceManual
} from "../schemas/schema.size-and-space.js";

export type SpaceVariantsRecord = Record<string, number>;

export function calculateSpaceVariantsAuto(
  variants: SpaceAuto["variants"],
  baselineGrid: number
): SpaceVariantsRecord {
  return [...new Array(variants)].reduce<SpaceVariantsRecord>((acc, _, i) => {
    const value = baselineGrid * (i + 1);
    return Object.assign(acc, { [String(value)]: value });
  }, {});
}

export function calculateSpaceVariantsManual(
  variants: SpaceManual["variants"]
): SpaceVariantsRecord {
  return variants.reduce<SpaceVariantsRecord>(
    (acc, px) => Object.assign(acc, { [String(px)]: px }),
    {}
  );
}

export function createSpaceVariants(size: ChamferConfigSizeAndSpace): SpaceVariantsRecord {
  switch (size.space.mode) {
    case "auto":
      return calculateSpaceVariantsAuto(size.space.variants, size.baselineGrid);

    case "manual":
      return calculateSpaceVariantsManual(size.space.variants);

    default:
      return exhaustiveMatchGuard(size.space);
  }
}
