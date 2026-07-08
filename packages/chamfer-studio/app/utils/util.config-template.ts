export function wrapConfig(config: string) {
  return `import { defineTokensConfig } from "@keystone-css/core";

export default defineTokensConfig(${JSON.stringify(config, null, 2)});
`;
}
