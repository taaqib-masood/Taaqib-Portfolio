import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";

export const maxDuration = 30; // max duration for edge

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt, temperature, maxTokens } = await req.json();

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const result = streamText({
      model: groq(process.env.GROQ_MODEL || "openai/gpt-oss-20b"),
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
