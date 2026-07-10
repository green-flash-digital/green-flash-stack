import type { TokensConfig } from "../Chamfer.js";
import type { TokenManifest } from "../TokenManifest.js";

/**
 * `util` is a generic *method* (not a fixed field) so that each call site
 * re-infers its type parameter from whatever tokens object is actually
 * passed in, instead of being frozen to whatever `TTokens` this template
 * happened to be defined with. Without this, `colorTemplate.util(tokens)`
 * in generated `makeUtils.ts` files would only ever see the wide type
 * `tokens()` returns (e.g. `Record<string, string>`), not the literal
 * `as const` keys of the real generated tokens manifest — silently
 * widening `makeColor`/`makeSpace`/etc.'s parameter types to plain
 * `string`/`number`.
 */
export type TokenTemplate<TTokens extends Record<string, unknown> = Record<string, unknown>> = {
  name: string;
  description?: string;
  namespace: string;
  tokens(config: TokensConfig): TTokens;
  cssProperties(config: TokensConfig): string[];
  util<T extends TokenManifest & TTokens>(tokens: T): object;
};

/**
 * `TUtilFn`'s constraint `(tokens: never) => object` is deliberately almost
 * a no-op — `never` is contravariantly compatible with any parameter type,
 * so virtually any `util` function satisfies it. That's the point: it gives
 * `util` its own independent type parameter that TS can infer as the exact
 * type of whatever function was passed (preserving e.g. `makeColorUtil`'s
 * real `keyof T["color"]`-based signature), without ever needing to unify
 * it with `TTokens` during inference. Writing `util`'s constraint directly
 * in terms of `TTokens` (as a nested generic method) confuses TS's
 * inference order when both come from the same object literal argument —
 * it silently falls back to widening `TTokens` to `Record<string, unknown>`.
 * Keeping the two type parameters independent sidesteps that entirely.
 */
export function defineTemplate<
  TTokens extends Record<string, unknown>,
  TUtilFn extends (tokens: never) => object
>(def: {
  name: string;
  description?: string;
  namespace: string;
  tokens(config: TokensConfig): TTokens;
  cssProperties(config: TokensConfig): string[];
  util: TUtilFn;
}): Omit<typeof def, "util"> & { util: TUtilFn } {
  return def as Omit<typeof def, "util"> & { util: TUtilFn };
}
