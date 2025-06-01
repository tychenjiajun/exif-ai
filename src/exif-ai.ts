#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { execute } from "./index.js";
import { existsSync } from "node:fs";
import { getText } from "./fluent/index.js";
import { DescriptionKey } from "./tasks/description.js";
import { TagKey } from "./tasks/tags.js";

// Define the type for our arguments
interface Args {
  apiProvider: string;
  tasks?: string[];
  input?: string;
  descriptionPrompt?: string;
  tagPrompt?: string;
  model?: string;
  descriptionTags?: string[];
  tagTags?: string[];
  verbose?: boolean;
  dryRun?: boolean;
  exifToolWriteArgs?: string[];
  providerArgs?: string[];
  avoidOverwrite?: boolean;
  repeat?: number;
}

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .version("3.2.4")
  .usage(getText("description") ?? "")
  .option("a", {
    alias: "api-provider",
    describe: getText("api-provider") ?? "Name of the AI provider to use",
    type: "string",
    demandOption: true
  })
  .option("T", {
    alias: "tasks",
    describe: getText("tasks") ?? "List of tasks to perform",
    type: "array"
  })
  .option("i", {
    alias: "input",
    describe: getText("input") ?? "Path to the input image file",
    type: "string"
  })
  .option("p", {
    alias: "description-prompt",
    describe: getText("description-prompt") ?? "Custom prompt for the AI provider to generate description",
    type: "string"
  })
  .option("tag-prompt", {
    describe: getText("tag-prompt") ?? "Custom prompt for the AI provider to generate tags",
    type: "string"
  })
  .option("m", {
    alias: "model",
    describe: getText("model") ?? "Specify the AI model to use",
    type: "string"
  })
  .option("t", {
    alias: "description-tags",
    describe: getText("description-tags") ?? "List of EXIF tags to write the description to",
    type: "array"
  })
  .option("tag-tags", {
    describe: getText("tag-tags") ?? "List of EXIF tags to write the tags to",
    type: "array"
  })
  .option("v", {
    alias: "verbose",
    describe: getText("verbose") ?? "Enable verbose output for debugging",
    type: "boolean"
  })
  .option("d", {
    alias: "dry-run",
    describe: getText("dry-run") ?? "Preview AI-generated content without writing to the image file",
    type: "boolean"
  })
  .option("exif-tool-write-args", {
    describe: getText("exif-tool-write-args") ?? "Additional ExifTool arguments for writing metadata",
    type: "array"
  })
  .option("provider-args", {
    describe: getText("provider-args") ?? "Additional arguments for the AI provider",
    type: "array"
  })
  .option("avoid-overwrite", {
    describe: getText("avoid-overwrite") ?? "Avoid overwriting if EXIF tags already exist in the file",
    type: "boolean"
  })
  .option("repeat", {
    describe: getText("repeat") ?? "Number of times to repeat the task if the AI-generated result is deemed unacceptable",
    type: "number"
  })
  .help()
  .parseSync() as unknown as Args;

function logVerbose(...message: unknown[]) {
  if (argv.verbose) console.log(...message);
}

async function handleExecution(path: string) {
  try {
    // Default description tags from the index.ts file
    const defaultDescriptionTags: DescriptionKey[] = [
      "XPComment",
      "Description",
      "ImageDescription",
      "Caption-Abstract",
    ];

    // Default tag tags from the index.ts file
    const defaultTagTags: TagKey[] = ["Subject", "TagsList", "Keywords"];

    await execute({
      tasks: argv.tasks,
      path,
      provider: argv.apiProvider,
      model: argv.model,
      descriptionTags: argv.descriptionTags ? 
        argv.descriptionTags.filter((tag): tag is DescriptionKey => 
          defaultDescriptionTags.includes(tag as DescriptionKey)
        ) : 
        undefined,
      tagTags: argv.tagTags ? 
        argv.tagTags.filter((tag): tag is TagKey => 
          defaultTagTags.includes(tag as TagKey)
        ) : 
        undefined,
      tagPrompt: argv.tagPrompt,
      descriptionPrompt: argv.descriptionPrompt,
      verbose: argv.verbose,
      dry: argv.dryRun,
      writeArgs: argv.exifToolWriteArgs,
      providerArgs: argv.providerArgs,
      avoidOverwrite: argv.avoidOverwrite,
      repeat: argv.repeat,
    });
  } catch (error) {
    console.error(`Error processing file ${path}:`, error);
  }
}

if (argv.verbose) {
  logVerbose("Running with options:", argv);
}

if (!argv.input) {
  console.error(
    "No input file specified. Please provide an input file using the -i option.",
  );
  process.exit(1);
}
if (!existsSync(argv.input)) {
  console.error(`Input file does not exist: ${argv.input}`);
  process.exit(1);
}
handleExecution(argv.input);