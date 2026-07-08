import { css } from "@linaria/core";
import { Fragment } from "react/jsx-runtime";

import { styleGuideSections } from "./style-guide.utils";
import { StyleGuideBasicHome } from "./StyleGuideBasicHome";
import { StyleGuidePageBreak } from "./StyleGuidePageBreak";

const styles = css`
  background: white;
`;

export function StyleGuideBasic() {
  return (
    <div className={styles}>
      <StyleGuideBasicHome />
      <StyleGuidePageBreak />
      {styleGuideSections.map(({ Component, ...restProps }, i) => {
        return (
          <Fragment key={`section-${i}`}>
            <Component {...restProps} />
            <StyleGuidePageBreak />
          </Fragment>
        );
      })}
    </div>
  );
}
