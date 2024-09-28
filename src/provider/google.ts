#!/usr/bin/env node

import { GoogleGenerativeAI } from "@google/generative-ai";
import { fileTypeFromBuffer } from "file-type";

import { env } from "node:process";
import sharp from "sharp";

const genAI = new GoogleGenerativeAI(env.API_KEY as string);

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

  while (done.byteLength > 18_000_000) {
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
  model: _model = "gemini-1.5-flash",
  prompt = "请使用中文描述这个图片。",
}: {
  buffer: Buffer;
  model?: string;
  prompt?: string;
}) {
  try {
    const handled = await sizeHandle(buffer);

    const model = genAI.getGenerativeModel({ model: _model });

    const image = {
      inlineData: {
        data: handled.toString("base64"),
        mimeType: (await fileTypeFromBuffer(handled))?.mime ?? "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, image] as const);
    return result.response.text();
  } catch (error) {
    console.error("An error occurred while getting the description:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export async function getTags({
  buffer,
  model: _model = "gemini-1.5-flash",
  prompt = "请根据图片中的场景、事件、地点、人数、出现的物体来给图片打标签。输出为 <tag1>, <tag2>, <tags>, …… , <tagN>",
}: {
  buffer: Buffer;
  model?: string;
  prompt?: string;
}) {
  try {
    const handled = await sizeHandle(buffer);

    const model = genAI.getGenerativeModel({ model: _model });

    const image = {
      inlineData: {
        data: handled.toString("base64"),
        mimeType: (await fileTypeFromBuffer(handled))?.mime ?? "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, image] as const);
    return result.response.text();
  } catch (error) {
    console.error("An error occurred while getting the tags:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}
