import { readFile } from "node:fs/promises";
import { exiftool } from "exiftool-vendored";
import { resolve } from "node:path";
import { env } from "node:process";
import ISO6391 from "iso-639-1";
// @ts-ignore
import xhr2 from "xhr2";

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
  !globalThis.fetch ||
  env.https_proxy ||
  env.HTTPS_PROXY ||
  env.http_proxy ||
  env.HTTP_PROXY
) {
  // @ts-ignore
  globalThis.fetch = function (
    url: URL | RequestInfo,
    init?: RequestInit,
  ): Promise<Response> {
    const agentObject = env.https_proxy
      ? { agent: new HttpsProxyAgent(env.https_proxy) }
      : env.HTTPS_PROXY
        ? { agent: new HttpsProxyAgent(env.HTTPS_PROXY) }
        : env.http_proxy
          ? { agent: new HttpsProxyAgent(env.http_proxy) }
          : env.HTTP_PROXY
            ? { agent: new HttpsProxyAgent(env.HTTP_PROXY) }
            : undefined;

    return fetch(url, agentObject ? { ...init, ...agentObject } : init);
  };
  // @ts-ignore
  globalThis.Headers = Headers;
  // @ts-ignore
  globalThis.Request = Request;
  // @ts-ignore
  globalThis.Response = Response;
}

if (global.XMLHttpRequest == null) global.XMLHttpRequest = xhr2;

const lang = env.LANG?.slice(0, 2);

export async function execute({
  tasks = ["description"],
  path,
  provider,
  model,
  descriptionTags = [
    "XPComment",
    "Description",
    "ImageDescription",
    "Caption-Abstract",
  ],
  tagTags = ["Subject", "TagsList", "Keywords"],
  descriptionPrompt = getText('description-prompt-input') ?? `Describe image in ${lang ? (ISO6391.getName(lang) ?? "English") : "English"}`,
  tagPrompt = getText('tag-prompt-input') ?? `Tag image in ${lang ? (ISO6391.getName(lang) ?? "English") : "English"} words based on subject, object, event, place. Output format: <tag1>, <tag2>, <tag3>, <tag4>,  <tag5>,  ..., <tagN>`,
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
  if (["description", "tag", "tags"].every((t) => !tasks.includes(t)))
    return;

  const resolvedPath = resolve(path);

  try {
    // Read the file once to get the buffer and existing tags
    const buffer = await readFile(resolvedPath);

    if (verbose) console.log("Read file from", resolvedPath);

    // Check existing EXIF tags only if avoidOverwrite is true
    const existingTags = avoidOverwrite
      ? await exiftool.read(resolvedPath)
      : undefined;

    // Import AI SDK provider module
    let providerModule;
    try {
      providerModule = await import(`./provider/ai-sdk.js`);
      if (verbose) console.log("Using AI SDK with provider:", provider);
    } catch (error) {
      console.error("Failed to import AI SDK provider module", error);
      return;
    }
    if (providerModule == null) {
      console.error("Import AI SDK provider failed");
      return;
    }

    // AI SDK doesn't use file_id
    let file_id: string | undefined;

    if (verbose) {
      // log tasks' prompt
      console.log("Description prompt:", descriptionPrompt);
      console.log("Tag prompt:", tagPrompt);
    }

    const [description, tags] = await Promise.all([
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

    const result = {
      ...description,
      ...tags,
    };

    if (dry) {
      console.log(JSON.stringify(result));
      if (verbose) console.log("Dry run - did not write to file");
    } else {
      if (Object.keys(result).length > 0) {
        await exiftool.write(resolvedPath, result, { writeArgs });
        if (verbose) console.log("Wrote description to file:", resolvedPath);
      } else {
        if (verbose) console.log("No new tags to write, skipping.");
      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Ensure ExifTool session is closed properly
    await exiftool.end();
  }
}
