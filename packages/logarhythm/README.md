# Logarhythm

An isomorphic logging utility for any JavaScript runtime, providing structured, styled, and extensible logs.

## Features

- 🌐 **Isomorphic** - Works seamlessly in both browser and Node.js environments
- 🎨 **Styled Output** - Beautiful colorized logs in terminal and styled console logs in browser
- 📊 **Structured Logging** - Support for both string and JSON log formats
- 🎯 **Log Levels** - Trace, debug, info, warn, error, and fatal levels with filtering
- ✨ **Vanity Methods** - Convenient methods like `success()`, `watch()`, and checkpoint tracking
- 🔧 **TypeScript** - Fully typed with TypeScript support
- 🎭 **Customizable** - Configurable log levels, formats, and styling

## Installation

```bash
npm install logarhythm
# or
yarn add logarhythm
# or
pnpm add logarhythm
```

## Quick Start

```typescript
import { Logarhythm } from "logarhythm";

// Create a logger instance
const logger = new Logarhythm({
  name: "my-feature",
  logLevel: "info",
  logFormat: "string", // or "json"
});

// Log messages
logger.info("Application started");
logger.warn("This is a warning");
logger.error("Something went wrong");
logger.success("Operation completed successfully");
```

## API Reference

### Constructor Options

```typescript
interface LogarhythmOptions {
  /**
   * A name that will be converted into camel case that describes
   * the logger that is being instantiated. This can be a feature
   * or a group of functionality that you want to ensure has its own
   * separate logger
   */
  name: string;
  
  /**
   * A hex value for the background color of the pill that
   * is logged to the console in the browser
   * @default "#55daf0"
   */
  pillColor?: string;
  
  /**
   * The default log level to be printed
   * @default "info"
   */
  logLevel?: LogarhythmLogLevel;
  
  /**
   * The format at which the log should be printed
   * @default "string"
   */
  logFormat?: "json" | "string";
}
```

### Log Levels

Logarhythm supports six log levels, ordered by priority:

1. `trace` - Most verbose, for detailed debugging
2. `debug` - Debug information
3. `info` - General informational messages
4. `warn` - Warning messages
5. `error` - Error messages
6. `fatal` - Critical errors that may cause the application to crash

Only messages at or above the configured log level will be output.

### Logging Methods

#### Standard Log Levels

```typescript
logger.trace("Detailed trace information");
logger.debug("Debug information");
logger.info("Informational message");
logger.warn("Warning message");
logger.error("Error message");
logger.fatal(new Error("Critical error"));
```

#### Vanity Methods

```typescript
// Success message (logged at info level)
logger.success("Operation completed successfully");

// Watch message (logged at info level)
logger.watch("Watching for file changes...");

// Checkpoint tracking
logger.checkpointStart("Processing data");
// ... your code ...
logger.checkpointEnd();
```

All logging methods support additional data:

```typescript
logger.info("User logged in", { userId: 123, timestamp: Date.now() });
logger.error("Failed to fetch data", { url: "/api/users", status: 500 });
```

### Dynamic Log Level Control

You can change the log level at runtime:

```typescript
// Using setter
logger.logLevel = "debug";

// Using method
logger.setLogLevel("warn");

// Get current log level
const currentLevel = logger.getLogLevel();
```

### Log Formats

#### String Format (Default)

The string format provides human-readable, colorized output:

- **Browser**: Styled console logs with colored pills and formatted timestamps
- **Server**: ANSI colorized terminal output with formatted timestamps

#### JSON Format

The JSON format provides structured, machine-readable output:

```typescript
const logger = new Logarhythm({
  name: "api",
  logFormat: "json",
});

logger.info("Request received");
// Output: {"timestamp":"2024-01-15T10:30:45.123Z","feature":"api","level":"info","message":"Request received","data":[]}
```

## Browser Integration

In browser environments, Logarhythm automatically registers loggers to `window.__Logarhythm__` for easy debugging:

```typescript
// Access your logger from the browser console
window.__Logarhythm__.myFeature.info("Debug from console");
```

## Utilities

### Colorize

The `Colorize` utility provides ANSI color support for terminal output:

```typescript
import { c } from "logarhythm";

console.log(c.red("Error message"));
console.log(c.green.bold("Success!"));
console.log(c.blueBright.underline("Important info"));
```

Available colors: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`, `redBright`, `greenBright`, `yellowBright`, `blueBright`, `magentaBright`, `cyanBright`, `whiteBright`

Available styles: `bold`, `underline`, `bg`

### Print as Bullets

Format arrays as bullet points:

```typescript
import { printAsBullets } from "logarhythm";

const items = ["Item 1", "Item 2", "Item 3"];
console.log(printAsBullets(items));
// Output:
// 	- Item 1
// 	- Item 2
// 	- Item 3

console.log(printAsBullets(items, { bulletType: "numbers" }));
// Output:
// 	1. Item 1
// 	2. Item 2
// 	3. Item 3
```

## Examples

### Basic Usage

```typescript
import { Logarhythm } from "logarhythm";

const logger = new Logarhythm({
  name: "user-service",
  logLevel: "info",
});

logger.info("User service initialized");
logger.debug("This won't be logged (level is info)");

logger.logLevel = "debug";
logger.debug("Now this will be logged");
```

### Feature-Specific Loggers

```typescript
// Create separate loggers for different features
const authLogger = new Logarhythm({
  name: "authentication",
  pillColor: "#ff6b6b",
});

const dbLogger = new Logarhythm({
  name: "database",
  pillColor: "#4ecdc4",
});

authLogger.info("User authenticated");
dbLogger.info("Query executed");
```

### Error Handling

```typescript
try {
  // Some operation
} catch (error) {
  if (error instanceof Error) {
    logger.fatal(error);
  } else {
    logger.error("Unknown error occurred", error);
  }
}
```

### Checkpoint Tracking

```typescript
logger.checkpointStart("Data processing");

// Process data
logger.debug("Step 1: Loading data");
logger.debug("Step 2: Transforming data");
logger.debug("Step 3: Saving data");

logger.checkpointEnd();
```

## TypeScript Support

Logarhythm is written in TypeScript and provides full type definitions:

```typescript
import type { LogarhythmLogLevel, LogarhythmAction } from "logarhythm";

const level: LogarhythmLogLevel = "info";
const action: LogarhythmAction = "success";
```

## License

Apache-2.0

## Author

Drew DeCarme (drew@greenflash.digital)

