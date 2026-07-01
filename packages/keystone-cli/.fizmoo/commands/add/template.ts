import path from "node:path";

import { Keystone } from "@keystone-css/core";
import { defineArgs, type Action, type Meta } from "fizmoo";
import { writeFileRecursive } from "ts-jolt/node";

export const meta: Meta = {
  name: "template",
  description: "Scaffolds a new custom token template in .keystone/templates/"
};

export const args = defineArgs({
  name: {
    name: "name",
    type: "string",
    description: "Name of the template in kebab-case (e.g. make-border)",
    required: true
  }
});

export const action: Action<typeof args> = async ({ args }) => {
  const tokens = new Keystone({ logLevel: "info", autoInit: true });
  const config = await tokens.getConfig();

  const filePath = path.resolve(config.meta.dirPath, "templates", `${args.name}.ts`);

  await writeFileRecursive(
    filePath,
    `import { defineTemplate } from "@keystone-css/core";

export default defineTemplate({
  name: "${args.name}",
  description: "",
  namespace: "${args.name}",
  tokens(_config) {
    return {};
  },
  cssProperties(_config) {
    return [];
  },
  util(_tokens) {
    return {};
  },
});
`
  );

  console.log(`Created .keystone/templates/${args.name}.ts`);
};
