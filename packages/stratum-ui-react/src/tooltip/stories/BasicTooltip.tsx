import { useTooltip } from "../useTooltip.js";
import { tooltipStyles, triggerStyles } from "./tooltip.shared-styles.js";

export function BasicTooltip() {
  const tooltip = useTooltip({ position: "top", offset: 6 });

  return (
    <>
      <button type="button" className={triggerStyles} ref={tooltip.triggerRef}>
        Hover or focus me
      </button>
      <div ref={tooltip.tooltipRef} className={tooltipStyles}>
        {tooltip.shouldRenderContent && "Saved 2 minutes ago"}
      </div>
    </>
  );
}
