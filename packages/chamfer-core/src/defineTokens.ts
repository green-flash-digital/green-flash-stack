import type { z } from "zod";

import { ConfigSchema, type ChamferConfig } from "./schemas/schema.js";
import type { TokensConfig } from "./Chamfer.js";

export type ChamferConfigInput = z.input<typeof ConfigSchema>;

/**
 * Deliberately looser than `TokenTemplate` — this only gates "can this go
 * in the templates array," it doesn't need to preserve real typing (that's
 * `TokenTemplate`'s job for the exported const itself). `TokenTemplate`'s
 * abstract `util` constraint hardcodes `TokenManifest & TTokens`, which
 * would reject any custom template needing a field `TokenManifest` doesn't
 * have (e.g. a project-specific `border` template) — even though that
 * field is genuinely present on the real merged manifest at runtime.
 * `util(tokens: never)` accepts virtually any util function, since `never`
 * is contravariantly compatible with any parameter type.
 */
type AnyTemplate = {
  name: string;
  description?: string;
  namespace: string;
  tokens(config: TokensConfig): Record<string, unknown>;
  cssProperties(config: TokensConfig): string[];
  util(tokens: never): object;
};

export type ChamferDefinition<T extends AnyTemplate[] = AnyTemplate[]> = {
  config: ChamferConfig;
  templates: T;
};

export function defineTokens<T extends AnyTemplate[]>(input: {
  tokens: ChamferConfigInput;
  templates?: [...T];
}): ChamferDefinition<T> {
  return {
    config: ConfigSchema.parse(input.tokens),
    templates: (input.templates ?? []) as T
  };
}
