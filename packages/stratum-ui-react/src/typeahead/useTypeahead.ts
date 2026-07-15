import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { filterTypeaheadOptions } from "@stratum-ui/core";

import type { UsePopoverOptions } from "../popover/usePopover.js";
import { usePopover } from "../popover/usePopover.js";

export type UseTypeaheadOptions<T> = Omit<UsePopoverOptions, "type"> & {
  /** All selectable options (unfiltered) — filtering happens against these on every query change. */
  options: T[];
  /** Extracts the display/searchable label from an option. */
  getLabel: (option: T) => string;
  /** How the query matches against labels. @default "contains" */
  match?: "startsWith" | "contains";
  /** Controlled query text. Omit for uncontrolled (internal state, seeded by `defaultQuery`). */
  query?: string;
  /** Uncontrolled initial query text. Ignored if `query` is provided. @default "" */
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  /** Called when an option is chosen (Enter on the highlighted option, or clicking one). */
  onSelect: (option: T) => void;
};

/**
 * The "typing" half of a typeahead: query text, list filtering, keyboard
 * highlighting, and the ARIA wiring for it — deliberately built as a *button*
 * trigger (shows the selected label, or a placeholder) plus a real `<input>`
 * revealed only inside the popover, not one input trying to be both.
 * Trying to make a single input both display the current selection and serve
 * as the live search field means constantly reconciling two different things
 * it should show depending on open/closed/focus state — splitting them means
 * the button never touches typing state, and the input never touches
 * "what's currently selected." Focus-return-to-button on close falls out of
 * `PopoverEngine`'s existing mechanism for free, the same way it already does
 * for `useMenu` — this is structurally the same trigger/content split, not a
 * new one.
 *
 * `role="combobox"` still applies to the internal input (WAI-ARIA APG's
 * combobox pattern explicitly supports "popup triggered by a separate
 * element" as a variant, not just the single-input shape); the trigger
 * button gets `aria-haspopup="listbox"` instead, matching `useMenu`'s
 * `"menu"` value for the same attribute.
 *
 * Deliberately doesn't manage "what's selected" at all — single vs. multi
 * selection is purely a question of what the consumer does in `onSelect`
 * (store one value, or push onto an array); this only ever fires
 * `onSelect(option)` once per choice. It also renders no hidden input for
 * form participation, for the same reason: whether that's one hidden input
 * or several depends on that same decision this hook doesn't make.
 */
export function useTypeahead<T>(options: UseTypeaheadOptions<T>) {
  const {
    options: allOptions,
    getLabel,
    match = "contains",
    query: controlledQuery,
    defaultQuery = "",
    onQueryChange,
    onSelect,
    position = "bottom-span-left",
    ...popoverOptions
  } = options;

  const [internalQuery, setInternalQuery] = useState(defaultQuery);
  const query = controlledQuery ?? internalQuery;
  const setQuery = useCallback(
    (next: string) => {
      if (controlledQuery === undefined) setInternalQuery(next);
      onQueryChange?.(next);
    },
    [controlledQuery, onQueryChange]
  );

  const filtered = useMemo(
    () => filterTypeaheadOptions({ query, options: allOptions, getLabel, match }),
    [query, allOptions, getLabel, match]
  );

  const {
    engine,
    state: { isOpen },
    shouldRenderContent,
    popoverRef
  } = usePopover({ ...popoverOptions, position, type: "auto" });

  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const listboxId = useId();
  const optionIdPrefix = useId();
  const inputNodeRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setHighlightedIndex((i) => Math.min(Math.max(i, 0), Math.max(filtered.length - 1, 0)));
  }, [filtered.length]);

  // Focus the search input every time the popover opens, so typing can start immediately.
  useEffect(() => {
    if (!isOpen) return;
    inputNodeRef.current?.focus();
  }, [isOpen]);

  const activeDescendantId =
    filtered.length > 0 ? `${optionIdPrefix}-${highlightedIndex}` : undefined;

  useEffect(() => {
    const node = inputNodeRef.current;
    if (!node) return;
    if (activeDescendantId) node.setAttribute("aria-activedescendant", activeDescendantId);
    else node.removeAttribute("aria-activedescendant");
  }, [activeDescendantId]);

  // Kept fresh for the stable, attach-once keydown listener below.
  const latest = useRef({ filtered, onSelect });
  latest.current = { filtered, onSelect };

  const close = useCallback(() => {
    void engine.closePopover();
  }, [engine]);

  const selectHighlighted = useCallback(() => {
    const option = latest.current.filtered[highlightedIndex];
    if (!option) return;
    latest.current.onSelect(option);
    setQuery("");
    close();
  }, [highlightedIndex, close, setQuery]);

  /** Ref for the trigger button — click-to-toggle, `aria-haspopup="listbox"`. */
  const triggerRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      node.setAttribute("aria-haspopup", "listbox");
      node.setAttribute("aria-expanded", String(isOpen));
      const onClick = (e: Event) => engine.togglePopover(e);
      node.addEventListener("click", onClick);
      return () => node.removeEventListener("click", onClick);
    },
    [engine, isOpen]
  );

  /** Ref for the search input rendered inside the popover. */
  const inputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputNodeRef.current = node;
      if (!node) return;
      node.setAttribute("role", "combobox");
      node.setAttribute("aria-autocomplete", "list");
      node.setAttribute("aria-controls", listboxId);

      const onKeyDown = (e: KeyboardEvent) => {
        const { filtered: currentFiltered } = latest.current;
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setHighlightedIndex((i) => Math.min(i + 1, Math.max(currentFiltered.length - 1, 0)));
            return;
          case "ArrowUp":
            e.preventDefault();
            setHighlightedIndex((i) => Math.max(i - 1, 0));
            return;
          case "Enter":
            e.preventDefault();
            selectHighlighted();
            return;
          case "Escape":
            close();
            return;
        }
      };

      node.addEventListener("keydown", onKeyDown);
      return () => node.removeEventListener("keydown", onKeyDown);
    },
    [listboxId, selectHighlighted, close]
  );

  /** Ref/props for a single rendered option, in filtered-list order — `getOptionProps(index)`. */
  const getOptionProps = useCallback(
    (index: number) => ({
      id: `${optionIdPrefix}-${index}`,
      role: "option" as const,
      "aria-selected": index === highlightedIndex,
      onMouseEnter: () => setHighlightedIndex(index),
      onMouseDown: (e: { preventDefault: () => void }) => {
        // mousedown (not click), prevented — so the search input never blurs
        // from this click at all, rather than racing a blur-close against it.
        e.preventDefault();
        const option = filtered[index];
        if (!option) return;
        onSelect(option);
        setQuery("");
        close();
      }
    }),
    [highlightedIndex, filtered, onSelect, setQuery, close, optionIdPrefix]
  );

  /** Static props for the actual `<ul>`/list element containing the rendered options — the input's `aria-controls` points at this same id. */
  const listboxProps = useMemo(() => ({ id: listboxId, role: "listbox" as const }), [listboxId]);

  return {
    query,
    setQuery,
    filtered,
    highlightedIndex,
    isOpen,
    shouldRenderContent,
    triggerRef,
    /** Ref for the popover container (holds both the input and the listbox). */
    popoverRef,
    listboxProps,
    inputRef,
    getOptionProps,
    close
  };
}
