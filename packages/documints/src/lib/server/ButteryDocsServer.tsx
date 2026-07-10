import type { ButteryMeta } from "@buttery/meta";
import { ButteryMetaProvider } from "@buttery/meta/react";
import { StrictMode } from "react";
import {
  type StaticHandlerContext,
  StaticRouterProvider,
  type createStaticRouter,
} from "react-router";

export type ButteryDocsServerContext = {
  route: string;
  Meta: ButteryMeta;
};

export function ButteryDocsServer({
  router,
  routerContext,
  ...props
}: ButteryDocsServerContext & {
  router: ReturnType<typeof createStaticRouter>;
  routerContext: StaticHandlerContext;
}) {
  return (
    <StrictMode>
      <ButteryMetaProvider ButteryMeta={props.Meta}>
        <StaticRouterProvider router={router} context={routerContext} />
      </ButteryMetaProvider>
    </StrictMode>
  );
}
