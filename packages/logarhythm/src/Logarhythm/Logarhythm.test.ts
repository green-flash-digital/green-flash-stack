import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Logarhythm } from "./Logarhythm.js"; // Adjust path as needed
import { c } from "./Colorize.js";

describe("Logarhythm", () => {
  let logger: Logarhythm;
  let consoleSpyLog: ReturnType<typeof vi.spyOn>;
  let consoleSpyWarn: ReturnType<typeof vi.spyOn>;
  let consoleSpyError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock console methods before each test
    consoleSpyLog = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleSpyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleSpyError = vi.spyOn(console, "error").mockImplementation(() => {});

    logger = new Logarhythm({ name: "testLogger" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Log Level Filtering", () => {
    it("should not log when level is below the set log level", () => {
      logger.logLevel = "warn"; // Set log level to warn

      logger.info("This should not be logged");
      logger.debug("This should also not be logged");

      expect(consoleSpyLog).not.toHaveBeenCalled();
    });

    it("should log when level is at or above the set log level", () => {
      logger.logLevel = "info";

      logger.info("This should be logged");
      expect(consoleSpyLog).toHaveBeenCalledTimes(1);
    });
  });

  describe("Log Formatting", () => {
    it("should format a basic log message correctly", () => {
      logger.logLevel = "info";
      logger.info("Test message");

      expect(consoleSpyLog).toHaveBeenCalledWith(
        expect.stringContaining("Test message")
      );
    });

    it("should format JSON log messages correctly", () => {
      logger = new Logarhythm({ name: "jsonLogger", logFormat: "json" });

      logger.info("JSON log");
      expect(consoleSpyLog).toHaveBeenCalledWith(
        expect.stringContaining('"message":"JSON log"')
      );
    });
  });

  describe("Logging Methods", () => {
    it("should log trace messages with magenta color", () => {
      logger.logLevel = "trace";
      logger.trace("Trace message");

      expect(consoleSpyLog).toHaveBeenCalledWith(
        expect.stringContaining(c.magenta(`● ${c.underline("trace")}`))
      );
    });

    it("should log debug messages", () => {
      logger.logLevel = "debug";
      logger.debug("Debug message");

      expect(consoleSpyLog).toHaveBeenCalledWith(
        expect.stringContaining(c.magenta(`● ${c.underline("debug")}`))
      );
    });

    it("should log info messages", () => {
      logger.logLevel = "info";
      logger.info("Info message");

      expect(consoleSpyLog).toHaveBeenCalledWith(
        expect.stringContaining(c.blueBright(`ℹ︎ ${c.underline("info")}`))
      );
    });

    it("should log warnings", () => {
      logger.logLevel = "warn";
      logger.warn("Warning message");

      expect(consoleSpyWarn).toHaveBeenCalledWith(
        expect.stringContaining(c.yellowBright(`! ${c.underline("warn")}`))
      );
    });

    it("should log error messages with red", () => {
      logger.logLevel = "error";
      logger.error("Error message");

      expect(consoleSpyError).toHaveBeenCalledWith(
        expect.stringContaining(c.red(`✕ ${c.underline("error")}`))
      );
    });

    it("should log fatal errors", () => {
      logger.logLevel = "debug";
      const error = new Error("Fatal crash");
      logger.fatal(error);

      expect(consoleSpyError).toHaveBeenCalledWith(
        expect.stringContaining(c.redBright(`✕ ${c.underline("fatal")}`))
      );
      expect(consoleSpyLog).toHaveBeenCalledWith(
        expect.stringContaining(error.stack!.split("\n")[1])
      );
    });

    it("should log success messages", () => {
      logger.success("Success message");

      expect(consoleSpyLog).toHaveBeenCalledWith(
        expect.stringContaining(c.green(`✓ ${c.underline("success")}`))
      );
    });

    it("should log watch messages", () => {
      logger.watch("Watching file...");

      expect(consoleSpyLog).toHaveBeenCalledWith(
        expect.stringContaining(c.cyan(`⦿ ${c.underline("watching")}`))
      );
    });

    it("should log checkpoint start", () => {
      logger.logLevel = "debug";
      logger.checkpointStart("Feature1");

      expect(consoleSpyLog).toHaveBeenCalledWith(
        expect.stringContaining(
          c.cyanBright(`➤ ${c.underline("checkpoint:start")}`)
        )
      );
    });

    it("should log checkpoint end", () => {
      logger.logLevel = "debug";
      logger.checkpointEnd();

      expect(consoleSpyLog).toHaveBeenCalledWith(
        expect.stringContaining(
          c.cyanBright(`➤ ${c.underline("checkpoint:end")}`)
        )
      );
    });
  });

  describe("Timestamps", () => {
    it("should format timestamp correctly in ISO format", () => {
      logger = new Logarhythm({ name: "isoLogger", logFormat: "json" });

      logger.info("Check timestamp");
      expect(consoleSpyLog).toHaveBeenCalledWith(
        expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      );
    });

    it("should format timestamp correctly in hh:mm:ss format", () => {
      logger = new Logarhythm({ name: "prettyLogger", logFormat: "string" });

      logger.info("Check timestamp");
      expect(consoleSpyLog).toHaveBeenCalledWith(
        expect.stringMatching(/\d{1,2}:\d{2}:\d{2} (AM|PM)/)
      );
    });
  });

  describe("Dynamic Log Level", () => {
    it("should update log level dynamically", () => {
      logger.logLevel = "warn";

      logger.info("Should not log");
      expect(consoleSpyLog).not.toHaveBeenCalled();

      logger.logLevel = "info";
      logger.info("Now this logs");
      expect(consoleSpyLog).toHaveBeenCalledTimes(1);
    });
  });
});
