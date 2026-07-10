import type { ToastOptions, ToastState } from "./ToastEngine.js";
import { ToastEngine } from "./ToastEngine.js";

export class NotificationEngine<T extends ToastState> {
  toast: ToastEngine<T>;

  constructor(options: ToastOptions) {
    this.toast = new ToastEngine<T>(options);
  }
}
