import { readFile } from "node:fs/promises";
import { exiftool } from "exiftool-vendored";
import path from "node:path";
import { env } from "node:process";
import ISO6391 from "iso-639-1";
// @ts-expect-error - xhr2 doesn't have TypeScript definitions
import xhr2 from "xhr2";

// Export the new improved API
export * from "./api.js";

import fetch, {
  Headers,
  Request,
  Response,
  RequestInit,
  RequestInfo,
} from "node-fetch";
import { DescriptionKey, getDescription } from "./tasks/description.js";
import { getTags, TagKey } from "./tasks/tags.js";
import { HttpsProxyAgent } from "https-proxy-agent";
import { getText } from "./fluent/index.js";

if (
  Boolean(env.https_proxy) ||
  Boolean(env.HTTPS_PROXY) ||
  Boolean(env.http_proxy) ||
  Boolean(env.HTTP_PROXY)
) {
  // @ts-expect-error - Polyfilling fetch for proxy support
  globalThis.fetch = function (
    url: URL | RequestInfo,
    init?: RequestInit,
  ): Promise<Response> {
    let agentObject: { agent: HttpsProxyAgent<string> } | undefined;

    if (env.https_proxy) {
      agentObject = { agent: new HttpsProxyAgent(env.https_proxy) };
    } else if (env.HTTPS_PROXY) {
      agentObject = { agent: new HttpsProxyAgent(env.HTTPS_PROXY) };
    } else if (env.http_proxy) {
      agentObject = { agent: new HttpsProxyAgent(env.http_proxy) };
    } else if (env.HTTP_PROXY) {
      agentObject = { agent: new HttpsProxyAgent(env.HTTP_PROXY) };
    }

    return fetch(url, agentObject ? { ...init, ...agentObject } : init);
  };
  // @ts-expect-error - Polyfilling Headers
  globalThis.Headers = Headers;
  // @ts-expect-error - Polyfilling Request
  globalThis.Request = Request;
  // @ts-expect-error - Polyfilling Response
  globalThis.Response = Response;
}

// Set XMLHttpRequest for environments that don't have it
global.XMLHttpRequest = xhr2 as unknown as typeof XMLHttpRequest;

const lang = env.LANG?.slice(0, 2);

/**
 * Imports the AI SDK provider module
 */
async function importProviderModule(provider: string, verbose: boolean) {
  try {
    const providerModule = await import(`./provider/ai-sdk.js`);
    if (verbose) console.log("Using AI SDK with provider:", provider);
    return providerModule;
  } catch (error) {
    console.error("Failed to import AI SDK provider module", error);
    return null;
  }
}

/**
 * Processes the image and generates metadata
 */
async function processImage({
  tasks,
  buffer,
  resolvedPath,
  model,
  descriptionPrompt,
  tagPrompt,
  providerArgs,
  providerModule,
  verbose,
  descriptionTags,
  tagTags,
  existingTags,
  repeat,
  provider,
}: {
  tasks: string[];
  buffer: Buffer;
  resolvedPath: string;
  model?: string;
  descriptionPrompt: string;
  tagPrompt: string;
  providerArgs?: string[];
  providerModule: unknown;
  verbose: boolean;
  descriptionTags: DescriptionKey[];
  tagTags: TagKey[];
  existingTags?: Readonly<import("exiftool-vendored").Tags>;
  repeat: number;
  provider: string;
}) {
  // AI SDK doesn't use file_id
  const file_id: string | undefined = undefined;

  if (verbose) {
    // log tasks' prompt
    console.log("Description prompt:", descriptionPrompt);
    console.log("Tag prompt:", tagPrompt);
  }

  return Promise.all([
    tasks.includes("description")
      ? getDescription({
          buffer,
          model,
          prompt: descriptionPrompt,
          providerArgs,
          providerModule,
          verbose,
          descriptionTags,
          existingTags,
          path: resolvedPath,
          file_id,
          repeat,
          provider, // Pass the provider name
        })
      : undefined,
    tasks.includes("tag") || tasks.includes("tags")
      ? getTags({
          buffer,
          model,
          prompt: tagPrompt,
          providerArgs,
          providerModule,
          tagTags,
          existingTags,
          additionalTags: undefined,
          path: resolvedPath,
          file_id,
          repeat,
          provider, // Pass the provider name
        })
      : undefined,
  ] as const);
}

/**
 * Displays the results without writing to file
 */
function displayResults(result: Record<string, unknown>, verbose: boolean) {
  console.log(JSON.stringify(result));
  if (verbose) console.log("Dry run - did not write to file");
}

/**
 * Writes the results to the file
 */
async function writeResults(
  result: Record<string, unknown>,
  resolvedPath: string,
  writeArguments: string[] | undefined,
  verbose: boolean,
) {
  if (Object.keys(result).length > 0) {
    await exiftool.write(resolvedPath, result, { writeArgs: writeArguments });
    if (verbose) console.log("Wrote description to file:", resolvedPath);
  } else if (verbose) {
    console.log("No new tags to write, skipping.");
  }
}

/**
 * Handles the results for a dry run (display only)
 */
function handleDryRun(result: Record<string, unknown>, verbose: boolean) {
  displayResults(result, verbose);
}

/**
 * Handles the results for a real run (write to file)
 */
async function handleFileWrite(
  result: Record<string, unknown>,
  resolvedPath: string,
  writeArguments: string[] | undefined,
  verbose: boolean,
) {
  await writeResults(result, resolvedPath, writeArguments, verbose);
}

export async function execute({
  tasks = ["description"],
  path: imagePath,
  provider,
  model,
  descriptionTags = [
    "XPComment",
    "Description",
    "ImageDescription",
    "Caption-Abstract",
  ],
  tagTags = ["Subject", "TagsList", "Keywords"],
  descriptionPrompt = getText("description-prompt-input") ??
    `Describe image in ${lang ? ISO6391.getName(lang) : "English"}`,
  tagPrompt = getText("tag-prompt-input") ??
    `Tag image in ${lang ? ISO6391.getName(lang) : "English"} words based on subject, object, event, place. Output format: <tag1>, <tag2>, <tag3>, <tag4>,  <tag5>,  ..., <tagN>`,
  verbose = false,
  dry = false,
  writeArgs,
  providerArgs,
  avoidOverwrite = false,
  repeat = 0,
}: {
  /**
   * Array of tasks to perform: 'description', 'tag'
   */
  tasks?: string[];
  /**
   * Path to the image file to process
   */
  path: string;
  /**
   * Name of the provider module to use for generating descriptions and tags
   */
  provider: string;
  /**
   * Optional model name to be used by the provider
   */
  model?: string;
  /**
   * List of EXIF tags to write the description to
   */
  descriptionTags?: DescriptionKey[];
  /**
   * List of EXIF tags to write the tags to
   */
  tagTags?: TagKey[];
  /**
   * Prompt to use for generating the description
   */
  descriptionPrompt?: string;
  /**
   * Prompt to use for generating the tags
   */
  tagPrompt?: string;
  /**
   * Enable verbose logging
   */
  verbose?: boolean;
  /**
   * Perform a dry run without writing to the file
   */
  dry?: boolean;
  /**
   * Additional arguments to pass to the exiftool write function
   */
  writeArgs?: string[];
  /**
   * Additional arguments to pass to the provider module
   */
  providerArgs?: string[];
  /**
   * Avoid overwriting existing tags
   */
  avoidOverwrite?: boolean;

  /**
   * Number of times to repeat the task if it does not return acceptable results
   */
  repeat?: number;
}) {
  if (["description", "tag", "tags"].every((t) => !tasks.includes(t))) return;

  const resolvedPath = path.resolve(imagePath);

  try {
    // Read the file once to get the buffer and existing tags
    const buffer = await readFile(resolvedPath);

    if (verbose) console.log("Read file from", resolvedPath);

    // Check existing EXIF tags only if avoidOverwrite is true
    const existingTags = avoidOverwrite
      ? await exiftool.read(resolvedPath)
      : undefined;

    // Import AI SDK provider module
    const providerModule = await importProviderModule(provider, verbose);
    if (!providerModule) return;

    const [description, tags] = await processImage({
      tasks,
      buffer,
      resolvedPath,
      model,
      descriptionPrompt,
      tagPrompt,
      providerArgs,
      providerModule,
      verbose,
      descriptionTags,
      tagTags,
      existingTags,
      repeat,
      provider,
    });

    const result = {
      ...description,
      ...tags,
    };

    if (dry) {
      handleDryRun(result, verbose);
    } else {
      await handleFileWrite(result, resolvedPath, writeArgs, verbose);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Ensure ExifTool session is closed properly
    await exiftool.end();
  }
}
