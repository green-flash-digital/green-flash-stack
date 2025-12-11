/**
 * Combines class names based on given arguments of strings, numbers, arrays, or objects.
 *
 * @param {...(string | number | boolean | null | undefined | Record<string, boolean> | Array<string | number | boolean | null | undefined | Record<string, boolean>>)} args - Arguments that can be strings, numbers, objects, arrays or boolean values.
 * @returns {string} - A single string with all valid class names concatenated.
 *
 * @example
 * // Basic usage with strings
 * classes('foo', 'bar'); // returns "foo bar"
 *
 * @example
 * // Usage with object notation
 * classes('foo', { bar: true, baz: false }); // returns "foo bar"
 *
 * @example
 * // Usage with arrays
 * classes(['foo', 'bar']); // returns "foo bar"
 *
 * @example
 * // Combined usage with nested arrays and objects
 * classes(['foo', { bar: true, baz: false }]); // returns "foo bar"
 */
export function classes(
  ...args: (
    | string
    | number
    | boolean
    | null
    | undefined
    | Record<string, boolean>
    | Array<
        string | number | boolean | null | undefined | Record<string, boolean>
      >
  )[]
): string {
  const classNames: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;

    if (typeof arg === "string" || typeof arg === "number") {
      classNames.push(arg.toString());
      continue;
    }

    if (Array.isArray(arg)) {
      if (arg.length) {
        const inner = classes(...arg);
        if (inner) {
          classNames.push(inner);
        }
      }
      continue;
    }

    if (typeof arg === "object") {
      for (const key in arg) {
        if ((arg as Record<string, boolean>)[key]) {
          classNames.push(key);
        }
      }
    }
  }

  return classNames.join(" ");
}
