import { Button } from "~/components/Button";
import { IconCode } from "~/icons/IconCode";

import { configJSONModalController } from "./ConfigJSONModal.controller";

export function ConfigJSON() {
  return (
    <>
      <Button dxVariant="outlined" DXIconStart={IconCode} onClick={configJSONModalController.launch}>
        JSON
      </Button>
      <configJSONModalController.Component />
    </>
  );
}
