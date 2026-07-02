import { useCallback } from "react";

import { makeSpace, makeRem, makeReset } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";
import { exhaustiveMatchGuard, generateGUID } from "ts-jolt/isomorphic";

import { VariantEmpty } from "~/components/VariantEmpty";

import { useConfigurationContext } from "../Config.context";
import { BreakpointConfigVariant } from "./BreakpointConfigVariant";
import type { OnResponseBreakpointAction } from "./BreakpointConfigVariant";

const styles = css`
  ${makeReset("ul")};
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(8)};
`;

export function BreakpointConfig() {
  const { state, update } = useConfigurationContext();
  const breakpoints = state.response.breakpoints;

  const handleAction = useCallback<OnResponseBreakpointAction>(
    (args) => {
      switch (args.action) {
        case "addBreakpointDirection":
          update((draft) => {
            const entires = Object.entries(draft.response.breakpoints);
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
            draft.response.breakpoints = Object.fromEntries(entires);
          });
          break;

        case "addBreakpoint":
          update((draft) => {
            draft.response.breakpoints = {
              ...draft.response.breakpoints,
              [generateGUID()]: { name: `mobile`, value: 480 }
            };
          });
          break;

        case "deleteBreakpoint":
          update((draft) => {
            delete draft.response.breakpoints[args.id];
          });
          break;

        case "updateBreakpoint":
          update((draft) => {
            draft.response.breakpoints[args.id].name = args.name;
            draft.response.breakpoints[args.id].value = args.value;
          });
          break;

        default:
          return exhaustiveMatchGuard(args);
      }
    },
    [update]
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
