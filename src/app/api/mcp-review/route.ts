import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const maxDuration = 30; // max duration for edge

// Input caps: huge diffs would burn the Groq quota in a single request.
const MAX_DIFF_CHARS = 40_000;
const MAX_AC_CHARS = 10_000;

const SYSTEM_PROMPT = `You are an automated MCP code reviewer. 
You cross-reference the provided PR diff with the provided Jira Acceptance Criteria (AC).
If there is a violation of the AC, cite the AC and concisely explain the fix. If no violation, approve it.
Do not use conversational filler (e.g. "Sure!", "Here is the review"). Output the review directly in markdown format.`;

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GROQ_API_KEY is not configured on the server." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // --- Rate limit: 10 reviews / hour / IP ---
  const { allowed, remaining } = rateLimit(`mcp-review:${getClientIp(req)}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Max 10 reviews per hour." }),
      { status: 429, headers: { "Content-Type": "application/json", "X-RateLimit-Remaining": "0" } }
    );
  }

  try {
    const { prDiff, jiraAc } = await req.json();

    if (typeof prDiff !== "string" || typeof jiraAc !== "string" ||
        !prDiff.trim() || !jiraAc.trim()) {
      return new Response(
        JSON.stringify({ error: "Both prDiff and jiraAc are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const result = streamText({
      model: groq(process.env.GROQ_MODEL || "openai/gpt-oss-20b"),
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Jira AC:\n${jiraAc.slice(0, MAX_AC_CHARS)}\n\nPR Diff:\n${prDiff.slice(0, MAX_DIFF_CHARS)}`,
        },
      ],
      temperature: 0.1,
    });

    return result.toTextStreamResponse({
      headers: { "X-RateLimit-Remaining": String(remaining) },
    });
  } catch (error) {
    console.error("MCP Review API error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
