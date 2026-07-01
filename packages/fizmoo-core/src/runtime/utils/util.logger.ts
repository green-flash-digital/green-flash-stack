import { Isoscribe } from "isoscribe";

export const LOG = new Isoscribe({
  name: "fizmoo/runtime",
  logFormat: "string",
  logLevel: "debug"
});
