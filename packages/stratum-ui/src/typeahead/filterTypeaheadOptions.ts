export type FilterTypeaheadOptionsInput<T> = {
  query: string;
  options: T[];
  /** Extracts the display/searchable label from an option. */
  getLabel: (option: T) => string;
  /** @default "contains" */
  match?: "startsWith" | "contains";
};

/**
 * Reduces a list of options down to whatever matches the current query — the
 * one genuinely framework-agnostic, stateless piece of a typeahead. Pure
 * function, not a class or hook: filtering a list doesn't need
 * `TransactionStore`'s async-queue/optimistic-update machinery the way
 * `PopoverEngine`'s DOM-lifecycle concerns actually do, so there's nothing
 * here worth wrapping in more than this.
 */
export function filterTypeaheadOptions<T>({
  query,
  options,
  getLabel,
  match = "contains"
}: FilterTypeaheadOptionsInput<T>): T[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return options;
  return options.filter((option) => {
    const label = getLabel(option).toLowerCase();
    return match === "startsWith" ? label.startsWith(normalizedQuery) : label.includes(normalizedQuery);
  });
}
