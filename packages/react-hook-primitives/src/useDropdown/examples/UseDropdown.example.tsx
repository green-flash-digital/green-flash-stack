import { useDropdown } from "../useDropdown.js";

export default () => {
  const { openDropdown, closeDropdown, setDropdownRef, setTargetRef } =
    useDropdown({
      id: "use-dropdown",
    });

  return (
    <>
      <button type="button" ref={setTargetRef} onClick={openDropdown}>
        Open Dropdown
      </button>
      <article
        ref={setDropdownRef}
        style={{
          border: "1px solid red",
        }}
      >
        this is some dropdown content
        <button type="button" onClick={closeDropdown}>
          Close Dropdown
        </button>
      </article>
    </>
  );
};
