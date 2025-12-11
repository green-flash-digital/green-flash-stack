import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { findDirectoryUpwards } from "./util.node.find-directory-upwards";

const TEST_DIR = path.join(process.cwd(), "temp_test");
const TARGET_DIR = path.join(TEST_DIR, "node_modules");
const NESTED_DIR = path.join(TARGET_DIR, "nestedDir");

beforeEach(() => {
  // Cleanup before each test
  fs.rmSync(TEST_DIR, { recursive: true, force: true });

  // Create test directories
  fs.mkdirSync(TEST_DIR, { recursive: true });
  fs.mkdirSync(TARGET_DIR, { recursive: true });
  fs.mkdirSync(NESTED_DIR, { recursive: true });

  // Create a subdirectory where we will start the search
  fs.mkdirSync(path.join(TEST_DIR, "someSubDir"), { recursive: true });
});

afterEach(() => {
  // Cleanup after each test
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("findDirectoryUpwards", () => {
  it("should find a directory when it exists", () => {
    const result = findDirectoryUpwards("node_modules", undefined, {
      startingDirectory: path.join(TEST_DIR, "someSubDir"),
    });

    expect(result).toBe(TARGET_DIR);
  });

  it("should find a nested directory when specified", () => {
    const result = findDirectoryUpwards("node_modules", "nestedDir", {
      startingDirectory: path.join(TEST_DIR, "someSubDir"),
    });

    expect(result).toBe(NESTED_DIR);
  });

  it("should return null when the directory does not exist", () => {
    const result = findDirectoryUpwards("non_existent_folder", undefined, {
      startingDirectory: TEST_DIR,
    });

    expect(result).toBeNull();
  });

  it("should return null when the nested directory does not exist", () => {
    const result = findDirectoryUpwards("node_modules", "non_existent", {
      startingDirectory: TEST_DIR,
    });

    expect(result).toBeNull();
  });

  it("should correctly search upwards to find the directory", () => {
    const deepSubDir = path.join(TEST_DIR, "deep", "sub", "dir");
    fs.mkdirSync(deepSubDir, { recursive: true });

    const result = findDirectoryUpwards("node_modules", undefined, {
      startingDirectory: deepSubDir,
    });

    expect(result).toBe(TARGET_DIR);
  });

  it("should return null when it reaches the root without finding the directory", () => {
    const result = findDirectoryUpwards("missing_directory", undefined, {
      startingDirectory: "/",
    });

    expect(result).toBeNull();
  });
});
