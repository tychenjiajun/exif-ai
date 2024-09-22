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

export async function getDescription({
  file_id,
  model = "7417012623289516083",
  prompt = "请使用中文描述这个图片。",
  providerArgs = [],
}: {
  model?: string;
  prompt?: string;
  file_id: string;
  providerArgs?: string[];
}): Promise<string | undefined> {
  try {
    const { data } = await coze.runWorkflow({
      workflow_id: model,
      parameters: {
        url: file_id,
        BOT_USER_INPUT: prompt,
        ...JSON.parse(providerArgs[0] || "{}"), // 解析 providerArgs 并将其作为参数传递
      },
    });

    return data.output;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('"code":7100050002') ||
        error.message.includes("code: 5000"))
    ) {
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
  providerArgs = [],
}: {
  model?: string;
  prompt?: string;
  file_id: string;
  providerArgs?: string[];
}): Promise<string | undefined> {
  try {
    const { data } = await coze.runWorkflow({
      workflow_id: model,
      parameters: {
        url: file_id,
        BOT_USER_INPUT: prompt,
        ...JSON.parse(providerArgs[0] || "{}"), // 解析 providerArgs 并将其作为参数传递
      },
    });

    return data.output;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('"code":7100050002') ||
        error.message.includes("code: 5000"))
    ) {
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
