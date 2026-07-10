import { StrictMode, useRef } from "react";
import { type RouteObject, RouterProvider, createBrowserRouter } from "react-router";

import ReactDOMClient from "react-dom/client";

import { DocumintsMetaProvider } from "./components/DocumintsMeta.provider.js";
import { routes } from "./routes.js";

ReactDOMClient.hydrateRoot(
  document.getElementById("root") as HTMLElement,
  <DocumintClient routes={routes} />
);

function DocumintClient({ routes }: { routes: RouteObject[] }) {
  const routerRef = useRef(
    createBrowserRouter(routes, {
      hydrationData: window?.__staticRouterHydrationData
    })
  );

  return (
    <StrictMode>
      <DocumintsMetaProvider>
        <RouterProvider router={routerRef.current} />
      </DocumintsMetaProvider>
    </StrictMode>
  );
}
