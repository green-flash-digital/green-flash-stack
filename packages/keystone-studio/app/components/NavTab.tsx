import type { ReactElement } from "react";
import React, { useMemo } from "react";

import type { NavTabContent } from "./NavTabContent";
import type { NavTabLabel } from "./NavTabLabel";

export function NavTab({
  id,
  children
}: {
  id: string;
  children: [ReactElement<typeof NavTabLabel>, ReactElement<typeof NavTabContent>];
}) {
  return useMemo(
    () =>
      React.Children.map(children, (child) =>
        // @ts-expect-error we're not too interested in the typechecker here
        React.cloneElement(child, {
          key: id,
          id
        })
      ),
    [children, id]
  );
}
