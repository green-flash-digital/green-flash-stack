// import { readdirSync, readFileSync } from "node:fs";
// import path from "node:path";
// import { readdir } from "node:fs/promises";

// import { parse } from "@babel/parser";
// import {
//   getNodeModulesButteryOutputDir,
//   parseAndValidateOptions,
// } from "@buttery/core/utils";
// import { printAsBullets } from "@buttery/logs";
// import { select } from "@inquirer/prompts";
// import { traverse } from "@babel/core";

// import type { ButteryComponentsExportOptions } from "./_cli-scripts.utils.js";
// import {
//   butteryComponentsExportOptionsSchema,
//   LOG,
// } from "./_cli-scripts.utils.js";

// export async function exportComponent(
//   options?: ButteryComponentsExportOptions
// ) {
//   const parsedOptions = parseAndValidateOptions(
//     butteryComponentsExportOptionsSchema,
//     options,
//     LOG
//   );
//   LOG.level = parsedOptions.logLevel;

//   LOG.loadingStart("Starting export...");
//   const componentsDir = await getNodeModulesButteryOutputDir(
//     import.meta.dirname,
//     "components",
//     { logLevel: parsedOptions.logLevel }
//   );
//   const rootComponentsDir = path.resolve(componentsDir.target, "./lib");

//   LOG.debug("Fetching components to pick from...");
//   const componentFilesAndDirs = await readdir(rootComponentsDir, {
//     withFileTypes: true,
//   });
//   const componentDirs = componentFilesAndDirs.filter((dirent) =>
//     dirent.isDirectory()
//   );
//   const componentDirsToPickFrom = componentDirs.filter(
//     (dirent) =>
//       dirent.isDirectory() &&
//       !dirent.name.includes("__archive") &&
//       !dirent.name.includes("__todo") &&
//       !dirent.name.includes("utils")
//   );
//   LOG.debug("Fetching components to pick from... done.");

//   LOG.debug("Waiting for user to select a component to export...");
//   const componentForExport = await select({
//     message: "Please select a component to export",
//     choices: componentDirsToPickFrom.map((dirent) => ({
//       name: dirent.name,
//       value: {
//         name: dirent.name,
//         path: path.join(dirent.parentPath, dirent.name),
//       },
//     })),
//   });
//   LOG.debug("Waiting for user to select a component to export... done.", {
//     componentForExport,
//   });

//   LOG.loadingStart("Traversing components to export");
//   // Initialize a graph
//   LOG.debug("Searching for and registering intra-dependencies...");
//   LOG.debug(componentForExport.path);
//   const dependencies = new Set<string>();

//   const DEPENDENCY_ID = "@BUTTERY_COMPONENT/";

//   // An inline recursive function that will recursively search through all directories
//   // and look for any dependencies. All dependencies are identified with `@BUTTERY_COMPONENT`.
//   // if dependencies are found, then it will recursively look through all of those files as well
//   // which will output in a list of all of the components that need to be exported
//   function registerComponentIntraDependencies(directoryPath: string) {
//     const directoryContents = readdirSync(directoryPath, {
//       withFileTypes: true,
//     });
//     for (const dirent of directoryContents) {
//       // If the contents is a directory, then recurse the function again.
//       // At this point we're not including any examples in the output.
//       if (dirent.isDirectory() && dirent.name !== "examples") {
//         const innerDirectoryPath = path.join(dirent.parentPath, dirent.name);
//         registerComponentIntraDependencies(innerDirectoryPath);
//       }

//       // Since it's a file, we want to turn it into an abstract syntax tree
//       // and then parse it to read the imports. This way to can start to determine
//       // if the the imports have other intra-dependencies.
//       if (dirent.isFile()) {
//         const innerFilePath = path.join(dirent.parentPath, dirent.name);
//         LOG.debug(`Registering dependencies in: ${innerFilePath}`);

//         // parse the file
//         const code = readFileSync(innerFilePath, "utf-8");
//         const ast = parse(code, {
//           sourceType: "module",
//           plugins: [
//             "typescript", // Enable TypeScript syntax parsing
//             "jsx", // Enable JSX syntax parsing
//           ],
//         });

//         traverse(ast, {
//           ImportDeclaration: ({ node }) => {
//             const importPath = node.source.value;
//             if (
//               importPath.startsWith(DEPENDENCY_ID) &&
//               !dependencies.has(importPath) // prevents unnecessary traversal for deps already registered
//             ) {
//               const innerDependencyFileName =
//                 importPath.split(DEPENDENCY_ID)[1];
//               dependencies.add(innerDependencyFileName);

//               // we know this directory since our component directory always starts at the root dir.
//               // the alias is nested directly under the root dir so we can assume that the inner dependency
//               // directory is at the rootComponentDir + the innerDependencyFileName
//               const innerDependencyDir = path.resolve(
//                 rootComponentsDir,
//                 innerDependencyFileName
//               );

//               // recursively register other intra-dependencies in the other component directory.
//               registerComponentIntraDependencies(innerDependencyDir);
//             }
//           },
//         });
//       }
//     }
//   }

//   // use the inline recursive function to start searching for intra-dependencies
//   // starting at the folder of the component selected by the user.
//   registerComponentIntraDependencies(componentForExport.path);

//   LOG.debug("Searching for and registering intra-dependencies... done");

//   const dependenciesArr = [...dependencies.values()];
//   LOG.loadingEnd("complete!");
//   if (dependenciesArr.length === 0) {
//     LOG.debug("No interdependencies.");
//   } else {
//     LOG.info(
//       `Dependencies that will be copied: ${printAsBullets(dependenciesArr, {
//         bulletType: "numbers",
//       })}`
//     );
//   }
// }
