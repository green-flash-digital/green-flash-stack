// import { createSpaceVariants, remFromConfig } from "@chamfer-css/core-utils";

// import { type CompileFunction, MakeTemplate } from "./MakeTemplate.js";

// const template: CompileFunction = ({
//   config,
//   docs,
//   functionName,
//   methods,
//   cssVarPrefix,
// }) => {
//   const spaceVariants = createSpaceVariants(config.sizeAndSpace);
//   const spaceTokenNames = Object.keys(spaceVariants);
//   const spaceVariantUnion = methods.createTypeUnion(spaceTokenNames);

//   return `export type SpaceTokens = ${spaceVariantUnion};
// export type MakeSpace = (tokenName: SpaceTokens, options?: {
// /**
//  * The specific unit of the token to be returned
//  * @default rem
//  */
// unit?: "px" | "rem"}) => string;

// /**
//  * ## Description
//  * ${docs.description}
//  *
//  * ## Usage
//  * ### css-in-ts
//  * \`\`\`ts
//  * import { css } from "@linaria/core";
//  * ${docs.importClause}
//  *
//  * const divClassName = css\`
//  *   position: sticky;
//  *   top: \${${functionName}(${spaceTokenNames[0]})};;
//  * \`
//  * \`\`\`
//  *
//  * ### style-object
//  * \`\`\`ts
//  * import { forwardRef } from "react"
//  * ${docs.importClause};
//  *
//  * const Button = forwardRef<HTMLButtonElement, JSX.IntrinsicElements["button"]>(
//  *  ({ children, style, ...restProps }, ref) => {
//  *    return (
//  *      <button
//  *        {...restProps}
//  *        style={{
//  *          position: "sticky",
//  *          padding: 0 ${functionName}(${spaceTokenNames}) }}
//  *        ref={ref}
//  *      >
//  *        {children}
//  *      </button>
//  *    );
//  *  }
//  * );
//  * \`\`\`
//  */
// export const ${functionName}: MakeSpace = (value, options) => {
//   const unit = options?.unit ?? "rem";
//   return \`var(${cssVarPrefix}-\${value}-\${unit})\`
// };
// `;
// };

// const css: CompileFunction = ({ config, cssVarPrefix }) => {
//   const spaceVariants = createSpaceVariants(config.size);
//   return Object.entries(spaceVariants).reduce(
//     (accum, [spaceKey, spaceValue]) => {
//       return accum.concat(`${cssVarPrefix}-${spaceKey}-px: ${spaceValue}px;
// ${cssVarPrefix}-${spaceKey}-rem: ${remFromConfig(config, spaceValue)}rem;
// `);
//     },
//     ""
//   );
// };

// export const MakeTemplateSpace = new MakeTemplate({
//   functionName: "makeSpace",
//   functionDescription:
//     "Returns the token associated with the specific spacing token",
//   variableBody: "space",
//   template,
//   css,
// });
