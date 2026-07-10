import { defineConfig, command } from "fizmoo";

export default defineConfig({
  name: "sandbox",
  description: "A sandbox CLI for testing fizmoo end-to-end",
  commands: [command("./commands/hello.ts")]
});
