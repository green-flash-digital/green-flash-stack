/**
 * One event-delegated listener for every "Copy" button rehype-copy-code.ts
 * injects, instead of hydrating a React component per code block - the
 * buttons already exist in the prerendered HTML, this just makes them work.
 */
export function setupCopyCodeButtons(): void {
  if (typeof document === "undefined") return;

  document.addEventListener("click", async (event) => {
    const button = (event.target as HTMLElement)?.closest<HTMLButtonElement>(
      "[data-copy-code]"
    );
    if (!button) return;

    const code = button.getAttribute("data-copy-code") ?? "";
    try {
      await navigator.clipboard.writeText(code);
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
