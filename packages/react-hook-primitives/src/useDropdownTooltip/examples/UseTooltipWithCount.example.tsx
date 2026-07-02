import { css } from "@linaria/core";
import type { FC } from "react";

import { useDropdownTooltip } from "../useDropdownTooltip.js";

const tooltipClass = css`
  padding: 0.5rem 1rem;
  background: black;
  color: white;
  border: 0;
  border-radius: 0.5rem;
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

const burstClass = css`
  height: 1rem;
  width: 1rem;
  position: absolute;
  top: -2px;
  right: -2px;
  border-radius: 50%;
  font-size: 10px;
  background: red;
  color: white;
  display: grid;
  place-content: center;
`;

const IconHeart: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
    <title>heart</title>
    <path
      d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export default () => {
  const { setTargetRef, setTooltipRef } = useDropdownTooltip({
    dxType: "tooltip",
    dxLabeledBy: "likes-count likes-label",
    dxPosition: "top-center",
    dxArrow: {
      size: 8,
      color: "black",
    },
  });

  return (
    <>
      <button
        ref={setTargetRef}
        className={buttonClass}
        onClick={() => alert("Liked!")}
      >
        <span id="likes-count" className={burstClass}>
          3
        </span>
        <IconHeart />
      </button>
      <div ref={setTooltipRef} className={tooltipClass} id="likes-label">
        Likes
      </div>
    </>
  );
};
