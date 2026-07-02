import { randAnimal, randUuid } from "@ngneat/falso";

import { useDropdownMenu } from "../useDropdownMenu.js";

const options = [...new Array(10)].map(() => ({
  id: randUuid(),
  animal: randAnimal(),
}));

export default () => {
  const { setDropdownRef, setTargetRef } = useDropdownMenu<HTMLUListElement>();

  return (
    <>
      <button ref={setTargetRef}>open the menu</button>
      <ul ref={setDropdownRef}>
        {options.map((option) => (
          <li key={option.id}>
            <button>{option.animal}</button>
          </li>
        ))}
      </ul>
    </>
  );
};
