# Modal

A flexible, type-safe modal system for React built on top of the native `<dialog>` element. This modal implementation provides lazy loading, state management, animation support, and multiple styling variants.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Basic Usage](#basic-usage)
- [Modals with State](#modals-with-state)
- [Optional: Using the Modal Component](#optional-using-the-modal-component)
- [Modal Registry](#modal-registry)
- [API Reference](#api-reference)
- [Examples](#examples)

## Overview

The Modal system consists of several key pieces:

- **`ModalController`** - Creates and manages a modal instance with lazy-loaded content
- **`useModalContext`** - React hook to access modal state and controls from within modal content
- **`ModalRegistry`** - Central registry for managing multiple modals across your app
- **`Modal`** - Optional styled dialog component wrapper with variant and size support (only use if you want the defaults)
- **`ModalEngine`** - Core engine that handles state management and lifecycle (extended by `ModalController`)

**The core strategy:** Use the native `<dialog>` element directly and style it however you want. The `onMount` callback from `useModalContext` handles all the lifecycle management. Only use the `Modal` component if you want the pre-built styling variants.

## Quick Start

### 1. Create a Modal Content Component

Create your modal content component using the native `<dialog>` element. Use `useModalContext` to get the `onMount` callback that handles all the lifecycle:

```tsx
// MyModalContent.tsx
import { useModalContext } from "@stratum-ui/react";

export default function MyModalContent() {
  const { onMount, closeModal } = useModalContext();

  return (
    <dialog ref={onMount} style={{ padding: "2rem", borderRadius: "0.5rem" }}>
      <h2>Hello, World!</h2>
      <p>This is my modal content.</p>
      <button onClick={closeModal}>Close</button>
    </dialog>
  );
}
```

### 2. Create a Modal Controller

Create a controller instance that references your modal content:

```tsx
// myModal.controller.ts
import { ModalController } from "@stratum-ui/react";

export const myModalController = new ModalController({
  load: async () => import("./MyModalContent")
});
```

### 3. Render and Launch

In your component, render the modal and add a trigger:

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

### Using the Native Dialog Element

The recommended approach is to use the native `<dialog>` element directly. This gives you complete control over styling and behavior. The `onMount` callback from `useModalContext` handles opening the dialog and managing its lifecycle.

```tsx
// Content.tsx
import { useModalContext } from "@stratum-ui/react";

export default function MyModal() {
  const { onMount, closeModal } = useModalContext();

  return (
    <dialog
      ref={onMount}
      style={{
        padding: "2rem",
        borderRadius: "0.5rem",
        border: "1px solid #ccc",
        maxWidth: "500px"
      }}
    >
      <h2>My Custom Modal</h2>
      <p>You have complete control over styling!</p>
      <button onClick={closeModal}>Close</button>
    </dialog>
  );
}

// controller.ts
import { ModalController } from "@stratum-ui/react";

export const myModalController = new ModalController({
  load: async () => import("./Content")
});
```

You can apply any CSS you want - inline styles, CSS modules, styled-components, Tailwind classes, etc. The `onMount` ref callback handles:

- Opening the dialog when the modal state becomes `isOpen: true`
- Managing event listeners for escape key and backdrop clicks
- Coordinating the close animation sequence

### Optional: Using the Modal Component for Defaults

If you want to use the pre-built styling variants (modal, drawer-right, drawer-up) and sizes, you can use the `Modal` component instead. This is optional and only recommended when you want the defaults:

```tsx
// Content.tsx
import { Modal, useModalContext } from "@stratum-ui/react";

export default function SimpleModal() {
  const { closeModal } = useModalContext();

  return (
    <Modal>
      <h2>Simple Modal</h2>
      <p>This uses the default modal styling.</p>
      <button onClick={closeModal}>Close</button>
    </Modal>
  );
}
```

## Modals with State

Modals can accept and manage typed state. This is useful when you need to pass data to the modal when launching it.

### 1. Define Your State Type

```tsx
// Content.tsx
import { useModalContext } from "@stratum-ui/react";

export type UserModalState = {
  userId: string;
  userName: string;
};

export default function UserModal() {
  const { state, onMount, closeModal } = useModalContext<UserModalState>();
  const { userId, userName } = state;

  return (
    <dialog
      ref={onMount}
      style={{
        padding: "2rem",
        borderRadius: "0.5rem",
        maxWidth: "500px"
      }}
    >
      <h2>User Details</h2>
      <dl>
        <dt>ID</dt>
        <dd>{userId}</dd>
        <dt>Name</dt>
        <dd>{userName}</dd>
      </dl>
      <button onClick={closeModal}>Close</button>
    </dialog>
  );
}
```

### 2. Create a Typed Controller

```tsx
// controller.ts
import { ModalController } from "@stratum-ui/react";
import { UserModalState } from "./Content";

export const userModalController = new ModalController<UserModalState>({
  load: async () => import("./Content")
});
```

### 3. Launch with State

```tsx
import { userModalController } from "./controller";

function MyComponent() {
  const handleOpen = () => {
    userModalController.launch({
      userId: "123",
      userName: "John Doe"
    });
  };

  return (
    <>
      <userModalController.Component />
      <button onClick={handleOpen}>View User</button>
    </>
  );
}
```

## Optional: Using the Modal Component

The `Modal` component is an optional wrapper that provides pre-built styling variants and sizes. **Only use this if you want the defaults** - otherwise, use the native `<dialog>` element with your own styling.

### Variants

- **`modal`** (default) - Centered modal dialog
- **`drawer-right`** - Slide-in drawer from the right
- **`drawer-up`** - Slide-up drawer from the bottom

### Sizes

- **`sm`** - Small
- **`md`** (default) - Medium
- **`lg`** - Large
- **`xl`** - Extra large
- **`full`** - Full screen (only available for `modal` variant)

### Example

```tsx
import { Modal } from "@stratum-ui/react";

export default function CustomStyledModal() {
  return (
    <Modal cxVariant="drawer-right" cxSize="lg">
      <h2>Right Drawer</h2>
      <p>This is a large drawer sliding in from the right.</p>
    </Modal>
  );
}
```

**Remember:** You can achieve the same result by styling a native `<dialog>` element yourself. The `Modal` component is just a convenience for when you want these specific defaults.

## Modal Registry

For applications with multiple modals, use a `ModalRegistry` to centrally manage all modals. This avoids prop drilling and keeps your modal rendering organized.

### 1. Create and Register Modals

```tsx
// modals.ts
import { ModalRegistry, ModalController } from "@stratum-ui/react";

const modals = new ModalRegistry();

// Register your modal controllers
export const userModal = modals.register(
  new ModalController({
    load: async () => import("./UserModal")
  })
);

export const settingsModal = modals.register(
  new ModalController({
    load: async () => import("./SettingsModal")
  })
);

export { modals };
```

### 2. Render the Registry Once

Render the registry at the root of your app (typically in your main app component):

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

Once registered, you can launch modals from anywhere in your app without prop drilling:

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

Creates a modal controller instance with lazy-loaded content.

```tsx
new ModalController<S>(options: {
  load: () => Promise<{ default: ComponentType<any> }>;
  closeOnBackdropClick?: boolean; // default: false
  closeOnEscapePress?: boolean; // default: true
})
```

**Generic Parameter:**

- `S` - The type of state your modal accepts (optional, defaults to `undefined`)

**Methods:**

- `launch(eventOrState?: S | Event)` - Opens the modal, optionally with state
- `Component()` - React component that renders the modal
- `closeModal()` - Closes the modal with animation

**Properties:**

- `closeOnBackdropClick` - Whether clicking the backdrop closes the modal
- `closeOnEscapePress` - Whether pressing Escape closes the modal

### `Modal` (Optional)

Optional styled dialog component wrapper with pre-built variants. **Only use if you want the defaults** - otherwise use the native `<dialog>` element.

```tsx
<Modal
  cxVariant?: "modal" | "drawer-right" | "drawer-up"
  cxSize?: "sm" | "md" | "lg" | "xl" | "full"
  className?: string
  // ... all standard dialog element props
>
  {children}
</Modal>
```

### `useModalContext`

Hook to access modal state and controls from within modal content.

```tsx
const {
  state, // The current modal state (typed if using generic)
  closeModal, // Function to close the modal with animation
  onMount // Ref callback for the dialog element - pass this to your <dialog> ref to handle lifecycle
} = useModalContext<S>();
```

**Generic Parameter:**

- `S` - The type of state your modal uses (should match your controller's type)

### `ModalRegistry`

Central registry for managing multiple modals.

```tsx
const registry = new ModalRegistry();

// Register a controller
registry.register(controller);

// Render all registered modals
<registry.Render />;
```

**Methods:**

- `register(controller: ModalController)` - Registers a modal controller
- `Render()` - React component that renders all registered modals

## Examples

### Example: Confirmation Dialog with State

```tsx
// ConfirmDialog.tsx
import { useModalContext } from "@stratum-ui/react";

export type ConfirmDialogState = {
  title: string;
  message: string;
  onConfirm: () => void;
};

export default function ConfirmDialog() {
  const { state, onMount, closeModal } = useModalContext<ConfirmDialogState>();
  const { title, message, onConfirm } = state;

  const handleConfirm = () => {
    onConfirm();
    closeModal();
  };

  return (
    <dialog
      ref={onMount}
      style={{
        padding: "2rem",
        borderRadius: "0.5rem",
        border: "1px solid #ccc",
        maxWidth: "400px"
      }}
    >
      <h2>{title}</h2>
      <p>{message}</p>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button onClick={handleConfirm}>Confirm</button>
        <button onClick={closeModal}>Cancel</button>
      </div>
    </dialog>
  );
}

// controller.ts
export const confirmDialog = new ModalController<ConfirmDialogState>({
  closeOnBackdropClick: false, // Prevent accidental closes
  closeOnEscapePress: false,
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

### Example: Custom Styled Drawer

Using the native dialog element with custom styling:

```tsx
// Sidebar.tsx
import { useModalContext } from "@stratum-ui/react";

export default function Sidebar() {
  const { onMount, closeModal } = useModalContext();

  return (
    <dialog
      ref={onMount}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "300px",
        height: "100vh",
        margin: 0,
        padding: "2rem",
        border: "none",
        borderLeft: "1px solid #ccc",
        boxShadow: "-2px 0 8px rgba(0,0,0,0.1)"
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Navigation</h2>
        <button onClick={closeModal}>×</button>
      </header>
      <nav>
        <ul>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/about">About</a>
          </li>
          <li>
            <a href="/contact">Contact</a>
          </li>
        </ul>
      </nav>
    </dialog>
  );
}
```

Or using the Modal component if you want the drawer variant defaults:

```tsx
// Sidebar.tsx
import { Modal, useModalContext } from "@stratum-ui/react";

export default function Sidebar() {
  const { closeModal } = useModalContext();

  return (
    <Modal cxVariant="drawer-right" cxSize="md">
      <header>
        <h2>Navigation</h2>
        <button onClick={closeModal}>×</button>
      </header>
      <nav>
        <ul>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/about">About</a>
          </li>
          <li>
            <a href="/contact">Contact</a>
          </li>
        </ul>
      </nav>
    </Modal>
  );
}
```

## Best Practices

1. **Use Native Dialog**: Prefer using the native `<dialog>` element with `onMount` from `useModalContext` for complete control over styling. Only use the `Modal` component if you specifically want the pre-built variants.
2. **Lazy Loading**: Always use dynamic imports in the `load` option to enable code splitting
3. **Type Safety**: Use TypeScript generics to ensure type safety when working with modal state
4. **Registry Pattern**: For apps with multiple modals, use `ModalRegistry` to keep rendering centralized
5. **State Management**: Keep modal state minimal - only include data needed for the modal to render
6. **User Experience**: Consider setting `closeOnBackdropClick: false` for critical actions (like confirmations)
7. **Styling Flexibility**: Style your dialogs however you want - inline styles, CSS modules, styled-components, Tailwind, etc. The `onMount` callback handles all the lifecycle management.
