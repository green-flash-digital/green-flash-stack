import { useState } from "react";

import { useTypeahead } from "../useTypeahead.js";
import type { Fruit } from "./fruits.js";
import { fruits } from "./fruits.js";
import {
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
 * Single-select: one hidden input carries the selection into `FormData` — its
 * `value` is the empty string when nothing's chosen yet, so the field is
 * still present (just empty) rather than missing from the submission.
 */
export function SingleSelectTypeahead() {
  const [selected, setSelected] = useState<Fruit | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const typeahead = useTypeahead({
    options: fruits,
    getLabel: (fruit) => fruit.label,
    offset: 6,
    onSelect: setSelected
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setSubmitted(JSON.stringify({ fruit: data.get("fruit") }, null, 2));
      }}
    >
      <input type="hidden" name="fruit" value={selected?.id ?? ""} />

      <button type="button" className={triggerStyles} ref={typeahead.triggerRef}>
        {selected ? selected.label : <span className={placeholderStyles}>Select a fruit…</span>}
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
              {typeahead.filtered.map((fruit, index) => (
                <li key={fruit.id} {...typeahead.getOptionProps(index)} className={optionStyles}>
                  {fruit.label}
                </li>
              ))}
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
