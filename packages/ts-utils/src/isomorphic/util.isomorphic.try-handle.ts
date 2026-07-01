export type TryHandleResult<T> = { success: true; data: T } | { success: false; error: Error };

export async function tryHandle<T>(promise: Promise<T>): Promise<TryHandleResult<T>> {
  try {
    const data = await promise;
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

export function tryHandleSync<T, Args extends unknown[]>(fn: (...args: Args) => T) {
  return (...args: Args): TryHandleResult<T> => {
    try {
      return { success: true, data: fn(...args) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  };
}
