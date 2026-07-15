import { useEffect, useState } from "react";

import { useTypeahead } from "../useTypeahead.js";
import type { Fruit } from "./fruits.js";
import { fetchFruits } from "./fruits.js";
import {
  emptyStateStyles,
  listboxStyles,
  loadingStateStyles,
  optionStyles,
  placeholderStyles,
  popoverChromeStyles,
  searchInputStyles,
  triggerStyles
} from "./typeahead.shared-styles.js";

const DEBOUNCE_MS = 300;

/**
 * Same hook as the static examples — the only difference is where `options`
 * comes from. `query` is taken over as a controlled value so a debounced
 * effect can fetch off of it; the effect's own cleanup (clearing the pending
 * timeout, and the `cancelled` flag guarding the `then`) does double duty as
 * both the debounce and the stale-response guard: a keystroke before the
 * timer fires cancels the fetch outright, and a keystroke while a fetch is
 * already in flight drops that response when it lands late.
 */
export function ApiSearchTypeahead() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Fruit[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Fruit | null>(null);

  const typeahead = useTypeahead({
    options: results,
    getLabel: (fruit) => fruit.label,
    query,
    onQueryChange: setQuery,
    offset: 6,
    onSelect: setSelected
  });
  const { isOpen } = typeahead;

  // Gated on `isOpen` so opening the popover fetches an initial (unfiltered)
  // page before any typing, rather than firing a request on every mount.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);

    const timer = setTimeout(() => {
      void fetchFruits(query).then((data) => {
        if (cancelled) return;
        setResults(data);
        setLoading(false);
      });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  return (
    <div>
      <button type="button" className={triggerStyles} ref={typeahead.triggerRef}>
        {selected ? selected.label : <span className={placeholderStyles}>Search fruits…</span>}
      </button>

      <div ref={typeahead.popoverRef} className={popoverChromeStyles}>
        {typeahead.shouldRenderContent && (
          <>
            <input
              type="text"
              className={searchInputStyles}
              placeholder="Type to search…"
              value={typeahead.query}
              onChange={(e) => typeahead.setQuery(e.target.value)}
              ref={typeahead.inputRef}
            />
            <ul {...typeahead.listboxProps} className={listboxStyles}>
              {loading && <li className={loadingStateStyles}>Searching…</li>}
              {!loading && typeahead.filtered.length === 0 && (
                <li className={emptyStateStyles}>No matches</li>
              )}
              {!loading &&
                typeahead.filtered.map((fruit, index) => (
                  <li key={fruit.id} {...typeahead.getOptionProps(index)} className={optionStyles}>
                    {fruit.label}
                  </li>
                ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
