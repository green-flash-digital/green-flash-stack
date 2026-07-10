import { InputCheckbox } from "~/components/InputCheckbox";
import { InputLabel } from "~/components/InputLabel";
import { InputSection } from "~/components/InputSection";
import { InputText } from "~/components/InputText";

import { useConfigurationContext } from "../Config.context";

export function SettingsConfig() {
  const { state, update } = useConfigurationContext();

  return (
    <>
      <InputSection dxSize="dense">
        <InputLabel
          dxLabel="Prefix"
          dxHelp="A string that will prefix the generated CSS custom properties to ensure there aren't any conflicts with other 3rd party CSS custom properties"
        >
          <InputText
            dxSize="normal"
            value={state.settings.prefix}
            onChange={({ currentTarget: { value } }) =>
              update((draft) => {
                if (!value) return;
                draft.settings.prefix = value;
              })
            }
          />
        </InputLabel>
      </InputSection>
      <InputSection dxSize="dense">
        <InputLabel
          dxLabel="Strict mode?"
          dxHelp="Enforces the specific constraints of the utilities (e.g. if your baseline factor is 4 and you try to 'makeRem(6)', you'll get a build & runtime error will be thrown."
        >
          <InputCheckbox
            dxSize="normal"
            checked={state.settings.strict}
            onChange={({ currentTarget: { checked } }) =>
              update((draft) => {
                draft.settings.strict = checked;
              })
            }
          />
        </InputLabel>
      </InputSection>
    </>
  );
}
