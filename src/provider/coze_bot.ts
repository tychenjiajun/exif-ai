#!/usr/bin/env node

import { Coze } from "@coze/coze-js";

import { env } from "node:process";

const apiKey = env.COZE_API_KEY;
const endpoint = env.COZE_ENDPOINT;

const coze = new Coze({ api_key: apiKey, endpoint });

async function sleep(ms: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, Math.ceil(ms));
  });
}

async function chat(model: string, prompt: string, file_id: string) {
  const v = await coze.chatV3({
    bot_id: model,
    additional_messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image",
            file_id,
          },
        ],
        content_type: "object_string",
      },
    ],
  });

  const chat_id = v.id;
  const conversation_id = v.conversation_id;
  while (true) {
    await sleep(1200 * Math.random());
    const chat = await coze.getChat({ chat_id, conversation_id });
    if (
      chat.status === "completed" ||
      chat.status === "failed" ||
      chat.status === "requires_action"
    ) {
      break;
    }
  }
  return { chat_id, conversation_id };
}

export async function getDescription({
  file_id,
  model = "7417012623289516083",
  prompt = "请使用中文描述这个图片。",
}: {
  model?: string;
  prompt?: string;
  file_id: string;
}): Promise<string | undefined> {
  try {
    const { chat_id, conversation_id } = await chat(model, prompt, file_id);

    const messageList = await coze.getChatHistory({
      chat_id,
      conversation_id,
    });

    const result = messageList.find(
      (m) => m.role === "assistant" && m.type === "answer",
    )?.content;
    return Array.isArray(result) ? undefined : result;
  } catch (error) {
    if (error instanceof Error && error.message.includes('"code":7100050002')) {
      await sleep(1200 * Math.random());
      return getDescription({ file_id, model, prompt });
    }
    console.error("An error occurred while getting the description:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export async function getTags({
  file_id,
  model = "7417012623289516083",
  prompt = "请根据图片中的场景、事件、地点、人数、出现的物体来给图片打标签。输出为 <tag1>, <tag2>, <tags>, …… , <tagN>",
}: {
  model?: string;
  prompt?: string;
  file_id: string;
}): Promise<string | undefined> {
  try {
    const { chat_id, conversation_id } = await chat(model, prompt, file_id);

    const messageList = await coze.getChatHistory({
      chat_id,
      conversation_id,
    });

    const result = messageList.find(
      (m) => m.role === "assistant" && m.type === "answer",
    )?.content;
    return Array.isArray(result) ? undefined : result;
  } catch (error) {
    if (error instanceof Error && error.message.includes('"code":7100050002')) {
      await sleep(1200 * Math.random());
      return getTags({ file_id, model, prompt });
    }
    console.error("An error occurred while getting the description:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export async function uploadFile({
  path,
}: {
  path: string;
}): Promise<{ id: string }> {
  return await coze.uploadFile(path);
}
