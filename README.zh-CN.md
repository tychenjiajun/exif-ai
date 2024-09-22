# Exif AI

[![NPM Downloads](https://img.shields.io/npm/dw/exif-ai)](https://www.npmjs.com/package/exif-ai)

https://github.com/user-attachments/assets/c5370480-2dd9-4980-ad08-317e5634ab9d

## 关于

_Exif AI_ 是一款功能强大的命令行工具，专为直接将AI生成的图像描述和/或标签写入图像文件的元数据而设计。该工具运用先进的AI模型来深入分析图像内容，并自动生成相应的描述性元数据，显著提升图像的检索效率和可用性。

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

- `-a, --api-provider <value>`: 选择要使用的AI供应商，请指定以下名称之一（`ollama`对应Ollama，`zhipu`对应ZhipuAI，`google`对应Google Gemini，`coze_bot`对应扣子bot，`openai`对应OpenAI）

可选项:

- `-T, --tasks <tasks...>`: 指定要执行的任务列表，支持的选项有`description`（生成描述）、`tag`（生成标签）和`face`（面部识别）。
- `-i, --input <file>` : 指定要处理的图像文件路径。
- `-p, --description-prompt <text>`: 自定义AI供应商生成描述的提示语，默认使用通用的图像描述提示。
- `--tag-prompt <text>`: 自定义AI供应商生成标签的提示语，默认使用通用的图像标签提示。
- `-m, --model <name>`: 指定要使用的AI模型，如果AI供应商支持自定义模型。
- `-t, --description-tags <tags...>`: 指定要写入描述的EXIF标签名称列表，默认为常见的描述标签。
- `--tag-tags <tags...>`: 指定要写入标签的EXIF标签名称列表，默认为常见的标签。
- `-v, --verbose`: 启用详细输出，以便在调试时查看更多信息。
- `-d, --dry-run`: 进行dry run，预览AI生成的内容但不实际写入图像文件。
- `--exif-tool-write-args <args...>`: 提供额外的参数给ExifTool，用于写入元数据。
- `--provider-args <args...>`: 提供额外的参数给AI供应商。
- `-w, --watch <path>`: 监视指定路径中的新文件，当检测到新文件时自动处理。
- `--avoid-overwrite`: 如果文件中已存在EXIF标签，则避免覆盖现有标签。
- `--ext <extensions...>`: 指定要监视的文件扩展名，只有符合这些扩展名的文件会被处理。
- `--concurrency <number>`: 在监视模式下，同时处理的文件数量上限。
- `--face-group-ids <group...>`: 指定用于面部识别的面部组ID列表。

示例用法:

```bash
exif-ai -i example.jpg -a ollama -p "描述这张图片"
```

### 作为库集成

若要在您的项目中将Exif AI作为库使用，请按照以下步骤进行：

1. 导入Exif AI库。
2. 使用库中提供的函数进行操作。

具体代码示例如下：

```typescript
import { execute } from "exif-ai";

const options = {
  tasks: ["description"], // 要执行的任务列表
  input: "example.jpg", // 要处理的图像文件
  provider: "ollama", // 要使用的AI供应商名称
  descriptionTags: ["Description"], // 要写入描述的EXIF标签列表
  tagTags: ["TagsList"], // 要写入标签的EXIF标签列表
  descriptionPrompt: "描述这张图片", // 自定义AI供应商生成描述的提示
  tagPrompt: "根据主题、对象、事件、地点标记这张图片", // 自定义AI供应商生成标签的提示
  verbose: true, // 启用调试输出
  dry: false, // 预览AI生成的内容而不写入图像文件
  writeArgs: [], // 用于写入元数据的ExifTool的额外参数
  providerArgs: [], // AI供应商的额外参数
  avoidOverwrite: false, // 如果文件中已经存在EXIF标签，则避免覆盖
  doNotEndExifTool: false, // 不在写入元数据后结束ExifTool进程
};

execute(options)
  .then((result) => {
    console.log(result); // 处理结果
  })
  .catch((error) => {
    console.error(error); // 处理错误
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

### 面部识别

`face`任务利用腾讯云的 API 在图像上进行面部识别。识别结果将被记录在`tagTags`中指定的 EXIF 标签里。

目前，`face`任务需要配置腾讯云 API 密钥，并且您必须已经开通了腾讯云的人脸识别服务。如果您尚未拥有腾讯云账户，请先注册并开通相关服务。

```bash
export TENCENTCLOUD_SECRET_ID=your_tencentcloud_secret_id
export TENCENTCLOUD_SECRET_KEY=your_tencentcloud_secret_key
```

### 注意

请确保您安全地管理您的API密钥。不要在公共仓库或其他公共论坛中暴露它们。

## API供应商

Exif AI旨在利用各种API供应商来生成图像描述和标签。我们目前支持五个主流的供应商，每个供应商都提供独特的功能和集成选项。以下是支持供应商的摘要，包括它们的要求和功能详情。

### 支持的供应商

- ZhipuAI：一家以先进算法著称的尖端AI服务供应商。访问此服务需要API密钥。
- Ollama：一种创新的本地AI服务，直接在您的机器上运行。此选项不需要API密钥，提供无缝且私密的体验。
- Google Gemini：由Google提供支持的强大AI服务，以其高质量的图像处理能力而闻名。
- Coze: 扣子是新一代AI大模型智能体开发平台。您可以使用API来调用扣子的bot或工作流。
- OpenAI：一家领先的AI服务供应商，以其广泛的AI工具和应用而闻名。与ZhipuAI一样，它需要API密钥才能访问。

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

Ollama 在本地运行，因此不需要 API 密钥。请确保已正确安装和配置 Ollama。更多安装和设置信息，请参阅[Ollama](https://github.com/ollama/ollama)的官方文档。。

若要使用远程 Ollama 服务，您可以在`providerArgs`中指定服务 URL：

```bash
exif-ai --providerArgs "http://ollama.example.com:8080" -a ollama -i image.jpg
```

在使用库集成时，`providerArgs`可以这样设置：

```js
providerArgs: ["http://ollama.example.com:8080"],
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
