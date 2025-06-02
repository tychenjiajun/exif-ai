import { execute as executeCore } from "./index.js";
import { DescriptionKey } from "./tasks/description.js";
import { TagKey } from "./tasks/tags.js";

/**
 * Configuration for AI providers
 */
export interface AIConfig {
  /** AI provider name */
  provider: string;
  /** AI model (optional, uses provider default) */
  model?: string;
  /** Custom description prompt */
  descriptionPrompt?: string;
  /** Custom tag prompt */
  tagPrompt?: string;
  /** Additional provider arguments */
  args?: string[];
}

/**
 * Configuration for EXIF metadata
 */
export interface ExifConfig {
  /** EXIF tags for descriptions */
  descriptionTags?: DescriptionKey[];
  /** EXIF tags for tags */
  tagTags?: TagKey[];
  /** Additional ExifTool arguments */
  args?: string[];
}

/**
 * Task types that can be performed
 */
export type TaskType = "description" | "tag" | "tags";

/**
 * Processing options
 */
export interface ProcessingOptions {
  /** Tasks to perform */
  tasks?: TaskType[];
  /** Preview mode - don't write to file */
  preview?: boolean;
  /** Skip if tags already exist */
  skipExisting?: boolean;
  /** Number of retry attempts */
  retries?: number;
  /** Enable verbose output */
  verbose?: boolean;
}

/**
 * Complete configuration for exif-ai
 */
export interface ExifAIConfig {
  /** Path to image file */
  image: string;
  /** AI configuration */
  ai: AIConfig;
  /** EXIF configuration (optional) */
  exif?: ExifConfig;
  /** Processing options (optional) */
  options?: ProcessingOptions;
}

/**
 * Simplified configuration for common use cases
 */
export interface SimpleConfig {
  /** Path to image file */
  image: string;
  /** AI provider */
  provider: string;
  /** AI model (optional) */
  model?: string;
  /** Tasks to perform (default: ["description", "tag"]) */
  tasks?: TaskType[];
  /** Custom description prompt */
  descriptionPrompt?: string;
  /** Custom tag prompt */
  tagPrompt?: string;
  /** Preview mode */
  preview?: boolean;
  /** Verbose output */
  verbose?: boolean;
}

/**
 * Builder class for fluent API
 */
export class ExifAI {
  private config: ExifAIConfig;

  constructor(image: string) {
    this.config = {
      image,
      ai: { provider: "" },
    };
  }

  /**
   * Set AI provider
   */
  provider(provider: string): this {
    this.config.ai.provider = provider;
    return this;
  }

  /**
   * Set AI model
   */
  model(model: string): this {
    this.config.ai.model = model;
    return this;
  }

  /**
   * Set tasks to perform
   */
  tasks(...tasks: TaskType[]): this {
    this.config.options ??= {};
    this.config.options.tasks = tasks;
    return this;
  }

  /**
   * Set description prompt
   */
  descriptionPrompt(prompt: string): this {
    this.config.ai.descriptionPrompt = prompt;
    return this;
  }

  /**
   * Set tag prompt
   */
  tagPrompt(prompt: string): this {
    this.config.ai.tagPrompt = prompt;
    return this;
  }

  /**
   * Enable preview mode
   */
  preview(): this {
    this.config.options ??= {};
    this.config.options.preview = true;
    return this;
  }

  /**
   * Enable verbose output
   */
  verbose(): this {
    this.config.options ??= {};
    this.config.options.verbose = true;
    return this;
  }

  /**
   * Skip if tags already exist
   */
  skipExisting(): this {
    this.config.options ??= {};
    this.config.options.skipExisting = true;
    return this;
  }

  /**
   * Set retry attempts
   */
  retries(count: number): this {
    this.config.options ??= {};
    this.config.options.retries = count;
    return this;
  }

  /**
   * Set EXIF tags for descriptions
   */
  descriptionTags(...tags: DescriptionKey[]): this {
    this.config.exif ??= {};
    this.config.exif.descriptionTags = tags;
    return this;
  }

  /**
   * Set EXIF tags for tags
   */
  tagTags(...tags: TagKey[]): this {
    this.config.exif ??= {};
    this.config.exif.tagTags = tags;
    return this;
  }

  /**
   * Execute the processing
   */
  async run(): Promise<void> {
    if (!this.config.ai.provider) {
      throw new Error("AI provider is required");
    }

    const options = this.config.options ?? {};
    const exif = this.config.exif ?? {};

    await executeCore({
      path: this.config.image,
      provider: this.config.ai.provider,
      model: this.config.ai.model,
      tasks: options.tasks ?? ["description", "tag"],
      descriptionPrompt: this.config.ai.descriptionPrompt,
      tagPrompt: this.config.ai.tagPrompt,
      descriptionTags: exif.descriptionTags,
      tagTags: exif.tagTags,
      dry: options.preview ?? false,
      verbose: options.verbose ?? false,
      avoidOverwrite: options.skipExisting ?? false,
      repeat: options.retries ?? 0,
      writeArgs: exif.args,
      providerArgs: this.config.ai.args,
    });
  }
}

/**
 * Simple function for common use cases
 */
export async function processImage(config: SimpleConfig): Promise<void> {
  const builder = new ExifAI(config.image)
    .provider(config.provider)
    .tasks(...(config.tasks ?? ["description", "tag"]));

  if (config.model) builder.model(config.model);
  if (config.descriptionPrompt)
    builder.descriptionPrompt(config.descriptionPrompt);
  if (config.tagPrompt) builder.tagPrompt(config.tagPrompt);
  if (config.preview) builder.preview();
  if (config.verbose) builder.verbose();

  await builder.run();
}

/**
 * Advanced function with full configuration
 */
export async function processImageAdvanced(
  config: ExifAIConfig,
): Promise<void> {
  const builder = new ExifAI(config.image).provider(config.ai.provider);

  if (config.ai.model) builder.model(config.ai.model);
  if (config.ai.descriptionPrompt)
    builder.descriptionPrompt(config.ai.descriptionPrompt);
  if (config.ai.tagPrompt) builder.tagPrompt(config.ai.tagPrompt);

  const options = config.options ?? {};
  if (options.tasks) builder.tasks(...options.tasks);
  if (options.preview) builder.preview();
  if (options.verbose) builder.verbose();
  if (options.skipExisting) builder.skipExisting();
  if (options.retries) builder.retries(options.retries);

  const exif = config.exif ?? {};
  if (exif.descriptionTags) builder.descriptionTags(...exif.descriptionTags);
  if (exif.tagTags) builder.tagTags(...exif.tagTags);

  await builder.run();
}

// Note: The execute function is now exported directly from index.ts
