import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const maxDuration = 30; // max duration for edge

// Server-side caps — never trust client-sent generation settings.
const MAX_TOKENS = 1024;
const MAX_SYSTEM_PROMPT_CHARS = 4_000;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 8_000;

type ModelMessage = { role: "user" | "assistant"; content: string };

// Accepts both plain {role, content} and AI SDK UIMessage {role, parts} shapes;
// normalizes to ModelMessage[] with per-message size caps.
function sanitizeMessages(raw: unknown): ModelMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) return null;
  const cleaned: ModelMessage[] = [];
  for (const msg of raw) {
    if (!msg || typeof msg !== "object") return null;
    const { role, content, parts } = msg as {
      role?: unknown;
      content?: unknown;
      parts?: unknown;
    };
    if (role !== "user" && role !== "assistant") return null;

    let text: string | null = null;
    if (typeof content === "string") {
      text = content;
    } else if (Array.isArray(parts)) {
      text = parts
        .filter(
          (p): p is { type: string; text: string } =>
            !!p && typeof p === "object" && (p as { type?: unknown }).type === "text" &&
            typeof (p as { text?: unknown }).text === "string"
        )
        .map((p) => p.text)
        .join("\n");
    }
    if (text === null) return null;
    cleaned.push({ role, content: text.slice(0, MAX_MESSAGE_CHARS) });
  }
  return cleaned;
}

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GROQ_API_KEY is not configured on the server." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // --- Rate limit: 20 requests / hour / IP (playground is a demo, keep spend tight) ---
  const { allowed, remaining } = rateLimit(`playground:${getClientIp(req)}`, 20, 60 * 60 * 1000);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Max 20 playground requests per hour." }),
      { status: 429, headers: { "Content-Type": "application/json", "X-RateLimit-Remaining": "0" } }
    );
  }

  let body: {
    messages?: unknown;
    systemPrompt?: unknown;
    temperature?: unknown;
    maxTokens?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = sanitizeMessages(body.messages);
  if (!messages) {
    return new Response(
      JSON.stringify({
        error: `Invalid messages: expected 1-${MAX_MESSAGES} user/assistant messages with string content.`,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const systemPrompt =
    typeof body.systemPrompt === "string" && body.systemPrompt.trim().length > 0
      ? body.systemPrompt.slice(0, MAX_SYSTEM_PROMPT_CHARS)
      : "You are a helpful AI assistant. Respond concisely.";

  const temperature =
    typeof body.temperature === "number" && body.temperature >= 0 && body.temperature <= 1
      ? body.temperature
      : 0.7;

  const maxTokens =
    typeof body.maxTokens === "number" && Number.isFinite(body.maxTokens) && body.maxTokens > 0
      ? Math.min(Math.floor(body.maxTokens), MAX_TOKENS)
      : MAX_TOKENS;

  const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const result = streamText({
      model: groq(process.env.GROQ_MODEL || "openai/gpt-oss-20b"),
      system: systemPrompt,
      messages,
      temperature,
      maxOutputTokens: maxTokens,
    });

    return result.toUIMessageStreamResponse({
      headers: { "X-RateLimit-Remaining": String(remaining) },
      onError: (error) => {
        console.error("Playground API error:", error);
        return "An error occurred while generating the response.";
      },
    });
  } catch (error) {
    console.error("Playground API error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
