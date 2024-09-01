# NAME

exif-ai - Write AI-generated image descriptions to EXIF metadata.

# SYNOPSIS

```
exif-ai [options]
```

# DESCRIPTION

The `exif-ai` command is a Node.js CLI tool that uses AI to analyze image content and write descriptive metadata to the EXIF information of an image file. It supports two AI providers: Ollama and ZhipuAI. Ollama runs locally, while ZhipuAI requires an API key.

# OPTIONS

* `-i, --input <file>`:
Specify the path to the input image file.

* `-a, --api-provider <name>`:
Choose the AI provider to use. Acceptable values are ollama or zhipu.

* `-p, --prompt <text>`:
Set a custom prompt for the AI provider. If not specified, a default prompt is used.

* `-m, --model <name>`:
Specify the AI model to use, if supported by the provider.

* `-t, --tags <tags...>`:
List the EXIF tags to write the description to. Defaults to common description tags if not specified.

* `-v, --verbose`:
Enable verbose output for debugging.

* `-d, --dry-run`:
Preview the AI-generated description without writing to the image file.

* `--exif-tool-write-args <args...>`:
Provide additional arguments for ExifTool when writing metadata.

* `--provider-args <args...>`:
Pass additional arguments to the AI provider.

# EXAMPLES

Write a description to an image using Ollama:

```
exif-ai -i image.jpg -a ollama
```

Use ZhipuAI with a custom prompt:

```
exif-ai -i image.jpg -a zhipu -p "Describe the scenery in this photo."
```

Perform a dry run to see the description without modifying the image:

```
exif-ai -i image.jpg -a ollama -d
```

# PROVIDERS

* Ollama:
A local AI service that runs on your machine. No API key is required.

* ZhipuAI:
An AI service provider that requires an API key. Set the environment variable ZHIPUAI_API_KEY with your key.

# CONFIGURATION

For ZhipuAI, set the API key using an environment variable:

```
export ZHIPUAI_API_KEY=your_zhipuai_api_key
```

Ensure Ollama is installed and configured on your machine. Refer to the Ollama GitHub repository for installation and setup instructions.

# DEVELOPMENT
To contribute to Exif AI, clone the repository, install dependencies, and build the project:

```
git clone https://github.com/tychenjiajun/exif-ai.git
cd exif-ai
pnpm install
pnpm run build
```

# LICENSE

Exif AI is licensed under the GPL-2.0-only License.

# SEE ALSO
* exiftool-vendored (https://github.com/photostructure/exiftool-vendored.js)
* ollama (https://github.com/ollama/ollama)
* zhipuAI (https://zhipu.ai)