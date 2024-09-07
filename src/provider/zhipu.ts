#!/usr/bin/env node
import sharp from "sharp";

async function sizeHandle(
  buffer: Buffer,
  quality = 100,
  drop = 2,
): Promise<Buffer> {
  const sharpInstance = await sharp(buffer);
  const { width = 0, height = 0 } = await sharpInstance.metadata();
  let done = await sharp(buffer)
    .resize({
      ...(width > height ? { width: 6000 } : { height: 6000 }),
      withoutEnlargement: true,
    })
    .jpeg({
      quality,
    })
    .toBuffer();

  while (done.byteLength > 5_000_000) {
    quality = Math.max(quality - drop, 0);
    done = await sharp(buffer)
      .resize({
        ...(width > height ? { width: 6000 } : { height: 6000 }),
        withoutEnlargement: true,
      })
      .jpeg({
        quality,
      })
      .toBuffer();
  }

  return done;
}

export async function getDescription({
  buffer,
  model = "glm-4v-plus",
  prompt = "请使用中文描述这个图片。",
}: {
  buffer: Buffer;
  model?: string;
  prompt?: string;
}) {
  try {
    const handled = await sizeHandle(buffer);
    const response = await fetch(
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
    );
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    if ("choices" in data) {
      return data.choices.at(-1)?.message.content;
    } else {
      return;
    }
  } catch (error) {
    console.error("An error occurred while getting the description:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}
