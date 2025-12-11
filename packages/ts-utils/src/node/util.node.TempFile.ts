import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { tryHandle } from "../isomorphic/util.isomorphic.try-handle.js";

export class TempFile {
  private filePath: string = "";

  async create(fileContents: string, ext: string) {
    const tempFilePath = join(tmpdir(), `${Date.now()}.${ext}`);
    await writeFile(tempFilePath, fileContents);
    this.filePath = tempFilePath;
    return this.filePath;
  }

  async cleanup() {
    const res = await tryHandle(unlink)(this.filePath);
    if (res.hasError) {
      throw new Error(
        `Error when trying to clean up the temporary file: ${res.error.message}`
      );
    }
  }
}
