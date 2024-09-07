#!/usr/bin/env node

import { Command } from "commander";
import { execute } from "./index.js";
import { WriteTags } from "exiftool-vendored";
import { watch } from "chokidar";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { getText } from "./fluent/index.js";

async function findFilesRecursive(
  dir: string,
  ext: string[],
): Promise<string[]> {
  const files: string[] = [];
  const items = await readdir(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = join(dir, item.name);
    if (item.isDirectory()) {
      const subFiles = await findFilesRecursive(fullPath, ext);
      files.push(...subFiles);
    } else if (
      item.isFile() &&
      (!ext || ext.some((e) => fullPath.endsWith(e)))
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

const program = new Command();

const options = program.opts();

program
  .version("2.0.1")
  .description(getText("description") ?? "")
  .requiredOption("-a, --api-provider <name>", getText("api-provider"))
  .option("-i, --input <file>", getText("input"))
  .option("-p, --prompt <text>", getText("prompt"))
  .option("-m, --model <name>", getText("model"))
  .option("-t, --tags <tags...>", getText("tags"))
  .option("-v, --verbose", getText("verbose"))
  .option("-d, --dry-run", getText("dry-run"))
  .option("--exif-tool-write-args <args...>", getText("exif-tool-write-args"))
  .option("--provider-args <args...>", getText("provider-args"))
  .option("-w, --watch <path>", getText("watch"))
  .option("--avoid-overwrite", getText("avoid-overwrite"))
  .option("--ext <extensions...>", getText("ext"))
  .parse();
const watchMode = options.watch;

function logVerbose(...message: unknown[]) {
  if (options.verbose) console.log(message);
}

async function handleExecution(path: string) {
  try {
    await execute({
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
      avoidOverwrite: options.avoidOverwrite as boolean,
      doNotEndExifTool: Boolean(watchMode),
    });
  } catch (error) {
    console.error(`Error processing file ${path}:`, error);
  }
}

if (options.verbose) {
  logVerbose("Running with options:", options);
}

if (watchMode) {
  const pathToWatch = watchMode === true ? "./" : watchMode;
  logVerbose(`Watching directory: ${pathToWatch}`);

  // Process files in `pathToWatch` recursively
  const files = await findFilesRecursive(pathToWatch, options.ext);

  // Process all files concurrently
  await Promise.all(files.map((file) => handleExecution(file)));

  watch(pathToWatch, {
    persistent: true,
    ignoreInitial: true,
    ignored: (path) => {
      return !options.ext.some((ext: string) => path.endsWith(ext));
    },
    awaitWriteFinish: {
      stabilityThreshold: 2000, // Wait for 2 seconds after a file is modified
    },
  }).on("add", (path) => {
    logVerbose(`New file detected: ${path}`);
    handleExecution(path);
  });
} else {
  if (!options.input) {
    console.error(
      "No input file specified. Please provide an input file using the -i option.",
    );
    process.exit(1);
  }
  if (!existsSync(options.input)) {
    console.error(`Input file does not exist: ${options.input}`);
    process.exit(1);
  }
  handleExecution(options.input);
}
