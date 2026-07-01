import { useCallback } from "react";

import { makeSpace, makeRem, makeReset } from "@keystone@keystone-css/studio-tokens";
import { css } from "@linaria/core";
import { exhaustiveMatchGuard, generateGUID } from "ts-jolt/isomorphic";

import { VariantEmpty } from "~/components/VariantEmpty";

import { useConfigurationContext } from "../Config.context";
import { BreakpointConfigVariant } from "./BreakpointConfigVariant";
import type { OnResponseBreakpointAction } from "./response.utils";

const styles = css`
  ${makeReset("ul")};
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(8)};
`;

export function BreakpointConfig() {
  const {
    setResponse,
    response: { breakpoints }
  } = useConfigurationContext();

  const handleAction = useCallback<OnResponseBreakpointAction>(
    (args) => {
      switch (args.action) {
        case "addBreakpointDirection":
          setResponse((draft) => {
            const entires = Object.entries(draft.breakpoints);
            const newIndex =
              args.direction === "above" ? args.referenceIndex : args.referenceIndex + 1;

            const newValue =
              args.direction === "above"
                ? entires[args.referenceIndex][1].value - 1
                : entires[args.referenceIndex][1].value + 1;

            entires.splice(newIndex, 0, [
              generateGUID(),
              {
                name: `breakpoint${newIndex}`,
                value: newValue
              }
            ]);
            draft.breakpoints = Object.fromEntries(entires);
          });
          break;

        case "addBreakpoint":
          setResponse((draft) => {
            draft.breakpoints = {
              ...draft.breakpoints,
              [generateGUID()]: { name: `mobile`, value: 480 }
            };
          });
          break;

        case "deleteBreakpoint":
          setResponse((draft) => {
            delete draft.breakpoints[args.id];
          });
          break;

        case "updateBreakpoint":
          setResponse((draft) => {
            draft.breakpoints[args.id].name = args.name;
            draft.breakpoints[args.id].value = args.value;
          });
          break;

        default:
          return exhaustiveMatchGuard(args);
      }
    },
    [setResponse]
  );

  const handleAddBreakpoint = useCallback(() => {
    handleAction({ action: "addBreakpoint" });
  }, [handleAction]);

  const breakpointsEntires = Object.entries(breakpoints);

  if (breakpointsEntires.length === 0) {
    return (
      <VariantEmpty
        dxMessage="No breakpoints have been added yet"
        dxActionMessage="Click to add a breakpoint"
        dxOnAdd={handleAddBreakpoint}
      />
    );
  }

  return (
    <ul className={styles}>
      {Object.entries(breakpoints).map(([breakpointId, breakpoint], index) => (
        <li key={breakpointId}>
          <BreakpointConfigVariant
            breakpoint={breakpoint}
            breakpointId={breakpointId}
            breakpointIndex={index}
            onAction={handleAction}
          />
        </li>
      ))}
    </ul>
  );
}
