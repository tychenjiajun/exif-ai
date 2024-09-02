#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { exiftool, WriteTags } from "exiftool-vendored";
import { resolve } from "node:path";

export async function execute({
  path,
  provider,
  model,
  tags = ["XPComment", "Description", "ImageDescription", "Caption-Abstract"],
  prompt = "请使用中文描述这个图片。",
  verbose = false,
  dry = false,
  writeArgs,
  providerArgs,
  skip = false,
}: {
  path: string;
  provider: string;
  model?: string;
  tags?: Exclude<
    Extract<keyof WriteTags, string>,
    "AllDates" | "Orientation#" | "History+" | "Versions+"
  >[];
  prompt?: string;
  verbose?: boolean;
  dry?: boolean;
  writeArgs?: string[];
  providerArgs?: string[];
  skip?: boolean;
}) {
  const resolvedPath = resolve(path);

  try {
    if (skip) {
      // Read the file to check existing EXIF tags
      const existingTags = await exiftool.read(resolvedPath);

      // Check if any of the tags to be written already exist
      const tagExists = tags.every((tag) => existingTags[tag]);
      if (tagExists) {
        if (verbose)
          console.log("Skipping description generation, tag already exists.");
        return; // Exit the function early if skip is true and tag exists
      }
    }

    const buffer = await readFile(resolvedPath);
    if (verbose) console.log("Read file from", resolvedPath);

    let providerModule;
    try {
      providerModule = await import(`./provider/${provider}.js`);
    } catch (error) {
      console.error("Failed to import provider module", error);
      return;
    }

    if (providerModule == null) {
      console.error("Import provider failed. Provider name:", provider);
      return;
    }

    if (verbose) console.log("Imported provider:", provider);

    let description;
    try {
      description = await providerModule.getDescription?.({
        buffer,
        model,
        prompt,
        providerArgs,
      });
    } catch (error) {
      console.error("Failed to get description from provider:", error);
      return;
    }

    if (verbose) console.log("Description is:", description);

    if (description && !dry) {
      try {
        await exiftool.write(
          resolvedPath,
          Object.fromEntries(tags.map((tag) => [tag, description])),
          { writeArgs },
        );
        if (verbose) console.log("Wrote description to file:", resolvedPath);
      } catch (error) {
        console.error("Failed to write description to file:", error);
        return;
      } finally {
        await exiftool.end();
      }
    } else {
      if (description) console.log(description);
      if (verbose) console.log("Dry run - did not write to file");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
