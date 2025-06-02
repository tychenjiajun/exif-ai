# Exif AI

[![NPM Downloads](https://img.shields.io/npm/dw/exif-ai)](https://www.npmjs.com/package/exif-ai)

https://github.com/user-attachments/assets/a445d46a-0d3c-44a2-a42e-f98c23e9c1b4

_Read this in other languages:_
[_简体中文_](README.zh-CN.md)

## About

_Exif AI_ is a powerful CLI tool designed to write AI-generated image descriptions and/or tags directly into the metadata of image files. This tool leverages advanced AI models to analyze image content and generate descriptive metadata, enhancing the accessibility and searchability of your images.

## Usage Example

### CLI

#### Without Installation

You can run Exif AI directly using npx without installing it globally:

```bash
npx exif-ai -i example.jpeg -a ollama
```

#### With Installation

If you have installed Exif AI globally, you can run it directly from the command line:

```bash
exif-ai -i example.jpeg -a ollama
```

#### Options

Required options:

- `-a, --api-provider <value>`: Name of the AI provider to use (`openai`, `google`, `anthropic`, `mistral`, `ollama`, `amazon`, `bedrock`, `azure`, `deepinfra`, `fireworks`, `openai-compatible`, `together`, `togetherai`, `xai`, `openrouter`).

Optional options:

- `-T, --tasks <tasks...>`: List of tasks to perform ('description', 'tag').
- `-i, --input <file>` Path to the input image file.
- `-p, --description-prompt <text>`: Custom prompt for the AI provider to generate description. Defaults to a generic image description prompt.
- `--tag-prompt <text>`: Custom prompt for the AI provider to generate tags. Defaults to a generic image tagging prompt.
- `-m, --model <name>`: Specify the AI model to use, if supported by the provider.
- `-t, --description-tags <tags...>`: List of EXIF tags to write the description to. Defaults to common description tags.
- `--tag-tags <tags...>`: List of EXIF tags to write the tags to. Defaults to common tags.
- `-v, --verbose`: Enable verbose output for debugging.
- `-d, --dry-run`: Preview AI-generated content without writing to the image file.
- `--exif-tool-write-args <args...>`: Additional ExifTool arguments for writing metadata.
- `--provider-args <args...>`: Additional arguments for the AI provider.
- `--avoid-overwrite`: Avoid overwriting if EXIF tags already exist in the file.
- `--repeat`: The number of times to repeat the task if the AI-generated result is deemed unacceptable. This parameter helps ensure the quality of the output by allowing multiple attempts. Default value is 0. An AI-generated description is considered acceptable if it has more than 10 characters and is not in markdown format. AI-generated tags are considered acceptable if there are more than 1 tag and they are not in markdown format. Using this parameter will consume more tokens, which may incur additional costs. Use it at your own risk.

Example usage:

```bash
exif-ai -i example.jpg -a ollama -p "Describe this landscape photo."
```

### Library

To use Exif AI as a library in your project, import it and use the provided functions:

```typescript
import { execute } from "exif-ai";

const options = {
  tasks: ["description"], // List of tasks to perform
  path: "example.jpg", // Path to the input image file
  provider: "ollama", // Name of the AI provider to use
  descriptionTags: [
    "XPComment",
    "Description",
    "ImageDescription",
    "Caption-Abstract",
  ], // List of EXIF tags to write the description to
  tagTags: ["Subject", "TagsList", "Keywords"], // List EXIF tags to write the tags to
  descriptionPrompt: "Describe this landscape photo.", // Custom prompt for the AI provider to generate description
  tagPrompt: "Tag this image based on subject, object, event, place.", // Custom prompt for the AI provider to generate tags
  verbose: false, // Enable verbose output for debugging
  dry: false, // Preview AI-generated content without writing to the image file
  writeArgs: [], // Additional ExifTool arguments for writing metadata
  providerArgs: [], // Additional arguments for the AI provider
  avoidOverwrite: false, // Avoid overwriting if EXIF tags already exist in the file
  repeat: 0, // The number of times to repeat the task if the AI-generated result is deemed unacceptable
};

execute(options)
  .then(() => {
    console.log("Image description has been written to EXIF metadata.");
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });
```

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

Exif AI now uses the AI SDK by Vercel to provide a unified interface for multiple AI providers. This allows for seamless integration with various AI services without the need for provider-specific code.

### Supported Providers

- OpenAI: A leading AI service provider, recognized for its wide range of AI-powered tools and applications.
- Google Generative AI: A robust AI service powered by Google, renowned for its high-quality image processing capabilities.
- Anthropic: A provider focused on developing reliable, interpretable, and steerable AI systems.
- Mistral: A provider offering state-of-the-art language models with strong performance.
- Ollama: An innovative local AI service that operates directly on your machine, offering a seamless and private experience.
- Amazon Bedrock: Amazon's fully managed service that offers a choice of high-performing foundation models.
- Azure OpenAI: Microsoft's cloud-based service that provides access to OpenAI models with Azure security features.
- DeepInfra: A platform offering access to various open-source and proprietary AI models.
- Fireworks: A provider specializing in efficient and cost-effective AI model inference.
- OpenAI Compatible: A generic interface for services that implement the OpenAI API specification.
- TogetherAI: A platform that provides access to a wide range of open-source models.
- XAI: Provider of the Grok model family with vision capabilities.
- OpenRouter: A unified API gateway that provides access to various AI models from different providers.

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
