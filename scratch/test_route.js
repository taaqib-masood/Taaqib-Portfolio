const { createOpenAI } = require("@ai-sdk/openai");
const { streamText, stepCountIs } = require("ai");
const { tools } = require("../src/lib/tools");
require("dotenv").config({ path: ".env.local" });

const SYSTEM_PROMPT = `You are Taaqib Masood's portfolio agent.`;

async function test() {
  try {
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      headers: {
        "HTTP-Referer": "https://taaqib-masood.github.io",
        "X-Title": "Taaqib Masood Portfolio",
      },
    });

    console.log("Sending stream request with api key:", process.env.OPENROUTER_API_KEY ? "EXISTS" : "MISSING");

    const result = streamText({
      model: openrouter("openai/gpt-4o-mini"),
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: "What did Taaqib build at LTTS?" }],
      tools,
      stopWhen: stepCountIs(5),
    });

    console.log("Awaiting stream response chunks...");
    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
    console.log("\nStream finished successfully!");
  } catch (error) {
    console.error("CRITICAL ROUTE ERROR:", error);
  }
}

test();
