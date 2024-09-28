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
import { getFaces } from "./tasks/face.js";
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
  doNotEndExifTool = false,
  faceGroupIds = [],
  repeat = 0,
}: {
  /**
   * Array of tasks to perform: 'description', 'tag', 'face'
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
   * Do not end the ExifTool session after execution
   */
  doNotEndExifTool?: boolean;
  /**
   * Array of face group IDs to use for face recognition
   */
  faceGroupIds?: string[];
  /**
   * Number of times to repeat the task if it does not return acceptable results
   */
  repeat?: number;
}) {
  if (["description", "tag", "tags", "face"].every((t) => !tasks.includes(t)))
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

    const faces = tasks.includes("face")
      ? await getFaces({
          buffer,
          verbose,
          faceGroupIds,
        })
      : undefined;

    let file_id: string | undefined;

    if ("uploadFile" in providerModule) {
      if (verbose) console.log("Uploading file to provider");
      const { id } = await providerModule.uploadFile({
        path,
        buffer,
      });

      file_id = id;
    }

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
            additionalTags: faces,
            path: resolvedPath,
            file_id,
            repeat,
          })
        : tasks.includes("face")
          ? getTags({
              buffer,
              model,
              prompt: tagPrompt,
              providerArgs,
              tagTags,
              existingTags,
              additionalTags: faces,
              path: resolvedPath,
              file_id,
              repeat,
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
    if (doNotEndExifTool) return;
    // Ensure ExifTool session is closed properly
    await exiftool.end();
  }
}
