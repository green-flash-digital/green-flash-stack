import type { ChangeEventHandler } from "react";
import { useCallback, useMemo } from "react";

import { makeSpace, makeRem } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";
import { match } from "ts-pattern";

import { InputLabel } from "~/components/InputLabel";
import { InputRadioCard } from "~/components/InputRadioCard";
import { InputSection } from "~/components/InputSection";
import { IconMagicWand01 } from "~/icons/IconMagicWand01";
import { IconPencil } from "~/icons/IconPencil";

import { useConfigurationContext } from "../Config.context";
import { SpaceConfigAuto } from "./SpaceConfigAuto";
import { SpaceConfigManual } from "./SpaceConfigManual";

const groupStyles = css`
  display: flex;
  gap: ${makeSpace(16)};

  & > * {
    flex: 1;
  }
`;

export function SpaceConfig() {
  const { state, update } = useConfigurationContext();

  const handleOnChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      update((draft) => {
        draft.sizing.space.mode = value === "auto" ? "auto" : "manual";
      });
    },
    [update]
  );

  return (
    <>
      {useMemo(
        () => (
          <InputSection>
            <InputLabel dxLabel="Select how you would like to create the spacing constraints" />
            <div className={groupStyles}>
              <InputRadioCard
                DXIcon={IconMagicWand01}
                dxTitle="Automatic"
                dxDescription="Auto derive spacing tokens based upon a set numeric factor"
                dxHelp="Best when starting from scratch without design assets"
                value="auto"
                name="mode"
                defaultChecked={state.sizing.space.mode === "auto"}
                onChange={handleOnChange}
              />
              <InputRadioCard
                DXIcon={IconPencil}
                dxTitle="Manual"
                dxDescription="Manually add named spacing variants & values"
                dxHelp="Best when configuring spacing definitions provided by a design / product team"
                value="manual"
                name="mode"
                defaultChecked={state.sizing.space.mode === "manual"}
                onChange={handleOnChange}
              />
            </div>
          </InputSection>
        ),
        [handleOnChange, state.sizing.space.mode]
      )}
      <InputSection>
        {match(state.sizing.space)
          .with({ mode: "manual" }, (spaceState) => (
            <SpaceConfigManual
              baseFontSize={state.sizing.baseFontSize}
              state={spaceState.manual}
              update={update}
            />
          ))
          .with({ mode: "auto" }, (spaceState) => (
            <SpaceConfigAuto
              baseFontSize={state.sizing.baseFontSize}
              state={spaceState.auto}
              update={update}
            />
          ))
          .exhaustive()}
      </InputSection>
    </>
  );
}
