import type { TokensConfig } from "../Keystone.js";
import type { TokenManifest } from "../TokenManifest.js";

export type TokenTemplate<
  TTokens extends Record<string, unknown> = Record<string, unknown>,
  TUtil extends Record<string, unknown> = Record<string, unknown>
> = {
  name: string;
  description?: string;
  namespace: string;
  tokens(config: TokensConfig): TTokens;
  cssProperties(config: TokensConfig): string[];
  util(tokens: TokenManifest & TTokens): TUtil;
};

export function defineTemplate<
  TTokens extends Record<string, unknown>,
  TUtil extends Record<string, unknown>
>(def: {
  name: string;
  description?: string;
  namespace: string;
  tokens(config: TokensConfig): TTokens;
  cssProperties(config: TokensConfig): string[];
  util(tokens: TokenManifest & TTokens): TUtil;
}): TokenTemplate<TTokens, TUtil> {
  return def;
}
