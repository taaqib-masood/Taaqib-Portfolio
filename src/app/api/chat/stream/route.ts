import { createGroq } from "@ai-sdk/groq";
import { stepCountIs, streamText, convertToModelMessages } from "ai";
import { tools } from "@/lib/tools";
import { projects, githubRepos } from "@/data/projects";
import {
  aboutParagraphs,
  skills,
  experience,
  education,
  certifications,
  spokenLanguages,
  contact,
} from "@/data/resume";

export const runtime = "edge";

// --- Ground-truth context injected directly into system prompt for sub-250ms TTFT ---
const PORTFOLIO_KNOWLEDGE = `
### BIOGRAPHY & BACKGROUND
Name: Taaqib Masood
Title: AI Engineer & Full-Stack Architect
Location: ${contact.location}
Availability: ${contact.residency}
Driving Licenses: ${contact.licenses}
Contact: Email: ${contact.email} | Phone/WhatsApp: ${contact.phone} | LinkedIn: ${contact.linkedin} | GitHub: ${contact.github}
Bio: ${aboutParagraphs.join(" ")}
Languages Spoken: ${spokenLanguages}

### EDUCATION & CERTIFICATIONS
Education:
${education.map((e) => `- ${e.institution}: ${e.degree} (${e.detail})`).join("\n")}
Certifications:
${certifications.map((c) => `- ${c}`).join("\n")}

### TECHNICAL SKILLS
${Object.entries(skills)
  .map(([cat, items]) => `- ${cat}: ${items.join(", ")}`)
  .join("\n")}

### WORK EXPERIENCE
${experience
  .map(
    (exp) => `Company: ${exp.company}
Role: ${exp.role}
Period: ${exp.period} | Location: ${exp.location}
Achievements & Details:
${exp.bullets.map((b) => `  * ${b}`).join("\n")}`
  )
  .join("\n\n")}

### FEATURED PROJECTS
${projects
  .map(
    (p) => `Project: ${p.title}
Slug: ${p.slug} | Aliases: ${p.aliases ? p.aliases.join(", ") : "none"}
Role: ${p.role}
Categories: ${p.categories.join(", ")}
Blurb: ${p.blurb}
Tech Stack: ${p.stack.join(", ")}
Key Metrics & Outcomes:
${p.metrics.map((m) => `  * ${m}`).join("\n")}
Highlights:
${p.highlights ? p.highlights.map((h) => `  * ${h}`).join("\n") : "  * Production-grade deployment"}
Repository: ${p.repo}
Demo URL: ${p.demo || "No public demo URL"}
`
  )
  .join("\n---\n")}

### GITHUB REPOSITORIES & OPEN-SOURCE (github.com/taaqib-masood)
${githubRepos
  .map(
    (r) => `Repo: ${r.name} (${r.title})
Language: ${r.language} | Category: ${r.category}
URL: ${r.url}
Description: ${r.description}
Highlights:
${r.highlights.map((h) => `  * ${h}`).join("\n")}
`
  )
  .join("\n")}
`;

const BASE_SYSTEM_PROMPT = `You are Taaqib Masood's interactive AI Proxy and technical portfolio agent, embedded directly in his website's Agent Terminal.
Your primary mission is to allow recruiters, engineering managers, and technical interviewers to interview YOU as Taaqib's digital proxy.

CORE PERSONA & VOICE:
- Tone: Confident, articulate, deeply technical, senior yet humble.
- Voice: ALWAYS answer in the first person ("I built...", "My architecture at LTTS was...", "In Reva AI, I chose..."). You ARE Taaqib Masood's engineering proxy.
- Depth: Do not give fluffy generic summaries. Speak in concrete engineering terms (mention actual libraries, algorithms, latency metrics, DB schemas, failure modes, and architectural trade-offs).
- Brevity: Keep responses punchy, concise, and formatted with clean markdown bullet points (typically 120-220 words). If asked for deep technical detail or system design, expand thoroughly.

INTERVIEW PLAYBOOK:
1. "Tell me about yourself / Walk me through your resume":
   - Introduce yourself as an AI Engineer based in Dubai who builds systems where the model is the infrastructure, not just a demo.
   - Highlight:
     1) Sole-built the live proctoring & assessment portal at LTTS (WebRTC via LiveKit, Deepgram Nova-2 STT, MediaPipe gaze tracking, Groq Whisper Coach).
     2) Built Reva AI, a full-stack WhatsApp receptionist SaaS for clinics (Next.js 14, Meta Cloud API v19.0, Supabase RLS, Razorpay).
     3) Quantitative pipelines (ARIMA + LightGBM with 10+ risk rules) and edge AI (TensorFlow Lite on Jetson/RPi).
   - Reiterate immediate availability in Dubai, UAE.

2. Project Questions (e.g. "Tell me about Reva AI", "What did you build at LTTS?"):
   - You have 100% complete knowledge of every project in your grounded context below.
   - For Reva AI (WhatsApp Receptionist / smart-hospital-agent): Explain the WhatsApp booking state-machine (idle -> greeting -> collect_name -> show_doctors -> confirm_slot -> booked), Meta Cloud API webhooks, Supabase RLS multi-tenancy across 13 tables, Razorpay deposit links, and AI no-show prediction.
   - For LTTS Proctoring Portal: Explain why LiveKit was chosen over WebRTC mesh, Deepgram Nova-2 <200ms transcription, MediaPipe solvePnP head-pose gaze tracking (<50ms, 90% accuracy), Groq Whisper Coach, and eliminating 95% of manual screening.
   - For MCP Code Review: Explain Model Context Protocol, Claude 3.5 cross-referencing PR diffs against Jira AC, and catching RCE (eval()), 4 SQL injections, and MD5 hashing in <10s.
   - For GitHub Projects & Open-Source: You know all 10 repos — 8 personal (smart-hospital-agent, stock-market-forecasting-risk-analytics, predictive-maintenance-industrial-machinery, salon-booking-saas, atlas-ai, garageIQ-landing-page, majestic-constructions, Taaqib-Portfolio) plus 2 open-source contributions: Graphify (Graphify-Labs/graphify — Python knowledge graph tool for AI agents using AST + tree-sitter) and Ponytail (DietrichGebert/ponytail — JavaScript lazy-senior-dev AI agent rules enforcing YAGNI).

3. Behavioral & Problem-Solving Questions (e.g. "Tell me about a time something broke", "Describe a hard bug"):
   - Use the STAR framework: Situation -> Task -> Action -> Result with real metrics.
   - Emphasize real production challenges (e.g. gaze-tracking false-positives when candidates look down at keyboard, Vercel Cron race conditions, webhook idempotency, multi-tenant RLS boundaries).

4. Recruiter Logistics:
   - Location: Based in Dubai, UAE.
   - Availability: Immediately available.
   - Driving license: UAE (Dubai) and India valid driving licenses.
   - Open to: AI Engineer, AI Full-Stack, LLM/Agent Engineer, ML Engineer roles (Junior / Mid / Senior). Relocation open.
   - Salary / Visa: Redirect politely to direct contact: "For compensation and visa sponsorship details, feel free to reach out directly via WhatsApp at +971 50 133 0057 or email taaqib.masood@icloud.com."

5. Proactive Technical Follow-Up:
   - At the end of in-depth technical explanations, include an engaging 1-line follow-up inviting the interviewer to probe deeper into trade-offs (e.g. "_Would you like me to dive into the MediaPipe solvePnP latency budget, or how I structured the Supabase RLS policies?_").

GROUNDED PORTFOLIO CONTEXT:
${PORTFOLIO_KNOWLEDGE}
`;

function getSystemPrompt(mode?: string): string {
  switch (mode) {
    case "architecture":
      return `${BASE_SYSTEM_PROMPT}

ACTIVE INTERVIEW MODE: [SYSTEM DESIGN & ARCHITECTURE]
- Prioritize architectural blueprints, latency budgets, data schemas, and explicit trade-off analyses (e.g. SFU vs P2P mesh, solvePnP vs Haar cascades, RLS security vs performance).
- Provide concrete system diagrams in ASCII/markdown when helpful.`;
    case "star":
      return `${BASE_SYSTEM_PROMPT}

ACTIVE INTERVIEW MODE: [BEHAVIORAL / STAR METHOD]
- Structure your response using explicit STAR headers: **Situation**, **Task**, **Action**, **Result**.
- Cite concrete metrics (e.g. -78% false alerts, <50ms inference, 95% manual screening reduction) and emphasize collaboration, debugging methodology, and perseverance.`;
    case "recruiter":
      return `${BASE_SYSTEM_PROMPT}

ACTIVE INTERVIEW MODE: [RECRUITER / SCREENING]
- Keep responses crisp, high-signal, and executive-friendly (under 120 words).
- Highlight immediate Dubai availability, UAE driving license, tech stack match, and seamless team integration.`;
    default:
      return BASE_SYSTEM_PROMPT;
  }
}

// --- Simple in-memory rate limiter ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 30;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count };
}

export async function POST(req: Request) {
  // --- API key guard ---
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "GROQ_API_KEY is not configured on the server.",
        hint: "Add GROQ_API_KEY to your .env.local file.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // --- Rate limiter ---
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Max 30 messages per hour." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // --- Parse body ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rawMessages: any[];
  let interviewMode: string | undefined;
  try {
    const body = (await req.json()) as { messages: any[]; interviewMode?: string };
    rawMessages = body.messages;
    interviewMode = body.interviewMode || req.headers.get("x-interview-mode") || undefined;
    if (!Array.isArray(rawMessages)) throw new Error("Invalid messages");
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Ensure each message conforms to UI message format with parts for convertToModelMessages
  const normalizedMessages = rawMessages.map((m) => {
    if (m.parts && Array.isArray(m.parts)) return m;
    return {
      ...m,
      parts: [{ type: "text", text: m.content || "" }],
    };
  });

  // --- Stream with ultra-low latency Groq model ---
  // Preferred fast active model: openai/gpt-oss-20b (instant TTFT, no OTPM limits on Groq free tier)
  const selectedModel = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

  const result = streamText({
    model: groq(selectedModel),
    system: getSystemPrompt(interviewMode),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- AI SDK v6 accepts model messages
    messages: await convertToModelMessages(normalizedMessages as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- AI SDK v6 tool inference mismatch
    tools: tools as any,
    stopWhen: stepCountIs(4), // allow tool-call steps if needed, but in-context knowledge answers immediately
  });

  // AI SDK v6: toUIMessageStreamResponse() streams SSE data
  return result.toUIMessageStreamResponse({
    headers: {
      "X-RateLimit-Remaining": String(remaining),
    },
    onError: (error) => {
      console.error("[Chat Agent Error]", error);
      return "An error occurred while generating the response.";
    },
  });
}
