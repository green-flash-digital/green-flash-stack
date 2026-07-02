import type { ButteryComponentLoggers } from "../_utils/private/LOG.ts";

declare global {
  interface Window {
    __rhp_toasts: Map<string, Record<string, unknown>>;
    __rhp_logs: ButteryComponentLoggers;
  }
}
