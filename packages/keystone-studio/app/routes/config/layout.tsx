import { Outlet, useLoaderData } from "react-router";

import { classes, tryHandle } from "@green-flash/ts-utils/isomorphic";
import { makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { layoutSidebarSectionStyles, layoutSidebarStyles } from "~/components/layout.styles";
import { LayoutNavItem } from "~/components/LayoutNavItem";
import { LayoutSidebarTitle } from "~/components/LayoutSidebarTitle";
import { AdapterContext } from "~/context";
import { ConfigurationProvider } from "~/features/Config.context";
import { IconCode } from "~/icons/IconCode";
import { IconColors } from "~/icons/IconColors";
import { IconGrid } from "~/icons/IconGrid";
import { IconLayout2Column } from "~/icons/IconLayout2Column";
import { IconSettings05 } from "~/icons/IconSettings05";
import { IconTextFont } from "~/icons/IconTextFont";
import { errors } from "~/utils/util.error-modes";

import type { Route } from "./+types/layout";

const shellStyles = css`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "nav preview"
    "config preview";
`;

export async function loader({ context }: Route.LoaderArgs) {
  const adapter = context.get(AdapterContext);
  if (!adapter) throw errors.API_ERROR(500, new Error("No storage adapter configured"));

  const config = await tryHandle(adapter.read.bind(adapter))();
  if (config.success === false) {
    throw errors.API_ERROR(500, config.error);
  }

  return { config: config.data };
}

const sidebarNav = css`
  grid-area: nav;
  background: white;
  padding-bottom: ${makeRem(12)};
`;

export default function AppConfigRoute() {
  const { config } = useLoaderData<typeof loader>();

  return (
    <ConfigurationProvider originalConfig={config}>
      <div className={shellStyles}>
        {/* Nav */}
        <aside className={classes(layoutSidebarStyles, sidebarNav)}>
          <LayoutSidebarTitle>Pages</LayoutSidebarTitle>
          <nav className={layoutSidebarSectionStyles}>
            <LayoutNavItem to="/config" label="Color" DXIcon={IconColors} end />
            <LayoutNavItem to="/config/size-and-spacing" label="Size & Space" DXIcon={IconGrid} />
            <LayoutNavItem to="/config/typography" label="Typography" DXIcon={IconTextFont} />
            <LayoutNavItem to="/config/response" label="Response" DXIcon={IconLayout2Column} />
            <LayoutNavItem to="/config/custom" label="Custom" DXIcon={IconCode} />
            <LayoutNavItem to="/config/settings" label="Settings" DXIcon={IconSettings05} />
          </nav>
        </aside>
        {/* <div className={sidebarFooterStyles}>
            <ButtonGroup>
              <ConfigStyleGuide />
              <ConfigJSON />
            </ButtonGroup>
            <ConfigSave />
          </div> */}
        <Outlet />
      </div>
    </ConfigurationProvider>
  );
}
