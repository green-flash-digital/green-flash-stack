import { Outlet, useLoaderData } from "react-router";

import { makeSpace, makeColor, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";
import { tryHandle } from "@green-flash/ts-utils/isomorphic";

import type { Route } from "./+types/layout";
import { ButtonGroup } from "~/components/ButtonGroup";
import { LayoutSidebar } from "~/components/LayoutSidebar";
import { LayoutSidebarItem } from "~/components/LayoutSidebarItem";
import { ConfigurationProvider } from "~/features/Config.context";
import { ConfigJSON } from "~/features/ConfigJSON";
import { ConfigSave } from "~/features/ConfigSave";
import { ConfigStyleGuide } from "~/features/ConfigStyleGuide";
import { IconCode } from "~/icons/IconCode";
import { IconColors } from "~/icons/IconColors";
import { IconGrid } from "~/icons/IconGrid";
import { IconLayout2Column } from "~/icons/IconLayout2Column";
import { IconSettings05 } from "~/icons/IconSettings05";
import { IconTextFont } from "~/icons/IconTextFont";
import { errors } from "~/utils/util.error-modes";
import { readTokensConfig } from "~/utils/util.getLocalConfig";

const shellStyles = css`
  display: flex;
  height: 100%;
`;

const sidebarFooterStyles = css`
  margin-top: auto;
  padding: ${makeSpace(12)} ${makeSpace(8)};
  border-top: ${makeRem(1)} solid ${makeColor("neutral-dark", { opacity: 0.08 })};
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(8)};
`;

const contentStyles = css`
  flex: 1;
  overflow-y: auto;
`;

export async function loader({ context }: Route.LoaderArgs) {
  const config = await tryHandle(readTokensConfig)(context.tokensPath);
  if (config.hasError) {
    throw errors.API_ERROR(500, config.error);
  }

  return { config: config.data };
}

export default function AppConfigRoute() {
  const { config } = useLoaderData<typeof loader>();

  return (
    <ConfigurationProvider originalConfig={config}>
      <div className={shellStyles}>
        <LayoutSidebar>
          <LayoutSidebarItem to="/config" label="Color" DXIcon={IconColors} end />
          <LayoutSidebarItem
            to="/config/size-and-spacing"
            label="Size & Space"
            DXIcon={IconGrid}
          />
          <LayoutSidebarItem
            to="/config/typography"
            label="Typography"
            DXIcon={IconTextFont}
          />
          <LayoutSidebarItem
            to="/config/response"
            label="Response"
            DXIcon={IconLayout2Column}
          />
          <LayoutSidebarItem to="/config/custom" label="Custom" DXIcon={IconCode} />
          <LayoutSidebarItem to="/config/settings" label="Settings" DXIcon={IconSettings05} />
          <div className={sidebarFooterStyles}>
            <ButtonGroup>
              <ConfigStyleGuide />
              <ConfigJSON />
            </ButtonGroup>
            <ConfigSave />
          </div>
        </LayoutSidebar>
        <div className={contentStyles}>
          <Outlet />
        </div>
      </div>
    </ConfigurationProvider>
  );
}
