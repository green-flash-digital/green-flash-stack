import ReactDOMClient from "react-dom/client";

import { ButteryDocsClient } from "@buttery/docs/client";

import { routes } from "./routes.js";

ReactDOMClient.hydrateRoot(
  document.getElementById("root") as HTMLElement,
  <ButteryDocsClient routes={routes} />
);
