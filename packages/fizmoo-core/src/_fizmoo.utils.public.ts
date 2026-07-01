import type {
  Args,
  FizmooCommandDef,
  FizmooCommandEntry,
  FizmooUserConfig,
  Options
} from "./_fizmoo.types.js";

export const fizmooConstants = {
  COMMAND_ROOT: "__ROOT__"
} as const;

/**
 * Define a CLI command. The args and options types are inferred from
 * the definition, so the action callback is fully typed without any
 * manual type annotations.
 *
 * @example
 * export default defineCommand({
 *   name: 'build',
 *   description: 'Compile the project',
 *   options: {
 *     watch: { type: 'boolean', description: 'Rebuild on change' },
 *   },
 *   action: async ({ options }) => {
 *     // options.watch is boolean
 *   },
 * });
 */
export function defineCommand<A extends Args, O extends Options>(
  def: FizmooCommandDef<A, O>
): FizmooCommandDef<A, O> {
  return def;
}

/**
 * Register a command file in the config tree. The file path is resolved
 * relative to fizmoo.config.ts at build time.
 *
 * @example
 * command('./commands/build.ts', [
 *   command('./commands/build-watch.ts'),
 * ])
 */
export function command(file: string, commands?: FizmooCommandEntry[]): FizmooCommandEntry {
  return { file, commands };
}

/**
 * Define the fizmoo configuration for your CLI. This is the entry point
 * the build pipeline reads to discover commands and generate the manifest.
 *
 * @example
 * export default defineConfig({
 *   name: 'mycli',
 *   description: 'My CLI tool',
 *   version: '1.0.0',
 *   commands: [
 *     command('./commands/dev.ts'),
 *     command('./commands/build.ts', [
 *       command('./commands/build-watch.ts'),
 *     ]),
 *   ],
 * });
 */
export function defineConfig(config: FizmooUserConfig): FizmooUserConfig {
  return config;
}
