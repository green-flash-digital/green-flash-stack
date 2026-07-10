import path from "node:path";

import { Chamfer } from "@chamfer-css/core";
import { writeFileRecursive } from "@green-flash/ts-utils/node";
import { defineCommand } from "fizmoo";

export default defineCommand({
  name: "template",
  description: "Scaffolds a new custom token template in .chamfer/templates/",
  args: {
    name: {
      name: "name",
      type: "string",
      description: "Name of the template in kebab-case (e.g. make-border)",
      required: true
    }
  },
  action: async ({ args }) => {
    const tokens = new Chamfer({ logLevel: "info", autoInit: true });
    const config = await tokens.getConfig();

    const filePath = path.resolve(config.meta.dirPath, "templates", `${args.name}.ts`);

    await writeFileRecursive(
      filePath,
      `import { defineTemplate } from "@chamfer-css/core";

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
  // \`util\` must be a real generic function (not a plain method) so its
  // parameter type is preserved instead of collapsing to \`never\` — add
  // fields to the <T extends {...}> constraint as you add fields above.
  util<T extends { prefix: string }>(_tokens: T) {
    return {};
  },
});
`
    );

    console.log(`Created .chamfer/templates/${args.name}.ts`);
  }
});
