import type { z } from "zod";

import { ConfigSchema, type KeystoneConfig } from "./schemas/schema.js";
import type { TokenTemplate } from "./templates/types.js";

export type KeystoneConfigInput = z.input<typeof ConfigSchema>;

type AnyTemplate = TokenTemplate<Record<string, unknown>, Record<string, unknown>>;

export type KeystoneDefinition<T extends AnyTemplate[] = AnyTemplate[]> = {
  config: KeystoneConfig;
  templates: T;
};

export function defineTokens<T extends AnyTemplate[]>(input: {
  tokens: KeystoneConfigInput;
  templates?: [...T];
}): KeystoneDefinition<T> {
  return {
    config: ConfigSchema.parse(input.tokens),
    templates: (input.templates ?? []) as T
  };
}
