import { useConfigurationContext } from "../Config.context";

/**
 * Returns a named exportStyleGuide function that will
 * save the configuration. All sever loaders will
 * re-update
 */
export function useExportStyleGuide() {
  const { getConfigFromState } = useConfigurationContext();

  async function exportStyleGuide() {
    const config = getConfigFromState();

    const formData = new FormData();
    formData.append("config", JSON.stringify(config, null, 2));

    // Send a POST request and open the PDF in a new tab
    const response = await fetch("/api/style-guide/export", {
      method: "POST",
      body: formData
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank"); // Open the PDF in a new tab
    }
  }

  return { exportStyleGuide };
}
