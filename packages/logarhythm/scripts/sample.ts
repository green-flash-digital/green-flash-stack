import { Isoscribe } from "../src/Logarhythm/Logarhythm.js";

const LOG_SANDBOX = new Isoscribe({
  name: "sandbox",
  logFormat: "string"
});

function runSandbox() {
  LOG_SANDBOX.logLevel = "debug";

  LOG_SANDBOX.checkpointStart("Sandbox");
  LOG_SANDBOX.debug("This is a debug message");
  LOG_SANDBOX.debug("This is a debug message with content", {
    test: "hello"
  });
  LOG_SANDBOX.warn("This is a warn message");
  LOG_SANDBOX.warn("This is a warn message with content", {
    test: "hello"
  });
  LOG_SANDBOX.error("This is a error message");
  LOG_SANDBOX.error("This is a error message with content", {
    test: "hello"
  });
  LOG_SANDBOX.info("This is a info message");
  LOG_SANDBOX.info("This is a info message with content", {
    test: "hello"
  });
  LOG_SANDBOX.success("This is a success message");
  LOG_SANDBOX.success("This is a success message with content", {
    test: "hello"
  });
  LOG_SANDBOX.fatal(new Error("This is a fatal message"));
  LOG_SANDBOX.checkpointEnd();
}

runSandbox();
