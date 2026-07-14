/**
 * Event-delegated listener for the "Copy as Markdown" button
 * (`LayoutBodyTOC.tsx`) - fetches the page's own `markdownHref` (the same
 * sibling `.md` route "View as Markdown" links to) and copies its raw
 * contents to the clipboard.
 */
export function setupCopyMarkdownButtons(): void {
  if (typeof document === "undefined") return;

  document.addEventListener("click", async (event) => {
    const button = (event.target as HTMLElement)?.closest<HTMLButtonElement>(
      "[data-copy-markdown-href]"
    );
    if (!button) return;

    const href = button.getAttribute("data-copy-markdown-href");
    if (!href) return;

    try {
      const response = await fetch(href);
      const markdown = await response.text();
      await navigator.clipboard.writeText(markdown);
    } catch {
      return;
    }

    const originalLabel = button.textContent;
    button.textContent = "Copied!";
    button.disabled = true;
    setTimeout(() => {
      button.textContent = originalLabel;
      button.disabled = false;
    }, 1500);
  });
}
