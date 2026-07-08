import path from "node:path";

import { writeFileRecursive } from "@green-flash/ts-utils/node";
import { Keystone } from "@keystone-css/core";
import { defineCommand } from "fizmoo";

export default defineCommand({
  name: "template",
  description: "Scaffolds a new custom token template in .keystone/templates/",
  args: {
    name: {
      name: "name",
      type: "string",
      description: "Name of the template in kebab-case (e.g. make-border)",
      required: true
    }
  },
  action: async ({ args }) => {
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
  }
});
