type BreakDownObject<O, R = void> = {
  [K in keyof O as string]: K extends string | number
    ? R extends string | number | boolean
      ? ObjectDotNotation<O[K], `${R}.${K}`>
      : ObjectDotNotation<O[K], K>
    : never;
};

export type ObjectDotNotation<O, R = void> = O extends string | number | boolean
  ? R extends string | number | boolean
    ? R
    : never
  : BreakDownObject<O, R>[keyof BreakDownObject<O, R>];
