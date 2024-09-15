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

function formatTags(tags: string | string[] | undefined) {
  return typeof tags === "string"
    ? tags
        .replaceAll(/tag[0-9]+/g, "")
        .replaceAll(/[\[\]\.{}<>/*'"()]/g, "")
        .split(tags.includes("：") ? "：" : ":")
        .at(-1)
        ?.split(tags.includes(",") ? "," : "\n")
        .map((s) =>
          s
            .trim()
            .replace(/\n$/g, "")
            .replace(/[0-9]+[ ]+(.*)/g, "$1"),
        )
        .filter(
          (s) =>
            s.length > 0 && [...s.matchAll(/ /g)].length <= 1 && s !== "\n",
        )
    : tags;
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
}: {
  buffer: Buffer;
  model?: string;
  prompt: string;
  providerModule: any;
  providerArgs?: string[];
  verbose?: boolean;
  tagTags: Readonly<TagKey[]>;
  existingTags?: Readonly<Tags>;
}) {
  // Get tags from provider
  let tags: string | string[] | undefined;

  try {
    tags = await providerModule.getTags?.({
      buffer,
      model,
      prompt: prompt,
      providerArgs,
    });
  } catch (error) {
    console.error("Failed to get tags from provider:", error);
    return;
  }

  const formatted = formatTags(tags);

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
