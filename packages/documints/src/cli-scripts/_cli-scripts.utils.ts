import { ButteryLogLevelSchema } from "@buttery/core/utils";
import { z } from "zod";

const baseOptionsSchema = z.object({
  /**
   * The level of detail the logs should be displayed at
   * @default info
   */
  logLevel: ButteryLogLevelSchema.default("info"),
  /**
   * If the required folder structures don't exist, display
   * prompts to create them / re-align them instead of
   * throwing errors
   * @default true
   */
  prompt: z.boolean().default(true),
});
export type ButteryDocsBaseOptions = z.infer<typeof baseOptionsSchema>;

// --- dev ---
export const butteryDocsDevOptionsSchema = baseOptionsSchema.extend({
  /**
   * Opens the DevServer to the configured hostname and port
   * when it starts
   * @default true
   */
  open: z.boolean().default(true),
  /**
   * Specify the port the host should run on
   */
  host: z.string().default("localhost"),
  /**
   * The port at which the DevServer will run on
   */
  port: z.number().default(4000),
});
export type ButteryDocsDevOptions = z.infer<typeof butteryDocsDevOptionsSchema>;

// --- build ---
export const butteryDocsBuildOptionsSchema = baseOptionsSchema;
export type ButteryDocsBuildOptions = z.infer<
  typeof butteryDocsBuildOptionsSchema
>;

// --- new ---
export const butteryDocsAddOptionsSchema = baseOptionsSchema.extend({
  /**
   * Brings up an interactive menu that you can select
   * a template from to create a new doc
   */
  template: z.boolean().default(false),
});
export type ButteryDocsAddOptions = z.infer<typeof butteryDocsAddOptionsSchema>;
