import { makeSpace, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { Button } from "~/components/Button";
import { ButtonGroup } from "~/components/ButtonGroup";
import { IconMoon2 } from "~/icons/IconMoon2";
import { IconSun03 } from "~/icons/IconSun03";
import { IconUniversalAccess } from "~/icons/IconUniversalAccess";

import { useColorPreviewContext } from "./ColorPreview.context";
import { ColorPreviewControlsAccessibility } from "./ColorPreviewControlsAccessibility";

const styles = css`
  display: flex;
  gap: ${makeSpace(16)};
`;

export function ColorPreviewControls() {
  const { themeMode, setThemeMode, toggleWCAG, showWCAG } = useColorPreviewContext();
  return (
    <div className={styles}>
      <ColorPreviewControlsAccessibility />
      <ButtonGroup>
        <Button
          dxVariant="icon"
          DXIcon={IconUniversalAccess}
          onClick={toggleWCAG}
          dxStyle="outlined"
          dxSize="normal"
          dxHelp={`${showWCAG ? "Hide" : "Show"} accessibility metrics`}
        />
        <Button
          dxVariant="icon"
          DXIcon={themeMode === "light" ? IconMoon2 : IconSun03}
          onClick={() => setThemeMode((prevState) => (prevState === "dark" ? "light" : "dark"))}
          dxStyle="outlined"
          dxSize="normal"
          dxHelp={`Toggle ${themeMode === "dark" ? "light" : "dark"} theme`}
        />
      </ButtonGroup>
    </div>
  );
}
