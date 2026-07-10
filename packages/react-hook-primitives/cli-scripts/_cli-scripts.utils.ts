// import { ButteryLogLevelSchema } from "@buttery/core/utils";
// import { ButteryLogger } from "@buttery/logs";
// import { z } from "zod";

// const baseOptionsSchema = z.object({
//   /**
//    * The level of detail the logs should be displayed at
//    * @default info
//    */
//   logLevel: ButteryLogLevelSchema.default("info"),
// });
// export type ButteryComponentsBaseOptions = z.infer<typeof baseOptionsSchema>;

// export const butteryComponentsExportOptionsSchema = baseOptionsSchema.extend({
//   /**
//    * The absolute directory the selected component should be exported to
//    */
//   outDir: z.string(),
// });
// export type ButteryComponentsExportOptions = z.infer<
//   typeof butteryComponentsExportOptionsSchema
// >;

// export const LOG = new ButteryLogger({
//   id: "buttery-components",
//   prefix: "buttery:components",
//   prefixBgColor: "#ecc60a",
//   logLevel: "debug",
// });
