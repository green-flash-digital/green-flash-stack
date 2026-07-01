import { useFetcher } from "react-router";

import { tryHandle } from "ts-jolt/isomorphic";

import { useConfigurationContext } from "./Config.context";

/**
 * Returns a named saveConfig function that will
 * save the configuration. All sever loaders will
 * re-update
 */
export function useSaveConfig() {
  const fetcher = useFetcher();
  const { getConfigFromState } = useConfigurationContext();

  async function saveConfig() {
    const config = getConfigFromState();

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
