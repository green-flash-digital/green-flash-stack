import { InputCheckbox } from "~/components/InputCheckbox";
import { InputLabel } from "~/components/InputLabel";
import { InputSection } from "~/components/InputSection";
import { InputText } from "~/components/InputText";

import { useConfigurationContext } from "../Config.context";

export function SettingsConfig() {
  const { settings, setSettings } = useConfigurationContext();

  return (
    <>
      <InputSection dxSize="dense">
        <InputLabel
          dxLabel="Prefix"
          dxHelp="A string that will prefix the generated CSS custom properties to ensure there aren't any conflicts with other 3rd party CSS custom properties"
        >
          <InputText
            dxSize="normal"
            value={settings.prefix}
            onChange={({ currentTarget: { value } }) =>
              setSettings((draft) => {
                if (!value) return;
                draft.prefix = value;
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
            checked={settings.strict}
            onChange={({ currentTarget: { checked } }) =>
              setSettings((draft) => {
                draft.strict = checked;
              })
            }
          />
        </InputLabel>
      </InputSection>
    </>
  );
}
