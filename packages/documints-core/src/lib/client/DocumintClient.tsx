import { StrictMode, useRef } from "react";
import { type RouteObject, RouterProvider, createBrowserRouter } from "react-router";

import { DocumintsMetaProvider } from "../meta/DocumintsMetaProvider.js";

export function DocumintClient({ routes }: { routes: RouteObject[] }) {
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
