import React from "react";

import type { ModalDefaultState } from "#/useModalDialog/index.js";

export type ModalContextType<T extends ModalDefaultState = ModalDefaultState> =
  {
    initialState: T | undefined;
    closeModal: () => Promise<void>;
  };
export const ModalContext = React.createContext<ModalContextType | null>(null);
