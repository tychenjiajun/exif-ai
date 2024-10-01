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

function formatTags(tags: string | string[] | undefined): string[] {
  const result =
    typeof tags === "string"
      ? Number(tags.match(/[0-9]+.*\n/g)?.length) > 1
        ? (tags.match(/[0-9]+.*\n/g)?.map((s) => {
            return s
              .replaceAll(/tag[0-9]+/g, "")
              .replaceAll(/[\[\]\.{}<>/*'"()。]/g, "")
              .replace(/\n$/g, "")
              .replace(/[0-9]+(.*)/g, "$1")
              .replace(/[：:]*/g, "")
              .trim();
          }) ?? [])
        : (tags
            .replaceAll(/tag[0-9]+/g, "")
            .replaceAll(/[\[\]\.{}<>/*'"()。]/g, "")
            .split(tags.includes("：") ? "：" : ":")
            .at(-1)
            ?.split(
              tags.includes("，") ? "，" : tags.includes(",") ? "," : "\n",
            )
            .map((s) =>
              s
                .trim()
                .replace(/\n$/g, "")
                .replace(/[0-9]+[ ]+(.*)/g, "$1")
                .replace(/[：:]*/g, ""),
            )
            .filter(
              (s) =>
                s.length > 0 && [...s.matchAll(/ /g)].length <= 1 && s !== "\n",
            ) ?? [])
      : (tags ?? []);

  // if (result.length === 1) {
  //   return result.flatMap(r => formatTags(r));
  // }
  return result;
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
}: {
  buffer: Buffer;
  model?: string;
  prompt: string;
  providerModule?: any;
  providerArgs?: string[];
  verbose?: boolean;
  tagTags: Readonly<TagKey[]>;
  existingTags?: Readonly<Tags>;
  additionalTags?: Readonly<string[]>;
  path: string;
  file_id?: string;
  repeat?: number;
}) {
  // Get tags from provider
  let tags: string[] = [];

  if (providerModule) {
    for (let i = 0; i < (repeat ?? 0) + 1; i++) {
      try {
        tags = formatTags(
          await providerModule.getTags?.({
            buffer,
            model,
            prompt: prompt,
            providerArgs,
            path,
            file_id,
          }),
        );
      } catch (error) {
        if (verbose) console.error("Failed to get tags from provider:", error);
      }
      if (tags.length > 1) break;
    }
  }

  const formatted = tags?.concat(additionalTags ?? []);

  if (verbose) console.log("Tags are:", formatted);

  return formatted == null || formatted.length === 0
    ? ({} as Record<TagKey, string[]>)
    : existingTags
      ? objectFromEntries(
          tagTags.map((key) => {
            const existingTag = existingTags[key];
            return [
              key,
              Array.from(
                new Set(
                  existingTag == null
                    ? formatted
                    : Array.isArray(existingTag)
                      ? existingTag.concat(formatted)
                      : formatted.concat(existingTag.trim()),
                ),
              ),
            ];
          }),
        )
      : objectFromEntries(tagTags.map((key) => [key, formatted]));
}
