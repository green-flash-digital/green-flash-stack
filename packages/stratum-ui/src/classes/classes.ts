/**
 * Combines and conditionally includes CSS class names from various input types.
 *
 * This utility function intelligently merges class names from strings, numbers, arrays,
 * and objects into a single space-separated string. Falsy values (null, undefined, false)
 * are automatically filtered out, and object keys are included only when their values
 * are truthy. Supports nested arrays and objects for complex conditional class logic.
 *
 * @example
 * // Basic usage with strings
 * classes('foo', 'bar'); // returns "foo bar"
 *
 * @example
 * // Conditional classes with object notation
 * classes('foo', { bar: true, baz: false }); // returns "foo bar"
 *
 * @example
 * // Arrays are flattened and processed recursively
 * classes(['foo', 'bar']); // returns "foo bar"
 *
 * @example
 * // Complex nested structures
 * classes('base', ['foo', { bar: true, baz: false }], { active: true }); // returns "base foo bar active"
 *
 * @example
 * // Falsy values are automatically filtered
 * classes('foo', null, undefined, false, 'bar'); // returns "foo bar"
 */
export function classes(
  ...args: (
    | string
    | number
    | boolean
    | null
    | undefined
    | Record<string, boolean>
    | Array<string | number | boolean | null | undefined | Record<string, boolean>>
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
