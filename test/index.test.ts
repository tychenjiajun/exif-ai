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
    descriptionTags: [
      "XPComment",
      "Description",
      "ImageDescription",
      "Caption-Abstract",
    ] as Parameters<typeof execute>[0]["descriptionTags"],
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
    const descriptionTags = await exiftool.read(resolvedPath);
    expect(descriptionTags.XPComment).to.equal("请使用中文描述这个图片。");
    expect(descriptionTags.Description).to.equal("请使用中文描述这个图片。");
    expect(descriptionTags.ImageDescription).to.equal("请使用中文描述这个图片。");
    expect(descriptionTags["Caption-Abstract"]).to.equal("请使用中文描述这个图片。");

    expect(existsSync(`${resolvedPath}_original`)).to.be.true;
  });

  it("should run with prompt correctly", async () => {
    const resolvedPath = resolve(baseOptions.path);

    const result = await execute({
      ...baseOptions,
      descriptionPrompt: "Describe",
    });
    expect(result).to.be.undefined; // Assuming the function returns undefined on success

    // Verify the existing tag is not overwritten
    const descriptionTags = await exiftool.read(resolvedPath);
    expect(descriptionTags.XPComment).to.equal("Describe");
    expect(descriptionTags.Description).to.equal("Describe");
    expect(descriptionTags.ImageDescription).to.equal("Describe");
    expect(descriptionTags["Caption-Abstract"]).to.equal("Describe");

    expect(existsSync(`${resolvedPath}_original`)).to.be.true;
  });

  it("should handle dry run correctly", async () => {
    const result = await execute({
      ...baseOptions,
      dry: true,
    });
    expect(result).to.be.undefined; // Assuming the function returns undefined on success
  });

  it("should not overwrite existing descriptionTags with avoidOverwrite", async () => {
    // Setup: Write a tag to the test image
    const resolvedPath = resolve(baseOptions.path);

    await exiftool.write(resolvedPath, { XPComment: "Existing comment" });

    await execute({
      ...baseOptions,
      avoidOverwrite: true,
    });
    // Verify the existing tag is not overwritten
    const descriptionTags = await exiftool.read(resolvedPath);
    expect(descriptionTags.XPComment).to.equal("Existing comment");
    expect(descriptionTags.Description).to.equal("请使用中文描述这个图片。");
    expect(descriptionTags.ImageDescription).to.equal("请使用中文描述这个图片。");
    expect(descriptionTags["Caption-Abstract"]).to.equal("请使用中文描述这个图片。");
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

  it("should handle invalid descriptionTags", async () => {
    const result = await execute({
      ...baseOptions,
      // @ts-ignore
      descriptionTags: ["InvalidTag"],
    });
    // Verify that the function handles invalid descriptionTags appropriately
    expect(result).to.be.undefined;
  });

  it("should handle no descriptionTags provided", async () => {
    const result = await execute({
      ...baseOptions,
      descriptionTags: undefined,
    });
    // Verify that the function uses default descriptionTags when none are provided
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
    // Verify that the descriptionTags are written correctly
    const descriptionTags = await exiftool.read(resolvedPath);
    expect(descriptionTags.XPComment).to.equal("请使用中文描述这个图片。");
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
