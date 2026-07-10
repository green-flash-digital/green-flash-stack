// import type { ButteryConfigDocsOrder } from "../config/buttery-config.types.docs";
// import { parseFilename } from "./docs.parseFilename";
// import type { ButteryDocsRoute } from "./docs.types";
// import { kebabToPascalCase } from "./ts/util.ts.kebab-to-pascal-case";

// export function autoOrderButteryDocFiles(files: ButteryDocsRoute[]) {
//   // try to create the file order automatically
//   return files.reduce<ButteryConfigDocsOrder>((accum, file) => {
//     const { section, route } = parseFilename(file.filename);
//     if (section === "_index") return accum;
//     const sectionAlreadyAdded = accum[section];
//     if (!sectionAlreadyAdded) {
//       return Object.assign(accum, {
//         [section]: {
//           display: kebabToPascalCase(section),
//           routeOrder: [route],
//         },
//       });
//     }
//     const routeOrder = accum[section].routeOrder;
//     // add the route
//     routeOrder.push(route);
//     // sort the order based upon length
//     routeOrder.sort((a, b) => a.length - b.length);
//     // find the section index page and move it to the front of the routeOrder
//     const sectionPageIndex = routeOrder.findIndex((route) => route === section);
//     if (sectionPageIndex > -1) {
//       routeOrder.unshift(routeOrder.splice(sectionPageIndex, 1)[0]);
//     }
//     return Object.assign(accum, {
//       [section]: {
//         ...accum[section],
//         routeOrder,
//       },
//     });
//   }, {});
// }
export {};
