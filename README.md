# Exif AI

_Exif AI_ is a powerful CLI tool designed to write AI-generated image descriptions directly into the metadata of image files. This tool leverages advanced AI models to analyze image content and generate descriptive metadata, enhancing the accessibility and searchability of your images.

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

- `-i, --input <value>` Path to the input image file.
- `-a, --api-provider <value>` Name of the AI provider to use (`ollama` for Ollama or `zhipu` for ZhipuAI).

Optional options:

- `-p, --prompt [value]`: Custom prompt for the AI provider. Defaults to a generic image description prompt.
- `-m, --model [value]`: Specify the AI model to use, if supported by the provider.
- `-t, --tags [value...]`: EXIF tags to write the description to. Defaults to common description tags.
- `-v, --verbose`: Enable verbose output for debugging.
- `-d, --dry-run`: Preview the AI-generated description without writing to the image file.
- `--exif-tool-write-args [value...]`: Additional ExifTool arguments for writing metadata.
- `--provider-args [value...]`: Additional arguments for the AI provider.

Example usage:

```bash
exif-ai -i example.jpg -a ollama -p "Describe this landscape photo."
```

### Library

To use Exif AI as a library in your project, import it and use the provided functions:

```typescript
import { execute } from "exif-ai";

const options = {
  path: "example.jpeg", // Path to the input image file
  provider: "ollama", // AI provider to use (e.g., 'ollama', 'zhipu')
  model: "moondream", // Optional: Specific AI model to use (if supported by the provider)
  tags: ["XPComment", "Description", "ImageDescription", "Caption-Abstract"], // Optional: EXIF tags to write the description to
  prompt: "请使用中文描述这个图片。", // Optional: Custom prompt for the AI provider
  verbose: false, // Optional: Enable verbose logging for debugging
  dry: false, // Optional: Perform a dry run without writing to the file
  writeArgs: [], // Optional: Additional arguments for EXIF write task
  providerArgs: [], // Optional: Additional arguments for the AI provider
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

## API Providers

Exif AI relies on API providers to generate image descriptions. Currently, we support two providers: ZhipuAI and Ollama.

### Supported Providers

ZhipuAI: A leading AI service provider. Requires an API key.
Ollama: A local AI service that runs on your machine, eliminating the need for an API key.

### Custom Providers

You can also develop your own custom provider by implementing the provider interface. This allows you to integrate with other AI services or customize the description generation process.

## Configuration

### Setting API Keys (for ZhipuAI)

To use ZhipuAI, you need to set the API key. You can do this by setting an environment variable:

```bash
export ZHIPUAI_API_KEY=your_zhipuai_api_key
```

### Ollama Configuration

Ollama runs locally and does not require an API key. Ensure that Ollama is installed and properly configured on your machine. Refer to the [Ollama GitHub repository](https://github.com/ollama/ollama) for installation and setup instructions.

## Develop

### Prerequisites

- Node.js >=18
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
