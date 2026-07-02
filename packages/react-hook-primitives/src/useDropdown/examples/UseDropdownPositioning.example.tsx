import { useState } from "react";

import { useDropdown } from "../useDropdown.js";
import { useDropdownPositions } from "../useDropdown.utils.js";
import type { DropdownOptionPosition } from "../useDropdown.types.js";

export default () => {
  const [position, setPosition] =
    useState<DropdownOptionPosition>("bottom-right");
  const { openDropdown, closeDropdown, setDropdownRef, setTargetRef } =
    useDropdown({
      id: "use-dropdown",
      dxPosition: position,
    });

  return (
    <>
      <label>
        <div>Select a position</div>
        <select
          value={position}
          onChange={({ currentTarget: { value } }) =>
            setPosition(value as DropdownOptionPosition)
          }
        >
          {useDropdownPositions.map((position) => (
            <option key={position}>{position}</option>
          ))}
        </select>
      </label>
      <br />
      <br />
      <div>
        <button type="button" ref={setTargetRef} onClick={openDropdown}>
          Open Dropdown
        </button>
        <article
          ref={setDropdownRef}
          style={{
            border: "1px solid red",
          }}
        >
          this is some dropdown where the top right is aligned
          <button type="button" onClick={closeDropdown}>
            Close Dropdown
          </button>
        </article>
      </div>
    </>
  );
};
