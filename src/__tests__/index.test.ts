import {
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
  vi,
  afterAll,
} from "vitest";
import { execute } from "../index.js";
import { exiftool } from "exiftool-vendored";
import { resolve } from "node:path";
import { existsSync, promises as fsPromises } from "node:fs";
import { deleteAsync } from "del";

let i = 0;

const getDescription = vi.fn(async ({ prompt }: { prompt: string }) => prompt); // Return the prompt as the description
const getTags = vi.fn(async ({ prompt }: { prompt: string }) => prompt); // Return the prompt as the tags

describe("Image Processing Tests", () => {
  const baseOptions = {
    path: "./src/__tests__/image0.jpeg",
    provider: "provider1",
    model: "model1",
    descriptionTags: [
      "XPComment",
      "Description",
      "ImageDescription",
      "Caption-Abstract",
    ] as Parameters<typeof execute>[0]["descriptionTags"],
    prompt: "Describe image.",
    verbose: true,
    dry: false,
    writeArgs: [],
    providerArgs: [],
    skip: false,
    doNotEndExifTool: true,
  };

  beforeEach(async () => {
    i++;
    baseOptions.path = `./src/__tests__/image${i}.jpeg`;
    const resolvedPath = resolve(baseOptions.path);

    await fsPromises.copyFile(
      "./src/__tests__/image/VCG211476897295.jpeg",
      resolvedPath,
    );
    // Mock the provider module
    vi.doMock("provider1", () => ({
      getDescription,
      getTags,
    }));
  });

  it("should run correctly", async () => {
    const resolvedPath = resolve(baseOptions.path);

    await execute({
      ...baseOptions,
    });

    // Verify the existing tag is not overwritten
    const descriptionTags = await exiftool.read(resolvedPath);
    expect(descriptionTags.XPComment).to.equal("Describe image.");
    expect(descriptionTags.Description).to.equal("Describe image.");
    expect(descriptionTags.ImageDescription).to.equal(
      "Describe image.",
    );
    expect(descriptionTags["Caption-Abstract"]).to.equal(
      "Describe image.",
    );

    expect(existsSync(`${resolvedPath}_original`)).to.be.true;
  });

  it("should run with prompt correctly", async () => {
    const resolvedPath = resolve(baseOptions.path);

    await execute({
      ...baseOptions,
      descriptionPrompt: "Describe",
    });

    // Verify the existing tag is not overwritten
    const descriptionTags = await exiftool.read(resolvedPath);
    expect(descriptionTags.XPComment).to.equal("Describe");
    expect(descriptionTags.Description).to.equal("Describe");
    expect(descriptionTags.ImageDescription).to.equal("Describe");
    expect(descriptionTags["Caption-Abstract"]).to.equal("Describe");

    expect(existsSync(`${resolvedPath}_original`)).to.be.true;
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
    expect(descriptionTags.Description).to.equal("Describe image.");
    expect(descriptionTags.ImageDescription).to.equal(
      "Describe image.",
    );
    expect(descriptionTags["Caption-Abstract"]).to.equal(
      "Describe image.",
    );
  });

  it("should handle different write args", async () => {
    const resolvedPath = resolve(baseOptions.path);
    const writeArgs = ["-overwrite_original"];
    await execute({
      ...baseOptions,
      writeArgs,
    });

    // Assuming the function returns undefined on success
    // Verify that the descriptionTags are written correctly
    const descriptionTags = await exiftool.read(resolvedPath);
    expect(descriptionTags.XPComment).to.equal("Describe image.");
    // Additional assertions can be made based on the expected behavior with the given write args
    expect(existsSync(`${resolvedPath}_original`)).to.be.false;
  });

  it("should handle without any tasks", async () => {
    // Setup: Write a tag to the test image
    const resolvedPath = resolve(baseOptions.path);

    await exiftool.write(resolvedPath, { XPComment: "Existing comment" });
    await execute({
      ...baseOptions,
      tasks: [],
    });

    // Verify the existing tag is not overwritten
    const descriptionTags = await exiftool.read(resolvedPath);
    expect(descriptionTags.XPComment).to.equal("Existing comment");
    expect(descriptionTags.Description).to.equal(
      "                               ",
    );
    expect(descriptionTags.ImageDescription).to.equal(
      "                               ",
    );
    expect(descriptionTags["Caption-Abstract"]).to.equal(
      "                               ",
    );
  });

  it("should handle dry", async () => {
    // Setup: Write a tag to the test image
    const resolvedPath = resolve(baseOptions.path);

    await exiftool.write(resolvedPath, { XPComment: "Existing comment" });
    await execute({
      ...baseOptions,
      dry: true,
    });
    // Verify the existing tag is not overwritten
    const descriptionTags = await exiftool.read(resolvedPath);
    expect(descriptionTags.XPComment).to.equal("Existing comment");
    expect(descriptionTags.Description).to.equal(
      "                               ",
    );
    expect(descriptionTags.ImageDescription).to.equal(
      "                               ",
    );
    expect(descriptionTags["Caption-Abstract"]).to.equal(
      "                               ",
    );
  });

  it("should handle no provider", async () => {
    // Setup: Write a tag to the test image
    const resolvedPath = resolve(baseOptions.path);

    await exiftool.write(resolvedPath, { XPComment: "Existing comment" });
    await execute({
      ...baseOptions,
      provider: "invalid",
    });
    // Verify the existing tag is not overwritten
    const descriptionTags = await exiftool.read(resolvedPath);
    expect(descriptionTags.XPComment).to.equal("Existing comment");
    expect(descriptionTags.Description).to.equal(
      "                               ",
    );
    expect(descriptionTags.ImageDescription).to.equal(
      "                               ",
    );
    expect(descriptionTags["Caption-Abstract"]).to.equal(
      "                               ",
    );
  });

  afterEach(async () => {
    const resolvedPath = resolve(baseOptions.path);

    await deleteAsync(["./src/__tests__/*original"]);
    await fsPromises.unlink(resolvedPath);
  });

  afterAll(async () => {
    await exiftool.end();
  });
});