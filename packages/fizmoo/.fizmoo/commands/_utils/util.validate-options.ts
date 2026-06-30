import { printAsBullets } from "isoscribe";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";
import { LOG } from "./util.logger.js";
/**
 * This function takes in a schema, some input data that should be validated
 * against that zod schema and a logger to parse and validate the options that
 * are passed into any function. This is intended to easily validate that required
 * options exist as well as validate that they're well formed at runtime. In addition,
 * defaults can easily be defined using teh Zod schema that is passed to the function.
 *
 * This function is a one stop shop for ensuring that the options that are passed into
 * a function are well formed and properly defaulted. This ostensibly turns functional option
 * reconciliation and defaulting into a one liner.
 */
export function validateOptions<T>(
  schema: ZodSchema<T>,
  options: Partial<T> | undefined
) {
  try {
    const rawOptions = (options ?? {}) as T;
    // Parse input data, apply defaults, and validate
    return schema.parse(rawOptions) as Required<T>;
  } catch (error) {
    if (error instanceof ZodError) {
      // Custom error formatting
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
        value: err.code,
      }));

      const validationErrors = formattedErrors.map(
        (err) => `${err.path}: ${err.message} (Code: ${err.value})`
      );

      throw LOG.fatal(
        new Error(
          `Failed to validate provided options: ${printAsBullets(
            validationErrors
          )}`
        )
      );
    }
    throw LOG.fatal(new Error(`Failed to parse options: ${error}`));
  }
}
