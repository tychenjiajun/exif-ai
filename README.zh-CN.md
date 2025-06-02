# Exif AI

[![NPM Downloads](https://img.shields.io/npm/dw/exif-ai)](https://www.npmjs.com/package/exif-ai)

https://github.com/user-attachments/assets/a445d46a-0d3c-44a2-a42e-f98c23e9c1b4

## 关于

_Exif AI_ 是一款功能强大的命令行工具和库，专为直接将AI生成的图像描述和/或标签写入图像文件的元数据而设计。该工具运用来自多个提供商的先进AI模型来深入分析图像内容，并自动生成相应的描述性元数据，显著提升图像的检索效率和可用性。

基于 [Vercel AI SDK](https://sdk.vercel.ai/) 构建，Exif AI 支持 13+ 个AI提供商，包括 OpenAI、Google Gemini、Anthropic Claude、Mistral、Ollama、Amazon Bedrock、Azure OpenAI 等。

## 使用示例

### 命令行

#### 无需安装

如果您不想全局安装 Exif AI，完全可以选择使用 npx 命令来直接运行它。这样操作非常简单：

```bash
npx exif-ai -i example.jpeg -a ollama
```

#### 全局安装版

如果您已经将 Exif AI 全局安装到您的系统，那么您可以直接在命令行中直接调用它来使用。

```bash
exif-ai -i example.jpeg -a ollama
```

#### 选项

必选项:

- `-a, --api-provider <value>`: 选择要使用的AI供应商。支持的供应商：`openai`、`google`、`anthropic`、`mistral`、`ollama`、`amazon`、`bedrock`、`azure`、`deepinfra`、`fireworks`、`openai-compatible`、`together`、`togetherai`、`xai`、`openrouter`。

可选项:

- `-T, --tasks <tasks...>`: 指定要执行的任务列表（`description`、`tag`）。默认：`['description', 'tag']`。
- `-i, --input <file>`: 指定要处理的图像文件路径（必需）。
- `-p, --description-prompt <text>`: 自定义AI供应商生成描述的提示语，默认使用通用的图像描述提示。
- `--tag-prompt <text>`: 自定义AI供应商生成标签的提示语，默认使用通用的图像标签提示。
- `-m, --model <name>`: 指定要使用的AI模型，如果AI供应商支持自定义模型。
- `-t, --description-tags <tags...>`: 指定要写入描述的EXIF标签名称列表，默认为常见的描述标签。
- `--tag-tags <tags...>`: 指定要写入标签的EXIF标签名称列表，默认为常见的标签。
- `-v, --verbose`: 启用详细输出，以便在调试时查看更多信息。
- `-d, --dry-run`: 进行dry run，预览AI生成的内容但不实际写入图像文件。
- `--exif-tool-write-args <args...>`: 提供额外的参数给ExifTool，用于写入元数据。
- `--provider-args <args...>`: 提供额外的参数给AI供应商。
- `--avoid-overwrite`: 如果文件中已存在EXIF标签，则避免覆盖现有标签。
- `--repeat <number>`: 如果AI生成结果被认为不可接受时，重复执行任务的次数。默认：0。

示例用法:

```bash
# 使用 Ollama（本地）的基本用法
exif-ai -i example.jpg -a ollama

# 使用 OpenAI 和自定义模型
OPENAI_API_KEY=your_key exif-ai -i example.jpg -a openai -m gpt-4o

# 使用 Google Gemini 和自定义提示
GOOGLE_API_KEY=your_key exif-ai -i example.jpg -a google -p "详细描述这张风景照片。"

# 仅生成标签
exif-ai -i example.jpg -a anthropic -T tag

# 预览结果（不写入文件）
exif-ai -i example.jpg -a ollama -d
```

### 作为库集成

若要在您的项目中将Exif AI作为库使用，请按照以下步骤进行：

1. 导入Exif AI库。
2. 使用库中提供的函数进行操作。

具体代码示例如下：

### 库使用方法

Exif AI 提供三种使用方式，从简单到高级：

#### 1. 简单 API（推荐用于大多数用例）

```typescript
import { processImage } from "exif-ai";

// 基本用法
await processImage({
  image: "photo.jpg",
  provider: "ollama",
  preview: true // 不写入文件，仅预览
});

// 自定义选项
await processImage({
  image: "photo.jpg",
  provider: "openai",
  model: "gpt-4o",
  tasks: ["description"],
  descriptionPrompt: "详细描述这张图片。",
  verbose: true
});
```

#### 2. 流式构建器 API（更多控制）

```typescript
import { ExifAI } from "exif-ai";

await new ExifAI("photo.jpg")
  .provider("google")
  .model("gemini-1.5-pro")
  .tasks("description", "tag")
  .descriptionPrompt("描述这张风景照片。")
  .tagPrompt("生成相关标签。")
  .preview() // 不写入文件
  .verbose()
  .run();
```

#### 3. 高级配置 API（复杂场景）

```typescript
import { processImageAdvanced } from "exif-ai";

await processImageAdvanced({
  image: "photo.jpg",
  ai: {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    descriptionPrompt: "专业图像描述",
    tagPrompt: "生成SEO友好的标签"
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

#### 4. 传统 API（向后兼容）

```typescript
import { execute } from "exif-ai";

await execute({
  path: "photo.jpg",
  provider: "ollama",
  tasks: ["description", "tag"],
  dry: true // 预览模式
});
```

## 安装指南

要全局安装 Exif AI，请执行以下命令：

```bash
npm install -g exif-ai
```

## 任务

### 生成描述

`description`任务利用 AI 供应商生成图像的描述性文本。生成的描述将自动写入到指定的`descriptionTags`EXIF 标签中。

### 生成标签

`tags`任务通过 AI 供应商为图像创建标签。这些标签将被记录在`tagTags`定义的 EXIF 标签里。



### 注意

请确保您安全地管理您的API密钥。不要在公共仓库或其他公共论坛中暴露它们。

## API供应商

Exif AI旨在利用各种API供应商来生成图像描述和标签。我们目前支持五个主流的供应商，每个供应商都提供独特的功能和集成选项。以下是支持供应商的摘要，包括它们的要求和功能详情。

### 支持的供应商

- OpenAI：一家领先的AI服务供应商，以其广泛的AI工具和应用而闻名。
- Google Gemini：由Google提供支持的强大AI服务，以其高质量的图像处理能力而闻名。
- Anthropic：一家专注于开发可靠、可解释和可控制的AI系统的供应商。
- Mistral：一家提供高性能语言模型的供应商。
- Ollama：一种创新的本地AI服务，直接在您的机器上运行。此选项不需要API密钥，提供无缝且私密的体验。
- Amazon Bedrock：亚马逊的完全托管服务，提供多种高性能基础模型的选择。
- Azure OpenAI：微软的基于云的服务，提供带有Azure安全功能的OpenAI模型访问。
- DeepInfra：一个提供各种开源和专有AI模型访问的平台。
- Fireworks：一家专注于高效和经济的AI模型推理的供应商。
- OpenAI Compatible：一个适用于实现OpenAI API规范的服务的通用接口。
- TogetherAI：一个提供广泛开源模型访问的平台。
- XAI：Grok模型系列的提供商，具有视觉能力。
- OpenRouter：一个统一的API网关，提供对来自不同供应商的各种AI模型的访问。

### 自定义供应商

对于寻求扩展Exif AI功能或与额外AI服务集成的用户，我们提供开发自定义供应商的灵活性。通过实现供应商接口，您可以创建自定义供应商以集成其他AI服务，或根据您的特定需求定制图像描述生成过程。

## 配置

## OpenAI

要使用 OpenAI，您需要配置 API 密钥。您可以通过以下步骤设置环境变量：

```bash
export OPENAI_API_KEY=your_openai_api_key
```

如果您需要使用与 OpenAI API 兼容的自定义 API 服务，可以设置 `OPEN_API_BASEURL` 环境变量，指向所需的 API 端点：

```bash
export OPEN_API_BASEURL=https://api.example.com
```

### 智谱AI

要使用[智谱AI](https://open.bigmodel.cn/usercenter/apikeys)，您需要设置 API 密钥。通过以下命令设置环境变量：

```bash
export ZHIPUAI_API_KEY=your_zhipuai_api_key
```

如果您还没有智谱AI的 API 密钥，可以前往[智谱AI官网](https://www.bigmodel.cn/invite?icode=INWAHJuWBFUp07JYI6oBveZLO2QH3C0EBTSr%2BArzMw4%3D)注册并获取。

### Google Gemini

使用[Google Gemini](https://ai.google.dev/)时，您需要设置 API 密钥。以下是设置环境变量的命令：

```bash
export API_KEY=your_google_api_key
```

### Coze

要使用[Coze](https://www.coze.com/) Bot，您需要设置 API 密钥。设置环境变量的命令如下：

```bash
export COZE_API_KEY=your_coze_api_key
```

在中国大陆地区使用 Coze 时，请确保配置正确的端点设置：

```bash
export COZE_ENDPOINT=https://api.coze.cn
```

与 Coze API 交互时，您可以使用以下命令格式，其中 `-m` 参数指定了 bot 的 id：

```bash
exif-ai -a coze_bot -i image.jpg -m 7402199305639034921
```

在此处，`-a coze_bot`指定了Coze API，`-i image.jpg`表示输入图像文件，而`-m 7402199305639034921`是您希望使用的bot的id。

### Ollama

Ollama 在本地运行，因此不需要 API 密钥。请确保已正确安装和配置 Ollama。更多安装和设置信息，请参阅[Ollama](https://github.com/ollama/ollama)的官方文档。

若要使用远程 Ollama 服务，您可以设置以下环境变量：

```bash
export OLLAMA_BASE_URL=http://ollama.example.com:11434
```

### Amazon Bedrock

要使用 [Amazon Bedrock](https://aws.amazon.com/bedrock/)，您需要设置 AWS 凭证：

```bash
export AWS_ACCESS_KEY_ID=your_aws_access_key_id
export AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
export AWS_REGION=us-east-1  # 或您首选的区域
```

### Azure OpenAI

要使用 [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service/)，您需要设置以下环境变量：

```bash
export AZURE_OPENAI_API_KEY=your_azure_openai_api_key
export AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
export AZURE_OPENAI_API_VERSION=2023-12-01-preview  # 或您首选的 API 版本
```

### DeepInfra

要使用 [DeepInfra](https://deepinfra.com/)，您需要设置 API 密钥：

```bash
export DEEPINFRA_API_KEY=your_deepinfra_api_key
```

### Fireworks

要使用 [Fireworks](https://fireworks.ai/)，您需要设置 API 密钥：

```bash
export FIREWORKS_API_KEY=your_fireworks_api_key
```

### OpenAI Compatible

要使用 OpenAI 兼容的 API 服务，您需要设置以下环境变量：

```bash
export OPENAI_COMPATIBLE_API_KEY=your_api_key
export OPENAI_COMPATIBLE_BASE_URL=https://api.compatible-service.com/v1
```

### TogetherAI

要使用 [TogetherAI](https://www.together.ai/)，您需要设置 API 密钥：

```bash
export TOGETHER_API_KEY=your_together_api_key
```

### XAI

要使用 [XAI](https://x.ai/)，您需要设置 API 密钥：

```bash
export XAI_API_KEY=your_xai_api_key
```

### OpenRouter

要使用 [OpenRouter](https://openrouter.ai/)，您需要设置 API 密钥：

```bash
export OPENROUTER_API_KEY=your_openrouter_api_key
```

## 开发

### 前置条件

- Node.js >=16
- pnpm

### 克隆仓库

首先，将Exif AI仓库克隆到您的本地机器：

```bash
git clone https://github.com/tychenjiajun/exif-ai.git
cd exif-ai
```

### 安装依赖

接下来，使用 pnpm 安装所需的依赖项。

```bash
pnpm install
```

### 构建

```bash
pnpm run build
```

### Watch

```bash
pnpm run watch
```
