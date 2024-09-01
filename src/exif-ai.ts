#!/usr/bin/env node
import { Command } from "commander"; // add this line
import { execute } from "./index.js";
import { WriteTags } from "exiftool-vendored";

//add the following line
const program = new Command();

program
  .version("1.1.1")
  .description(
    "A Node.js CLI that uses Ollama or ZhipuAI to intelligently write image description to exif metadata by it's content.",
  )
  .requiredOption("-i, --input <file>", "Path to the input image file.")
  .requiredOption(
    "-a, --api-provider <name>",
    "Name of the AI provider to use ('ollama' for Ollama or 'zhipu' for ZhipuAI).",
  )
  .option(
    "-p, --prompt <text>",
    "Custom prompt for the AI provider. Defaults to a generic image description prompt.",
  )
  .option(
    "-m, --model <name>",
    "Specify the AI model to use, if supported by the provider.",
  )
  .option(
    "-t, --tags <tags...>",
    "EXIF tags to write the description to. Defaults to common description tags.",
  )
  .option("-v, --verbose", "Enable verbose output for debugging.")
  .option(
    "-d, --dry-run",
    "Preview the AI-generated description without writing to the image file.",
  )
  .option(
    "--exif-tool-write-args <args...>",
    "Additional ExifTool arguments for writing metadata.",
  )
  .option(
    "--provider-args <args...>",
    "Additional arguments for the AI provider.",
  )
  .parse();

const options = program.opts();

if (options.verbose) console.log("Running with options:", options);

execute({
  path: options.input,
  provider: options.apiProvider,
  model: options.model,
  tags: options.tags as Extract<keyof WriteTags, string>[],
  prompt: options.prompt,
  verbose: options.verbose as boolean,
  dry: options.dryRun as boolean,
  writeArgs: options.exifToolWriteArgs,
  providerArgs: options.providerArgs,
}).catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});
