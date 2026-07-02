import { useConfigurationContext } from "../Config.context";
import { convertNeutralColorIntoVariants } from "./color.utils";
import { ColorPreviewBlocks } from "./ColorPreviewBlocks";

export function ColorPreviewNeutral() {
  const { state } = useConfigurationContext();
  const variants = convertNeutralColorIntoVariants(state.color);

  return Object.entries(variants).map(
    ([colorName, { base: baseVariantHex, ...restVariants }], i) => {
      return (
        <ColorPreviewBlocks
          key={colorName.concat(`-${i}`)}
          colorName={colorName}
          baseVariantHex={baseVariantHex}
          variants={restVariants}
        />
      );
    }
  );
}
