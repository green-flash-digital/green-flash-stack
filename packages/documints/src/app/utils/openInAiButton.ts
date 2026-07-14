/**
 * Event-delegated listener for the "Open in ChatGPT"/"Open in Claude" buttons
 * (`LayoutBodyTOC.tsx`) - builds an absolute URL to the page's `markdownHref`
 * from `window.location.origin` (no `siteUrl` config needed, and correct
 * under any preview/custom domain) and opens a new chat referencing it.
 */
const AI_PROVIDER_URLS = {
  chatgpt: "https://chatgpt.com/?q=",
  claude: "https://claude.ai/new?q="
} as const;

type AiProvider = keyof typeof AI_PROVIDER_URLS;

function isAiProvider(value: string): value is AiProvider {
  return value in AI_PROVIDER_URLS;
}

export function setupOpenInAiButtons(): void {
  if (typeof document === "undefined") return;

  document.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement)?.closest<HTMLButtonElement>(
      "[data-open-in-ai]"
    );
    if (!button) return;

    const provider = button.getAttribute("data-open-in-ai") ?? "";
    const markdownHref = button.getAttribute("data-markdown-href");
    if (!markdownHref || !isAiProvider(provider)) return;

    const absoluteUrl = `${window.location.origin}${markdownHref}`;
    const prompt = `Read ${absoluteUrl} so I can ask questions about it.`;
    window.open(
      `${AI_PROVIDER_URLS[provider]}${encodeURIComponent(prompt)}`,
      "_blank",
      "noopener,noreferrer"
    );
  });
}
