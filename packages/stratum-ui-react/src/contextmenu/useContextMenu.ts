import { useCallback, useEffect, useRef } from "react";

import type { UseMenuOptions } from "../menu/useMenu.js";
import { useMenu } from "../menu/useMenu.js";

export type UseContextMenuOptions = UseMenuOptions;

/**
 * A menu triggered by right-click (the `contextmenu` event) and anchored to
 * the cursor position rather than a persistent trigger element — built
 * directly on `useMenu`, so it gets the same `role="menu"`/`"menuitem"`,
 * arrow-key + typeahead navigation, and focus management for free. The only
 * things that differ from a regular menu are *how* it opens and *what* it's
 * positioned against.
 *
 * Manages its own invisible, zero-size "virtual anchor" element internally —
 * CSS anchor positioning needs a real element to anchor to, and a point under
 * the cursor isn't one, so this creates a detached one, moves it to
 * `(clientX, clientY)` on each right-click, and anchors the menu to that
 * instead of to whatever was actually right-clicked. This is a pure
 * implementation detail; nothing needs to be rendered for it, unlike every
 * other ref this package hands out.
 *
 * Also explicitly restores focus to the right-clicked element on close, via
 * `engine.setFocusReturnTarget()` — left to the engine's default, it would try
 * to focus the invisible virtual anchor instead, which isn't focusable and so
 * would silently do nothing, leaving focus wherever it happened to land when
 * the menu's contents disappeared.
 *
 * Stateless by design (no generic state parameter, unlike `usePopover`/
 * `useMenu`): a context menu is almost always one instance per row/item
 * (mirroring how a per-row action menu is normally built — see the
 * `ManyRowMenus` example in the Menu stories), so whatever needs to be known
 * about *what* was right-clicked is already available to the surrounding
 * component via closure, without needing to thread it through engine state.
 */
export function useContextMenu(options: UseContextMenuOptions = {}) {
  const menu = useMenu({ position: "bottom-right", ...options });
  const anchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const anchor = document.createElement("div");
    anchor.style.position = "fixed";
    anchor.style.width = "0";
    anchor.style.height = "0";
    anchor.style.pointerEvents = "none";
    document.body.appendChild(anchor);
    anchorRef.current = anchor;
    return () => {
      anchor.remove();
      anchorRef.current = null;
    };
  }, []);

  /** Ref for whatever region should trigger the menu on right-click (a row, a card, a whole canvas). */
  const targetRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      const onContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        const clientX = e.clientX;
        const clientY = e.clientY;

        const attemptOpen = () => {
          const anchor = anchorRef.current;
          if (!anchor) return;
          anchor.style.left = `${clientX}px`;
          anchor.style.top = `${clientY}px`;
          menu.engine.setFocusReturnTarget(node);
          try {
            menu.engine.openPopover({ currentTarget: anchor } as unknown as Event);
          } catch {
            // A right-click's own pointerdown fires *before* contextmenu, and
            // since it lands outside the popover it triggers the native
            // light-dismiss first — so this is almost certainly still settling
            // from that (or a previous) close: showPopover() throws while a
            // hide transition is still in flight. Retry next frame rather
            // than trying to predict exactly how long that takes — a quick
            // click loses this race consistently; holding the button and
            // moving over where the menu will appear before releasing wins
            // it by accident, which is exactly the signature of this.
            requestAnimationFrame(attemptOpen);
          }
        };

        if (menu.engine.getState().isOpen) {
          // Stably open, not just mid-close (e.g. right-clicking a different
          // row while its menu is still fully open) — retrying would throw
          // "already showing" forever, so close it explicitly first.
          void menu.engine.closePopover().then(attemptOpen);
          return;
        }

        attemptOpen();
      };
      node.addEventListener("contextmenu", onContextMenu);
      return () => node.removeEventListener("contextmenu", onContextMenu);
    },
    [menu.engine]
  );

  return {
    ...menu,
    targetRef
  };
}
