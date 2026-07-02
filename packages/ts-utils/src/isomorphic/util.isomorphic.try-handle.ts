export type TryHandleResult<T> = { success: true; data: T } | { success: false; error: Error };

function wrapError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export async function tryHandle<T>(promise: Promise<T>): Promise<TryHandleResult<T>>;
export function tryHandle<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>
): (...args: Args) => Promise<TryHandleResult<T>>;
export function tryHandle<T, Args extends unknown[]>(
  promiseOrFn: Promise<T> | ((...args: Args) => Promise<T>)
): Promise<TryHandleResult<T>> | ((...args: Args) => Promise<TryHandleResult<T>>) {
  if (typeof promiseOrFn === "function") {
    return async (...args: Args): Promise<TryHandleResult<T>> => {
      try {
        const data = await promiseOrFn(...args);
        return { success: true, data };
      } catch (error) {
        return { success: false, error: wrapError(error) };
      }
    };
  }
  return promiseOrFn.then(
    (data) => ({ success: true, data }) as TryHandleResult<T>,
    (error) => ({ success: false, error: wrapError(error) }) as TryHandleResult<T>
  );
}

export function tryHandleSync<T, Args extends unknown[]>(fn: (...args: Args) => T) {
  return (...args: Args): TryHandleResult<T> => {
    try {
      return { success: true, data: fn(...args) };
    } catch (error) {
      return { success: false, error: wrapError(error) };
    }
  };
}
