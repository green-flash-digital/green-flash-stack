import { useConfigurationContext } from "../Config.context";
import { convertBrandColorIntoVariants, convertNeutralColorIntoVariants } from "./color.utils";
import { ColorPreviewBlocks } from "./ColorPreviewBlocks";
import { ColorPreviewContainer } from "./ColorPreviewContainer";

export function ColorPreviewPalette() {
  const { state } = useConfigurationContext();
  const brandVariants = convertBrandColorIntoVariants(state.color);
  const neutralVariants = convertNeutralColorIntoVariants(state.color);

  return (
    <ColorPreviewContainer>
      {Object.entries({ ...brandVariants, ...neutralVariants }).map(
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
      )}
    </ColorPreviewContainer>
  );
}
