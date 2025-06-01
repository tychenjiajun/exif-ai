import { Tags } from "exiftool-vendored";
import { objectFromEntries } from "ts-extras";

export type DescriptionKey = keyof {
  [K in keyof Tags as Tags[K] extends string | undefined ? K : never]: Tags[K];
};

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
  providerModule: any;
  descriptionTags: Readonly<DescriptionKey[]>;
  verbose?: boolean;
  existingTags?: Readonly<Tags>;
  path: string;
  file_id?: string;
  repeat?: number;
  provider?: string;
}) {
  // Get description from provider
  let description: string | undefined;

  if (providerModule) {
    for (let i = 0; i < (repeat ?? 0) + 1; i++) {
      try {
        description = await providerModule.getDescription?.({
          buffer,
          model,
          prompt: prompt,
          providerArgs,
          path,
          file_id,
          provider, // Pass the provider name to the AI SDK
        });
      } catch (error) {
        if (verbose)
          console.error("Failed to get description from provider:", error);
      }
      if (description && description.trim().length > 10 && !/[*#>`]/.test(description)) {
        description = description.trim().replaceAll(/\n/g, "");
        break;
      }
    }
  }

  if (verbose) console.log("Description is:", description);

  return description
    ? existingTags
      ? objectFromEntries(
          descriptionTags
            .filter((d) => {
              const existingTag = existingTags[d];
              if (typeof existingTag === "string") {
                return existingTag?.trim().length === 0;
              }
              return false;
            })
            .map((d) => {
              return [d, description] as const;
            }),
        )
      : objectFromEntries(
          descriptionTags.map((d) => {
            return [d, description] as const;
          }),
        )
    : ({} as Record<DescriptionKey, string>);
}
