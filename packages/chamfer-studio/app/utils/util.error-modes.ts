import { data } from "react-router";

import { LOG } from "./util.logger";

class Errors {
  private log(error: Error) {
    LOG.fatal(error);
  }

  /**
   * Rethrows the error but also logs it
   */
  RETHROW(error: Error) {
    this.log(error);
    return error;
  }

  /**
   * Creates a new error from an existing error accompanied
   * by a contextual message. Helpful for when throwing a new error
   * based upon one that was already encountered.
   */
  WITH_MESSAGE(message: string, error: Error) {
    const err = new Error(`${message}: ${error.message}`);
    this.log(err);
    return err;
  }

  /**
   * Creates a new error that details the specifics of which environment
   * variable is missing
   */
  MISSING_ENV_VAR(message: string, env_var: string) {
    const err = new Error(`${message}

    Reason:
    MISSING_ENV_VAR: ${env_var}. Please be sure that you have correctly set the necessary environment variables.`);
    this.log(err);
    return err;
  }

  /**
   * Returns some well formed information to be parsed the by front-end
   * on why an API operation failed.
   */
  API_ERROR(code: 500, error: Error, message?: string) {
    this.log(error);
    return data({
      status: code,
      message: message ?? error.message
    });
  }
}

export const errors = new Errors();
