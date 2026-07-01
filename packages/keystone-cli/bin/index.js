import { FizmooRuntime } from "@fizmoo/runtime";
import manifest from "./fizmoo.manifest.json" with { type: "json" };

const runtime = new FizmooRuntime(manifest, { cwd: import.meta.dirname });

try {
  runtime.execute();
} catch (error) {
  runtime.throw(error);
}
