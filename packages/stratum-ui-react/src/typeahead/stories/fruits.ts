export type Fruit = { id: string; label: string };

export const fruits: Fruit[] = [
  { id: "apple", label: "Apple" },
  { id: "apricot", label: "Apricot" },
  { id: "banana", label: "Banana" },
  { id: "blackberry", label: "Blackberry" },
  { id: "blueberry", label: "Blueberry" },
  { id: "cantaloupe", label: "Cantaloupe" },
  { id: "cherry", label: "Cherry" },
  { id: "clementine", label: "Clementine" },
  { id: "cranberry", label: "Cranberry" },
  { id: "date", label: "Date" },
  { id: "dragonfruit", label: "Dragonfruit" },
  { id: "elderberry", label: "Elderberry" },
  { id: "fig", label: "Fig" },
  { id: "grape", label: "Grape" },
  { id: "grapefruit", label: "Grapefruit" },
  { id: "guava", label: "Guava" },
  { id: "honeydew", label: "Honeydew" },
  { id: "kiwi", label: "Kiwi" },
  { id: "kumquat", label: "Kumquat" },
  { id: "lemon", label: "Lemon" },
  { id: "lime", label: "Lime" },
  { id: "lychee", label: "Lychee" },
  { id: "mango", label: "Mango" },
  { id: "mandarin", label: "Mandarin" },
  { id: "nectarine", label: "Nectarine" },
  { id: "orange", label: "Orange" },
  { id: "papaya", label: "Papaya" },
  { id: "passionfruit", label: "Passionfruit" },
  { id: "peach", label: "Peach" },
  { id: "pear", label: "Pear" },
  { id: "persimmon", label: "Persimmon" },
  { id: "pineapple", label: "Pineapple" },
  { id: "plum", label: "Plum" },
  { id: "pomegranate", label: "Pomegranate" },
  { id: "raspberry", label: "Raspberry" },
  { id: "strawberry", label: "Strawberry" },
  { id: "tangerine", label: "Tangerine" },
  { id: "watermelon", label: "Watermelon" }
];

/**
 * Stands in for a network call — same `contains` predicate `useTypeahead`
 * would otherwise apply client-side, just with artificial latency, so the
 * client-side filtering it still runs on the returned page is a no-op rather
 * than a surprising second filter pass. Capped to 8 results, the way a real
 * search endpoint would paginate rather than return everything.
 */
export function fetchFruits(query: string): Promise<Fruit[]> {
  const normalized = query.trim().toLowerCase();
  const matches = normalized
    ? fruits.filter((fruit) => fruit.label.toLowerCase().includes(normalized))
    : fruits;

  const latencyMs = 300 + Math.random() * 300;
  return new Promise((resolve) => {
    setTimeout(() => resolve(matches.slice(0, 8)), latencyMs);
  });
}
