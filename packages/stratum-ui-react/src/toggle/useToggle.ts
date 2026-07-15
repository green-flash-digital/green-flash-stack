import { useCallback, useState } from "react";

/**
 * A simple boolean toggle hook.
 */
export function useToggle(
  initValue?: boolean
): [boolean, () => void, { setState: React.Dispatch<React.SetStateAction<boolean>> }] {
  const [state, setState] = useState(() => initValue ?? false);
  const toggle = useCallback(() => {
    setState((prevState) => !prevState);
  }, []);

  return [state, toggle, { setState }];
}
