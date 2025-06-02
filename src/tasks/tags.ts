import { Tags } from "exiftool-vendored";
import { objectFromEntries } from "ts-extras";

type TagKey1 = keyof {
  [K in keyof Tags as Tags[K] extends string | undefined ? K : never]: Tags[K];
};

type TagKey2 = keyof {
  [K in keyof Tags as Tags[K] extends string | string[] | undefined
    ? K
    : never]: Tags[K];
};

export type TagKey = Exclude<TagKey2, TagKey1>;

/**
 * Determines the appropriate comma separator based on the content
 */
function determineCommaSeparator(text: string): string {
  if (text.includes("，")) {
    return "，";
  }
  if (text.includes(",")) {
    return ",";
  }
  return "\n";
}

/**
 * Counts the number of spaces in a string
 */
function countSpaces(text: string): number {
  return (text.match(/\s/g) ?? []).length;
}

function formatTags(tags: string | string[] | undefined): string[] {
  if (typeof tags !== "string") {
    return tags ?? [];
  }

  // Split the text by newlines first to avoid regex backtracking issues
  const lines = tags.split(/[\n\r]+/);
  const numberedLines = lines.filter((line) => /^\d+/.test(line));
  const hasMultipleNumberedLines = numberedLines.length > 1;

  if (hasMultipleNumberedLines) {
    return numberedLines.map((s) => {
      return s
        .replaceAll(/tag\d+/g, "")
        .replaceAll(/[[\].{}<>/*'"()。]/g, "")
        .replace(/^\d+/, "") // Remove leading digits
        .replaceAll(/[：:]*/g, "")
        .trim();
    });
  }

  const cleanedTags = tags
    .replaceAll(/tag\d+/g, "")
    .replaceAll(/[[\].{}<>/*'"()。]/g, "");

  // Determine separators
  const colonSeparator = cleanedTags.includes("：") ? "：" : ":";
  const commaSeparator = determineCommaSeparator(cleanedTags);

  return (
    cleanedTags
      .split(colonSeparator)
      .at(-1)
      ?.split(commaSeparator)
      .map((s) =>
        s
          .trim()
          .replaceAll(/\n$/g, "")
          .replaceAll(/^\d+\s+/g, "")
          .replaceAll(/[：:]*/g, ""),
      )
      .filter((s) => s.length > 0 && s !== "\n" && countSpaces(s) <= 1) ?? []
  );
}

/**
 * Fetches tags from the provider
 */
async function fetchTags({
  module,
  buffer,
  model,
  prompt,
  providerArgs,
  path,
  file_id,
  provider,
  verbose,
  repeat = 0,
}: {
  module: { getTags?: (arguments_: unknown) => Promise<string | string[]> };
  buffer: Buffer;
  model?: string;
  prompt: string;
  providerArgs?: string[];
  path: string;
  file_id?: string;
  provider?: string;
  verbose: boolean;
  repeat?: number;
}): Promise<string[]> {
  let tags: string[] = [];

  for (let index = 0; index < repeat + 1; index++) {
    try {
      const result = await module.getTags?.({
        buffer,
        model,
        prompt,
        providerArgs,
        path,
        file_id,
        provider, // Pass the provider name to the AI SDK
      });
      tags = formatTags(result);
    } catch (error) {
      if (verbose) console.error("Failed to get tags from provider:", error);
    }
    if (tags.length > 1) break;
  }

  return tags;
}

/**
 * Creates a record of tag entries
 */
function createTagsRecord(
  formatted: string[],
  tagTags: readonly TagKey[],
  existingTags?: Readonly<Tags>,
): Record<TagKey, string[]> {
  if (formatted.length === 0) {
    return {} as Record<TagKey, string[]>;
  }

  if (!existingTags) {
    return objectFromEntries(tagTags.map((key) => [key, formatted]));
  }

  return objectFromEntries(
    tagTags.map((key) => {
      const existingTag = existingTags[key];
      let combinedTags: string[];

      if (existingTag == null) {
        combinedTags = formatted;
      } else if (Array.isArray(existingTag)) {
        combinedTags = existingTag.concat(formatted);
      } else {
        combinedTags = formatted.concat(existingTag.trim());
      }

      return [key, Array.from(new Set(combinedTags))];
    }),
  );
}

export async function getTags({
  buffer,
  model,
  prompt,
  providerModule,
  providerArgs,
  verbose = false,
  tagTags,
  existingTags,
  additionalTags,
  path,
  file_id,
  repeat,
  provider,
}: {
  buffer: Buffer;
  model?: string;
  prompt: string;
  providerModule?: unknown;
  providerArgs?: string[];
  verbose?: boolean;
  tagTags: readonly TagKey[];
  existingTags?: Readonly<Tags>;
  additionalTags?: readonly string[];
  path: string;
  file_id?: string;
  repeat?: number;
  provider?: string;
}) {
  // Get tags from provider
  let tags: string[] = [];

  if (providerModule && typeof providerModule === "object") {
    const module = providerModule as {
      getTags?: (arguments_: unknown) => Promise<string | string[]>;
    };

    tags = await fetchTags({
      module,
      buffer,
      model,
      prompt,
      providerArgs,
      path,
      file_id,
      provider,
      verbose,
      repeat,
    });
  }

  const formatted = tags.concat(additionalTags ?? []);

  if (verbose) console.log("Tags are:", formatted);

  return createTagsRecord(formatted, tagTags, existingTags);
}
