import { ButteryLogger } from "@buttery/logs";

export const LOG_SERVER = new ButteryLogger({
  id: "buttery-docs",
  prefix: "buttery:docs:server",
  prefixBgColor: "#812c8d",
  logLevel: "debug",
});
