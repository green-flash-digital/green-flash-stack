# @green-flash/reactor EventEmitter

A type-safe event emitter with built-in logging capabilities. Perfect for decoupling components and managing event-driven architectures in TypeScript applications.

## Features

- 🔒 **Type Safe** - Full TypeScript support with event payload type inference
- 📝 **Built-in Logging** - Integrated Logarhythm logging for debugging and monitoring
- 🎯 **Multiple Listeners** - Support for multiple listeners per event
- 🔄 **Auto Cleanup** - Returns unsubscribe function for easy listener management
- 🧹 **Bulk Operations** - Clear all listeners at once
- ⚡ **Zero Dependencies** - Lightweight implementation (except for logging)
- 🎨 **Customizable** - Configurable logger name, color, and log level

## Installation

```bash
yarn add @green-flash/reactor
# or
npm install @green-flash/reactor
```

## Quick Start

```typescript
import { EventEmitter } from "@green-flash/reactor";

// Define your event map
interface MyEvents {
  userLogin: { userId: string; username: string };
  userLogout: void;
  messageReceived: { from: string; content: string };
}

// Create an emitter
const emitter = new EventEmitter<MyEvents>();

// Register listeners
const unsubscribe = emitter.on("userLogin", (payload) => {
  console.log(`User ${payload.username} logged in`);
});

emitter.on("messageReceived", (payload) => {
  console.log(`Message from ${payload.from}: ${payload.content}`);
});

// Emit events
emitter.emit("userLogin", { userId: "123", username: "alice" });
emitter.emit("messageReceived", { from: "bob", content: "Hello!" });

// Clean up
unsubscribe();
```

## Usage with React

```typescript
import { useEffect } from "react";
import { EventEmitter } from "@green-flash/reactor";

interface AppEvents {
  dataUpdated: { timestamp: number };
  error: { message: string };
}

const emitter = new EventEmitter<AppEvents>({
  name: "AppEvents",
  logColor: "#3b82f6",
});

function DataComponent() {
  useEffect(() => {
    const unsubscribe = emitter.on("dataUpdated", (payload) => {
      console.log("Data updated at:", payload.timestamp);
      // Update component state or trigger re-render
    });

    return unsubscribe; // Cleanup on unmount
  }, []);

  const handleUpdate = () => {
    emitter.emit("dataUpdated", { timestamp: Date.now() });
  };

  return <button onClick={handleUpdate}>Update Data</button>;
}
```

## API Reference

### `EventEmitter<T extends EventMap>`

#### Constructor

```typescript
new EventEmitter<T>(options?: {
  name?: string;
  logColor?: string;
  logLevel?: LogarhythmLogLevel;
})
```

Creates a new event emitter with optional logging configuration.

**Options:**
- **`name?: string`** - Custom name for the logger (default: `"EventEmitter"`)
- **`logColor?: string`** - Hex color for log pills (default: `"#202020ff"`)
- **`logLevel?: LogarhythmLogLevel`** - Minimum log level to display

#### Methods

##### `on<K extends keyof T>(event: K, listener: (payload: T[K]) => void): () => void`

Registers a listener for a specific event. Returns an unsubscribe function.

**Parameters:**
- **`event: K`** - The event name (must be a key in the event map)
- **`listener: (payload: T[K]) => void`** - Callback function that receives the event payload

**Returns:** A function that removes the listener when called.

##### `off<K extends keyof T>(event: K, listener: (payload: T[K]) => void): void`

Removes a specific listener from an event.

**Parameters:**
- **`event: K`** - The event name
- **`listener: (payload: T[K]) => void`** - The listener function to remove

##### `emit<K extends keyof T>(event: K): void`
##### `emit<K extends keyof T>(event: K, payload: T[K]): void`

Emits an event, calling all registered listeners. The payload is optional if the event's payload type is `void` or `undefined`.

**Parameters:**
- **`event: K`** - The event name to emit
- **`payload?: T[K]`** - Optional payload data (required if event type is not `void`)

##### `clear(): void`

Removes all listeners from all events. Useful for cleanup and teardown.

## Examples

### Basic Event Handling

```typescript
interface GameEvents {
  playerMove: { x: number; y: number };
  gameOver: { winner: string };
  scoreUpdate: number;
}

const gameEmitter = new EventEmitter<GameEvents>();

// Register multiple listeners for the same event
gameEmitter.on("playerMove", (payload) => {
  console.log(`Player moved to (${payload.x}, ${payload.y})`);
});

gameEmitter.on("playerMove", (payload) => {
  updateUI(payload);
});

// Emit events
gameEmitter.emit("playerMove", { x: 10, y: 20 });
gameEmitter.emit("scoreUpdate", 100);
gameEmitter.emit("gameOver", { winner: "Player 1" });
```

### Events Without Payloads

```typescript
interface UIEvents {
  buttonClick: void;
  windowResize: void;
  themeChange: "light" | "dark";
}

const uiEmitter = new EventEmitter<UIEvents>();

uiEmitter.on("buttonClick", () => {
  console.log("Button was clicked!");
});

uiEmitter.on("themeChange", (theme) => {
  document.body.className = theme;
});

// Emit without payload for void events
uiEmitter.emit("buttonClick");
uiEmitter.emit("windowResize");

// Emit with payload for typed events
uiEmitter.emit("themeChange", "dark");
```

### Custom Logger Configuration

```typescript
import { LogarhythmLogLevel } from "logarhythm";

const emitter = new EventEmitter<MyEvents>({
  name: "MyCustomEmitter",
  logColor: "#10b981", // Green
  logLevel: LogarhythmLogLevel.DEBUG, // Show debug logs
});

// All event operations will be logged with custom settings
emitter.on("myEvent", () => {});
emitter.emit("myEvent");
```

### Cleanup Patterns

```typescript
// Pattern 1: Store unsubscribe function
const unsubscribe = emitter.on("event", handler);
// Later...
unsubscribe();

// Pattern 2: Remove specific listener
const handler = (payload) => { /* ... */ };
emitter.on("event", handler);
// Later...
emitter.off("event", handler);

// Pattern 3: Clear all listeners
emitter.clear();
```

### React Hook Pattern

```typescript
import { useEffect, useRef } from "react";

function useEventEmitter<T extends EventMap>(emitter: EventEmitter<T>) {
  const handlersRef = useRef<Map<keyof T, Set<Function>>>(new Map());

  const on = <K extends keyof T>(
    event: K,
    handler: (payload: T[K]) => void
  ) => {
    const unsubscribe = emitter.on(event, handler);
    
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)!.add(unsubscribe);

    return unsubscribe;
  };

  useEffect(() => {
    return () => {
      // Cleanup all registered handlers
      handlersRef.current.forEach((unsubscribes) => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
      });
      handlersRef.current.clear();
    };
  }, []);

  return { on };
}
```

### Event-Driven State Management

```typescript
interface StateEvents {
  stateChange: { key: string; value: unknown };
  stateReset: void;
}

class StateManager {
  private emitter = new EventEmitter<StateEvents>();
  private state: Record<string, unknown> = {};

  subscribe<K extends keyof StateEvents>(
    event: K,
    handler: (payload: StateEvents[K]) => void
  ) {
    return this.emitter.on(event, handler);
  }

  setState(key: string, value: unknown) {
    this.state[key] = value;
    this.emitter.emit("stateChange", { key, value });
  }

  reset() {
    this.state = {};
    this.emitter.emit("stateReset");
  }
}
```

## How It Works

1. **Event Map**: The `EventMap` type defines all possible events and their payload types. This ensures type safety at compile time.

2. **Listener Storage**: Each event maintains a `Set` of listener functions, allowing multiple listeners per event.

3. **Type Inference**: TypeScript infers the payload type from the event name, ensuring listeners receive the correct type.

4. **Logging**: All operations (on, off, emit, clear) are logged using Logarhythm for debugging and monitoring.

5. **Unsubscribe Pattern**: The `on` method returns an unsubscribe function, making cleanup straightforward and preventing memory leaks.

6. **Optional Payloads**: The `emit` method supports both payload and no-payload variants, with TypeScript enforcing correctness.

## TypeScript

Full TypeScript support with proper type inference:

```typescript
interface AppEvents {
  userCreated: { id: string; name: string; email: string };
  userDeleted: string; // Just the user ID
  configUpdated: { theme: string; language: string };
  appShutdown: void;
}

const emitter = new EventEmitter<AppEvents>();

// TypeScript knows the exact payload type
emitter.on("userCreated", (payload) => {
  // payload is { id: string; name: string; email: string }
  console.log(payload.email); // ✅ Type-safe
});

emitter.on("userDeleted", (userId) => {
  // userId is string
  console.log(userId); // ✅ Type-safe
});

emitter.on("appShutdown", () => {
  // No payload needed
  console.log("App shutting down");
});

// TypeScript enforces correct payload types
emitter.emit("userCreated", { id: "1", name: "Alice", email: "alice@example.com" }); // ✅
emitter.emit("userDeleted", "123"); // ✅
emitter.emit("appShutdown"); // ✅
emitter.emit("userCreated", { wrong: "data" }); // ❌ Type error
```

## License

Apache-2.0

