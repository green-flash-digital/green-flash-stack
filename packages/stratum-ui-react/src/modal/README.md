# Modal

A flexible, type-safe modal system for React built on top of the native `<dialog>` element. This modal implementation provides lazy loading, state management, animation support, and multiple styling variants.

## Table of Contents

- [Modal](#modal)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Quick Start](#quick-start)
    - [1. Create a Modal Content Component](#1-create-a-modal-content-component)
    - [2. Create a Modal Controller](#2-create-a-modal-controller)
    - [3. Render and Launch](#3-render-and-launch)
  - [Basic Usage](#basic-usage)
    - [Styling Options](#styling-options)
  - [Modals with State](#modals-with-state)
  - [Closing: closeModal vs. dismissModal](#closing-closemodal-vs-dismissmodal)
  - [Responsive Layouts](#responsive-layouts)
  - [Theming](#theming)
  - [Modal Registry](#modal-registry)
    - [1. Create and Register Modals](#1-create-and-register-modals)
    - [2. Render the Registry Once](#2-render-the-registry-once)
    - [3. Launch Modals Anywhere](#3-launch-modals-anywhere)
  - [API Reference](#api-reference)
    - [`ModalController`](#modalcontroller)
    - [`useModalContext`](#usemodalcontext)
    - [`ModalRegistry`](#modalregistry)
  - [Examples](#examples)
    - [Example: Confirmation Dialog with State](#example-confirmation-dialog-with-state)
  - [Best Practices](#best-practices)

## Overview

The Modal system consists of several key pieces:

- **`ModalEngine`** (`@stratum-ui/core`) - Framework-agnostic state and lifecycle engine: owns `isOpen` + user state, the `<dialog>` ref, and event listeners (Escape key, backdrop click)
- **`ModalController`** - Extends `ModalEngine`. Adds lazy-loaded React content and a `Component` that renders the `<dialog>` itself
- **`useModalContext`** - React hook to access modal state and controls from within modal content
- **`ModalRegistry`** - Central registry for managing multiple modals across your app

**The core strategy:** the controller owns and renders the `<dialog>` element — your content component never touches `<dialog>` or refs directly. It just renders its content as a plain React fragment; the controller wires up mounting, sizing, variant styling, and lifecycle around it.

## Quick Start

### 1. Create a Modal Content Component

Content components are plain fragments — no `<dialog>`, no `ref`. Use `useModalContext` to read state and close the modal:

```tsx
// MyModalContent.tsx
import { useModalContext } from "@stratum-ui/react/modal";

export default function MyModalContent() {
  const { closeModal } = useModalContext();

  return (
    <>
      <h2>Hello, World!</h2>
      <p>This is my modal content.</p>
      <button onClick={closeModal}>Close</button>
    </>
  );
}
```

### 2. Create a Modal Controller

Every controller needs a `name` (used in debug logs and the `data-modal-name` attribute) and a `load` function:

```tsx
// myModal.controller.ts
import { ModalController } from "@stratum-ui/react/modal";

export const myModalController = new ModalController({
  name: "my-modal",
  load: async () => import("./MyModalContent")
});
```

### 3. Render and Launch

```tsx
import { myModalController } from "./myModal.controller";

function MyComponent() {
  return (
    <>
      <myModalController.Component />
      <button onClick={myModalController.launch}>Open Modal</button>
    </>
  );
}
```

## Basic Usage

### Styling Options

Pass `size`, `variant`, and any native `<dialog>` prop (e.g. `className`) via `props` when constructing the controller:

```tsx
export const myModalController = new ModalController({
  name: "my-modal",
  props: {
    size: "lg", // "sm" | "md" | "lg" | "xl" | "full"
    variant: "drawer-right", // "modal" | "drawer-right" | "drawer-left" | "drawer-up" | "drawer-down"
    className: myCustomStyles
  },
  load: async () => import("./MyModalContent")
});
```

## Modals with State

Modals can accept and manage typed state, useful for passing data to the modal when launching it.

```tsx
// Content.tsx
import { useModalContext } from "@stratum-ui/react/modal";

export type UserModalState = {
  userId: string;
  userName: string;
};

export default function UserModalContent() {
  const { state, closeModal } = useModalContext<UserModalState>();
  const { userId, userName } = state;

  return (
    <>
      <h2>User Details</h2>
      <dl>
        <dt>ID</dt>
        <dd>{userId}</dd>
        <dt>Name</dt>
        <dd>{userName}</dd>
      </dl>
      <button onClick={closeModal}>Close</button>
    </>
  );
}

// controller.ts
import { ModalController } from "@stratum-ui/react/modal";
import type { UserModalState } from "./Content";

export const userModalController = new ModalController<UserModalState>({
  name: "user-modal",
  load: async () => import("./Content")
});

// Usage
userModalController.launch({ userId: "123", userName: "John Doe" });
```

## Closing: closeModal vs. dismissModal

`useModalContext` exposes two ways to close a modal:

- **`closeModal()`** - Runs the modal's exit animation, then fires the `onClose` callback (if one was passed to `launch`). Use this for explicit user-initiated close actions: an X button, Escape, Cancel/Done.
- **`dismissModal()`** - Same animated close, but **suppresses** `onClose`. Use this when the user navigates away via a link *inside* the modal, so the caller's close side-effect (e.g. a router push back to a parent page) doesn't fight the link navigation.

```tsx
// controller.ts
export const userModalController = new ModalController<UserModalState>({
  name: "user-modal",
  load: async () => import("./Content")
});

// launching with an onClose callback
userModalController.launch(
  { userId: "123", userName: "John Doe" },
  { onClose: () => navigate("/users") }
);
```

```tsx
// Content.tsx
const { closeModal, dismissModal } = useModalContext<UserModalState>();

// Explicit close — runs onClose (navigate back to /users)
<button onClick={closeModal}>Done</button>

// Navigating via a link inside the modal — onClose is suppressed
<Link to={`/users/${userId}/profile`} onClick={dismissModal}>
  View full profile
</Link>
```

## Responsive Layouts

`size` and `variant` are static — there's no built-in JS breakpoint switching. Apps in this
monorepo don't share a single breakpoint scheme (some have just mobile/desktop, others have
several), so baking one in would fit some apps and fight the rest. Instead, express
responsiveness as `@media` queries in the `className` you pass at construction — it's applied
directly to the `<dialog>` alongside the built-in variant/size classes:

```tsx
import { css } from "@linaria/core";

const responsive = css`
  @media (max-width: 768px) {
    position: fixed !important;
    inset: auto 0 0 0;
    width: 100vw !important;
    height: auto !important;
    margin: 0 !important;
    border-radius: 0.5rem 0.5rem 0 0 !important;
  }
`;

export const myModalController = new ModalController({
  name: "my-modal",
  props: { variant: "modal", size: "md", className: responsive },
  load: async () => import("./MyModalContent")
});
```

Since this is plain CSS, it composes with whatever breakpoint system the consuming app already
has (a single mobile cutoff, several tiers, container queries, etc.) instead of assuming one.

## Theming

Every built-in variant reads its durations, easing, backdrop color, and corner radius from CSS
custom properties, each with a sensible default baked in via `var(--name, default)`:

| Property               | Default                        | Affects                                |
| ----------------------- | ------------------------------- | --------------------------------------- |
| `--modal-duration-open` | `.4s`                          | Entry animation duration                |
| `--modal-duration-close`| `.25s`                         | Exit animation duration                 |
| `--modal-ease-out`      | `cubic-bezier(0.16, 1, 0.3, 1)`| Entry animation easing                  |
| `--modal-ease-in`       | `cubic-bezier(0.4, 0, 1, 1)`   | Exit animation easing                   |
| `--modal-backdrop`      | `rgba(0, 0, 0, 0.3)`           | `::backdrop` color                      |
| `--modal-backdrop-filter`| `none`                        | `::backdrop` filter (e.g. blur for a frosted-glass look) |
| `--modal-radius`        | `0.25rem`                      | Corner radius, `variant: "modal"`       |
| `--modal-drawer-radius` | `0.5rem`                       | Corner radius, drawer variants          |
| `--modal-shadow`        | `0px 4px 4px 0px #00000040`   | Box shadow, `variant: "modal"`          |
| `--modal-min-height`    | `8rem`                        | Floor on `modal`/`drawer-up`/`drawer-down` height — see [Lazy-loaded content and the open animation](#lazy-loaded-content-and-the-open-animation) |

Override per-instance via `style` on the controller's `props` (highest specificity, no cascade
fights):

```tsx
export const myModalController = new ModalController({
  name: "my-modal",
  props: { style: { "--modal-backdrop": "rgba(20, 20, 40, 0.6)" } as React.CSSProperties },
  load: async () => import("./MyModalContent")
});
```

Or globally, by setting them on `:root` (or any ancestor) in your app's own CSS — they inherit
down to every modal in the app. `modalThemeTokens` (the source-of-truth token map) and
`modalThemeStylesheet` (the same tokens pre-rendered as a `:root { ... }` block) are exported
from `@stratum-ui/react/modal` so you don't have to read the source to know what's available:

```tsx
import { modalThemeStylesheet } from "@stratum-ui/react/modal";

console.log(modalThemeStylesheet);
// :root {
//   --modal-duration-open: .4s;
//   --modal-duration-close: .25s;
//   ...
// }
```

Copy that block into your app's global stylesheet as a starting point, then change whichever
values you want to diverge from the defaults.

If a variant needs to change in ways these tokens don't cover — a different animation curve
shape, a different position entirely — write your own `className` (see
[Responsive Layouts](#responsive-layouts) above for the pattern) rather than forking this
package.

### Targeting one specific modal instance

Every rendered `<dialog>` carries `data-modal-name="<the name you passed to the controller>"`.
Since none of the built-in variant CSS uses `!important` (the browser's own `<dialog>` styling
loses to any author-origin rule regardless of specificity, so it was never needed), this
attribute selector is a reliable, readable way to fully re-skin one modal without touching its
`className` at all:

```css
[data-modal-name="user-modal"] {
  --modal-radius: 0;
}

[data-modal-name="user-modal"].modal-size-lg {
  /* the sm/md/lg/xl/full size classes are rendered as modal-size-<size> */
  width: 900px;
}
```

### Lazy-loaded content and the open animation

`load` is a dynamic `import()` — the first time a given modal opens (before the browser has
cached that chunk), there's a real gap between `launch()` calling `showModal()` and the actual
content rendering inside it. During that gap, `<Suspense>` renders `fallback` (`null` unless you
pass one), so the dialog is momentarily empty.

That matters because `modal`, `drawer-up`, and `drawer-down` all size themselves to their
content (`drawer-right`/`drawer-left` don't — they're pinned to `height: 100vh`). An empty
dialog has ~0 height, so the open animation *does* play, just on an invisible sliver — then
the real content pops in afterward with no animation on that size change, which reads as "the
open animation doesn't work."

`--modal-min-height` (default `8rem`) puts a floor under those three variants so the dialog
always has real, visible substance to animate in, even before content arrives — this alone
fixes the "invisible then pops in" symptom. For a more polished loading state, also pass a
sized `fallback` (see [`ModalController`](#modalcontroller) below) — a skeleton roughly matching
your content's shape avoids the box changing size at all once the real content swaps in.

## Per-launch Overrides

`size`, `variant`, `className`, `closeOnBackdropClick`, `disableCloseOnEscapePress` — everything
in `props` — is normally fixed for the controller's lifetime. `launch()`'s options bag can
override any of them for that one call, so a single controller doesn't need a twin just to
behave differently once:

```tsx
export const confirmDialog = new ModalController<{ message: string }>({
  name: "confirm-dialog",
  props: { closeOnBackdropClick: true }, // dismissable by default
  load: async () => import("./ConfirmDialog")
});

// Normal case: dismissable, default size
confirmDialog.launch({ message: "Discard draft?" });

// This one call: NOT dismissable and full-screen, without a second controller
confirmDialog.launch(
  { message: "This will permanently delete the account. Continue?" },
  { closeOnBackdropClick: false, size: "full" }
);
```

The override only applies to that open — the next `launch()` without one falls back to the
props passed at construction.

## Modal Registry

For applications with multiple modals, use a `ModalRegistry` to centrally manage all modals. This avoids prop drilling and keeps your modal rendering organized.

### 1. Create and Register Modals

```tsx
// modals.ts
import { ModalRegistry, ModalController } from "@stratum-ui/react/modal";

const modals = new ModalRegistry();

export const userModal = modals.register(
  new ModalController({ name: "user", load: async () => import("./UserModal") })
);

export const settingsModal = modals.register(
  new ModalController({ name: "settings", load: async () => import("./SettingsModal") })
);

export { modals };
```

### 2. Render the Registry Once

```tsx
// App.tsx
import { modals } from "./modals";

function App() {
  return (
    <>
      {/* Render all registered modals */}
      <modals.Render />

      {/* Rest of your app */}
      <YourAppContent />
    </>
  );
}
```

### 3. Launch Modals Anywhere

```tsx
import { userModal, settingsModal } from "./modals";

function Navbar() {
  return (
    <nav>
      <button onClick={userModal.launch}>View User</button>
      <button onClick={settingsModal.launch}>Settings</button>
    </nav>
  );
}
```

## API Reference

### `ModalController`

```tsx
new ModalController<S>(options: {
  name: string;
  load: () => Promise<{ default: ComponentType<any> }>;
  fallback?: ReactNode; // default: null — rendered by Suspense while `load` resolves
  props?: {
    size?: "sm" | "md" | "lg" | "xl" | "full"; // default: "sm"
    variant?: "modal" | "drawer-right" | "drawer-left" | "drawer-up" | "drawer-down"; // default: "modal"
    closeOnBackdropClick?: boolean; // default: false
    disableCloseOnEscapePress?: boolean; // default: false
    // ...plus any native <dialog> prop (className, style, id, etc.)
  };
})
```

Since `load` is a dynamic `import()`, there's a real network/parse gap between `launch()` opening
the dialog and the content actually rendering. Pass `fallback` for anything heavier than an
instant local chunk load — a skeleton, a spinner, whatever fits the modal's own size/variant:

```tsx
export const userModalController = new ModalController<UserModalState>({
  name: "user-modal",
  fallback: <UserModalSkeleton />,
  load: async () => import("./UserModalContent")
});
```

**Properties:**

- `id` - Generated unique id for this controller instance
- `name` - Human-readable name passed at construction (used in debug logs and `data-modal-name`)

**Methods:**

- `launch(state?, options?: { onClose?: () => void } & Partial<ModalControllerOptions>)` - Opens the modal, optionally with state, an `onClose` callback, and per-launch overrides of any `props` (only available when the controller has a state type) — see [Per-launch Overrides](#per-launch-overrides)
- `closeModal()` - Closes the modal with animation, then fires `onClose`
- `dismissModal()` - Closes the modal with animation, without firing `onClose`
- `Component()` - React component that renders the modal (mounts nothing until `isOpen`)

### `useModalContext`

```tsx
const {
  state, // The current modal state (typed via generic)
  closeModal, // Closes with animation, fires onClose
  dismissModal, // Closes with animation, does not fire onClose
  props // The { size, variant, ...rest } passed at construction
} = useModalContext<S>();
```

### `ModalRegistry`

```tsx
const registry = new ModalRegistry();
registry.register(controller);
<registry.Render />;
```

## Examples

### Example: Confirmation Dialog with State

```tsx
// ConfirmDialog.tsx
import { useModalContext } from "@stratum-ui/react/modal";

export type ConfirmDialogState = {
  title: string;
  message: string;
  onConfirm: () => void;
};

export default function ConfirmDialog() {
  const { state, closeModal } = useModalContext<ConfirmDialogState>();
  const { title, message, onConfirm } = state;

  const handleConfirm = () => {
    onConfirm();
    closeModal();
  };

  return (
    <>
      <h2>{title}</h2>
      <p>{message}</p>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button onClick={handleConfirm}>Confirm</button>
        <button onClick={closeModal}>Cancel</button>
      </div>
    </>
  );
}

// controller.ts
export const confirmDialog = new ModalController<ConfirmDialogState>({
  name: "confirm-dialog",
  props: {
    closeOnBackdropClick: false, // Prevent accidental closes
    disableCloseOnEscapePress: true
  },
  load: async () => import("./ConfirmDialog")
});

// Usage
confirmDialog.launch({
  title: "Delete Item",
  message: "Are you sure you want to delete this item?",
  onConfirm: () => {
    // Perform deletion
  }
});
```

## Best Practices

1. **Content is just fragments**: Content components never render `<dialog>` or handle refs — the controller owns that.
2. **Lazy Loading**: Always use dynamic imports in the `load` option to enable code splitting.
3. **Type Safety**: Use TypeScript generics to ensure type safety when working with modal state.
4. **Registry Pattern**: For apps with multiple modals, use `ModalRegistry` to keep rendering centralized.
5. **State Management**: Keep modal state minimal — only include data needed for the modal to render.
6. **closeModal vs. dismissModal**: Use `closeModal` for explicit close actions; use `dismissModal` when the user navigates away via a link so the caller's `onClose` side-effect doesn't fire twice.
7. **User Experience**: Consider `closeOnBackdropClick: false` and `disableCloseOnEscapePress: true` for critical/destructive actions (like confirmations).
