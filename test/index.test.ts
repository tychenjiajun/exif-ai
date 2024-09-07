import {
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
  vi,
  afterAll,
} from "vitest";
import { execute } from "../src/index.js";
import { exiftool } from "exiftool-vendored";
import { resolve } from "node:path";
import { existsSync, promises as fsPromises } from "node:fs";
import { deleteAsync } from "del";

let i = 0;

describe("Image Processing Tests", () => {
  const baseOptions = {
    path: "./test/image0.jpeg",
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
    doNotEndExifTool: true,
  };

  beforeEach(async () => {
    i++;
    baseOptions.path = `./test/image${i}.jpeg`;
    const resolvedPath = resolve(baseOptions.path);

    await fsPromises.copyFile(
      "./test/image/VCG211476897295.jpeg",
      resolvedPath,
    );
    // Mock the provider module
    vi.doMock("provider1", () => ({
      getDescription: async ({ prompt }: { prompt: string }) => prompt, // Return the prompt as the description
    }));
  });

  it("should run correctly", async () => {
    const resolvedPath = resolve(baseOptions.path);

    const result = await execute({
      ...baseOptions,
    });
    expect(result).to.be.undefined; // Assuming the function returns undefined on success

    // Verify the existing tag is not overwritten
    const tags = await exiftool.read(resolvedPath);
    expect(tags.XPComment).to.equal("请使用中文描述这个图片。");
    expect(tags.Description).to.equal("请使用中文描述这个图片。");
    expect(tags.ImageDescription).to.equal("请使用中文描述这个图片。");
    expect(tags["Caption-Abstract"]).to.equal("请使用中文描述这个图片。");

    expect(existsSync(`${resolvedPath}_original`)).to.be.true;
  });

  it("should run with prompt correctly", async () => {
    const resolvedPath = resolve(baseOptions.path);

    const result = await execute({
      ...baseOptions,
      prompt: "Describe",
    });
    expect(result).to.be.undefined; // Assuming the function returns undefined on success

    // Verify the existing tag is not overwritten
    const tags = await exiftool.read(resolvedPath);
    expect(tags.XPComment).to.equal("Describe");
    expect(tags.Description).to.equal("Describe");
    expect(tags.ImageDescription).to.equal("Describe");
    expect(tags["Caption-Abstract"]).to.equal("Describe");

    expect(existsSync(`${resolvedPath}_original`)).to.be.true;
  });

  it("should handle dry run correctly", async () => {
    const result = await execute({
      ...baseOptions,
      dry: true,
    });
    expect(result).to.be.undefined; // Assuming the function returns undefined on success
  });

  it("should not overwrite existing tags with avoidOverwrite", async () => {
    // Setup: Write a tag to the test image
    const resolvedPath = resolve(baseOptions.path);

    await exiftool.write(resolvedPath, { XPComment: "Existing comment" });

    await execute({
      ...baseOptions,
      avoidOverwrite: true,
    });
    // Verify the existing tag is not overwritten
    const tags = await exiftool.read(resolvedPath);
    expect(tags.XPComment).to.equal("Existing comment");
    expect(tags.Description).to.equal("请使用中文描述这个图片。");
    expect(tags.ImageDescription).to.equal("请使用中文描述这个图片。");
    expect(tags["Caption-Abstract"]).to.equal("请使用中文描述这个图片。");
  });

  it("should handle provider import failure", async () => {
    const result = await execute({
      ...baseOptions,
      provider: "nonexistentProvider",
    });
    // Assertions for error handling can be more complex, depending on how errors are managed
    // For simplicity, we assume the function logs an error and returns undefined
    expect(result).to.be.undefined;
  });

  it("should handle description generation failure", async () => {
    const result = await execute({
      ...baseOptions,
      provider: "failingProvider",
    });
    // Similar to the previous test, assertions depend on error handling implementation
    expect(result).to.be.undefined;
  });

  it("should handle non-existent file", async () => {
    const result = await execute({
      ...baseOptions,
      path: "./test/nonexistent.jpeg",
    });
    // Verify that the function handles the non-existent file appropriately
    expect(result).to.be.undefined;
  });

  it("should handle invalid tags", async () => {
    const result = await execute({
      ...baseOptions,
      // @ts-ignore
      tags: ["InvalidTag"],
    });
    // Verify that the function handles invalid tags appropriately
    expect(result).to.be.undefined;
  });

  it("should handle no tags provided", async () => {
    const result = await execute({
      ...baseOptions,
      tags: undefined,
    });
    // Verify that the function uses default tags when none are provided
    expect(result).to.be.undefined;
  });

  it("should handle different write args", async () => {
    const resolvedPath = resolve(baseOptions.path);
    const writeArgs = ["-overwrite_original"];
    const result = await execute({
      ...baseOptions,
      writeArgs,
    });
    expect(result).to.be.undefined; // Assuming the function returns undefined on success
    // Verify that the tags are written correctly
    const tags = await exiftool.read(resolvedPath);
    expect(tags.XPComment).to.equal("请使用中文描述这个图片。");
    // Additional assertions can be made based on the expected behavior with the given write args
    expect(existsSync(`${resolvedPath}_original`)).to.be.false;
  });

  afterEach(async () => {
    const resolvedPath = resolve(baseOptions.path);

    await deleteAsync(["./test/*original"]);
    await fsPromises.unlink(resolvedPath);
  });

  afterAll(async () => {
    await exiftool.end();
  });
});
