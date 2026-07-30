import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const maxDuration = 30; // max duration for edge

const SYSTEM_PROMPT = `You are an automated MCP code reviewer. 
You cross-reference the provided PR diff with the provided Jira Acceptance Criteria (AC).
If there is a violation of the AC, cite the AC and concisely explain the fix. If no violation, approve it.
Do not use conversational filler (e.g. "Sure!", "Here is the review"). Output the review directly in markdown format.`;

export async function POST(req: Request) {
  try {
    const { prDiff, jiraAc } = await req.json();

    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      headers: {
        "HTTP-Referer": "https://taaqib-masood.github.io",
        "X-Title": "Taaqib Masood Portfolio",
      },
    });

    const result = streamText({
      model: openrouter("openai/gpt-4o-mini"),
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Jira AC:\n${jiraAc}\n\nPR Diff:\n${prDiff}`,
        },
      ],
      temperature: 0.1,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("MCP Review API error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
