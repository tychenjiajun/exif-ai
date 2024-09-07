import { readFile } from "node:fs/promises";
import { exiftool, WriteTags } from "exiftool-vendored";
import { resolve } from "node:path";
import { env } from "node:process";
import ISO6391 from "iso-639-1";

const lang = env.LANG?.slice(0, 2);

export async function execute({
  path,
  provider,
  model,
  tags = ["XPComment", "Description", "ImageDescription", "Caption-Abstract"],
  prompt = `Describe image in ${lang ? (ISO6391.getName(lang) ?? "English") : "English"}`,
  verbose = false,
  dry = false,
  writeArgs,
  providerArgs,
  avoidOverwrite = false,
  doNotEndExifTool = false,
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
  avoidOverwrite?: boolean;
  doNotEndExifTool?: boolean;
}) {
  const resolvedPath = resolve(path);

  try {
    // Read the file once to get the buffer and existing tags
    const buffer = await readFile(resolvedPath);

    if (verbose) console.log("Read file from", resolvedPath);

    // Check existing EXIF tags only if avoidOverwrite is true
    let existingTags = avoidOverwrite ? await exiftool.read(resolvedPath) : {};

    // Import provider module
    let providerModule;
    try {
      providerModule = await import(`./provider/${provider}.js`);
    } catch (error) {
      try {
        providerModule = await import(`${provider}`);
      } catch (error) {
        console.error("Failed to import provider module", error);
        return;
      }
    }
    if (providerModule == null) {
      console.error("Import provider failed. Provider name:", provider);
      return;
    }
    if (verbose) console.log("Imported provider:", provider);
    // Get description from provider
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
      // Write description to EXIF tags, avoiding overwriting if necessary
      const tagsToWrite = avoidOverwrite
        ? tags.filter(
            (tag) =>
              existingTags[tag] == null ||
              (typeof existingTags[tag] === "string" &&
                existingTags[tag].trim() === ""),
          )
        : tags;
      if (tagsToWrite.length > 0) {
        await exiftool.write(
          resolvedPath,
          Object.fromEntries(tagsToWrite.map((tag) => [tag, description])),
          { writeArgs },
        );
        if (verbose) console.log("Wrote description to file:", resolvedPath);
      } else {
        if (verbose) console.log("No new tags to write, skipping.");
      }
    } else {
      if (description) console.log(description);
      if (verbose) console.log("Dry run - did not write to file");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    if (doNotEndExifTool) return;
    // Ensure ExifTool session is closed properly
    await exiftool.end();
  }
}
