// ===========================
// Options
// ===========================

type OptionShared = {
  description: string;
  alias?: string;
  required?: boolean;
};

type OptionBoolean = OptionShared & {
  type: "boolean";
  default?: boolean;
};

type OptionString = OptionShared & {
  type: "string";
  default?: string;
  validate?: (value: string) => boolean;
};

type OptionNumber = OptionShared & {
  type: "number";
  default?: number;
  validate?: (value: number) => boolean;
};

export type Option = OptionBoolean | OptionString | OptionNumber;
export type Options = { [key: string]: Option };

type InferOptionValue<T extends Option> = T extends OptionBoolean
  ? boolean
  : T extends OptionNumber
  ? number
  : string;

export type InferOptionValues<T extends Options> = {
  [K in keyof T]: InferOptionValue<T[K]>;
};

// ===========================
// Args
// ===========================

type ArgShared = {
  name: string;
  description: string;
  required?: boolean;
};

type ArgBoolean = ArgShared & {
  type: "boolean";
  default?: boolean;
};

type ArgString = ArgShared & {
  type: "string";
  default?: string;
  length?: { min?: number; max?: number };
  choices?: string[];
  validate?: (value: string) => boolean;
};

type ArgNumber = ArgShared & {
  type: "number";
  default?: number;
  range?: { min?: number; max?: number };
  choices?: number[];
  validate?: (value: number) => boolean;
};

export type Arg = ArgBoolean | ArgString | ArgNumber;
export type Args = { [key: string]: Arg };

type InferArgValue<T extends Arg> = T extends ArgBoolean
  ? boolean
  : T extends ArgNumber
  ? number
  : string;

export type InferArgValues<T extends Args> = {
  [K in keyof T]: InferArgValue<T[K]>;
};

// ===========================
// Command
// ===========================

export type FizmooCommandDef<
  A extends Args = Args,
  O extends Options = Options
> = {
  name: string;
  description: string;
  options?: O;
  args?: A;
  action?: (params: {
    args: InferArgValues<A>;
    options: InferOptionValues<O>;
  }) => Promise<void> | void;
};

// ===========================
// Config
// ===========================

type HookActionContext = {
  commandId: string;
  args: Record<string, unknown>;
  options: Record<string, unknown>;
};

export type FizmooHooks = {
  onBeforeAction?: (ctx: HookActionContext) => Promise<void> | void;
  onAfterAction?: (ctx: HookActionContext) => Promise<void> | void;
  onError?: (
    err: unknown,
    ctx: Partial<HookActionContext>
  ) => Promise<void> | void;
};

export type FizmooCommandEntry = {
  file: string;
  commands?: FizmooCommandEntry[];
};

export type FizmooUserConfig = {
  name: string;
  description: string;
  version?: string;
  hooks?: FizmooHooks;
  commands: FizmooCommandEntry[];
};

// ===========================
// Manifest (runtime contract between build and runtime)
// ===========================

export type FizmooManifestEntryProperties = {
  name: string;
  description: string;
  options: Options | undefined;
  args: Args | undefined;
  hasAction: boolean;
  help: string;
};

export type FizmooManifestEntry = {
  /** Compiled JS path relative to the manifest, used for dynamic import at runtime */
  file: string;
  /** Original TS source path, retained for error messages */
  src: string;
  parents: string[] | null;
  subCommands: string[] | null;
  properties: FizmooManifestEntryProperties;
};

export type FizmooManifest = {
  [commandId: string]: FizmooManifestEntry;
};
