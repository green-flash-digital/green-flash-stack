# @green-flash/reactor

A queued state store with optimistic updates, transaction queuing, and automatic rollback capabilities. Perfect for managing complex state mutations with async side effects in React and other frameworks.

## Features

- 🔄 **Optimistic Updates** - Apply mutations immediately for instant UI feedback
- 📦 **Transaction Queuing** - Ensures mutations are processed sequentially
- 🔙 **Automatic Rollback** - Reverts to previous state if async actions fail
- ⏱️ **Debouncing** - Built-in debounce support for rapid-fire updates
- 🔄 **Reconciliation** - Merge server responses with local state
- ⚛️ **React Compatible** - Works seamlessly with `useSyncExternalStore`
- 🛡️ **Type Safe** - Full TypeScript support with Immer's Draft types
- 📝 **Lifecycle Hooks** - Execute callbacks after successful commits

## Installation

```bash
yarn add @green-flash/reactor
# or
npm install @green-flash/reactor
```

## Quick Start

```typescript
import { TransactionStore } from "@green-flash/reactor";

// Initialize with your state shape
interface AppState {
  count: number;
  items: string[];
}

const store = new TransactionStore<AppState>({
  count: 0,
  items: [],
});

// Enqueue a simple mutation
await store.enqueue({
  mutate: (draft) => {
    draft.count += 1;
  },
});

// Enqueue with async action
await store.enqueue({
  mutate: (draft) => {
    draft.items.push("New Item");
  },
  action: async () => {
    const response = await fetch("/api/items", { method: "POST" });
    return response.json();
  },
  reconcile: (draft, result) => {
    // Merge server response with local state
    draft.items[draft.items.length - 1].id = result.id;
  },
});
```

## Usage with React

```typescript
import { useSyncExternalStore } from "react";
import { TransactionStore } from "@green-flash/reactor";

const store = new TransactionStore({ count: 0 });

function Counter() {
  const state = useSyncExternalStore(
    store.subscribe,
    store.getState
  );

  const increment = () => {
    store.enqueue({
      mutate: (draft) => {
        draft.count += 1;
      },
    });
  };

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

## API Reference

### `TransactionStore<S>`

#### Constructor

```typescript
new TransactionStore<S>(initialState: S)
```

Creates a new transaction store with the given initial state.

#### Methods

##### `getState(): S`

Returns the current state snapshot. Safe to call at any time.

##### `subscribe(listener: () => void): () => void`

Subscribes to state changes. Returns an unsubscribe function. Compatible with React's `useSyncExternalStore`.

##### `notify()`

Manually triggers all subscribers. Usually called automatically, but can be used for manual control.

##### `enqueue<R>(options: TransactionStoreEnqueueOptions<S, R>): Promise<R>`

Enqueues a transaction with the following options:

- **`mutate: (draft: Draft<S>) => void`** (required)
  - Optimistic mutation function using Immer's draft API

- **`action?: () => Promise<R>`** (optional)
  - Async side effect (e.g., API call). If provided, the transaction will wait for completion.

- **`reconcile?: (draft: Draft<S>, result: R) => void`** (optional)
  - Called after `action` succeeds to merge server response with local state

- **`onAfterCommit?: (result?: R) => void | Promise<void>`** (optional)
  - Lifecycle hook called after successful state mutation

- **`rollback?: boolean`** (default: `true`)
  - Whether to revert state if `action` fails

- **`notify?: boolean`** (default: `true`)
  - Whether to notify subscribers of state changes

- **`optimistic?: boolean`** (default: `true`)
  - Whether to apply mutation immediately before awaiting `action`

- **`debounce?: number`** (optional)
  - Debounce delay in milliseconds

- **`debounceKey?: string`** (optional)
  - Key for debounce grouping. Defaults to function signatures.

##### `destroy()`

Clears all subscribers. Call this during cleanup/teardown.

## Examples

### Optimistic Update with Rollback

```typescript
await store.enqueue({
  mutate: (draft) => {
    draft.items.push({ id: "temp", name: "New Item" });
  },
  action: async () => {
    const response = await fetch("/api/items", {
      method: "POST",
      body: JSON.stringify({ name: "New Item" }),
    });
    if (!response.ok) throw new Error("Failed to create item");
    return response.json();
  },
  reconcile: (draft, result) => {
    // Replace temp item with server response
    const index = draft.items.findIndex((item) => item.id === "temp");
    draft.items[index] = result;
  },
  rollback: true, // Revert if action fails
});
```

### Debounced Updates

```typescript
// Debounce rapid updates (e.g., search input)
store.enqueue({
  mutate: (draft) => {
    draft.searchQuery = inputValue;
  },
  action: async () => {
    return fetch(`/api/search?q=${inputValue}`).then((r) => r.json());
  },
  reconcile: (draft, result) => {
    draft.searchResults = result;
  },
  debounce: 300, // Wait 300ms after last call
  debounceKey: "search", // Group all search updates together
});
```

### Synchronous Mutation Only

```typescript
// No async action, just update state
await store.enqueue({
  mutate: (draft) => {
    draft.ui.isLoading = false;
  },
  notify: true, // Still notify subscribers
});
```

### Lifecycle Hooks

```typescript
await store.enqueue({
  mutate: (draft) => {
    draft.user.name = "John Doe";
  },
  action: async () => {
    return updateUser({ name: "John Doe" });
  },
  onAfterCommit: async (result) => {
    // Called after successful mutation
    console.log("User updated:", result);
    showToast("Profile saved!");
  },
});
```

### Disable Optimistic Updates

```typescript
// Wait for server response before updating UI
await store.enqueue({
  mutate: (draft) => {
    draft.items.push(newItem);
  },
  action: async () => {
    return createItem(newItem);
  },
  optimistic: false, // Don't update until action completes
});
```

## How It Works

1. **Queuing**: All transactions are queued and processed sequentially, ensuring state consistency.

2. **Optimistic Updates**: When `optimistic: true` (default), mutations are applied immediately using Immer's `produce`, giving instant UI feedback.

3. **Async Actions**: If an `action` is provided, it's executed after the optimistic update. The transaction waits for completion.

4. **Reconciliation**: If `reconcile` is provided, it merges the server response with the current state.

5. **Rollback**: If `action` throws and `rollback: true`, the state is reverted to the previous snapshot.

6. **Debouncing**: When `debounce` is set, rapid calls are grouped by `debounceKey` and only the last one executes after the delay.

## TypeScript

Full TypeScript support with proper inference:

```typescript
interface MyState {
  users: User[];
  count: number;
}

const store = new TransactionStore<MyState>({
  users: [],
  count: 0,
});

// TypeScript knows the draft shape
store.enqueue({
  mutate: (draft) => {
    draft.count += 1; // ✅ Type-safe
    draft.users.push({ name: "John" }); // ✅ Type-safe
  },
});
```

## License

Apache-2.0

