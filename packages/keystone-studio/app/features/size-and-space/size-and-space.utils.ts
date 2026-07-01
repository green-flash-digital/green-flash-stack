import type {
  KeystoneConfig,
  SpaceAuto,
  SpaceManual,
  KeystoneConfigSizeAndSpace
} from "@keystone-css/core/schemas";
import type { SpaceVariantsRecord } from "@keystone-css/core/utils";
import { calculateSpaceVariantsAuto, calculateSpaceVariantsManual } from "@keystone-css/core/utils";
import { exhaustiveMatchGuard, generateGUID } from "ts-jolt/isomorphic";
import { match } from "ts-pattern";
import type { Updater } from "use-immer";
import { useImmer } from "use-immer";

export type ConfigurationStateSizeAndSpace_SpaceVariants = {
  [id: string]: {
    name: string;
    value: number;
    order: number;
  };
};
export type ConfigurationStateSizeAndSpace_SpaceAuto = Omit<SpaceAuto, "variants"> & {
  variants: ConfigurationStateSizeAndSpace_SpaceVariants;
};
export type ConfigurationStateSizeAndSpace_SpaceManual = Omit<SpaceManual, "variants"> & {
  variants: ConfigurationStateSizeAndSpace_SpaceVariants;
};
export type ConfigurationStateSizeAndSpace_SizeVariants = Record<
  string,
  { name: string; value: number }
>;
export type ConfigurationStateSizeAndSpace = Pick<
  KeystoneConfigSizeAndSpace,
  "baseFontSize" | "baselineGrid"
> & {
  size: {
    variants: ConfigurationStateSizeAndSpace_SizeVariants;
  };
  space: {
    mode: Required<KeystoneConfigSizeAndSpace>["space"]["mode"];
    manual: ConfigurationStateSizeAndSpace_SpaceManual;
    auto: ConfigurationStateSizeAndSpace_SpaceAuto;
  };
};

export function orderSpaceVariants(
  variants: ConfigurationStateSizeAndSpace_SpaceVariants
): ConfigurationStateSizeAndSpace_SpaceVariants {
  return Object.fromEntries(Object.entries(variants).sort((a, b) => a[1].order - b[1].order));
}

function convertSpaceVariantConfigIntoState(
  variants: SpaceVariantsRecord
): ConfigurationStateSizeAndSpace_SpaceVariants {
  const spaceVariants = Object.entries(variants).reduce(
    (accum, [variantName, variantValue], i) =>
      Object.assign(accum, {
        [generateGUID()]: {
          name: variantName,
          value: variantValue,
          order: i
        }
      }),
    {}
  );
  const orderedVariants = orderSpaceVariants(spaceVariants);
  return orderedVariants;
}

function createSpaceAutoVariantsFromConfig(
  variants: number,
  baselineGrid: number
): ConfigurationStateSizeAndSpace_SpaceAuto["variants"] {
  return convertSpaceVariantConfigIntoState(calculateSpaceVariantsAuto(variants, baselineGrid));
}

function createSpaceManualVariantsFromConfig(
  variants: number[]
): ConfigurationStateSizeAndSpace_SpaceManual["variants"] {
  return convertSpaceVariantConfigIntoState(calculateSpaceVariantsManual(variants));
}

function createSizeVariantsFromConfig(
  variants: KeystoneConfig["sizeAndSpace"]["size"]["variants"]
): ConfigurationStateSizeAndSpace_SizeVariants {
  return Object.fromEntries(
    Object.entries(variants).map(([variantName, variantValue]) => [
      generateGUID(),
      { name: variantName, value: variantValue }
    ])
  );
}

export function getInitStateSizeAndSpaceFromConfig(
  config: KeystoneConfig
): ConfigurationStateSizeAndSpace {
  switch (config.sizeAndSpace.space.mode) {
    case "auto": {
      const spaceVariants = createSpaceAutoVariantsFromConfig(
        config.sizeAndSpace.space.variants,
        config.sizeAndSpace.baselineGrid
      );
      return {
        baseFontSize: config.sizeAndSpace.baseFontSize,
        baselineGrid: config.sizeAndSpace.baselineGrid,
        size: {
          variants: createSizeVariantsFromConfig(config.sizeAndSpace.size.variants)
        },
        space: {
          mode: config.sizeAndSpace.space.mode,
          auto: {
            mode: "auto",
            variants: spaceVariants
          },
          manual: {
            mode: "manual",
            variants: createSpaceManualVariantsFromConfig([4, 8, 12])
          }
        }
      };
    }

    case "manual": {
      return {
        baseFontSize: config.sizeAndSpace.baseFontSize,
        baselineGrid: config.sizeAndSpace.baselineGrid,
        size: {
          variants: createSizeVariantsFromConfig(config.sizeAndSpace.size.variants)
        },
        space: {
          mode: config.sizeAndSpace.space.mode,
          auto: {
            mode: "auto",
            variants: createSpaceAutoVariantsFromConfig(10, config.sizeAndSpace.baselineGrid)
          },
          manual: {
            mode: "manual",
            variants: createSpaceManualVariantsFromConfig(config.sizeAndSpace.space.variants)
          }
        }
      };
    }

    default:
      return exhaustiveMatchGuard(config.sizeAndSpace.space);
  }
}

export function getSizeAndSpaceConfigFromState(
  state: ConfigurationStateSizeAndSpace
): KeystoneConfig["sizeAndSpace"] {
  const space = match<
    ConfigurationStateSizeAndSpace["space"],
    KeystoneConfig["sizeAndSpace"]["space"]
  >(state.space)
    .with({ mode: "auto" }, (state) => ({
      mode: "auto" as const,
      variants: Object.values(state.auto.variants).length
    }))
    .with({ mode: "manual" }, (state) => ({
      mode: "manual" as const,
      variants: Object.values(state.manual.variants)
        .sort((a, b) => a.order - b.order)
        .map(({ value }) => value)
    }))
    .exhaustive();

  const size = {
    variants: Object.values(state.size.variants).reduce<
      KeystoneConfig["sizeAndSpace"]["size"]["variants"]
    >((accum, { name, value }) => {
      return Object.assign(accum, { [name]: value });
    }, {})
  };

  return {
    baseFontSize: state.baseFontSize,
    baselineGrid: state.baselineGrid,
    size,
    space
  };
}

export function useConfigStateSizing(initConfig: KeystoneConfig) {
  const state = getInitStateSizeAndSpaceFromConfig(initConfig);
  return useImmer(state);
}
export type ConfigurationContextSizingType = {
  sizing: ConfigurationStateSizeAndSpace;
  setSizing: Updater<ConfigurationStateSizeAndSpace>;
};
