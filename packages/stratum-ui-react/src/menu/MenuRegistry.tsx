import { useSyncExternalStore } from "react";
import { TransactionStore } from "@green-flash/reactor";

import type { MenuController, MenuState } from "./MenuController.js";

type MenuRegistryState = {
  controllers: MenuController<MenuState | undefined>[];
};

/**
 * Central registry that ties multiple `MenuController` instances together.
 *
 * This sits on top of the core `MenuEngine`/`MenuController` stack and acts as a
 * global launchpad for all menus in an app. Controllers register themselves here,
 * and a single `<MenuRegistry.Render />` call renders every registered menu in one
 * place. This approach centralizes rendering, avoids prop drilling for menu launch functions,
 * and preserves the imperative launch API exposed by each controller.
 */
export class MenuRegistry extends TransactionStore<MenuRegistryState> {
  constructor() {
    super({ controllers: [] });
    this.register = this.register.bind(this);
    this.Render = this.Render.bind(this);
  }

  register<C extends MenuController<MenuState | undefined>>(controller: C) {
    this.enqueue({
      notify: true, // re-renders the `MenuRegistryRoot` when new modals are registered
      mutate: (draft) => {
        if (draft.controllers.includes(controller)) return; // avoid duplicates
        draft.controllers.push(controller);
      },
    });

    return controller;
  }

  Render() {
    return <MenuRegistryRoot registry={this} />;
  }
}

function MenuRegistryRoot({ registry }: { registry: MenuRegistry }) {
  const { controllers } = useSyncExternalStore(
    registry.subscribe,
    registry.getState,
    registry.getState
  );

  return controllers.map((controller, i) => {
    return <controller.Render key={i} />;
  });
}
