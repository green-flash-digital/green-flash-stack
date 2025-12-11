import fs from "node:fs";
import path from "node:path";

/**
 * Recursively searches up the directory tree to find a folder with a specific name,
 * and if found, checks for a nested directory within it.
 *
 * @example
 * // Assuming the following directory structure:
 * // /home/user/project/
 * // ├── node_modules
 * // │   └── nestedDir
 * // ├── src
 * // │   └── index.js
 * // └── package.json
 *
 * // If the current working directory is /home/user/project/src
 * // and we search for 'node_modules' and 'nestedDir', the function will return:
 * const result = findDirectoryUpwards('node_modules', 'nestedDir');
 * console.log(result); // /home/user/project/node_modules/nestedDir
 */
export function findDirectoryUpwards(
  /**
   * The name of the directory to search for.
   */
  dirName: string,
  /**
   * The name of the nested directory to search for within the found directory.
   */
  nestedDirName?: string,
  /**
   * Optional parameters.
   */
  options?: {
    /**
     * The directory to start the search from.
     * @default process.cwd()
     */
    startingDirectory?: string;
  }
) {
  const startingDirectory = options?.startingDirectory ?? process.cwd();

  let currentDirectory = path.resolve(startingDirectory);

  while (true) {
    // Check if the target directory exists in the current directory
    const contents = fs.readdirSync(currentDirectory);
    if (contents.includes(dirName)) {
      const targetDirPath = path.join(currentDirectory, dirName);

      // If a nested directory name is provided, check for its existence
      if (nestedDirName) {
        const nestedContents = fs.readdirSync(targetDirPath);
        if (nestedContents.includes(nestedDirName)) {
          return path.join(targetDirPath, nestedDirName);
        }
      } else {
        return targetDirPath;
      }
    }

    // Move up one level
    const parentDirectory = path.dirname(currentDirectory);

    // If we've reached the root directory without finding the target, return null
    if (parentDirectory === currentDirectory) {
      return null;
    }

    currentDirectory = parentDirectory;
  }
}
