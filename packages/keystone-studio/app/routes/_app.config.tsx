import { NavLink, Outlet, useLoaderData } from "react-router";

import { makeSpace, makeColor, makeCustom, makeRem } from "@keystone@keystone-css/studio-tokens";
import { css } from "@linaria/core";
import { tryHandle } from "ts-jolt/isomorphic";

import { ButtonGroup } from "~/components/ButtonGroup";
import { NavTabs } from "~/components/NavTabs";
import { ConfigurationProvider } from "~/features/Config.context";
import { ConfigJSON } from "~/features/ConfigJSON";
import { ConfigSave } from "~/features/ConfigSave";
import { ConfigStyleGuide } from "~/features/ConfigStyleGuide";
import { errors } from "~/utils/util.error-modes";
import { getKeystoneConfig } from "~/utils/util.getLocalConfig";

const styles = css`
  position: sticky;
  top: 0;
  background: white;
  z-index: 11;

  & > * {
    margin: 0 auto;
    max-width: ${makeCustom("layout-max-width")};
  }

  .page-header {
    display: grid;
    grid-template-columns: 1fr auto;
    width: 100%;
    padding: ${makeSpace(20)} ${makeCustom("layout-gutters")};

    h2 {
      margin: 0;
    }

    p {
      font-size: ${makeSpace(12)};
      margin-bottom: 0;
      color: ${makeColor("neutral-light", { opacity: 0.8 })};
    }

    .actions {
      display: flex;
      gap: ${makeSpace(16)};
    }
    & + * {
    }
  }

  .tabs {
    padding: 0 ${makeCustom("layout-gutters")};
  }
`;

export async function loader() {
  const config = await tryHandle(getKeystoneConfig)();
  if (config.hasError) {
    throw errors.API_ERROR(500, config.error);
  }

  return { config: config.data };
}

export default function AppConfigRoute() {
  const { config } = useLoaderData<typeof loader>();

  return (
    <ConfigurationProvider originalConfig={config}>
      <div className={styles}>
        <div className="page-header">
          <div>
            <h2>Configuration</h2>
          </div>
          <div className="actions">
            <ButtonGroup>
              <ConfigStyleGuide />
              <ConfigJSON />
            </ButtonGroup>
            <ButtonGroup>
              <ConfigSave />
            </ButtonGroup>
          </div>
        </div>
        <NavTabs>
          <ul className="tabs">
            <li>
              <NavLink to="." end>
                Color
              </NavLink>
            </li>
            <li>
              <NavLink to="./size-and-spacing">Size & Spacing</NavLink>
            </li>
            <li>
              <NavLink to="./typography">Typography</NavLink>
            </li>
            <li>
              <NavLink to="./response">Response</NavLink>
            </li>
            <li>
              <NavLink to="./custom">Custom</NavLink>
            </li>
            <li>
              <NavLink to="./settings">Settings</NavLink>
            </li>
          </ul>
        </NavTabs>
      </div>
      <Outlet />
    </ConfigurationProvider>
  );
}
