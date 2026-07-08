import { useMemo } from "react";

import { makeSpace, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { CodeBlock } from "~/components/CodeBlock";

import { useConfigurationContext } from "../Config.context";

const styles = css`
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(32)};
`;

export function SettingsPreviewContent() {
  const {
    state: {
      settings: { prefix }
    }
  } = useConfigurationContext();

  const prefixCode = useMemo(() => {
    return `/* Prefix

* When 'keystone build' is run, the values in the schema are read, compiled
* and built. Along with the creation of the utilities, the custom CSS properties
* that correspond to those values are also created at the root and _prefixed_
* with a string that will avoid clashing with other 3rd party CSS custom properties
*/

:root {
  --${prefix}-color-primary-50: #ffff92;
  --${prefix}-color-primary-50-hex: #ffff92;
  --${prefix}-color-primary-50-hsl: 60, 100, 79;
  --${prefix}-color-primary-50-rgb: 255, 255, 146;
  --${prefix}-color-primary-100: #fbf07c;
  --${prefix}-color-primary-100-hex: #fbf07c;
  --${prefix}-color-primary-100-hsl: 55, 94, 74;
  --${prefix}-color-primary-100-rgb: 251, 240,
  /* etc... */
}
`;
  }, [prefix]);

  return (
    <div className={styles}>
      <div>
        <CodeBlock dxCode={prefixCode} dxOptions={{ lang: "css" }} />
      </div>
    </div>
  );
}
