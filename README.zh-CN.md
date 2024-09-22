# Exif AI

[![NPM Downloads](https://img.shields.io/npm/dw/exif-ai)](https://www.npmjs.com/package/exif-ai)

## 关于

_Exif AI_ 是一个强大的命令行工具，旨在直接将AI生成的图像描述和/或标签写入图像文件的元数据。此工具利用先进的AI模型来分析图像内容并生成描述性元数据，从而提高图像的可用性和可搜索性。

## 使用示例

### 命令行

#### 免安装

如果您不想全局安装 Exif AI，可以使用 npx 命令直接运行。

```bash
npx exif-ai -i example.jpeg -a ollama
```

#### 安装版

如果您已经全局安装了 Exif AI，则可以直接从命令行运行它。

```bash
exif-ai -i example.jpeg -a ollama
```

#### 选项

必选项:

- `-a, --api-provider <value>`: 要使用的AI供应商名称（`ollama`代表Ollama，`zhipu`代表ZhipuAI，`google`代表Google Gemini）

可选项:

- `-T, --tasks <tasks...>`: 要执行的任务列表（`description`代表生成描述，`tags`代表生成标签，`face`代表面部识别）。
- `-i, --input <file>` : 要处理的图像文件。
- `-p, --description-prompt <text>`: 自定义AI供应商生成描述的提示。默认为通用的图像描述提示。
- `--tag-prompt <text>`: 自定义AI供应商生成标签的提示。默认为通用的图像标签提示。
- `-m, --model <name>`: 指定要使用的AI模型，如果AI供应商支持。
- `-t, --description-tags <tags...>`: 要写入描述的EXIF标签列表。默认为常见的描述标签。
- `--tag-tags <tags...>`: 要写入标签的EXIF标签列表。默认为常见的标签。
- `-v, --verbose`: 启用调试输出。
- `-d, --dry-run`: 预览AI生成的内容而不写入图像文件。
- `--exif-tool-write-args <args...>`: 用于写入元数据的ExifTool的额外参数。
- `--provider-args <args...>`: AI供应商的额外参数。
- `-w, --watch <path>`: 监视要处理的目录中的新文件。
- `--avoid-overwrite`: 如果文件中已经存在EXIF标签，则避免覆盖。
- `--ext <extensions...>`: 要监视的文件扩展名。只有具有这些扩展名的文件才会被处理。
- `--concurrency <number>`: 在监视模式下同时处理的文件数量。
- `--face-group-ids <group...>`: 要用于面部识别的面部组ID列表。

示例用法:

```bash
exif-ai -i example.jpg -a ollama -p "描述这张图片"
```

### 作为库使用

要在您的项目中将Exif AI用作库，请导入它并使用提供的函数：

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

## 安装

要全局安装 Exif AI，请使用以下命令：

```bash
npm install -g exif-ai
```

## 任务

### 生成描述

`description`任务使用AI供应商生成图像的描述。该描述将被写入在`descriptionTags`中。

### 生成标签

`tags`任务使用AI供应商生成图像的标签。标签将被写入在`tagTags`中。

### 面部识别

`face`任务使用腾讯云API在图像上执行面部识别。面部识别结果将写入在`tagTags`中定义的EXIF标签。

目前，`face`任务需要腾讯云API密钥，并且需要腾讯云人脸识别服务。如果您没有腾讯云账户，请先注册一个账户并启用人脸识别服务。

```bash
export TENCENTCLOUD_SECRET_ID=your_tencentcloud_secret_id
export TENCENTCLOUD_SECRET_KEY=your_tencentcloud_secret_key
```

### 注意

请确保您安全地管理您的API密钥。不要在公共仓库或其他公共论坛中暴露它们。

## API供应商

Exif AI依赖于API供应商来生成图像描述和标签。目前，我们支持三个供应商：ZhipuAI、Ollama和Google Gemini。

### 支持的供应商

- ZhipuAI：领先的AI服务供应商。需要API密钥。
- Ollama：在您的机器上运行的本地AI服务，无需API密钥。
- Google Gemini：由Google提供的强大AI服务。
- Coze: 扣子是新一代 AI 大模型智能体开发平台。您可以使用API来调用扣子的bot或工作流。

### 自定义供应商

您还可以通过实现供应商接口来开发您自己的自定义供应商。这允许您与其他AI服务集成或自定义描述生成过程。

## 配置

### 智谱AI

要使用[智谱AI](https://open.bigmodel.cn/usercenter/apikeys)，您需要设置API密钥。您可以通过设置环境变量来完成此操作：

```bash
export ZHIPUAI_API_KEY=your_zhipuai_api_key
```

如果你还没有智谱AI的API密钥，请[在此](https://www.bigmodel.cn/invite?icode=INWAHJuWBFUp07JYI6oBveZLO2QH3C0EBTSr%2BArzMw4%3D)注册并获取API密钥。

### Google Gemini

要使用[Google Gemini](https://ai.google.dev/)，您需要设置API密钥。您可以通过设置环境变量来完成此操作：

```bash
export API_KEY=your_google_api_key
```

### Coze

要使用[Coze](https://www.coze.com/) Bot，您需要设置API密钥。您可以通过设置环境变量来完成此操作：

```bash
export COZE_API_KEY=your_coze_api_key
```

在中国地区使用Coze时，请按照以下方式配置端点设置：

```bash
export COZE_ENDPOINT=https://api.coze.cn
```

在Coze中，`model`参数对应于bot的id。要使用Coze API进行交互，请使用以下命令格式：


```bash
exif-ai -a coze_bot -i image.jpg -m 7402199305639034921
```

在此处，`-a coze_bot`指定了Coze API，`-i image.jpg`表示输入图像文件，而`-m 7402199305639034921`是您希望使用的bot的id。

### Ollama

Ollama在本地运行，不需要API密钥。请确保Ollama已安装在您的机器上并正确配置。有关安装和设置说明，请参考[Ollama](https://github.com/ollama/ollama)。

要使用远程Ollama服务，您可以在`providerArgs`中定义URL：

```bash
exif-ai --providerArgs "http://ollama.example.com:8080" -a ollama -i image.jpg
```

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
