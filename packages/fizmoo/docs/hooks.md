# Lifecycle Hooks

Hooks let you run shared logic before every command action, after it, or when it errors — without modifying individual command files. They are declared in `defineConfig`.

---

## Declaring hooks

```ts
import { defineConfig, command } from "fizmoo";

export default defineConfig({
  name: "mycli",
  description: "My CLI",
  hooks: {
    onBeforeAction: async ({ commandId, args, options }) => {
      // runs before every command action
    },
    onAfterAction: async ({ commandId, args, options }) => {
      // runs after every command action (only if action succeeded)
    },
    onError: async (error, { commandId, args, options }) => {
      // runs when any command action throws
    },
  },
  commands: [...],
});
```

---

## onBeforeAction

Runs immediately before a command's `action`. Receives a context object with the resolved command ID, args, and options.

```ts
onBeforeAction: async ({ commandId, args, options }) => {
  console.log(`[${commandId}] starting...`);
}
```

**Common uses:**
- Logging / telemetry
- Authentication / session checks
- Setting up shared state (e.g. a database connection)

---

## onAfterAction

Runs after a command's `action` completes without throwing.

```ts
onAfterAction: async ({ commandId, args, options }) => {
  console.log(`[${commandId}] done.`);
}
```

**Common uses:**
- Cleanup (e.g. close a database connection)
- Logging duration
- Posting success notifications

---

## onError

Runs when a command's `action` throws. The context is `Partial` because the error may occur before the command was fully resolved.

```ts
onError: async (error, { commandId }) => {
  console.error(`[${commandId ?? "unknown"}] failed:`, error);
  process.exit(1);
}
```

**Common uses:**
- Centralized error reporting (Sentry, Datadog, etc.)
- Printing formatted error messages
- Ensuring a non-zero exit code

---

## Hook context

```ts
type HookActionContext = {
  commandId: string;
  args: Record<string, unknown>;
  options: Record<string, unknown>;
};
```

`onError` receives `Partial<HookActionContext>` because the error may occur during command resolution (before `commandId` is known).

---

## Example: authentication guard

```ts
hooks: {
  onBeforeAction: async ({ commandId }) => {
    const publicCommands = ["login", "version"];
    if (publicCommands.includes(commandId)) return;

    const token = process.env.MY_CLI_TOKEN;
    if (!token) {
      console.error("Not authenticated. Run `mycli login` first.");
      process.exit(1);
    }
  },
},
```

---

## Example: timing

```ts
let startTime: number;

hooks: {
  onBeforeAction: async () => {
    startTime = Date.now();
  },
  onAfterAction: async ({ commandId }) => {
    console.log(`${commandId} completed in ${Date.now() - startTime}ms`);
  },
},
```

---

## Hooks do not replace command actions

Hooks are cross-cutting concerns. Command-specific logic (the actual work) belongs in each command's `action`. Hooks are for shared setup, teardown, and error handling that would otherwise be copy-pasted across every command.
