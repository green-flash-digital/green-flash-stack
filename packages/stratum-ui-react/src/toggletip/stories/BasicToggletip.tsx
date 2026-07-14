import { useToggletip } from "../useToggletip.js";
import { contentStyles, iconButtonStyles } from "./toggletip.shared-styles.js";

export function BasicToggletip() {
  const toggletip = useToggletip({ position: "top", offset: 6 });

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
      Password
      <button type="button" className={iconButtonStyles} aria-label="more info" ref={toggletip.triggerRef}>
        i
      </button>
      <span ref={toggletip.contentRef} className={contentStyles}>
        {toggletip.shouldRenderContent && "Must be at least 12 characters, with one number."}
      </span>
    </span>
  );
}
