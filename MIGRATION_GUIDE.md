# Migration Guide for Exif AI

This guide will help you migrate from previous versions of Exif AI to the latest version, which includes significant changes to the provider system and feature set.

## Major Changes

### 1. AI SDK Integration

Exif AI now uses the [AI SDK by Vercel](https://sdk.vercel.ai/docs/introduction) to provide a unified interface for multiple AI providers. This replaces the previous provider-specific implementations with a single, consistent API.

#### Benefits:
- Simplified codebase
- Consistent API across providers
- Support for more providers
- Better maintainability
- Easier to add new providers in the future

### 2. Removed Features

#### Watch Mode
The watch mode functionality has been removed to simplify the codebase and focus on the core functionality of Exif AI. If you need to process multiple files, you can use shell scripts or other automation tools.

#### Face Recognition
The face recognition feature using Tencent Cloud API has been removed to reduce dependencies and simplify the codebase.

## Provider Migration

### Previously Supported Providers:
- OpenAI
- Google Gemini
- Ollama
- ZhipuAI
- Coze Bot

### Currently Supported Providers:
- OpenAI
- Google Generative AI
- Anthropic
- Mistral
- Ollama

## Environment Variables

### OpenAI
```bash
export OPENAI_API_KEY=your_openai_api_key
export OPENAI_BASE_URL=https://api.customprovider.com/v1  # Optional
```

### Google Generative AI
```bash
export API_KEY=your_google_api_key
# or
export GOOGLE_API_KEY=your_google_api_key
```

### Anthropic
```bash
export ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Mistral
```bash
export MISTRAL_API_KEY=your_mistral_api_key
```

### Ollama
```bash
export OLLAMA_BASE_URL=http://ollama.example.com:11434  # Optional, defaults to http://localhost:11434
```

## Command Line Usage

### Previous Usage:
```bash
exif-ai -i example.jpg -a ollama -w ./images -p "Describe this landscape photo."
```

### Current Usage:
```bash
exif-ai -i example.jpg -a ollama -p "Describe this landscape photo."
```

## Library Usage

### Previous Usage:
```typescript
import { execute } from "exif-ai";

const options = {
  tasks: ["description"],
  path: "example.jpg",
  provider: "ollama",
  descriptionTags: [
    "XPComment",
    "Description",
    "ImageDescription",
    "Caption-Abstract",
  ],
  tagTags: ["Subject", "TagsList", "Keywords"],
  descriptionPrompt: "Describe this landscape photo.",
  tagPrompt: "Tag this image based on subject, object, event, place.",
  verbose: false,
  dry: false,
  writeArgs: [],
  providerArgs: [],
  avoidOverwrite: false,
  doNotEndExifTool: false,
  faceGroupIds: [],
  repeat: 0,
};

execute(options);
```

### Current Usage:
```typescript
import { execute } from "exif-ai";

const options = {
  tasks: ["description"],
  path: "example.jpg",
  provider: "ollama",
  descriptionTags: [
    "XPComment",
    "Description",
    "ImageDescription",
    "Caption-Abstract",
  ],
  tagTags: ["Subject", "TagsList", "Keywords"],
  descriptionPrompt: "Describe this landscape photo.",
  tagPrompt: "Tag this image based on subject, object, event, place.",
  verbose: false,
  dry: false,
  writeArgs: [],
  providerArgs: [],
  avoidOverwrite: false,
  repeat: 0,
};

execute(options);
```

## Processing Multiple Files

Since the watch mode has been removed, you can use shell scripts to process multiple files:

### Bash Example:
```bash
#!/bin/bash
for file in ./images/*.jpg; do
  exif-ai -i "$file" -a openai -m gpt-4-vision-preview
done
```

### PowerShell Example:
```powershell
Get-ChildItem -Path "./images" -Filter "*.jpg" | ForEach-Object {
  exif-ai -i $_.FullName -a openai -m gpt-4-vision-preview
}
```

## Questions and Support

If you have any questions or need help migrating to the new version, please open an issue on the [GitHub repository](https://github.com/tychenjiajun/exif-ai/issues).