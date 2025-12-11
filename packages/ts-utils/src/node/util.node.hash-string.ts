import { createHash } from "node:crypto";

/**
 * Takes a string and returns a hashed representation
 * of that string. This is done to provide a significantly
 * unique temp directory for serving the local docs configuration
 */
export const hashString = (input: string) => {
  return createHash("sha256").update(input).digest("hex");
};
