import { Tags } from "exiftool-vendored";
import { objectFromEntries } from "ts-extras";

export type DescriptionKey = keyof {
  [K in keyof Tags as Tags[K] extends string | undefined ? K : never]: Tags[K];
};

/**
 * Attempts to get a description from the provider
 */
async function fetchDescription({
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
  module: { getDescription?: (arguments_: unknown) => Promise<string> };
  buffer: Buffer;
  model?: string;
  prompt: string;
  providerArgs?: string[];
  path: string;
  file_id?: string;
  provider?: string;
  verbose: boolean;
  repeat?: number;
}): Promise<string | undefined> {
  let description: string | undefined;

  for (let index = 0; index < repeat + 1; index++) {
    try {
      const result = await module.getDescription?.({
        buffer,
        model,
        prompt,
        providerArgs,
        path,
        file_id,
        provider, // Pass the provider name to the AI SDK
      });
      description = result;
    } catch (error) {
      if (verbose) {
        console.error("Failed to get description from provider:", error);
      }
    }

    const isValidDescription =
      description &&
      description.trim().length > 10 &&
      !/[*#>`]/.test(description);

    if (isValidDescription && description) {
      return description.trim().replaceAll("\n", "");
    }
  }

  return undefined;
}

/**
 * Creates a record of description tags based on existing tags
 */
function createDescriptionRecord(
  description: string | undefined,
  descriptionTags: readonly DescriptionKey[],
  existingTags?: Readonly<Tags>,
): Record<DescriptionKey, string> {
  if (!description) {
    return {} as Record<DescriptionKey, string>;
  }

  if (!existingTags) {
    return objectFromEntries(
      descriptionTags.map((d) => [d, description] as const),
    );
  }

  return objectFromEntries(
    descriptionTags
      .filter((d) => {
        const existingTag = existingTags[d];
        return (
          typeof existingTag === "string" && existingTag.trim().length === 0
        );
      })
      .map((d) => [d, description] as const),
  );
}

export async function getDescription({
  buffer,
  model,
  prompt,
  providerArgs,
  providerModule,
  descriptionTags,
  verbose = false,
  existingTags,
  path,
  file_id,
  repeat,
  provider,
}: {
  buffer: Buffer;
  model?: string;
  prompt: string;
  providerArgs?: string[];
  providerModule: unknown;
  descriptionTags: readonly DescriptionKey[];
  verbose?: boolean;
  existingTags?: Readonly<Tags>;
  path: string;
  file_id?: string;
  repeat?: number;
  provider?: string;
}) {
  // Get description from provider
  let description: string | undefined;

  if (providerModule && typeof providerModule === "object") {
    const module = providerModule as {
      getDescription?: (arguments_: unknown) => Promise<string>;
    };

    description = await fetchDescription({
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

  if (verbose) console.log("Description is:", description);

  return createDescriptionRecord(description, descriptionTags, existingTags);
}
