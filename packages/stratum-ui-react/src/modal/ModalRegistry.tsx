import { useSyncExternalStore } from "react";

import { TransactionStore } from "@green-flash/reactor";
import type { ModalState } from "@stratum-ui/core";

import type { ModalController } from "./ModalController.js";

type ModalRegistryState = {
  controllers: ModalController<ModalState | undefined>[];
};

/**
 * Central registry that ties multiple `ModalController` instances together.
 *
 * This sits on top of the core `ModalEngine`/`ModalController` stack and acts as a
 * global launchpad for all modals in an app. Controllers register themselves here,
 * and a single `<ModalRegistry.Render />` call renders every registered modal in one
 * place. That keeps rendering centralized, avoids prop drilling for launch functions,
 * and preserves the imperative launch API exposed by each controller.
 */
export class ModalRegistry extends TransactionStore<ModalRegistryState> {
  constructor() {
    super({ controllers: [] });
    this.register = this.register.bind(this);
    this.Render = this.Render.bind(this);
  }

  register<C extends ModalController<ModalState | undefined>>(controller: C) {
    this.enqueue({
      notify: true, // re-renders the `ModalRegistryRoot` when new modals are registered
      mutate: (draft) => {
        if (draft.controllers.includes(controller)) return; // avoid duplicates
        draft.controllers.push(controller);
      }
    });

    return controller;
  }

  Render() {
    return <ModalRegistryRoot registry={this} />;
  }
}

function ModalRegistryRoot({ registry }: { registry: ModalRegistry }) {
  const { controllers } = useSyncExternalStore(
    registry.subscribe,
    registry.getState,
    registry.getState
  );

  return controllers.map((controller, i) => {
    return <controller.Component key={i} />;
  });
}
