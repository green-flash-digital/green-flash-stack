<div align="center" style="padding-bottom: 30px">
  <img align="center" width="50%" src="./public/ts-utils-logo-transparent.png" style="margin: 0 auto;"/>
  <p>Shockingly simple and ergonomic utils for node, browser, and isomorphic typescript applications</p>
</div>

## Overview

This suite of tools is designed to enhance your full stack TypeScript workflow, ensuring seamless development, testing, and deployment across both client and server environments. Each utility serves a specific role in streamlining TypeScript-based projects, improving error handling, type narrowing, and filesystem operations.

## Installation

```bash
npm install @green-flash/ts-utils
# or
yarn add @green-flash/ts-utils
# or
pnpm add @green-flash/ts-utils
```

## Usage

The package is organized into three categories based on runtime environment:

- **`@green-flash/ts-utils/browser`** - Browser-only utilities
- **`@green-flash/ts-utils/isomorphic`** - Works in both browser and Node.js
- **`@green-flash/ts-utils/node`** - Node.js-only utilities

### Browser Utilities

#### `debounce`

Debounces a function call, ensuring it only executes after a specified delay has passed since the last invocation.

```typescript
import { debounce } from "@green-flash/ts-utils/browser";

const debouncedSearch = debounce((query: string) => {
  console.log(`Searching for: ${query}`);
}, 300);

// Only the last call will execute after 300ms
debouncedSearch("a");
debouncedSearch("ab");
debouncedSearch("abc"); // Only this will execute
```

### Isomorphic Utilities

#### `tryHandle` / `tryHandleSync`

Provides a Go-like error handling pattern that returns errors as values instead of throwing exceptions. Perfect for explicit error handling in async and sync contexts.

```typescript
import { tryHandle, tryHandleSync } from "@green-flash/ts-utils/isomorphic";

// Async version
const result = await tryHandle(fetch)("https://api.example.com/data");
if (result.hasError) {
  console.error("Failed to fetch:", result.error);
} else {
  console.log("Data:", result.data);
}

// Sync version
const parseResult = tryHandleSync(JSON.parse)('{"invalid": json}');
if (parseResult.hasError) {
  console.error("Parse error:", parseResult.error);
} else {
  console.log("Parsed:", parseResult.data);
}
```

#### `exhaustiveMatchGuard`

Ensures all cases in a discriminated union are handled in switch statements. Throws an error if a case is missing.

```typescript
import { exhaustiveMatchGuard } from "@green-flash/ts-utils/isomorphic";

type Status = "pending" | "success" | "error";

function handleStatus(status: Status) {
  switch (status) {
    case "pending":
      return "Processing...";
    case "success":
      return "Done!";
    case "error":
      return "Failed!";
    default:
      exhaustiveMatchGuard(status); // TypeScript error if a case is missing
  }
}
```

#### `generateGUID`

Generates a RFC4122 version 4 compliant GUID/UUID.

```typescript
import { generateGUID } from "@green-flash/ts-utils/isomorphic";

const id = generateGUID();
// Returns: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
```

#### `kebabToCamel`

Converts a kebab-case string to camelCase.

```typescript
import { kebabToCamel } from "@green-flash/ts-utils/isomorphic";

kebabToCamel("hello-world"); // "helloWorld"
kebabToCamel("my-component-name"); // "myComponentName"
```

#### `kebabToPascalCase`

Converts a kebab-case or space-separated string to PascalCase.

```typescript
import { kebabToPascalCase } from "@green-flash/ts-utils/isomorphic";

kebabToPascalCase("hello-world"); // "HelloWorld"
kebabToPascalCase("my component name"); // "MyComponentName"
```

### Node Utilities

#### `findDirectoryUpwards`

Recursively searches up the directory tree to find a directory with a specific name, optionally checking for a nested directory.

```typescript
import { findDirectoryUpwards } from "@green-flash/ts-utils/node";

// Find node_modules directory
const nodeModules = findDirectoryUpwards("node_modules");
// Returns: "/path/to/project/node_modules" or null

// Find nested directory
const nested = findDirectoryUpwards("node_modules", "some-package");
// Returns: "/path/to/project/node_modules/some-package" or null

// Start from a specific directory
const result = findDirectoryUpwards("src", undefined, {
  startingDirectory: "/custom/path"
});
```

#### `hashString`

Creates a SHA-256 hash of a string.

```typescript
import { hashString } from "@green-flash/ts-utils/node";

const hash = hashString("my-secret-string");
// Returns: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
```

#### `writeFileRecursive`

Writes a file, creating the directory structure if it doesn't exist.

```typescript
import { writeFileRecursive } from "@green-flash/ts-utils/node";

await writeFileRecursive(
  "/path/to/nested/directory/file.txt",
  "File contents"
);
// Creates directories and writes file
```

#### `ensureFileRecursive`

Ensures a file exists, creating it and its directory structure if needed.

```typescript
import { ensureFileRecursive } from "@green-flash/ts-utils/node";

await ensureFileRecursive("/path/to/file.txt");
// Creates file if it doesn't exist (empty file)
```

#### `TempFile`

A class for managing temporary files with automatic cleanup.

```typescript
import { TempFile } from "@green-flash/ts-utils/node";

const tempFile = new TempFile();
const path = await tempFile.create("file contents", "txt");
// Use the file...
await tempFile.cleanup(); // Removes the temporary file
```

## Documentation

Check out the `ts-utils` documentation: https://ts-utils.greenflash.digital

## Organization

Check out the company behind `ts-utils`: https://greenflash.digital
