declare module "react-router" {
  interface AppLoadContext {
    tokensPath: string;
    versionsDir: string;
    isLocal: boolean;
  }
}

export {};
