#!/usr/bin/env node
import { Ollama } from "ollama";

export async function getDescription({
  buffer,
  model = "moondream",
  prompt = "Describe image.",
  providerArgs,
}: {
  buffer: Buffer;
  model?: string;
  prompt?: string;
  providerArgs?: string[];
}) {
  const ollama = new Ollama({
    host: providerArgs?.[0],
  });
  
  try {
    const response = await ollama.chat({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
          images: [Buffer.from(buffer).toString("base64")],
        },
      ],
      stream: false,
    });

    return response.message.content;
  } catch (error) {
    console.error("An error occurred while getting the description:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export async function getTags({
  buffer,
  model = "moondream",
  prompt = "Describe image.",
  providerArgs,
}: {
  buffer: Buffer;
  model?: string;
  prompt?: string;
  providerArgs?: string[];
}) {
  const ollama = new Ollama({
    host: providerArgs?.[0],
  });
  
  try {
    const response = await ollama.chat({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
          images: [Buffer.from(buffer).toString("base64")],
        },
      ],
      stream: false,
    });

    return response.message.content;
  } catch (error) {
    console.error("An error occurred while getting the tags:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}
