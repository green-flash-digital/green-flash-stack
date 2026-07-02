export type DropdownOptionPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "right-top"
  | "right-middle"
  | "right-bottom"
  | "bottom-right"
  | "bottom-center"
  | "bottom-left"
  | "left-bottom"
  | "left-middle"
  | "left-top";
export type DropdownOptionOrigin = "top-left" | "top-right";
export type DropdownOptionArrow = {
  /**
   * The size of the arrow
   */
  size: number;
  /**
   * The color of the arrow. This value wil
   * be accessible using the `--arrow-color` token.
   * @default transparent
   */
  color?: string;
};
export type DropdownOptionOffset = number;
export type DropdownOptions = {
  /**
   * Where the menu should display when open relative
   * to the clicked target. The way that this can be
   * interpreted is to read it as **"I want my menu to display
   * relative to the targets `bottom-left` corner."**.
   * @default 'bottom-left'
   */
  dxPosition?: DropdownOptionPosition;
  /**
   * Displays an arrow at the size that points
   * to the target that was used to launch the menu
   * @default undefined // won't display
   */
  dxArrow?: DropdownOptionArrow;
  /**
   * The distance tha the popover displays
   * away from the selected target `dxPosition`.
   * If `dxArrow` is supplied, this value is ignored
   * @default undefined
   */
  dxOffset?: DropdownOptionOffset;
  /**
   * The origin of the dropdown which will effect how the
   * dropdown will be aligned
   * @default top-left
   */
  dxOrigin?: DropdownOptionOrigin;
};
