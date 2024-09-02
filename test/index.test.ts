import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { execute } from "../src/index.js";
import { exiftool } from "exiftool-vendored";
import { resolve } from "node:path";
import { promises as fsPromises } from "node:fs";

// Mock the provider module
vi.mock("./provider/provider1.js", () => ({
  getDescription: async ({ prompt }: { prompt: string }) => prompt, // Return the prompt as the description
}));

function runTest(
  testCaseNumber: number,
  options: {
    dry: boolean | undefined;
    path: string;
    provider: string;
    model: string | undefined;
    tags?: Parameters<typeof execute>[0]["tags"];
    prompt: string | undefined;
    verbose: boolean | undefined;
    writeArgs: string[] | never[] | undefined;
    providerArgs: string[] | never[] | undefined;
    skip: boolean | undefined;
  },
) {
  return execute(options);
}

describe("Image Processing Tests", () => {
  const baseOptions = {
    path: "./test/image.jpeg",
    provider: "provider1",
    model: "model1",
    tags: [
      "XPComment",
      "Description",
      "ImageDescription",
      "Caption-Abstract",
    ] as Parameters<typeof execute>[0]["tags"],
    prompt: "请使用中文描述这个图片。",
    verbose: true,
    dry: false,
    writeArgs: [],
    providerArgs: [],
    skip: false,
  };

  beforeEach(async () => {
    // Ensure the test image exists and is clean before each test
    const resolvedPath = resolve(baseOptions.path);
    await fsPromises.copyFile(
      "./test/image/VCG211476897295.jpeg",
      resolvedPath,
    );
  });

  it("should handle provider import failure", async () => {
    const result = await runTest(4, {
      ...baseOptions,
      provider: "nonexistentProvider",
    });
    // Assertions for error handling can be more complex, depending on how errors are managed
    // For simplicity, we assume the function logs an error and returns undefined
    expect(result).to.be.undefined;
  });

  it("should handle description generation failure", async () => {
    const result = await runTest(5, {
      ...baseOptions,
      provider: "failingProvider",
    });
    // Similar to the previous test, assertions depend on error handling implementation
    expect(result).to.be.undefined;
  });

  afterEach(async () => {
    // Clean up after each test to avoid side effects
    const resolvedPath = resolve(baseOptions.path);
    await fsPromises.unlink(resolvedPath);
    await exiftool.end();
  });
});
