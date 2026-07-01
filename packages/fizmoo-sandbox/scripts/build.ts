import { createFizmoo } from "fizmoo";

async function main() {
  const fizmoo = await createFizmoo({
    logLevel: "debug",
    autoInit: false,
    env: "development"
  });
  if (!fizmoo) return;
  await fizmoo.build();
}

main().catch(console.error);
