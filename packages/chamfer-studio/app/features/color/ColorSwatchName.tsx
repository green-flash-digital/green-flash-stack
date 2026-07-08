import type { ChangeEventHandler } from "react";

import { InputLabel } from "~/components/InputLabel";
import { InputText } from "~/components/InputText";

export function ColorSwatchName(props: {
  name: string;
  onChangeName: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <InputLabel dxLabel="Name" dxHelp="A unique & semantic color identifier" dxSize="dense">
      <InputText dxSize="dense" value={props.name} onChange={props.onChangeName} />
    </InputLabel>
  );
}
