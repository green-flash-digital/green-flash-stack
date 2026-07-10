import {
  type GetButteryConfigOptions,
  getButteryConfig,
} from "@buttery/core/config";

import { getButteryDocsDirectories } from "./getButteryDocsDirectories.js";
import {
  butteryDocsConfigSchema,
  type ButteryDocsConfig,
} from "./_config.utils.js";

export type ResolvedButteryDocsConfig = Awaited<
  ReturnType<typeof getButteryDocsConfig>
>;

type GetButteryDocsParams = Required<
  Pick<GetButteryConfigOptions<ButteryDocsConfig>, "prompt" | "logLevel">
>;

export async function getButteryDocsConfig({
  logLevel,
  prompt,
}: GetButteryDocsParams) {
  const { config, paths } = await getButteryConfig<ButteryDocsConfig>("docs", {
    logLevel,
    prompt,
    async onEmpty() {
      return {
        buildTarget: "cloudflare-pages",
      };
    },
    async validate(rawConfig) {
      const res = butteryDocsConfigSchema.safeParse(rawConfig);
      if (res.error) {
        throw res.error;
      }
      return rawConfig; // return the raw config so any TS functions aren't removed
    },
  });

  const dirs = await getButteryDocsDirectories(config, paths, {
    logLevel,
  });

  return {
    config,
    paths,
    dirs,
  };
}
