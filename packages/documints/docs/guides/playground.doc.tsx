/**
---
title: Guides/Writing/Playground
---
*/
import { useState } from "react";

export default function Playground() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Playground</h1>
      <p>
        This page is authored as plain <code>.doc.tsx</code>, not Markdown - its frontmatter lives
        in a comment-wrapped YAML block at the top of the file instead of a literal <code>---</code>{" "}
        block, since that isn't valid TSX syntax.
      </p>
      <p>Being real React means real interactivity works, not just static content:</p>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Clicked {count} {count === 1 ? "time" : "times"}
      </button>
    </div>
  );
}
