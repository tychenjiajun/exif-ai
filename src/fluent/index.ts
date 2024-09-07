import { FluentBundle, FluentResource, FluentVariable } from "@fluent/bundle";
import { env } from "node:process";

const bundles: Record<string, FluentBundle> = {
  "en-US": new FluentBundle("en-US"),
  "zh-CN": new FluentBundle("zh-CN"),
};

bundles["en-US"].addResource(
  new FluentResource(`
description = A Node.js CLI that uses Ollama or ZhipuAI to intelligently write image description to exif metadata by it's content.
api-provider = Name of the AI provider to use ('ollama' for Ollama or 'zhipu' for ZhipuAI).
input = Path to the input image file.
model = Specify the AI model to use, if supported by the provider.
tags = EXIF tags to write the description to. Defaults to common description tags.
dry-run = Preview the AI-generated description without writing to the image file.
exif-tool-write-args = Additional ExifTool arguments for writing metadata.
provider-args = Additional arguments for the AI provider.
watch = Watch directory for new files to process.
avoid-overwrite = Avoid overwriting if EXIF tags already exist in the file.
ext = File extensiosn to watch. Only files with this extensions will be processed.
prompt = Custom prompt for the AI provider. Defaults to a generic image description prompt.
verbose = Enable verbose output for debugging.
`),
);

bundles["zh-CN"].addResource(
  new FluentResource(`
description = 一个Node.js命令行工具，它使用Ollama或ZhipuAI根据图像内容智能地将图像描述写入EXIF元数据。
api-provider = 要使用的AI提供者名称（'ollama'代表Ollama或'zhipu'代表ZhipuAI）。
input = 输入图像文件的路径。
model = 指定要使用的AI模型（如果提供者支持）。
tags = 要写入描述的EXIF标签。默认为常见描述标签。
dry-run = 预览AI生成的描述，但不写入图像文件。
exif-tool-write-args = 写入元数据的ExifTool附加参数。
provider-args = AI提供者的附加参数。
watch = 监视目录以处理新文件。
avoid-overwrite = 如果EXIF标签已在文件中存在，则避免覆盖。
ext = 要监视的文件扩展名。只有具有此扩展名的文件才会被处理。
prompt = 为AI提供者定制的提示。默认为通用图像描述提示。
verbose = 启用详细输出以进行调试。
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
