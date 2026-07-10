import { css } from "@linaria/core";

import { IconPlusSign } from "~/icons/IconPlusSign";

import { Button } from "./Button";

const styles = css`
  width: 100%;
`;

export function VariantAdd(props: { children: string; onAdd: () => void }) {
  return (
    <Button
      dxVariant="outlined"
      dxColor="secondary"
      onClick={props.onAdd}
      DXIconStart={IconPlusSign}
      className={styles}
    >
      {props.children}
    </Button>
  );
}
