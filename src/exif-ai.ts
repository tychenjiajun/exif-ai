#!/usr/bin/env node

import { Command } from "commander";
import { execute } from "./index.js";
import { watch } from "chokidar";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { getText } from "./fluent/index.js";
import pLimit from "p-limit";

async function findFilesRecursive(
  dir: string,
  ext?: string[],
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
      (ext == null || ext.length === 0 || ext.some((e) => fullPath.endsWith(e)))
    ) {
      files.push(fullPath);
    }
  }
  return files;
}
const program = new Command();
program
  .version("3.2.4")
  .description(getText("description") ?? "")
  .requiredOption("-a, --api-provider <provider>", getText("api-provider"))
  .option("-T, --tasks <tasks...>", getText("tasks"))
  .option("-i, --input <path>", getText("input"))
  .option("-p, --description-prompt <prompt>", getText("description-prompt"))
  .option("--tag-prompt <prompt>", getText("tag-prompt"))
  .option("-m, --model <model>", getText("model"))
  .option("-t, --description-tags <tags...>", getText("description-tags"))
  .option("--tag-tags <tag...>", getText("tag-tags"))
  .option("-v, --verbose", getText("verbose"))
  .option("-d, --dry-run", getText("dry-run"))
  .option("--exif-tool-write-args <args...>", getText("exif-tool-write-args"))
  .option("--provider-args <args...>", getText("provider-args"))
  .option("-w, --watch <path>", getText("watch"))
  .option("--avoid-overwrite", getText("avoid-overwrite"))
  .option("--ext <extensions...>", getText("ext"))
  .option("--concurrency <number>", getText("concurrency"))
  .option("--face-group-ids <groups...>", getText("face-group-ids"))
  .option("--repeat <number>", getText("repeat"))
  .parse();

const options = program.opts();
const watchMode = options.watch;

const limit = pLimit(Number(options.concurrency) || 1);

function logVerbose(...message: unknown[]) {
  if (options.verbose) console.log(...message);
}

async function handleExecution(path: string) {
  try {
    await execute({
      tasks: options.tasks,
      path,
      provider: options.apiProvider,
      model: options.model,
      descriptionTags: options.descriptionTags,
      tagTags: options.tagTags,
      tagPrompt: options.tagPrompt,
      descriptionPrompt: options.descriptionPrompt,
      verbose: options.verbose,
      dry: options.dryRun,
      writeArgs: options.exifToolWriteArgs,
      providerArgs: options.providerArgs,
      avoidOverwrite: options.avoidOverwrite,
      doNotEndExifTool: Boolean(watchMode),
      faceGroupIds: options.faceGroupIds,
      repeat: options.repeat,
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
  await Promise.all(files.map((file) => limit(() => handleExecution(file))));

  watch(pathToWatch, {
    persistent: true,
    ignoreInitial: true,
    ignored: (path) => {
      return (
        !options.ext?.length ||
        !options.ext.some((ext: string) => path.endsWith(ext))
      );
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
