import { FizmooRuntime } from "@fizmoo/core/runtime";
import manifest from "./fizmoo.manifest.json" with { type: "json" };

const runtime = new FizmooRuntime(manifest, { cwd: import.meta.dirname });

runtime.execute().catch((error) => {
  console.error(error);
  process.exit(1);
});
