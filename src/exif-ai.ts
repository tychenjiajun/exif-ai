#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { execute } from "./index.js";
import { existsSync } from "node:fs";
import { DescriptionKey } from "./tasks/description.js";
import { TagKey } from "./tasks/tags.js";

// Define the type for our arguments
interface Arguments {
  image: string;
  provider: string;
  model?: string;
  tasks: string[];
  descriptionPrompt?: string;
  tagPrompt?: string;
  descriptionTags?: string[];
  tagTags?: string[];
  dryRun?: boolean;
  verbose?: boolean;
  skipExisting?: boolean;
  retry?: number;
  exifArgs?: string[];
  providerArgs?: string[];
}

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .version("4.0.0")
  .usage("$0 <image> [options]")
  .command(
    "$0 <image>",
    "Generate AI descriptions and tags for an image",
    (yargs) => {
      return yargs.positional("image", {
        describe: "Path to the input image file",
        type: "string",
        demandOption: true,
      });
    },
  )
  .option("provider", {
    alias: ["p", "ai"],
    describe: "AI provider to use",
    type: "string",
    choices: [
      "openai",
      "google",
      "anthropic",
      "mistral",
      "ollama",
      "amazon",
      "bedrock",
      "azure",
      "deepinfra",
      "fireworks",
      "openai-compatible",
      "together",
      "togetherai",
      "xai",
      "openrouter",
    ],
    demandOption: true,
  })
  .option("model", {
    alias: "m",
    describe: "AI model to use (uses provider default if not specified)",
    type: "string",
  })
  .option("tasks", {
    alias: "t",
    describe: "Tasks to perform",
    type: "array",
    choices: ["description", "tag", "tags"],
    default: ["description", "tag"],
  })
  .group(["provider", "model"], "AI Configuration:")
  .option("description-prompt", {
    describe: "Custom prompt for generating descriptions",
    type: "string",
  })
  .option("tag-prompt", {
    describe: "Custom prompt for generating tags",
    type: "string",
  })
  .group(["description-prompt", "tag-prompt"], "Prompts:")
  .option("description-tags", {
    describe:
      "EXIF tags for descriptions (default: XPComment, Description, ImageDescription, Caption-Abstract)",
    type: "array",
  })
  .option("tag-tags", {
    describe: "EXIF tags for tags (default: Subject, TagsList, Keywords)",
    type: "array",
  })
  .group(["description-tags", "tag-tags"], "EXIF Tags:")
  .option("dry-run", {
    alias: ["d", "preview"],
    describe: "Preview AI-generated content without writing to file",
    type: "boolean",
  })
  .option("verbose", {
    alias: "v",
    describe: "Enable verbose output for debugging",
    type: "boolean",
  })
  .option("skip-existing", {
    alias: "skip",
    describe: "Skip processing if EXIF tags already exist",
    type: "boolean",
  })
  .option("retry", {
    alias: "r",
    describe: "Number of retry attempts for better results",
    type: "number",
    default: 0,
  })
  .group(["dry-run", "verbose", "skip-existing", "retry"], "Output & Behavior:")
  .option("exif-args", {
    describe: "Additional ExifTool arguments",
    type: "array",
    hidden: true,
  })
  .option("provider-args", {
    describe: "Additional AI provider arguments",
    type: "array",
    hidden: true,
  })
  .example("$0 image.jpg --provider ollama", "Basic usage with Ollama")
  .example("$0 image.jpg -p openai -m gpt-4o", "Use OpenAI with specific model")
  .example(
    "$0 image.jpg -p google --tasks description",
    "Generate only descriptions",
  )
  .example("$0 image.jpg -p anthropic --dry-run", "Preview without writing")
  .epilog(
    "Environment variables: Set API keys like OPENAI_API_KEY, GOOGLE_API_KEY, etc.",
  )
  .help()
  .parseSync() as unknown as Arguments;

function logVerbose(...message: unknown[]) {
  if (argv.verbose) console.log(...message);
}

async function handleExecution(path: string) {
  try {
    // Default description tags from the index.ts file
    const defaultDescriptionTags = new Set<DescriptionKey>([
      "XPComment",
      "Description",
      "ImageDescription",
      "Caption-Abstract",
    ]);

    // Default tag tags from the index.ts file
    const defaultTagTags = new Set<TagKey>(["Subject", "TagsList", "Keywords"]);

    await execute({
      tasks: argv.tasks,
      path,
      provider: argv.provider,
      model: argv.model,
      descriptionTags: argv.descriptionTags
        ? argv.descriptionTags.filter((tag): tag is DescriptionKey =>
            defaultDescriptionTags.has(tag as DescriptionKey),
          )
        : undefined,
      tagTags: argv.tagTags
        ? argv.tagTags.filter((tag): tag is TagKey =>
            defaultTagTags.has(tag as TagKey),
          )
        : undefined,
      tagPrompt: argv.tagPrompt,
      descriptionPrompt: argv.descriptionPrompt,
      verbose: argv.verbose,
      dry: argv.dryRun,
      writeArgs: argv.exifArgs,
      providerArgs: argv.providerArgs,
      avoidOverwrite: argv.skipExisting,
      repeat: argv.retry,
    });
  } catch (error) {
    console.error(`Error processing file ${path}:`, error);
  }
}

if (argv.verbose) {
  logVerbose("Running with options:", argv);
}

if (!argv.image) {
  console.error("No input image specified. Please provide an image file path.");
  process.exit(1);
}
if (!existsSync(argv.image)) {
  console.error(`Image file does not exist: ${argv.image}`);
  process.exit(1);
}
await handleExecution(argv.image);
