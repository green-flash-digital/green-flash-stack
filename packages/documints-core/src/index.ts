export { Documints, type ResolvedDocumintsConfig, type DocumintsDirs } from "./Documints.js";
export { defineDocumintsConfig } from "./config/defineDocumintsConfig.js";
export {
  documintsConfigSchema,
  type DocumintsConfig,
  type DocumintConfigHeader,
  type DocumintConfigHeaderLink,
  type DocumintConfigHeaderLinkTypeText,
  type DocumintConfigHeaderLinkTypeSocial,
  type DocumintConfigHeaderLinkTypeInternal,
  type DocumintConfigHeaderLinkTypeDropdown,
  type DocumintConfigHeaderLinkTypeSection,
  type DocumintResolvedHeader,
  type DocumintResolvedHeaderLink
} from "./config/_config.utils.js";
export * from "./utils/util.types.js";
export { LOG } from "./utils/util.logger.js";
