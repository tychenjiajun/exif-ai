# Exif AI

[![NPM Downloads](https://img.shields.io/npm/dw/exif-ai)](https://www.npmjs.com/package/exif-ai)

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

- `-a, --api-provider <value>` Name of the AI provider to use (`ollama` for Ollama, `zhipu` for ZhipuAI, `google` for Google Gemini).

Optional options:

- `-T, --tasks <tasks...>`: List of tasks to perform ('description' and/or 'tag').
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
- `-w, --watch <path>`: Watch directory for new files to process.
- `--avoid-overwrite`: Avoid overwriting if EXIF tags already exist in the file.
- `--ext <extensions...>`: File extensions to watch. Only files with this extensions will be processed.
- `--concurrency <number>`: The numbers of files to process concurrently in watch mode.

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
  provider: "ollama", // AI provider to use (e.g., 'ollama', 'zhipu', 'google')
  model: "moondream", // Optional: Specific AI model to use (if supported by the provider)
  descriptionTags: [
    "XPComment",
    "Description",
    "ImageDescription",
    "Caption-Abstract",
  ], // Optional: EXIF tags to write the description to
  tagTags: ["Subject", "TagsList", "Keywords"], // Optional: EXIF tags to write the tags to
  descriptionPrompt: "请使用中文描述这个图片。", // Optional: Custom prompt for the AI provider to generate description
  tagPrompt:
    "Tag this image based on subject, object, event, place. Output format: <tag1>, <tag2>, <tag3>, <tag4>,  <tag5>,  ..., <tagN>", // Optional: Custom prompt for the AI provider to generate tags
  verbose: false, // Optional: Enable verbose logging for debugging
  dry: false, // Optional: Perform a dry run without writing to the file
  writeArgs: [], // Optional: Additional arguments for EXIF write task
  providerArgs: [], // Optional: Additional arguments for the AI provider
  avoidOverwrite: true, // Optional: Avoid overwriting existing tags
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

Exif AI relies on API providers to generate image descriptions. Currently, we support three providers: ZhipuAI, Ollama and Google Gemini.

### Supported Providers

- ZhipuAI: A leading AI service provider. Requires an API key.
- Ollama: A local AI service that runs on your machine, eliminating the need for an API key.
- Google Gemini: A powerful AI service provided by Google.

### Custom Providers

You can also develop your own custom provider by implementing the provider interface. This allows you to integrate with other AI services or customize the description generation process.

## Configuration

### Setting API Keys (for ZhipuAI)

To use [ZhipuAI](https://open.bigmodel.cn/usercenter/apikeys), you need to set the API key. You can do this by setting an environment variable:

```bash
export ZHIPUAI_API_KEY=your_zhipuai_api_key
```

### Google Gemini

To use [Google Gemini](https://ai.google.dev/), you need to set the API key. You can do this by setting an environment variable:

```bash
export API_KEY=your_google_api_key
```

### Ollama Configuration

Ollama runs locally and does not require an API key. Ensure that Ollama is installed and properly configured on your machine. Refer to the [Ollama GitHub repository](https://github.com/ollama/ollama) for installation and setup instructions.

## Develop

### Prerequisites

- Node.js >=16
- pnpm

### Clone the Repository

First, clone the Exif AI repository to your local machine:

```bash
git clone https://github.com/tychenjiajun/exif-ai.git
cd exif-ai
````

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
