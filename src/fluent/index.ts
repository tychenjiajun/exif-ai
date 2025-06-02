import { FluentBundle, FluentResource, FluentVariable } from "@fluent/bundle";
import { env } from "node:process";

const bundles: Record<string, FluentBundle> = {
  "en-US": new FluentBundle("en-US"),
  "zh-CN": new FluentBundle("zh-CN"),
};

bundles["en-US"].addResource(
  new FluentResource(`
description = A powerful Node.js CLI and library that uses AI providers (OpenAI, Google Gemini, Anthropic Claude, Mistral, Ollama, Amazon Bedrock, Azure OpenAI, and more) to intelligently write image descriptions and tags to EXIF metadata.
api-provider = Name of the AI provider to use (openai, google, anthropic, mistral, ollama, amazon, bedrock, azure, deepinfra, fireworks, openai-compatible, together, togetherai, xai, openrouter).
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
repeat = The number of times to repeat the task if the AI-generated result is deemed unacceptable. This parameter helps ensure the quality of the output by allowing multiple attempts. Default value is 0. An AI-generated description is considered acceptable if it has more than 10 characters and is not in markdown format. AI-generated tags are considered acceptable if there are more than 1 tag and they are not in markdown format. Using this parameter will consume more tokens, which may incur additional costs. Use it at your own risk.
description-prompt-input = Describe image.
tag-prompt-input = Tag image in words based on subject, object, event, place. Output format: <tag1>, <tag2>, <tag3>, <tag4>,  <tag5>,  ..., <tagN>
`),
);

bundles["zh-CN"].addResource(
  new FluentResource(`
description = 一个功能强大的Node.js命令行工具和库，使用AI供应商（OpenAI、Google Gemini、Anthropic Claude、Mistral、Ollama、Amazon Bedrock、Azure OpenAI等）根据图像内容智能地将图像描述和标签写入EXIF元数据。
api-provider = 要使用的AI供应商名称（openai、google、anthropic、mistral、ollama、amazon、bedrock、azure、deepinfra、fireworks、openai-compatible、together、togetherai、xai、openrouter）。
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
repeat = 如果AI生成结果被认为不可接受时，重复执行任务的次数。此参数通过允许多次尝试来确保输出质量。默认值为0。如果AI生成的描述超过10个字符且不是Markdown格式，则被视为可接受。AI生成的标签如果超过1个且不是Markdown格式，则被视为可接受。使用此参数将消耗更多令牌，可能会产生额外费用。使用时请自行承担风险。
description-prompt-input = 描述图像。输出格式为一行文本。示例输出：这幅照片是在一个风景名胜区里拍摄的，可以看到很多人在那里参观。这些石柱高耸，顶部平坦，看起来像是人工雕琢而成，让人想起中国的园林风格。前景是熙熙攘攘的人群，他们似乎都在欣赏这令人叹为观止的景色。照片里的气氛是宁静的，让人感觉平静祥和。，Description":"这幅照片是在一个风景名胜区里拍摄的，可以看到很多人在那里参观。这些石柱高耸，顶部平坦，看起来像是人工雕琢而成，让人想起中国的园林风格。前景是熙熙攘攘的人群，他们似乎都在欣赏这令人叹为观止的景色。照片里的气氛是宁静的，让人感觉平静祥和。
tag-prompt-input = 根据主题、对象、事件、地点对图像进行标签。输出格式：标签1，标签2，标签3，标签4，标签5，标签6，……，标签N。示例输出：石林，中国，中国石林，自然，喀斯特，山，旅行，旅游，景区，观光，人群，户外，公园，树木，天空，建筑。"
`),
);

export function getText(
  s: string,
  arguments_?: Record<string, FluentVariable> | null,
  errors?: Error[] | null,
) {
  const LANG = env.LANG;

  const bundle =
    bundles[LANG?.split(".")[0].replaceAll("_", "-") ?? "en-US"] ??
    bundles["en-US"];

  const message = bundle.getMessage(s);

  if (message?.value) {
    return bundle.formatPattern(message.value, arguments_, errors);
    // → "Welcome, Anna, to Foo 3000!"
  }
}
