import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const maxDuration = 30; // max duration for edge

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt, temperature, maxTokens } = await req.json();

    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const result = streamText({
      model: openrouter("meta-llama/llama-3.3-70b-instruct"),
      system: systemPrompt || "You are a helpful AI assistant. Respond concisely.",
      messages,
      temperature: temperature ?? 0.7,
      maxOutputTokens: maxTokens ?? 512,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Playground API error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
