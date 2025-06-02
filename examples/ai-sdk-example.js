#!/usr/bin/env node

/**
 * Example script demonstrating the improved Vercel AI SDK integration
 *
 * This script shows how to use the enhanced AI functionality with multiple providers.
 *
 * Usage:
 * 1. Set up environment variables for your preferred provider:
 *    - OPENAI_API_KEY for OpenAI
 *    - GOOGLE_API_KEY for Google Gemini
 *    - ANTHROPIC_API_KEY for Anthropic Claude
 *    - MISTRAL_API_KEY for Mistral
 *    - OLLAMA_BASE_URL for Ollama (defaults to http://localhost:11434/v1)
 *
 * 2. Run the script:
 *    node examples/ai-sdk-example.js path/to/image.jpg [provider] [model]
 *
 * Examples:
 *    node examples/ai-sdk-example.js image.jpg openai gpt-4o
 *    node examples/ai-sdk-example.js image.jpg google gemini-1.5-pro
 *    node examples/ai-sdk-example.js image.jpg anthropic claude-3-5-sonnet-20241022
 *    node examples/ai-sdk-example.js image.jpg mistral mistral-large-latest
 *    node examples/ai-sdk-example.js image.jpg ollama llama3.2-vision
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { getDescription, getTags } from "../dist/provider/ai-sdk.js";

async function main() {
  const arguments_ = globalThis.process.argv;
  const imagePath = arguments_[2];
  const provider = arguments_[3] ?? "openai";
  const model = arguments_[4];

  if (!imagePath) {
    globalThis.console.error(
      "Usage: node examples/ai-sdk-example.js <image-path> [provider] [model]",
    );
    globalThis.console.error("");
    globalThis.console.error(
      "Supported providers: openai, google, anthropic, mistral, ollama",
    );
    globalThis.console.error("");
    globalThis.console.error("Examples:");
    globalThis.console.error(
      "  node examples/ai-sdk-example.js image.jpg openai gpt-4o",
    );
    globalThis.console.error(
      "  node examples/ai-sdk-example.js image.jpg google gemini-1.5-pro",
    );
    globalThis.console.error(
      "  node examples/ai-sdk-example.js image.jpg anthropic claude-3-5-sonnet-20241022",
    );
    globalThis.process.exit(1);
  }

  try {
    globalThis.console.log(`🖼️  Processing image: ${imagePath}`);
    const modelInfo = model ? ` (${model})` : "";
    globalThis.console.log(`🤖 Using provider: ${provider}${modelInfo}`);
    globalThis.console.log("");

    // Read the image file
    const resolvedPath = path.resolve(imagePath);
    const buffer = await readFile(resolvedPath);

    globalThis.console.log("📝 Generating description...");
    const description = await getDescription({
      buffer,
      model,
      prompt: "Please provide a detailed description of this image.",
      provider,
    });

    globalThis.console.log("🏷️  Generating tags...");
    const tags = await getTags({
      buffer,
      model,
      prompt:
        "Please generate relevant tags for this image. Output format: <tag1>, <tag2>, <tag3>, ...",
      provider,
    });

    globalThis.console.log("");
    globalThis.console.log("✅ Results:");
    globalThis.console.log("");
    globalThis.console.log("📝 Description:");
    globalThis.console.log(description);
    globalThis.console.log("");
    globalThis.console.log("🏷️  Tags:");
    globalThis.console.log(tags);
  } catch (error) {
    globalThis.console.error("❌ Error:", error.message);

    if (error.message.includes("API key")) {
      globalThis.console.error("");
      globalThis.console.error(
        "💡 Make sure to set the appropriate environment variable:",
      );
      globalThis.console.error("   - OPENAI_API_KEY for OpenAI");
      globalThis.console.error("   - GOOGLE_API_KEY for Google Gemini");
      globalThis.console.error("   - ANTHROPIC_API_KEY for Anthropic Claude");
      globalThis.console.error("   - MISTRAL_API_KEY for Mistral");
      globalThis.console.error(
        "   - OLLAMA_BASE_URL for Ollama (optional, defaults to localhost)",
      );
    }

    globalThis.process.exit(1);
  }
}

await main();
