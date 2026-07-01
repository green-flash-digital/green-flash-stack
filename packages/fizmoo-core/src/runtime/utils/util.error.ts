import { exhaustiveMatchGuard } from "ts-jolt/isomorphic";

import type { Options } from "../../_fizmoo.types.js";

export class FizmooRuntimeError extends Error {
  type: string;
  reason: string;
  suggestion?: string;

  constructor({
    type = "ERROR",
    reason,
    message,
    suggestion
  }: {
    type?: string;
    reason: string;
    message: string;
    suggestion?: string;
  }) {
    super(message);
    this.name = "RUNTIME_ERROR";
    this.reason = reason;
    this.type = type;
    this.suggestion = suggestion;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FizmooRuntimeError);
    }
  }
}

export class RuntimeError {
  private _cliName: string;

  constructor({ cliName }: { cliName: string }) {
    this._cliName = cliName;
  }

  private _brightRed(msg: string) {
    return `\x1b[91m${msg}\x1b[0m`;
  }

  log(error: Error) {
    if (error instanceof FizmooRuntimeError) {
      console.error(`\n[${this._cliName}] 🚨 Runtime Failure 🚨`);
      console.error(`\n[${this._brightRed(error.type)}]: ${error.reason}`);
      console.error(`\n${error.message}. ${error.suggestion ?? ""}`);
      console.error();
      return;
    }

    this.log(
      new FizmooRuntimeError({
        type: "UNKNOWN_ERROR",
        reason: "An error occurred for an unknown reason",
        message: String(error)
      })
    );
  }

  MALFORMED_OPTION(optionKey: string) {
    return new FizmooRuntimeError({
      type: "MALFORMED_OPTION",
      reason: "There was an error when trying to parse the provided options",
      message: `"${optionKey}" is malformed. Options must be prefixed with "--" (expanded) or "-" (alias).`,
      suggestion: `Use an alias prefixed with a "-" or an expanded option prefixed with "--".`
    });
  }

  COMMAND_NOT_FOUND(commandName: string) {
    return new FizmooRuntimeError({
      type: "COMMAND_NOT_FOUND",
      reason: "There was an error when trying to locate the provided command",
      message: `The command "${commandName}" could not be found.`,
      suggestion: `Check the available commands with: ${this._cliName} --help`
    });
  }

  MISSING_ACTION(commandId: string) {
    return new FizmooRuntimeError({
      type: "MISSING_ACTION",
      reason: "There was an error when trying to run the command",
      message: `The "${commandId}" command is valid but is missing an action. This should have been caught at build time.`,
      suggestion: `Please log a GitHub issue. https://github.com/green-flash-digital/fizmoo/issues/new`
    });
  }

  OPTION_NOT_FOUND(optionId: string, type: "expanded" | "alias", possibleOptions: Options) {
    const errorType = "UNKNOWN_OPTION";
    const reason =
      "There was an error when trying to match the provided option with the available options";
    const availableOptions = Object.entries(possibleOptions).reduce<string>(
      (accum, [optionKey, { alias }]) => {
        return accum.concat(`\n --${optionKey}${alias ? `, -${alias}` : ""}`);
      },
      "Available options:"
    );

    switch (type) {
      case "expanded":
        return new FizmooRuntimeError({
          type: errorType,
          reason,
          message: `"--${optionId}" is not a valid option.`,
          suggestion: availableOptions
        });

      case "alias":
        return new FizmooRuntimeError({
          type: errorType,
          reason,
          message: `"-${optionId}" is not a valid alias.`,
          suggestion: availableOptions
        });

      default:
        exhaustiveMatchGuard(type);
    }
  }

  OPTION_VALIDATION_FAILED({
    optionId,
    message,
    suggestion
  }: {
    optionId: string;
    message: string;
    suggestion?: string;
  }) {
    return new FizmooRuntimeError({
      type: "OPTION_VALIDATION_FAILURE",
      reason: `There was an error when trying to validate the option "${optionId}"`,
      message,
      suggestion
    });
  }

  ARG_VALIDATION_FAILED({
    argId,
    message,
    suggestion
  }: {
    argId: string;
    message: string;
    suggestion?: string;
  }) {
    return new FizmooRuntimeError({
      type: "ARG_VALIDATION_FAILURE",
      reason: `There was an error when trying to validate the argument "${argId}"`,
      message,
      suggestion
    });
  }
}
