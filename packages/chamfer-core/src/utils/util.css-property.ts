export function createCSSProperty(prefix: string, namespace: string, ...args: string[]): string {
  const base = `--${prefix}-${namespace}`;
  if (args.length === 0) return base;
  return `${base}-${args.join("-")}`;
}
