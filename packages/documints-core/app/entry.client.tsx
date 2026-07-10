import { DocumintClient } from "@documints/core/client";
import ReactDOMClient from "react-dom/client";

import { routes } from "./routes.js";

ReactDOMClient.hydrateRoot(
  document.getElementById("root") as HTMLElement,
  <DocumintClient routes={routes} />
);
