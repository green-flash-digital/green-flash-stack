import { Isoscribe } from "isoscribe";
import { useCallback, useState } from "react";

const LOG = new Isoscribe({
  name: "counter",
  logFormat: "string",
  logLevel: "debug",
  pillColor: "#9248d9",
});

export function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount((prevCount) => {
      const newCount = prevCount + 1;
      LOG.debug("Incrementing counter", { prevCount, newCount });
      return newCount;
    });
  }, []);

  return (
    <div className="card">
      <button type="button" onClick={handleClick}>
        count is {count}
      </button>
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
    </div>
  );
}
