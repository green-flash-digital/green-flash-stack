import { useDropdownMenu } from "../useDropdownMenu.js";

/**
 * Suggestion - style the menu and use the hook wherever
 * Could also package it up into something that makes sense like consistent use of a context menu that only the icon can change
 */
export default () => {
  const { setDropdownRef, setTargetRef } = useDropdownMenu<HTMLDivElement>();

  return (
    <>
      <button ref={setTargetRef}>open the menu</button>
      <div ref={setDropdownRef}>
        <div style={{ width: 200, height: 400, backgroundColor: "purple" }} />
      </div>
    </>
  );
};
