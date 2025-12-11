import { writeFile as fsWriteFile, mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Writes a file regardless of a directory doesn't exist.
 */
export async function writeFileRecursive(
  filepath: string,
  data:
    | string
    | NodeJS.ArrayBufferView
    | Iterable<string | NodeJS.ArrayBufferView>
    | AsyncIterable<string | NodeJS.ArrayBufferView>
) {
  try {
    const directory = path.dirname(filepath);

    // Ensure the directory exists
    await mkdir(directory, { recursive: true });

    // Write the file
    await fsWriteFile(filepath, data, { encoding: "utf-8" });
  } catch (error) {
    throw new Error(String(error));
  }
}
