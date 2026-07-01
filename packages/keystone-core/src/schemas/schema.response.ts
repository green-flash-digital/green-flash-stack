import { z } from "zod";

import { withDescription } from "./schema-utils.js";

/**
 * Define the breakpoints that will govern how the application responds to the viewport size.
 * - phone-sm: 320, // This breakpoint targets small mobile devices, including older smartphones like the iPhone 5 and SE. It's crucial to ensure basic functionality and readability on these smaller screens.,
 * - phone: 375, // Common for newer smartphones, including devices like the iPhone 6, 7, 8, and X series. Many Android phones also fall into this range.,
 * - phone-lg: 414, // This size includes larger smartphones like the iPhone Plus series (6, 7, 8 Plus) and many of the larger Android phones,
 * - tablet-sm: 480, // Often used for small tablets and large smartphones in landscape mode.
 * - tablet: 768, // Targets smaller tablets, such as the iPad Mini, and larger smartphones in landscape mode. This is a key breakpoint for transitioning from a mobile-friendly layout to a more tablet-optimized design.
 * - tablet-lg: 1024, // This size is common for standard tablets like the iPad. It’s a significant breakpoint where layouts often shift to accommodate a more desktop-like experience.
 * - desktop-sm: 1200, // A common breakpoint for smaller desktop monitors and larger tablets in landscape mode. It marks the transition to more complex and spacious layouts.
 * - desktop: 1280, // Often used for larger desktop and laptop screens. This breakpoint helps in enhancing the layout for high-resolution monitors, providing more space for content and navigation elements.
 * - desktop-lg: 1400, // Targets full HD monitors, commonly used in desktop displays. Ensures that content utilizes the available screen real estate efficiently.
 */
export const BreakpointsSchema = z.record(z.string(), z.number()).default({
  mobile: 480,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
  ultraWide: 1536
});
export type Breakpoints = z.infer<typeof BreakpointsSchema>;

export const ResponseSchema = withDescription(
  z.object({
    breakpoints: BreakpointsSchema
  })
).default({});
export type KeystoneConfigResponse = z.infer<typeof ResponseSchema>;
