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
}: {
  path: string;
  provider: string;
  model?: string;
  tags?: Extract<keyof WriteTags, string>[];
  prompt?: string;
  verbose?: boolean;
  dry?: boolean;
}) {
  const anotherFile = resolve(path);

  try {
    const buffer = await readFile(anotherFile);
    if (verbose) console.log("Read file from", anotherFile);
    let module;
    try {
      module =
        (await import("./provider/" + provider + ".js")) ??
        (await import(provider));
    } catch (error) {
      console.error(
        "Failed to import provider. Provider name:",
        provider,
        error,
      );
      return;
    }
    if (module == null) {
      console.error("Import provider failed. Provider name:", provider);
      return;
    }
    if (verbose) console.log("Imported provider:", provider);
    let description;
    try {
      description = await module.getDescription?.({
        buffer,
        model,
        prompt,
      });
    } catch (error) {
      console.error(
        "Failed to get description from provider. Provider name:",
        provider,
        error,
      );
      return;
    }
    if (verbose) console.log("Description is:", description);
    if (description && !dry) {
      try {
        await exiftool.write(
          path,
          Object.fromEntries(tags.map((t) => [t, description])),
        );
        if (verbose) console.log("Write file", path);
      } catch (error) {
        console.error(
          "Failed to write description to file. File path:",
          path,
          error,
        );
        return;
      } finally {
        await exiftool.end();
      }
    } else {
      if (verbose) console.log("Did not write");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
