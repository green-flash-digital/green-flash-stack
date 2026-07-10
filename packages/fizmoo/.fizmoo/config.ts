import { defineConfig, command } from "fizmoo";

export default defineConfig({
  name: "fizmoo",
  description: "Author, build, and run Node.js CLIs using fizmoo",
  commands: [
    command("./commands/init.ts"),
    command("./commands/build.ts"),
    command("./commands/dev.ts")
  ]
});
