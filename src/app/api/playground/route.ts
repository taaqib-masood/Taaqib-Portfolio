import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { PLAYGROUND_PRESETS, DEFAULT_PRESET } from "@/lib/playground-presets";

export const maxDuration = 30; // max duration for edge

// Server-side caps: never trust client-sent generation settings.
const MAX_TOKENS = 1024;
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

  // --- Rate limit: 20 requests / hour / IP, 100 / day in total (playground is a demo, keep spend tight) ---
  const { allowed, remaining } = await limitRoute("playground", req, 20, 100);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
      { status: 429, headers: { "Content-Type": "application/json", "X-RateLimit-Remaining": "0" } }
    );
  }

  let body: {
    messages?: unknown;
    presetId?: unknown;
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

  const presetId =
    typeof body.presetId === "string" && Object.hasOwn(PLAYGROUND_PRESETS, body.presetId)
      ? (body.presetId as keyof typeof PLAYGROUND_PRESETS)
      : DEFAULT_PRESET;
  const systemPrompt = PLAYGROUND_PRESETS[presetId].prompt;

  const temperature =
    typeof body.temperature === "number" && body.temperature >= 0 && body.temperature <= 1
      ? body.temperature
      : 0.7;

  const maxTokens =
    typeof body.maxTokens === "number" && Number.isFinite(body.maxTokens) && body.maxTokens > 0
      ? Math.min(Math.floor(body.maxTokens), MAX_TOKENS)
      : MAX_TOKENS;

  // Fixed, not GROQ_MODEL: keeps playground traffic off the chat agent's primary model quota.
  const PRIMARY_MODEL = "openai/gpt-oss-120b";
  const FALLBACK_MODEL = "openai/gpt-oss-20b";
  const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
    fetch: async (url: string | URL | Request, opts?: RequestInit) => {
      const res = await globalThis.fetch(url, opts);
      if (res.ok) return res;
      // Only a missing model or a provider outage justifies a second model; 400/429 would just spend its quota too.
      if ((res.status === 404 || res.status >= 500) && opts?.body) {
        const body = JSON.parse(opts.body as string);
        if (body.model !== FALLBACK_MODEL) {
          console.warn(`[Groq] ${body.model} returned ${res.status}, falling back to ${FALLBACK_MODEL}`);
          body.model = FALLBACK_MODEL;
          return globalThis.fetch(url, { ...opts, body: JSON.stringify(body) });
        }
      }
      return res;
    },
  });

  try {
    const result = streamText({
      model: groq(PRIMARY_MODEL),
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
