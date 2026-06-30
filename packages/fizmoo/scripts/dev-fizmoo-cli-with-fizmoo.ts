import { createFizmoo } from "@fizmoo/core";

async function buildFizmooCLIWithFizmoo() {
  const fizmoo = await createFizmoo({
    logLevel: "trace",
    autoInit: false,
    env: "development",
  });
  if (!fizmoo) return;
  await fizmoo.dev();
}

buildFizmooCLIWithFizmoo();
