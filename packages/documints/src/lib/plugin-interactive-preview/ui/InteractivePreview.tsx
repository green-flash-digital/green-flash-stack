import { makeColor } from "@buttery/tokens/docs";
import { css } from "@linaria/core";
import React, { type ReactNode, useState } from "react";

const SourceCodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={24}
    height={24}
    fill={"none"}
    {...props}
  >
    <title>source code</title>
    <path
      d="M17 8L18.8398 9.85008C19.6133 10.6279 20 11.0168 20 11.5C20 11.9832 19.6133 12.3721 18.8398 13.1499L17 15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 8L5.16019 9.85008C4.38673 10.6279 4 11.0168 4 11.5C4 11.9832 4.38673 12.3721 5.16019 13.1499L7 15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.5 4L9.5 20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const styles = css`
  --preview-border-color: ${makeColor("neutral-100", {
    opacity: 0.6,
  })};

  border-radius: 0.25rem;
  border: 1px solid var(--preview-border-color);
  width: 100%;

  div {
    display: grid;
    place-content: center;

    height: 200px;
  }

  ul {
    display: flex;
    justify-content: center;
    padding: 0.5rem;
    margin: 0;
    border-top: 1px solid var(--preview-border-color);

    li {
      list-style-type: none;

      button {
        border: none;
        background: none;
        border-radius: 0.25rem;
        border: 1px solid transparent;
        display: flex;
        align-items: center;
        height: 36px;
        aspect-ratio: 1 / 1;
        transition: all 0.1s ease-in-out;
        cursor: pointer;

        &:hover,
        &:focus {
          background: ${makeColor("primary-500", {
            opacity: 0.2,
          })};
        }

        &.active {
          color: ${makeColor("primary")};
        }

        &:focus {
          outline: none;
          border: 1px solid ${makeColor("primary-500")};
        }
      }
    }
  }

  pre {
    margin: 0;
    border-top-left-radius: 0 !important;
    border-top-right-radius: 0 !important;
    border-bottom-left-radius: 0.25rem !important;
    border-bottom-right-radius: 0.25rem !important;
  }
`;

export function InteractivePreview({ children }: { children: ReactNode }) {
  const [displayCode, setDisplayCode] = useState(false);
  const [component, code] = React.Children.toArray(children);

  return (
    <div className={styles}>
      <div>{component}</div>
      <ul>
        <li>
          <button
            type="button"
            className={displayCode ? "active" : undefined}
            onClick={() => setDisplayCode((prevState) => !prevState)}
          >
            <SourceCodeIcon />
          </button>
        </li>
      </ul>
      {displayCode && code}
    </div>
  );
}
