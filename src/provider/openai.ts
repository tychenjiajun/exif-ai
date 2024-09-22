#!/usr/bin/env node
import { env } from "node:process";
import OpenAI from "openai";
import sharp from "sharp";

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY, // This is the default and can be omitted
  baseURL: env.OPENAI_BASE_URL,
});

async function sizeHandle(
  buffer: Buffer,
  quality = 100,
  drop = 2,
): Promise<Buffer> {
  const sharpInstance = await sharp(buffer);
  const { width = 0, height = 0 } = await sharpInstance.metadata();
  let done = await sharp(buffer)
    .resize({
      ...(width > height ? { width: 2000 } : { height: 2000 }),
      withoutEnlargement: true,
    })
    .jpeg({
      quality,
    })
    .toBuffer();

  while (done.byteLength > 10_000_000) {
    quality = Math.max(quality - drop, 0);
    done = await sharp(buffer)
      .resize({
        ...(width > height ? { width: 2000 } : { height: 2000 }),
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
  model = "yi-vision",
  prompt = "请使用中文描述这个图片。",
}: {
  buffer: Buffer;
  model?: string;
  prompt?: string;
}) {
  try {
    const handled = await sizeHandle(buffer);

    const response = await client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${Buffer.from(handled).toString("base64")}`,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
      model,
    });

    return response.choices.at(-1)?.message.content;
  } catch (error) {
    console.error("An error occurred while getting the description:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export async function getTags({
  buffer,
  model = "yi-vision",
  prompt = "请根据图片中的场景、事件、地点、人数、出现的物体来给图片打标签。输出为 <tag1>, <tag2>, <tags>, …… , <tagN>",
}: {
  buffer: Buffer;
  model?: string;
  prompt?: string;
}) {
  try {
    const handled = await sizeHandle(buffer);

    const response = await client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${Buffer.from(handled).toString("base64")}`,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
      model,
    });

    return response.choices.at(-1)?.message.content;
  } catch (error) {
    console.error("An error occurred while getting the tags:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}
