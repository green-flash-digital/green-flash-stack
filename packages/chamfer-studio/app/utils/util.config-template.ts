export function wrapConfig(config: string) {
  return `import { defineTokensConfig } from "@chamfer-css/core";

export default defineTokensConfig(${JSON.stringify(config, null, 2)});
`;
}
