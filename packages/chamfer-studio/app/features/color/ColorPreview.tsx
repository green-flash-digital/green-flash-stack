import type { ReactNode } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

import { LayoutConfigSectionPreview } from "~/components/LayoutConfigSectionPreview";

import { colorThemeMap } from "./color.utils";
import { ColorPreviewProvider, useColorPreviewContext } from "./ColorPreview.context";

const styles = css`
  position: relative;

  &.light {
    background: ${colorThemeMap.light};

    &::after {
      content: "";
      position: absolute;
      left: 100%;
      top: 0;
      bottom: 0;
      width: 100vw;
      background: white;
    }
  }
  &.dark {
    background: ${colorThemeMap.dark};
  }
`;

function ColorPreviewContent({ children }: { children: ReactNode }) {
  const { wcagValues } = useColorPreviewContext();
  return (
    <LayoutConfigSectionPreview
      style={{
        background: wcagValues.bgColor
      }}
      className={classes(styles)}
    >
      {children}
    </LayoutConfigSectionPreview>
  );
}

export function ColorPreview({ children }: { children: ReactNode }) {
  return (
    <ColorPreviewProvider>
      <ColorPreviewContent>{children}</ColorPreviewContent>
    </ColorPreviewProvider>
  );
}
