import { useEffect, useState } from "react";

import { type CodeToHastOptions, type BundledLanguage, type BundledTheme, codeToHtml } from "shiki";

export function useHighlightCode(
  code: string,
  options: Omit<CodeToHastOptions<BundledLanguage, BundledTheme>, "theme">
) {
  const [codeHtml, setCodeHtml] = useState<string>("");
  useEffect(() => {
    async function highlighCode() {
      const html = await codeToHtml(code, {
        theme: "slack-dark",
        ...options
      });
      setCodeHtml(html);
    }
    highlighCode();
  }, [code, options]);

  return codeHtml;
}
