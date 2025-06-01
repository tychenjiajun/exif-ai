#!/usr/bin/env node
import { env } from "node:process";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import OpenAI from "openai";

// Helper function to resize images to appropriate sizes for different providers
async function sizeHandle(
  buffer: Buffer,
  quality = 100,
  drop = 2,
  maxSize = 10_000_000, // Default max size (10MB)
  maxDimension = 2000, // Default max dimension
): Promise<Buffer> {
  const sharpInstance = await sharp(buffer);
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
        ...(width > height ? { width: maxDimension } : { height: maxDimension }),
        withoutEnlargement: true,
      })
      .jpeg({
        quality,
      })
      .toBuffer();
  }

  return done;
}

// Get the appropriate provider based on the provider name
function getProvider(provider: string) {
  // Create a unified OpenAI client that can be configured for different providers
  switch (provider.toLowerCase()) {
    case "openai":
      return new OpenAI({
        apiKey: env.OPENAI_API_KEY as string,
        baseURL: env.OPENAI_BASE_URL,
      });
    case "google":
      // For Google, we'll use the OpenAI client with Google's API
      return new OpenAI({
        apiKey: (env.API_KEY || env.GOOGLE_API_KEY) as string,
        baseURL: "https://generativelanguage.googleapis.com/v1",
      });
    case "anthropic":
      // For Anthropic, we'll use the OpenAI client with Anthropic's API
      return new OpenAI({
        apiKey: env.ANTHROPIC_API_KEY as string,
        baseURL: "https://api.anthropic.com/v1",
      });
    case "mistral":
      // For Mistral, we'll use the OpenAI client with Mistral's API
      return new OpenAI({
        apiKey: env.MISTRAL_API_KEY as string,
        baseURL: "https://api.mistral.ai/v1",
      });
    case "ollama":
      // For Ollama, we'll use the OpenAI client with Ollama's API
      return new OpenAI({
        baseURL: env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
      });
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

// Get the appropriate max size and dimension based on the provider
function getProviderLimits(provider: string): { maxSize: number; maxDimension: number } {
  switch (provider.toLowerCase()) {
    case "google":
      return { maxSize: 18_000_000, maxDimension: 6000 }; // Google has higher limits
    case "openai":
    default:
      return { maxSize: 10_000_000, maxDimension: 2000 };
  }
}

export async function getDescription({
  buffer,
  model = "gpt-4-vision-preview", // Default model
  prompt = "Please describe this image.",
  provider = "openai", // Default provider
  providerArgs = [],
}: {
  buffer: Buffer;
  model?: string;
  prompt?: string;
  provider?: string;
  providerArgs?: string[];
}) {
  try {
    // Get provider-specific limits
    const { maxSize, maxDimension } = getProviderLimits(provider);
    
    // Resize the image according to provider limits
    const handled = await sizeHandle(buffer, 100, 2, maxSize, maxDimension);
    
    // Get the appropriate provider
    const client = getProvider(provider);
    
    // Get the MIME type of the image
    const mimeType = (await fileTypeFromBuffer(handled))?.mime ?? "image/jpeg";
    
    // Convert the image to base64
    const base64Image = handled.toString("base64");
    
    // Create the message content based on the provider
    let messages = [];
    
    if (provider.toLowerCase() === "openai" || provider.toLowerCase() === "ollama") {
      messages = [
        {
          role: "user" as const,
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ];
    } else if (provider.toLowerCase() === "google") {
      messages = [
        {
          role: "user" as const,
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ];
    } else {
      // For other providers that might not support images directly
      throw new Error(`Provider ${provider} does not support image processing`);
    }

    const result = await client.chat.completions.create({
      model: model,
      messages: messages,
    });

    return result.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("An error occurred while getting the description:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export async function getTags({
  buffer,
  model = "gpt-4-vision-preview", // Default model
  prompt = "Please tag this image with relevant keywords. Output format: <tag1>, <tag2>, <tag3>, ...",
  provider = "openai", // Default provider
  providerArgs = [],
}: {
  buffer: Buffer;
  model?: string;
  prompt?: string;
  provider?: string;
  providerArgs?: string[];
}) {
  try {
    // Get provider-specific limits
    const { maxSize, maxDimension } = getProviderLimits(provider);
    
    // Resize the image according to provider limits
    const handled = await sizeHandle(buffer, 100, 2, maxSize, maxDimension);
    
    // Get the appropriate provider
    const client = getProvider(provider);
    
    // Get the MIME type of the image
    const mimeType = (await fileTypeFromBuffer(handled))?.mime ?? "image/jpeg";
    
    // Convert the image to base64
    const base64Image = handled.toString("base64");
    
    // Create the message content based on the provider
    let messages = [];
    
    if (provider.toLowerCase() === "openai" || provider.toLowerCase() === "ollama") {
      messages = [
        {
          role: "user" as const,
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ];
    } else if (provider.toLowerCase() === "google") {
      messages = [
        {
          role: "user" as const,
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ];
    } else {
      // For other providers that might not support images directly
      throw new Error(`Provider ${provider} does not support image processing`);
    }

    const result = await client.chat.completions.create({
      model: model,
      messages: messages,
    });

    return result.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("An error occurred while getting the tags:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}