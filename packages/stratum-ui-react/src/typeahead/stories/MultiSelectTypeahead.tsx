import { useState } from "react";

import { useTypeahead } from "../useTypeahead.js";
import type { Fruit } from "./fruits.js";
import { fruits } from "./fruits.js";
import {
  checkmarkStyles,
  emptyStateStyles,
  formActionsStyles,
  listboxStyles,
  optionStyles,
  outputStyles,
  placeholderStyles,
  popoverChromeStyles,
  searchInputStyles,
  submitButtonStyles,
  triggerStyles
} from "./typeahead.shared-styles.js";

/**
 * Multi-select: same hook as the single-select example — the only difference
 * is what `onSelect` does with each chosen option (toggle membership in an
 * array instead of replacing a single value) and how `FormData` picks it up
 * (one repeated `name="fruits"` hidden input per selected value, read back
 * with `FormData.getAll("fruits")`).
 *
 * `aria-selected` on each option (set by `getOptionProps`) tracks keyboard/
 * mouse *highlight*, not membership in `selected` — the checkmark here is a
 * separate, deliberately distinct visual signal for "already chosen."
 */
export function MultiSelectTypeahead() {
  const [selected, setSelected] = useState<Map<string, Fruit>>(new Map());
  const [submitted, setSubmitted] = useState<string | null>(null);

  const typeahead = useTypeahead({
    options: fruits,
    getLabel: (fruit) => fruit.label,
    offset: 6,
    onSelect: (fruit) => {
      setSelected((current) => {
        const next = new Map(current);
        if (next.has(fruit.id)) next.delete(fruit.id);
        else next.set(fruit.id, fruit);
        return next;
      });
    }
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setSubmitted(JSON.stringify({ fruits: data.getAll("fruits") }, null, 2));
      }}
    >
      {[...selected.keys()].map((id) => (
        <input key={id} type="hidden" name="fruits" value={id} />
      ))}

      <button type="button" className={triggerStyles} ref={typeahead.triggerRef}>
        {selected.size > 0 ? (
          [...selected.values()].map((f) => f.label).join(", ")
        ) : (
          <span className={placeholderStyles}>Select fruits…</span>
        )}
      </button>

      <div ref={typeahead.popoverRef} className={popoverChromeStyles}>
        {typeahead.shouldRenderContent && (
          <>
            <input
              type="text"
              className={searchInputStyles}
              placeholder="Search fruits…"
              value={typeahead.query}
              onChange={(e) => typeahead.setQuery(e.target.value)}
              ref={typeahead.inputRef}
            />
            <ul {...typeahead.listboxProps} className={listboxStyles}>
              {typeahead.filtered.length === 0 && <li className={emptyStateStyles}>No matches</li>}
              {typeahead.filtered.map((fruit, index) => {
                const isChosen = selected.has(fruit.id);
                return (
                  <li key={fruit.id} {...typeahead.getOptionProps(index)} className={optionStyles}>
                    {fruit.label}
                    {isChosen && <span className={checkmarkStyles}>✓</span>}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <div className={formActionsStyles}>
        <button type="submit" className={submitButtonStyles}>
          Submit
        </button>
      </div>

      {submitted && <pre className={outputStyles}>{submitted}</pre>}
    </form>
  );
}
