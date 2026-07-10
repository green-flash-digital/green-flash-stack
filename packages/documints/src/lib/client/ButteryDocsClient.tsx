import { ButteryMetaProvider } from "@buttery/meta/react";
import { StrictMode, useRef } from "react";
import {
  type RouteObject,
  RouterProvider,
  createBrowserRouter,
} from "react-router";

export function ButteryDocsClient({ routes }: { routes: RouteObject[] }) {
  const routerRef = useRef(
    createBrowserRouter(routes, {
      // @ts-expect-error react-router adds this for us
      hydrationData: window?.__staticRouterHydrationData,
    })
  );

  return (
    <StrictMode>
      <ButteryMetaProvider>
        <RouterProvider router={routerRef.current} />
      </ButteryMetaProvider>
    </StrictMode>
  );
}
