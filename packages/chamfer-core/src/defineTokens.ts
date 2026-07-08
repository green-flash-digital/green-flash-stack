import type { z } from "zod";

import { ConfigSchema, type ChamferConfig } from "./schemas/schema.js";
import type { TokenTemplate } from "./templates/types.js";

export type ChamferConfigInput = z.input<typeof ConfigSchema>;

type AnyTemplate = TokenTemplate<Record<string, unknown>, Record<string, unknown>>;

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
