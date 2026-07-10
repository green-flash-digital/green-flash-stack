import { command, defineConfig } from "fizmoo";

export default defineConfig({
  name: "chamfer",
  description:
    "Auto-generate TS functional utilities to easily recall & implement CSS design tokens",
  commands: [
    command("./commands/add.ts", [command("./commands/add/template.ts")]),
    command("./commands/build.ts"),
    command("./commands/dev.ts"),
    command("./commands/studio.ts")
  ]
});
