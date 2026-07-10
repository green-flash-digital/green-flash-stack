import { command, defineConfig } from "fizmoo";

export default defineConfig({
  name: "documints",
  description:
    "A static-site generator for documentation, with page hierarchy driven entirely by frontmatter.",
  commands: [
    command("./commands/dev.ts"),
    command("./commands/build.ts"),
    command("./commands/init.ts"),
  ],
});
