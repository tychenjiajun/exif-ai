# Exif AI

[![NPM Downloads](https://img.shields.io/npm/dw/exif-ai)](https://www.npmjs.com/package/exif-ai)

https://github.com/user-attachments/assets/a445d46a-0d3c-44a2-a42e-f98c23e9c1b4

_Read this in other languages:_
[_简体中文_](README.zh-CN.md)

## About

_Exif AI_ is a powerful CLI tool and library designed to write AI-generated image descriptions and/or tags directly into the metadata of image files. This tool leverages advanced AI models from multiple providers to analyze image content and generate descriptive metadata, enhancing the accessibility and searchability of your images.

Built with the [Vercel AI SDK](https://sdk.vercel.ai/), Exif AI supports 13+ AI providers including OpenAI, Google Gemini, Anthropic Claude, Mistral, Ollama, Amazon Bedrock, Azure OpenAI, and more.

## Quick Start

### CLI Usage

The CLI has been redesigned for better usability with intuitive commands and clear help text.

#### Basic Usage

```bash
# Without installation (using npx)
npx exif-ai image.jpg --provider ollama

# With global installation
exif-ai image.jpg --provider ollama
```

#### Common Examples

```bash
# Basic usage with Ollama (local, no API key needed)
exif-ai photo.jpg --provider ollama

# Use OpenAI with specific model
exif-ai photo.jpg --provider openai --model gpt-4o

# Generate only descriptions
exif-ai photo.jpg --provider google --tasks description

# Preview without writing to file
exif-ai photo.jpg --provider anthropic --dry-run

# Verbose output for debugging
exif-ai photo.jpg --provider ollama --verbose
```

#### Options

Required options:

- `-a, --api-provider <value>`: Name of the AI provider to use. Supported providers: `openai`, `google`, `anthropic`, `mistral`, `ollama`, `amazon`, `bedrock`, `azure`, `deepinfra`, `fireworks`, `openai-compatible`, `together`, `togetherai`, `xai`, `openrouter`.

Optional options:

- `-T, --tasks <tasks...>`: List of tasks to perform (`description`, `tag`). Default: `['description', 'tag']`.
- `-i, --input <file>`: Path to the input image file (required).
- `-p, --description-prompt <text>`: Custom prompt for the AI provider to generate description.
- `--tag-prompt <text>`: Custom prompt for the AI provider to generate tags.
- `-m, --model <name>`: Specify the AI model to use, if supported by the provider.
- `-t, --description-tags <tags...>`: List of EXIF tags to write the description to. Default: `['XPComment', 'Description', 'ImageDescription', 'Caption-Abstract']`.
- `--tag-tags <tags...>`: List of EXIF tags to write the tags to. Default: `['Subject', 'TagsList', 'Keywords']`.
- `-v, --verbose`: Enable verbose output for debugging.
- `-d, --dry-run`: Preview AI-generated content without writing to the image file.
- `--exif-tool-write-args <args...>`: Additional ExifTool arguments for writing metadata.
- `--provider-args <args...>`: Additional arguments for the AI provider.
- `--avoid-overwrite`: Avoid overwriting if EXIF tags already exist in the file.
- `--repeat <number>`: Number of times to repeat the task if the AI-generated result is deemed unacceptable. Default: 0.

Example usage:

```bash
# Legacy CLI syntax (still supported)
exif-ai -i example.jpg -a ollama

# New improved CLI syntax
exif-ai example.jpg --provider ollama
exif-ai example.jpg --provider openai --model gpt-4o
exif-ai example.jpg --provider google --tasks description --dry-run
```

### Library Usage

Exif AI provides three ways to use it as a library, from simple to advanced:

#### 1. Simple API (Recommended for most use cases)

```typescript
import { processImage } from "exif-ai";

// Basic usage
await processImage({
  image: "photo.jpg",
  provider: "ollama",
  preview: true // Don't write to file, just preview
});

// With custom options
await processImage({
  image: "photo.jpg",
  provider: "openai",
  model: "gpt-4o",
  tasks: ["description"],
  descriptionPrompt: "Describe this image in detail.",
  verbose: true
});
```

#### 2. Fluent Builder API (For more control)

```typescript
import { ExifAI } from "exif-ai";

await new ExifAI("photo.jpg")
  .provider("google")
  .model("gemini-1.5-pro")
  .tasks("description", "tag")
  .descriptionPrompt("Describe this landscape photo.")
  .tagPrompt("Generate relevant tags.")
  .preview() // Don't write to file
  .verbose()
  .run();
```

#### 3. Advanced Configuration API (For complex scenarios)

```typescript
import { processImageAdvanced } from "exif-ai";

await processImageAdvanced({
  image: "photo.jpg",
  ai: {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    descriptionPrompt: "Professional image description",
    tagPrompt: "Generate SEO-friendly tags"
  },
  exif: {
    descriptionTags: ["XPComment", "Description"],
    tagTags: ["Subject", "Keywords"]
  },
  options: {
    tasks: ["description", "tag"],
    preview: true,
    verbose: true,
    retries: 2
  }
});
```

#### 4. Legacy API (Backward compatibility)

```typescript
import { execute } from "exif-ai";

await execute({
  path: "photo.jpg",
  provider: "ollama",
  tasks: ["description", "tag"],
  dry: true // preview mode
});
```

## API Design Benefits

The new API design provides several improvements:

### CLI Improvements
- **Intuitive syntax**: `exif-ai image.jpg --provider ollama` instead of cryptic flags
- **Clear help text**: Organized options with examples and descriptions
- **Better defaults**: Sensible defaults for common use cases
- **Grouped options**: Related options are grouped together in help
- **Backward compatibility**: Old CLI syntax still works

### Library Improvements
- **Multiple API styles**: Choose the style that fits your use case
- **Type safety**: Full TypeScript support with proper interfaces
- **Fluent interface**: Chain methods for readable code
- **Simple defaults**: Easy to get started with minimal configuration
- **Advanced control**: Full control when needed

### Developer Experience
- **Better error messages**: Clear, actionable error messages
- **Consistent naming**: No more mixed conventions
- **Modern patterns**: Uses latest JavaScript/TypeScript patterns
- **Easy testing**: Preview mode for safe testing

## Installation

To install Exif AI globally, use the following command:

```bash
npm install -g exif-ai
```

## Tasks

### Description

The `description` task generates a description of the image using the AI provider. The description is written to the specified EXIF tags defined in `descriptionTags`.

### Tag

The `tag` task generates tags for the image using the AI provider. The tags are written to the specified EXIF tags defined in `tagTags`.

### Note

Please ensure that you securely manage your API keys. Do not expose them in public repositories or other public forums.

## AI SDK Integration

Exif AI is built with the [Vercel AI SDK](https://sdk.vercel.ai/) to provide a unified, modern interface for multiple AI providers. This integration offers:

- **Consistent API**: Same interface across all providers
- **Better Performance**: Optimized image processing and API efficiency
- **Type Safety**: Full TypeScript support with proper type definitions
- **Easy Extensibility**: Simple to add new providers and models
- **Modern Patterns**: Uses latest AI SDK features and best practices

### Supported Providers

| Provider | Default Model | Description |
|----------|---------------|-------------|
| **OpenAI** | `gpt-4o` | Leading AI provider with GPT-4o, GPT-4 Turbo, and other vision models |
| **Google** | `gemini-1.5-pro` | Google's Gemini models with excellent vision capabilities |
| **Anthropic** | `claude-3-5-sonnet-20241022` | Claude 3.5 Sonnet and other Claude models with strong reasoning |
| **Mistral** | `mistral-large-latest` | High-performance European AI models |
| **Ollama** | `llama3.2-vision` | Local AI models running on your machine (privacy-focused) |
| **Amazon Bedrock** | `anthropic.claude-3-sonnet-20240229-v1:0` | AWS managed AI service with multiple model choices |
| **Azure OpenAI** | `gpt-4-vision` | Microsoft's cloud service with OpenAI models |
| **DeepInfra** | `cogvlm2-llama3-8b-chat` | Platform for open-source and proprietary models |
| **Fireworks** | `accounts/fireworks/models/llama-v3-8b-instruct` | Fast and cost-effective model inference |
| **OpenAI Compatible** | `gpt-4-vision` | Generic interface for OpenAI API-compatible services |
| **TogetherAI** | `cogvlm2-llama3-8b-chat` | Access to wide range of open-source models |
| **XAI** | `grok-1.5-vision` | Grok models with advanced vision capabilities |
| **OpenRouter** | `openai/gpt-4o` | Unified gateway to multiple AI providers |

## Configuration

### OpenAI

To use [OpenAI](https://openai.com/), you need to set the API key. You can do this by setting an environment variable:

```bash
export OPENAI_API_KEY=your_openai_api_key
```

If you wish to use a custom API service provider that is compatible with the OpenAI API, you can set the `OPENAI_BASE_URL` environment variable to point to the desired endpoint.

```bash
export OPENAI_BASE_URL=https://api.customprovider.com/v1
```

### Google Generative AI

To use [Google Generative AI](https://ai.google.dev/), you need to set the API key. You can do this by setting an environment variable:

```bash
export API_KEY=your_google_api_key
# or
export GOOGLE_API_KEY=your_google_api_key
```

### Anthropic

To use [Anthropic](https://www.anthropic.com/), you need to set the API key. You can do this by setting an environment variable:

```bash
export ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Mistral

To use [Mistral](https://mistral.ai/), you need to set the API key. You can do this by setting an environment variable:

```bash
export MISTRAL_API_KEY=your_mistral_api_key
```

### Ollama

Ollama runs locally and does not require an API key. Ensure that Ollama is installed and properly configured on your machine. Refer to the [Ollama GitHub repository](https://github.com/ollama/ollama) for installation and setup instructions.

To use a remote Ollama service, you can set the base URL using an environment variable:

```bash
export OLLAMA_BASE_URL=http://ollama.example.com:11434
```

### Amazon Bedrock

To use [Amazon Bedrock](https://aws.amazon.com/bedrock/), you need to set your AWS credentials:

```bash
export AWS_ACCESS_KEY_ID=your_aws_access_key_id
export AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
export AWS_REGION=us-east-1  # or your preferred region
```

### Azure OpenAI

To use [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service/), you need to set the following environment variables:

```bash
export AZURE_OPENAI_API_KEY=your_azure_openai_api_key
export AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
export AZURE_OPENAI_API_VERSION=2023-12-01-preview  # or your preferred API version
```

### DeepInfra

To use [DeepInfra](https://deepinfra.com/), you need to set the API key:

```bash
export DEEPINFRA_API_KEY=your_deepinfra_api_key
```

### Fireworks

To use [Fireworks](https://fireworks.ai/), you need to set the API key:

```bash
export FIREWORKS_API_KEY=your_fireworks_api_key
```

### OpenAI Compatible

To use an OpenAI-compatible API service, you need to set the following environment variables:

```bash
export OPENAI_COMPATIBLE_API_KEY=your_api_key
export OPENAI_COMPATIBLE_BASE_URL=https://api.compatible-service.com/v1
```

### TogetherAI

To use [TogetherAI](https://www.together.ai/), you need to set the API key:

```bash
export TOGETHER_API_KEY=your_together_api_key
```

### XAI

To use [XAI](https://x.ai/), you need to set the API key:

```bash
export XAI_API_KEY=your_xai_api_key
```

### OpenRouter

To use [OpenRouter](https://openrouter.ai/), you need to set the API key:

```bash
export OPENROUTER_API_KEY=your_openrouter_api_key
```

## Develop

### Prerequisites

- Node.js >=16
- pnpm

### Clone the Repository

First, clone the Exif AI repository to your local machine:

```bash
git clone https://github.com/tychenjiajun/exif-ai.git
cd exif-ai
```

### Install Dependencies

Next, install the required dependencies using `pnpm`.

```bash
pnpm install
```

### Build

```bash
pnpm run build
```

### Watch

```bash
pnpm run watch
```
