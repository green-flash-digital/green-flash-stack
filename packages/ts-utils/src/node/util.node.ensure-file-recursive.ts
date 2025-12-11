import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Ensures that a file exists. If the file does not exist, it is created.
 * If the directory structure does not exist, it is also created.
 */
export async function ensureFileRecursive(filePath: string) {
  try {
    await access(filePath); // Check if the file exists
  } catch {
    // Use a lock by ensuring directory creation is awaited before writing the file
    await mkdir(path.dirname(filePath), { recursive: true });

    try {
      // Attempt to create the file only if it doesn't exist
      await writeFile(filePath, "", { flag: "wx" }); // 'wx' prevents overwriting
    } catch (err: any) {
      if (err.code !== "EEXIST") throw err; // Ignore 'file already exists' errors
    }
  }
}
