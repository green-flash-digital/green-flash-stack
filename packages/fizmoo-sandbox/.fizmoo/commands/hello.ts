import { defineCommand } from "fizmoo";

export default defineCommand({
  name: "hello",
  description: "A hello world command to verify fizmoo is working",
  options: {
    name: {
      type: "string",
      alias: "n",
      description: "Who to greet",
      default: "world"
    }
  },
  action: async ({ options }) => {
    console.log(`Hello, ${options.name}!`);
  }
});
