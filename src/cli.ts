#!/usr/bin/env node
import { Command } from "commander"; // add this line
import figlet from "figlet";
import { execute } from "./index.js";
import { WriteTags } from "exiftool-vendored";

//add the following line
const program = new Command();

program
  .version("1.0.1")
  .description("A CLI for writing AI-generated image description to metadata.")
  .option("-i, --input <value>", "Input file path (required)")
  .option("-a, --api-provider <value>", "Set API Provider (required)")
  .option("-p, --prompt [value]", "API Prompt")
  .option("-m, --model [value]", "Set model")
  .option("-t, --tags [value...]", "Exif Tag Names")
  .option("-v, --verbose", "Verbose Mode")
  .option(
    "-d, --dry-run",
    "Get description only. Do not write exif tags to file.",
  )
  .parse();
const options = program.opts();

console.log(figlet.textSync("Exif AI"));

if (options.verbose) console.log("Running with options:", options);

execute({
  path: options.input,
  provider: options.apiProvider,
  model: options.model,
  tags: options.tags as Extract<keyof WriteTags, string>[],
  prompt: options.prompt,
  verbose: options.verbose as boolean,
  dry: options.dryRun as boolean,
});
