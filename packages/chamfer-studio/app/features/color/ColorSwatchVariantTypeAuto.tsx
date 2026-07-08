import type { ChangeEvent } from "react";

import type { ChamferColorVariantBase, ColorVariantTypeAuto } from "@chamfer-css/core/schemas";

import { InputLabel } from "../../components/InputLabel";
import { InputNumber } from "../../components/InputNumber";

export function ColorSwatchVariantTypeAuto({
  variant,
  onChangeVariantAuto
}: {
  variant: ColorVariantTypeAuto;
  onChangeVariantAuto: <T extends ChamferColorVariantBase>(variant: T) => void;
}) {
  function handleChangeVariantTypeAuto({
    currentTarget: { value }
  }: ChangeEvent<HTMLInputElement>): void {
    onChangeVariantAuto(Number(value));
  }

  return (
    <InputLabel
      dxSize="dense"
      dxLabel="Total Count"
      dxHelp="Number of auto-named variants based upon the base color"
    >
      <InputNumber dxSize="dense" value={variant} onChange={handleChangeVariantTypeAuto} />
    </InputLabel>
  );
}
