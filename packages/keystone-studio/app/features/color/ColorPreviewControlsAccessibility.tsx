import { makeSpace, makeColor, makeRem } from "@keystone@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { InputColor } from "~/components/InputColor";
import { InputRange } from "~/components/InputRange";
import { Tooltip, useTooltip } from "~/components/Tooltip";

import { useColorPreviewContext } from "./ColorPreview.context";

const styles = css`
  display: flex;
  gap: ${makeSpace(16)};
  margin-right: ${makeSpace(16)};
  border-right: 1px solid ${makeColor("neutral-light", { opacity: 0.2 })};
  padding-right: ${makeSpace(16)};
  align-items: center;

  .color {
    border: 1px solid ${makeColor("neutral-light", { opacity: 0.2 })};
  }
`;

export function ColorPreviewControlsAccessibility() {
  const { showWCAG, wcagValues, setWcagValues } = useColorPreviewContext();
  const fontSizeTooltip = useTooltip({
    dxType: "tooltip",
    dxPosition: "top-center",
    dxArrow: {
      size: 16
    }
  });
  const colorTooltip = useTooltip({
    dxType: "tooltip",
    dxPosition: "top-right",
    dxArrow: {
      size: 16
    }
  });

  if (!showWCAG) return;

  return (
    <div className={styles}>
      <div>
        <InputRange
          ref={fontSizeTooltip.setTargetRef}
          dxDisplayInput
          dxVariant="normal"
          dxDisplayMax
          dxDisplayMin
          max={40}
          min={10}
          dxOnChange={(value) =>
            setWcagValues((draft) => {
              draft.fontSize = value;
            })
          }
          value={wcagValues.fontSize}
        />
        <Tooltip ref={fontSizeTooltip.setTooltipRef}>
          Adjust the font-size to view contrast ratios & thresholds based upon a smaller or bigger
          font
        </Tooltip>
      </div>

      <div>
        <InputColor
          ref={colorTooltip.setTargetRef}
          dxSize="dense"
          className="color"
          onChange={({ currentTarget: { value } }) =>
            setWcagValues((draft) => {
              draft.bgColor = value;
            })
          }
          value={wcagValues.bgColor}
        />
        <Tooltip ref={colorTooltip.setTooltipRef}>
          Adjust the background to view accessibility metrics for colors on different backgrounds.
        </Tooltip>
      </div>
    </div>
  );
}
