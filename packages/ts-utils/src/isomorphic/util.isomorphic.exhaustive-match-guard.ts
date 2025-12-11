export const exhaustiveMatchGuard = (_: never): never => {
  throw new Error(`Forgot to include an "${_}" in the switch statement`);
};
