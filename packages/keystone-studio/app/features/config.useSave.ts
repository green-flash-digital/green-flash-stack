import { useFetcher } from "react-router";

import { tryHandle } from "@green-flash/ts-utils/isomorphic";

import { useConfigurationContext } from "./Config.context";

/**
 * Returns a named saveConfig function that will
 * save the configuration. All sever loaders will
 * re-update
 */
export function useSaveConfig() {
  const fetcher = useFetcher();
  const { getTokens } = useConfigurationContext();

  async function saveConfig() {
    const config = getTokens();

    const res = await tryHandle(fetcher.submit)(
      { config: JSON.stringify(config) },
      { method: "POST", action: "/api/save-config" }
    );
    if (res.hasError) {
      throw res.error;
    }
  }

  return { saveConfig };
}
