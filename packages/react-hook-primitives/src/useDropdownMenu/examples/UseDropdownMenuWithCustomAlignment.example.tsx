import { randAnimal, randUuid } from "@ngneat/falso";

import { useDropdownMenu } from "../useDropdownMenu.js";

const options = [...new Array(10)].map(() => ({
  id: randUuid(),
  animal: randAnimal(),
}));

// By default the dropdown will be aligned to the target. The hook exports
// another strongly typed ref that you can attach to any node and align
// the dropdown instead.
export default () => {
  const { setDropdownRef, setTargetRef, alignmentRef } = useDropdownMenu<
    HTMLUListElement,
    HTMLDivElement
  >();

  return (
    <div
      ref={alignmentRef}
      style={{ padding: "3rem", border: "1px solid green" }}
    >
      <button ref={setTargetRef}>open the menu</button>
      <ul ref={setDropdownRef}>
        {options.map((option) => (
          <li key={option.id}>
            <button>{option.animal}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
