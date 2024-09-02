#!/usr/bin/env node
import { Command } from "commander";
import { execute } from "./index.js";
import { WriteTags } from "exiftool-vendored";
import { watch } from "chokidar";

const program = new Command();

program
  .version("1.2.0")
  .description(
    "A Node.js CLI that uses Ollama or ZhipuAI to intelligently write image description to exif metadata by it's content.",
  )
  .requiredOption(
    "-a, --api-provider <name>",
    "Name of the AI provider to use ('ollama' for Ollama or 'zhipu' for ZhipuAI).",
  )
  .option("-i, --input <file>", "Path to the input image file.")
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
  .option("-w, --watch <path>", "Watch directory for new files to process.")
  .option("-s, --skip", "Skip if EXIF tags already exist in the file.")
  .parse();

const options = program.opts();
const watchMode = options.watch;

function logVerbose(...message: unknown[]) {
  if (options.verbose) console.log(message);
}

function handleExecution(path: string) {
  execute({
    path,
    provider: options.apiProvider,
    model: options.model,
    tags: options.tags as Exclude<
      Extract<keyof WriteTags, string>,
      "AllDates" | "Orientation#" | "History+" | "Versions+"
    >[],
    prompt: options.prompt,
    verbose: options.verbose as boolean,
    dry: options.dryRun as boolean,
    writeArgs: options.exifToolWriteArgs,
    providerArgs: options.providerArgs,
    skip: options.skip as boolean,
  }).catch((error) => {
    console.error("An error occurred:", error.message);
    process.exit(1);
  });
}

if (options.verbose) {
  logVerbose("Running with options:", options);
}

if (watchMode) {
  const pathToWatch = watchMode === true ? "./" : watchMode;
  logVerbose(`Watching directory: ${pathToWatch}`);

  watch(pathToWatch, {
    persistent: true,
    ignoreInitial: true,
  }).on("add", (path) => {
    logVerbose(`New file detected: ${path}`);
    handleExecution(path);
  });
} else {
  
  handleExecution(options.input);
}
