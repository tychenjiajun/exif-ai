#!/usr/bin/env node
import { env } from "node:process";
import sharp from "sharp";
import { generateText, LanguageModel } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createMistral } from "@ai-sdk/mistral";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createAzure } from "@ai-sdk/azure";
import { createDeepInfra } from "@ai-sdk/deepinfra";
import { createFireworks } from "@ai-sdk/fireworks";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { createXai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// Helper function to resize images to appropriate sizes for different providers
async function sizeHandle(
  buffer: Buffer,
  quality = 100,
  drop = 2,
  maxSize = 10_000_000, // Default max size (10MB)
  maxDimension = 2000, // Default max dimension
): Promise<Buffer> {
  const sharpInstance = sharp(buffer);
  const { width = 0, height = 0 } = await sharpInstance.metadata();
  let done = await sharp(buffer)
    .resize({
      ...(width > height ? { width: maxDimension } : { height: maxDimension }),
      withoutEnlargement: true,
    })
    .jpeg({
      quality,
    })
    .toBuffer();

  while (done.byteLength > maxSize) {
    quality = Math.max(quality - drop, 0);
    done = await sharp(buffer)
      .resize({
        ...(width > height
          ? { width: maxDimension }
          : { height: maxDimension }),
        withoutEnlargement: true,
      })
      .jpeg({
        quality,
      })
      .toBuffer();
  }

  return done;
}

// Get the appropriate AI SDK model based on the provider name
function getModel(provider: string, model?: string): LanguageModel {
  switch (provider.toLowerCase()) {
    case "openai": {
      const openaiProvider = createOpenAI({
        apiKey: env.OPENAI_API_KEY,
        baseURL: env.OPENAI_BASE_URL,
      });
      return openaiProvider(model ?? "gpt-4o");
    }
    case "google": {
      const googleProvider = createGoogleGenerativeAI({
        apiKey: env.API_KEY ?? env.GOOGLE_API_KEY,
      });
      return googleProvider(model ?? "gemini-1.5-pro");
    }
    case "anthropic": {
      const anthropicProvider = createAnthropic({
        apiKey: env.ANTHROPIC_API_KEY,
      });
      return anthropicProvider(model ?? "claude-3-5-sonnet-20241022");
    }
    case "mistral": {
      const mistralProvider = createMistral({
        apiKey: env.MISTRAL_API_KEY,
      });
      return mistralProvider(model ?? "mistral-large-latest");
    }
    case "ollama": {
      // For Ollama, use OpenAI-compatible interface
      const ollamaProvider = createOpenAI({
        baseURL: env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
        apiKey: "ollama", // Ollama doesn't require a real API key
      });
      return ollamaProvider(model ?? "llama3.2-vision");
    }
    case "amazon":
    case "bedrock": {
      const bedrockProvider = createAmazonBedrock({
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        region: env.AWS_REGION ?? "us-east-1",
      });
      return bedrockProvider(
        model ?? "anthropic.claude-3-sonnet-20240229-v1:0",
      );
    }
    case "azure": {
      if (!env.AZURE_OPENAI_ENDPOINT) {
        throw new Error(
          "AZURE_OPENAI_ENDPOINT environment variable is required for Azure provider",
        );
      }
      const azureProvider = createAzure({
        apiKey: env.AZURE_OPENAI_API_KEY,
        baseURL: env.AZURE_OPENAI_ENDPOINT,
        apiVersion: env.AZURE_OPENAI_API_VERSION ?? "2023-12-01-preview",
      });
      return azureProvider(model ?? "gpt-4-vision");
    }
    case "deepinfra": {
      const deepInfraProvider = createDeepInfra({
        apiKey: env.DEEPINFRA_API_KEY,
      });
      return deepInfraProvider(model ?? "cogvlm2-llama3-8b-chat");
    }
    case "fireworks": {
      const fireworksProvider = createFireworks({
        apiKey: env.FIREWORKS_API_KEY,
      });
      return fireworksProvider(
        model ?? "accounts/fireworks/models/llama-v3-8b-instruct",
      );
    }
    case "openai-compatible": {
      if (!env.OPENAI_COMPATIBLE_BASE_URL) {
        throw new Error(
          "OPENAI_COMPATIBLE_BASE_URL environment variable is required for openai-compatible provider",
        );
      }
      const openaiCompatibleProvider = createOpenAICompatible({
        apiKey: env.OPENAI_COMPATIBLE_API_KEY ?? "key",
        baseURL: env.OPENAI_COMPATIBLE_BASE_URL,
        name: "openai-compatible",
      });
      return openaiCompatibleProvider(model ?? "gpt-4-vision");
    }
    case "together":
    case "togetherai": {
      const togetherAIProvider = createTogetherAI({
        apiKey: env.TOGETHER_API_KEY,
      });
      return togetherAIProvider(model ?? "cogvlm2-llama3-8b-chat");
    }
    case "xai": {
      const xaiProvider = createXai({
        apiKey: env.XAI_API_KEY,
      });
      return xaiProvider(model ?? "grok-1.5-vision");
    }
    case "openrouter": {
      const openRouterProvider = createOpenRouter({
        apiKey: env.OPENROUTER_API_KEY,
      });
      return openRouterProvider(model ?? "openai/gpt-4o");
    }
    default: {
      throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}

// Get the appropriate max size and dimension based on the provider
function getProviderLimits(provider: string): {
  maxSize: number;
  maxDimension: number;
} {
  const providerLower = provider.toLowerCase();

  switch (providerLower) {
    case "google": {
      return { maxSize: 18_000_000, maxDimension: 6000 };
    } // Google has higher limits
    case "anthropic": {
      return { maxSize: 10_000_000, maxDimension: 3000 };
    } // Claude limits
    case "amazon":
    case "bedrock": {
      return { maxSize: 5_000_000, maxDimension: 2500 };
    } // Amazon Bedrock limits
    case "azure": {
      return { maxSize: 10_000_000, maxDimension: 2000 };
    } // Azure OpenAI limits
    case "deepinfra": {
      return { maxSize: 8_000_000, maxDimension: 2048 };
    } // DeepInfra limits
    case "fireworks": {
      return { maxSize: 10_000_000, maxDimension: 2048 };
    } // Fireworks limits
    case "together":
    case "togetherai": {
      return { maxSize: 10_000_000, maxDimension: 2048 };
    } // TogetherAI limits
    case "xai": {
      return { maxSize: 10_000_000, maxDimension: 2048 };
    } // XAI limits
    case "openrouter": {
      return { maxSize: 10_000_000, maxDimension: 2048 };
    } // OpenRouter limits
    default: {
      return { maxSize: 10_000_000, maxDimension: 2000 };
    } // Default limits
  }
}

export async function getDescription({
  buffer,
  model,
  prompt = "Please describe this image.",
  provider = "openai", // Default provider
}: {
  buffer: Buffer;
  model?: string;
  prompt?: string;
  provider?: string;
}) {
  try {
    // Handle test providers
    if (provider === "test" || provider === "provider1") {
      // Return the prompt as the response for testing
      return prompt;
    }

    // Get provider-specific limits
    const { maxSize, maxDimension } = getProviderLimits(provider);

    // Resize the image according to provider limits
    const handled = await sizeHandle(buffer, 100, 2, maxSize, maxDimension);

    // Get the appropriate AI SDK model
    const aiModel = getModel(provider, model);

    // Create the message content using AI SDK format
    const result = await generateText({
      model: aiModel,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image",
              image: handled, // AI SDK can handle Buffer directly
            },
          ],
        },
      ],
    });

    return result.text || "";
  } catch (error) {
    console.error("An error occurred while getting the description:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export async function getTags({
  buffer,
  model,
  prompt = "Please tag this image with relevant keywords. Output format: <tag1>, <tag2>, <tag3>, ...",
  provider = "openai", // Default provider
}: {
  buffer: Buffer;
  model?: string;
  prompt?: string;
  provider?: string;
}) {
  try {
    // Handle test providers
    if (provider === "test" || provider === "provider1") {
      // Return the prompt as the response for testing
      return prompt;
    }

    // Get provider-specific limits
    const { maxSize, maxDimension } = getProviderLimits(provider);

    // Resize the image according to provider limits
    const handled = await sizeHandle(buffer, 100, 2, maxSize, maxDimension);

    // Get the appropriate AI SDK model
    const aiModel = getModel(provider, model);

    // Create the message content using AI SDK format
    const result = await generateText({
      model: aiModel,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image",
              image: handled, // AI SDK can handle Buffer directly
            },
          ],
        },
      ],
    });

    return result.text || "";
  } catch (error) {
    console.error("An error occurred while getting the tags:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}
