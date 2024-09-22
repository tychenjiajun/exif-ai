import { FluentBundle, FluentResource, FluentVariable } from "@fluent/bundle";
import { env } from "node:process";

const bundles: Record<string, FluentBundle> = {
  "en-US": new FluentBundle("en-US"),
  "zh-CN": new FluentBundle("zh-CN"),
};

bundles["en-US"].addResource(
  new FluentResource(`
description = A Node.js CLI that uses Ollama, ZhipuAI, Google Gemini, Coze or OpenAI to intelligently write image description and/or tags to exif metadata by it's content.
api-provider = Name of the AI provider to use ('ollama' for Ollama, 'zhipu' for ZhipuAI, 'google' for Google Gemini, 'coze_bot' for Coze Bot, 'openai' for OpenAI).
input = Path to the input image file.
model = Specify the AI model to use, if supported by the provider.
description-tags = List of EXIF tags to write the description to. Defaults to common description tags.
tag-tags = List of EXIF tags to write the tags to. Defaults to common tags.
dry-run = Preview AI-generated content without writing to the image file
exif-tool-write-args = Additional ExifTool arguments for writing metadata.
provider-args = Additional arguments for the AI provider.
watch = Watch directory for new files to process.
avoid-overwrite = Avoid overwriting if EXIF tags already exist in the file.
ext = File extensiosn to watch. Only files with this extensions will be processed.
description-prompt = Custom prompt for the AI provider to generate description. Defaults to a generic image description prompt.
tag-prompt = Custom prompt for the AI provider to generate tags. Defaults to a generic image tagging prompt.
verbose = Enable verbose output for debugging.
tasks = List of tasks to perform ('description', 'tag', 'face').
concurrency = The numbers of files to process concurrently in watch mode.
face-group-ids = List of face group IDs to use for face recognition.
`),
);

bundles["zh-CN"].addResource(
  new FluentResource(`
description = 一个Node.js命令行工具，它使用Ollama或ZhipuAI或Google Gemini或Coze或OpenAI根据图像内容智能地将图像描述和/或标签写入EXIF元数据。
api-provider = 要使用的AI供应商名称（'ollama'代表Ollama，'zhipu'代表ZhipuAI，'google'代表Google Gemini, 'coze_bot'代表Coze，'openai'代表OpenAI）。
input = 输入图像文件的路径。
model = 指定要使用的AI模型，如果供应商支持。
description-tags = 要写入描述的EXIF标签列表。默认为常见描述标签。
tag-tags = 要写入标签的EXIF标签列表。默认为常见标签。
dry-run = 预览AI生成的描述和标签，但不写入图像文件。
exif-tool-write-args = 写入元数据时附加的ExifTool参数。
provider-args = AI供应商的附加参数。
watch = 监视目录以处理新文件。
avoid-overwrite = 如果EXIF标签已在文件中存在，则避免覆盖。
ext = 要监视的文件扩展名。只有具有此扩展名的文件才会被处理。
description-prompt = 为AI供应商定制的生成描述的提示。默认为通用图像描述提示。
tag-prompt = 为AI供应商定制的生成标签的提示。默认为通用图像标签提示。
verbose = 启用详细输出以进行调试。
tasks = 要执行的任务列表（'description'，'tag'，'face'）。
concurrency = 在监视模式下同时处理文件的数目。
face-group-ids = 人脸搜索要使用的面部组ID列表。
`),
);

export function getText(
  s: string,
  args?: Record<string, FluentVariable> | null,
  errors?: Array<Error> | null,
) {
  const LANG = env.LANG;

  const bundle =
    bundles[LANG?.split(".")[0].replaceAll("_", "-") ?? "en-US"] ??
    bundles["en-US"];

  const message = bundle.getMessage(s);

  if (message?.value) {
    return bundle.formatPattern(message.value, args, errors);
    // → "Welcome, Anna, to Foo 3000!"
  }
}
