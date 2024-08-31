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
  const buffer = await readFile(anotherFile);

  if (verbose) console.log("Read file from", anotherFile);

  const module =
    (await import("./provider/" + provider + ".js")) ??
    (await import(provider));

  if (module == null) {
    console.error("Import provider failed. Provider name:", provider);
    return;
  }
  if (verbose) console.log("Imported provider:", provider);

  const description = await module?.getDescription?.({
    buffer,
    model,
    prompt,
  });

  if (verbose) console.log("Description is:", description);

  if (description && !dry) {
    await exiftool.write(
      path,
      Object.fromEntries(tags.map((t) => [t, description])),
    );
    if (verbose) console.log("Write file", path);
    await exiftool.end();
  } else {
    if (verbose) console.log("Did not write");
  }

  return;
}
