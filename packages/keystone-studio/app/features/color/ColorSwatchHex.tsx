import { useCallback, useRef, type ChangeEventHandler } from "react";

import { makeSpace, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { InputLabel } from "~/components/InputLabel";
import { InputText } from "~/components/InputText";

import { InputColor } from "../../components/InputColor";

const styles = css`
  display: grid;
  grid-template-columns: ${makeSpace(24)} 1fr;
  align-items: center;
  gap: ${makeSpace(8)};
`;

export function ColorSwatchHex(props: {
  id: string;
  hex: string;
  onChangeHex: ChangeEventHandler<HTMLInputElement>;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const handleChangeColor = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const hex = e.currentTarget.value;
      if (inputRef.current) {
        inputRef.current.value = hex;
      }
      props.onChangeHex(e);
    },
    [props]
  );

  const handleChangeInput = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const value = e.currentTarget.value;
      const hex = value.replace("#", "");
      if (hex.length === 3 || hex.length === 6) {
        props.onChangeHex(e);
      }
    },
    [props]
  );

  return (
    <InputLabel dxLabel="Hex" dxHelp="The hexadecimal color value" dxSize="dense">
      <div className={styles}>
        <InputColor dxSize="dense" value={props.hex} onChange={handleChangeColor} />
        <InputText
          ref={inputRef}
          defaultValue={props.hex}
          dxSize="dense"
          onChange={handleChangeInput}
        />
      </div>
    </InputLabel>
  );
}
