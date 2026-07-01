import { useMemo } from "react";

import { makeSpace, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { Button } from "~/components/Button";
import { ButtonGroup } from "~/components/ButtonGroup";
import { IconIdentityCard } from "~/icons/IconIdentityCard";
import { IconLeftToRightListNumber } from "~/icons/IconLeftToRightListNumber";
import { IconParagraph } from "~/icons/IconParagraph";

import { FontVariantPreviewControlsHelp } from "./FontVariantPreviewControlsHelp";

const styles = css`
  display: grid;
  grid-template-columns: auto auto;
  gap: ${makeSpace(16)};
  align-items: center;
`;

export function FontVariantPreviewControls() {
  return (
    <div className={styles}>
      {useMemo(
        () => (
          <>
            <ButtonGroup>
              <Button
                dxVariant="icon"
                DXIcon={IconLeftToRightListNumber}
                dxStyle="outlined"
                dxHelp="View as list"
              />
              <Button
                dxVariant="icon"
                DXIcon={IconIdentityCard}
                dxStyle="outlined"
                dxHelp="View in card"
              />
              <Button
                dxVariant="icon"
                DXIcon={IconParagraph}
                dxStyle="outlined"
                dxHelp="View in article"
              />
            </ButtonGroup>
            <ButtonGroup>
              <FontVariantPreviewControlsHelp />
            </ButtonGroup>
          </>
        ),
        []
      )}
    </div>
  );
}
