import type { ChangeEventHandler } from "react";
import { useCallback, useMemo } from "react";

import { makeSpace, makeRem } from "@keystone@keystone-css/studio-tokens";
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
  const { sizing, setSizing } = useConfigurationContext();

  const handleOnChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      setSizing((draft) => {
        draft.space.mode = value === "auto" ? "auto" : "manual";
      });
    },
    [setSizing]
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
                defaultChecked={sizing.space.mode === "auto"}
                onChange={handleOnChange}
              />
              <InputRadioCard
                DXIcon={IconPencil}
                dxTitle="Manual"
                dxDescription="Manually add named spacing variants & values"
                dxHelp="Best when configuring spacing definitions provided by a design / product team"
                value="manual"
                name="mode"
                defaultChecked={sizing.space.mode === "manual"}
                onChange={handleOnChange}
              />
            </div>
          </InputSection>
        ),
        [handleOnChange, sizing.space.mode]
      )}
      <InputSection>
        {match(sizing.space)
          .with({ mode: "manual" }, (state) => (
            <SpaceConfigManual
              baseFontSize={sizing.baseFontSize}
              state={state.manual}
              setSizing={setSizing}
            />
          ))
          .with({ mode: "auto" }, (state) => (
            <SpaceConfigAuto
              baseFontSize={sizing.baseFontSize}
              state={state.auto}
              setSizing={setSizing}
            />
          ))
          .exhaustive()}
      </InputSection>
    </>
  );
}
