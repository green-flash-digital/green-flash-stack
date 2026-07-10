import { ButteryLogger } from "@buttery/logs";

export const LOG_SERVER_DEV = new ButteryLogger({
  id: "buttery-docs",
  prefix: "buttery:docs:dev",
  prefixBgColor: "#812c8d",
  logLevel: "debug",
});
