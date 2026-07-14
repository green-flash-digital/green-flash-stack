import { StrictMode } from "react";
import { RouterProvider, createBrowserRouter } from "react-router";

import ReactDOMClient from "react-dom/client";

import { DocumintsMetaProvider } from "../meta/DocumintsMeta.provider.js";

import { routes } from "./routes.js";
import { setupCopyCodeButtons } from "./utils/copyCodeButton.js";
import { setupCopyMarkdownButtons } from "./utils/copyMarkdownButton.js";
import { setupOpenInAiButtons } from "./utils/openInAiButton.js";

setupCopyCodeButtons();
setupCopyMarkdownButtons();
setupOpenInAiButtons();

// A browser router is inherently a page-lifetime singleton tied to
// window.history - created once here, at module scope, rather than inside a
// component. Constructing it during render (e.g. via `useRef(createBrowserRouter(...))`)
// calls it as a plain expression on every render, and React's dev-mode
// StrictMode double-render would then construct a second, silently-discarded
// router instance - each with real side effects (history subscriptions,
// initial route matching) that can leave the actually-mounted router's
// context in a broken state.
const router = createBrowserRouter(routes, {
  hydrationData: window?.__staticRouterHydrationData
});

ReactDOMClient.hydrateRoot(
  document.getElementById("root") as HTMLElement,
  <StrictMode>
    <DocumintsMetaProvider>
      <RouterProvider router={router} />
    </DocumintsMetaProvider>
  </StrictMode>
);
