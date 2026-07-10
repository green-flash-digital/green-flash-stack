import { StrictMode } from "react";
import {
  type StaticHandlerContext,
  StaticRouterProvider,
  type createStaticRouter
} from "react-router";

import { type DocumintsMeta } from "../meta/DocumintsMeta.js";
import { DocumintsMetaProvider } from "../meta/DocumintsMetaProvider.js";

export type DocumintServerContext = {
  route: string;
  Meta: DocumintsMeta;
};

export function DocumintServer({
  router,
  routerContext,
  ...props
}: DocumintServerContext & {
  router: ReturnType<typeof createStaticRouter>;
  routerContext: StaticHandlerContext;
}) {
  return (
    <StrictMode>
      <DocumintsMetaProvider documintsMeta={props.Meta}>
        <StaticRouterProvider router={router} context={routerContext} />
      </DocumintsMetaProvider>
    </StrictMode>
  );
}
