# Exif AI

[![NPM Downloads](https://img.shields.io/npm/dw/exif-ai)](https://www.npmjs.com/package/exif-ai)

_Read this in other languages:_
[_简体中文_](README.zh-CN.md),

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

- `-a, --api-provider <value>`: Name of the AI provider to use (`ollama` for Ollama, `zhipu` for ZhipuAI, `google` for Google Gemini).

Optional options:

- `-T, --tasks <tasks...>`: List of tasks to perform ('description', 'tag', 'face').
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
- `--face-group-ids <group...>` List of face group IDs to use for face recognition.

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
  doNotEndExifTool: false, // Do not end ExifTool process after writing metadata
  faceGroupIds: [], // List of face group IDs to use for face recognition
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

### Face Recognition

The `face` task performs face recognition on the image using the [Tencent Cloud API](https://cloud.tencent.com/document/api/867/44994). The face recognition results are written to the specified EXIF tags defined in `tagTags`.

Currently, the `face` task requires user to enable face recognition service on Tencent Cloud and set a pair of Tencent Cloud API Secret ID and Tencent CLoud API Secret Key in the environment variable.

```bash
export TENCENTCLOUD_SECRET_ID=your_tencentcloud_secret_id
export TENCENTCLOUD_SECRET_KEY=your_tencentcloud_secret_key
```

### Note

Please ensure that you securely manage your API keys. Do not expose them in public repositories or other public forums.

## API Providers

Exif AI relies on API providers to generate image descriptions and tags. Currently, we support three providers: ZhipuAI, Ollama and Google Gemini.

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

To use remote Ollama service, you can defined the url in providerArgs:

```bash
exif-ai --providerArgs "http://ollama.example.com:8080" -a ollama -i image.jpg
```

```js
providerArgs: ["http://ollama.example.com:8080"],
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
