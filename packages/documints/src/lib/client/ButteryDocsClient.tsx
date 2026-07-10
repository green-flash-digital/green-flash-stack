import { StrictMode, useRef } from "react";
import {
  type RouteObject,
  RouterProvider,
  createBrowserRouter,
} from "react-router";

import { DocumintsMetaProvider } from "../meta/DocumintsMetaProvider.js";

export function ButteryDocsClient({ routes }: { routes: RouteObject[] }) {
  const routerRef = useRef(
    createBrowserRouter(routes, {
      // @ts-expect-error react-router adds this for us
      hydrationData: window?.__staticRouterHydrationData,
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
