#!/usr/bin/env node
import sharp from "sharp";

async function sizeHandle(buffer: Buffer, quality = 100, drop = 2) {
  const sharpInstance = await sharp(buffer);
  const { width = 0, height = 0 } = await sharpInstance.metadata();
  const done = await sharp(buffer)
    .resize({
      ...(width > height ? { width: 6000 } : { height: 6000 }),
      withoutEnlargement: true,
    })
    .jpeg({
      quality,
    })
    .toBuffer();

  if (done.byteLength > 5_000_000) {
    return sizeHandle(buffer, quality - drop);
  }

  return done;
}

export async function getDescription({
  buffer,
  model = "glm-4v-plus",
  prompt,
}: {
  buffer: Buffer;
  model?: string;
  prompt: string;
}) {
  const handled = await sizeHandle(buffer);

  const data = await fetch(
    "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.ZHIPUAI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: Buffer.from(handled).toString("base64"),
                },
              },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
        temperature: 0.5,
      }),
    },
  ).then((res) => res.json());

  if ("choices" in data) {
    return data.choices.at(-1)?.message.content;
  } else {
    return;
  }
}
