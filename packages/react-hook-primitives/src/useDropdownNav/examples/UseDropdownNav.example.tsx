import { useDropdownNav } from "../useDropdownNav.js";

/**
 * - Can be used as a single one off
 * - Can be packaged up into a component with some styles
 * - Component can then be nested and recursed on
 * - Can also hook into the component using forwarded refs and the callback refs
 */
export default () => {
  const { setTargetRef, setNavMenuRef } = useDropdownNav<HTMLUListElement>();

  return (
    <nav>
      <ul>
        <li>
          <a href="">Home</a>
        </li>
        <li>
          <button ref={setTargetRef}>About Us</button>
          <ul ref={setNavMenuRef}>
            <li>
              <a href="">About Us</a>
            </li>
            <li>
              <a href="">Meet the Team</a>
            </li>
            <li>
              <a href="">Our Story</a>
            </li>
          </ul>
        </li>
        <li>
          <a href="">Services</a>
        </li>
      </ul>
    </nav>
  );
};
