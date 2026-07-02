import { css } from "@linaria/core";
import type { FC } from "react";

import { useDropdownTooltip } from "../useDropdownTooltip.js";

const tooltipClass = css`
  padding: 0.5rem 1rem;
  background: black;
  color: white;
  border: 0;
  border-radius: 0.5rem;
  max-width: 200px;
  font-size: 12px;
`;

const buttonClass = css`
  border: 0;
  padding: 0;
  background: 0;
  height: 32px;
  width: 32px;
  display: grid;
  place-content: center;
  position: relative;
`;

const IconInfo: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    color="#000000"
    fill="none"
  >
    <title>info</title>
    <path
      d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M12.2422 17V12C12.2422 11.5286 12.2422 11.2929 12.0957 11.1464C11.9493 11 11.7136 11 11.2422 11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.992 8H12.001"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default () => {
  const { setTargetRef, setTooltipRef } = useDropdownTooltip({
    dxType: "toggletip",
  });

  return (
    <>
      <button
        ref={setTargetRef}
        className={buttonClass}
        aria-label="description"
      >
        <IconInfo />
      </button>
      <div ref={setTooltipRef} className={tooltipClass} id="description">
        This field helps make things a little more clear or further explains
        things that would otherwise not be as clear. Think of placeholder text
        in inputs or help text in labels.
      </div>
    </>
  );
};
