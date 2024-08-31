# Exif AI

*Exif AI* is a CLI tool for writing AI-generated image descriptions to metadata.

## Usage Example

Without Installation

```bash
ZHIPUAI_API_KEY=Your_Key npx exif-ai -i example.jpeg -a zhipu
```

With Installation

```bash
ZHIPUAI_API_KEY=Your_Key exif-ai -i example.jpeg -a zhipu
```

## Installation

```bash
npm install -g exif-ai
```

## API Providers

Exif AI requires an API provider to generate descriptions from images. Currently, we have only one built-in provider, ZhipuAI. You should have a ZhipuAI API key before using Exif AI.

You can also build your own provider by implementing the provider interface.

## Develop

1. Clone the Repository

```bash
git clone https://github.com/tychenjiajun/exif-ai.git
cd exif-ai
```

2. Install Dependencies

```bash
pnpm install
```

 
