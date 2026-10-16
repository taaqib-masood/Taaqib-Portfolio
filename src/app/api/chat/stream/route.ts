import { createGroq } from "@ai-sdk/groq";
import { stepCountIs, streamText, convertToModelMessages } from "ai";
import { tools } from "@/lib/tools";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
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
- Name spelling: always "Taaqib Masood" (T-a-a-q-i-b, one q). Never write "Taqib", "Taquib" or any other variant.
- Voice: ALWAYS answer in the first person ("I built...", "My architecture at LTTS was...", "In Reva AI, I chose..."). You ARE Taaqib Masood's engineering proxy.
- Depth: Do not give fluffy generic summaries. Speak in concrete engineering terms (mention actual libraries, algorithms, latency metrics, DB schemas, failure modes, and architectural trade-offs).
- Punctuation: Never use em dashes (—). Use commas, colons or full stops instead.
- Brevity: Keep responses punchy, concise, and formatted with clean markdown bullet points (typically 120-220 words). If asked for deep technical detail or system design, expand thoroughly.

INTERVIEW PLAYBOOK:
1. "Tell me about yourself / Walk me through your resume":
   - Introduce yourself as an AI Engineer based in Dubai who builds systems where the model is the infrastructure, not just a demo.
   - Highlight:
     1) Sole-built the live proctoring & assessment portal at LTTS (WebRTC via LiveKit, Deepgram Nova-2 STT, MediaPipe gaze tracking, Groq Whisper Coach).
     2) Built Reva AI, a full-stack WhatsApp receptionist SaaS for clinics (Next.js 14, Meta Cloud API v19.0, Supabase RLS, Razorpay).
     3) Quantitative pipelines (ARIMA + LightGBM with 10+ risk rules) and edge AI (TensorFlow Lite quantization).
   - Reiterate immediate availability in Dubai, UAE.

2. Project Questions (e.g. "Tell me about Reva AI", "What did you build at LTTS?"):
   - You have 100% complete knowledge of every project in your grounded context below.
   - For Reva AI (WhatsApp Receptionist / smart-hospital-agent): Explain the WhatsApp booking state-machine (idle -> greeting -> collect_name -> show_doctors -> confirm_slot -> booked), Meta Cloud API webhooks, Supabase RLS multi-tenancy across 13 tables, Razorpay deposit links, and AI no-show prediction.
   - For LTTS Proctoring Portal: Explain why LiveKit was chosen over WebRTC mesh, Deepgram Nova-2 <200ms transcription, MediaPipe solvePnP head-pose gaze tracking (<50ms, 90% accuracy), Groq Whisper Coach, and eliminating 95% of manual screening.
   - For MCP Code Review: Explain Model Context Protocol, Claude 3.5 cross-referencing PR diffs against Jira AC, and catching RCE (eval()), 4 SQL injections, and MD5 hashing in <10s.
   - For GitHub Projects & Open-Source: Taaqib's public GitHub repositories are: smart-hospital-agent (Reva AI), stock-market-forecasting-risk-analytics (Boro), predictive-maintenance-industrial-machinery, salon-booking-saas, atlas-ai (AI tool directory), garageIQ-landing-page (GarageIQ marketing site) and Taaqib-Portfolio. GarageIQ's product code, the LTTS portal and the MCP code reviewer live in private repositories: describe them, but never offer a public repo link for them. If asked what open-source repositories Taaqib maintains, list ONLY these public ones.
   - For GarageIQ: explain the dual-LLM design (Gemini 2.0 Flash for live search intent, a 6-model Groq fleet for batch review enrichment routed by daily token budget), PostGIS geo search plus pgvector in one Postgres, and admin-pinned tags that survive nightly re-enrichment. It is live at https://app.garageiq.ae/en: share that link, but never claim user, traffic or revenue numbers. You do NOT maintain Graphify or Ponytail (those are external third-party tools/methodologies created by other developers).

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

// --- Rate limiting: shared bounded limiter (30 msgs / hour / IP) ---
const MAX_REQUESTS = 30;
const WINDOW_MS = 60 * 60 * 1000;
// History caps: giant pasted histories would burn tokens per request.
const MAX_CHAT_MESSAGES = 30;
const MAX_MESSAGE_CHARS = 8_000;

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
  const ip = getClientIp(req);

  const { allowed, remaining } = rateLimit(`chat:${ip}`, MAX_REQUESTS, WINDOW_MS);
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
  type RawMessage = { role: string; content?: string; parts?: { type: string; text: string }[] };
  let rawMessages: RawMessage[];
  let interviewMode: string | undefined;
  try {
    const body = (await req.json()) as { messages: RawMessage[]; interviewMode?: string };
    rawMessages = body.messages;
    interviewMode = body.interviewMode || req.headers.get("x-interview-mode") || undefined;
    if (!Array.isArray(rawMessages)) throw new Error("Invalid messages");
    if (rawMessages.length === 0 || rawMessages.length > MAX_CHAT_MESSAGES) {
      throw new Error("Too many messages");
    }
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Only user/assistant text reaches the model: a client-supplied "system" role or forged
  // tool/file parts would let a caller rewrite the agent's instructions or fake tool results.
  // Each message is clamped so oversized histories can't inflate token spend.
  const normalizedMessages = rawMessages
    .filter((m) => m && (m.role === "user" || m.role === "assistant"))
    .map((m) => {
      const text = Array.isArray(m.parts)
        ? m.parts.filter((p) => p?.type === "text" && typeof p.text === "string").map((p) => p.text).join("\n")
        : typeof m.content === "string" ? m.content : "";
      return { id: crypto.randomUUID(), role: m.role as "user" | "assistant", parts: [{ type: "text" as const, text: text.slice(0, MAX_MESSAGE_CHARS) }] };
    })
    .filter((m) => m.parts[0].text.trim().length > 0);
  if (normalizedMessages.length === 0 || normalizedMessages.at(-1)!.role !== "user") {
    return new Response(JSON.stringify({ error: "Invalid messages" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  // --- Stream with Groq model + automatic fallback ---
  // Defaults must be models this key can actually reach: the llama-3.x ids are gated
  // ("does not exist or you do not have access to it" -> 404), which killed the request
  // ~0.2s in. Override with GROQ_MODEL / GROQ_FALLBACK_MODEL.
  // 20b is primary on measured latency: 120b burns ~2s on reasoning tokens before any
  // visible output (1958ms vs 456ms to first visible token), and this is a chat UI.
  // Set GROQ_MODEL=openai/gpt-oss-120b if you want the deeper answers.
  // Fallback is 120b, not qwen: the free tier caps input tokens per minute at ~7-8k and
  // this system prompt alone is ~7.1k tokens, so qwen (ITPM 7000) can never accept a
  // request from this app and would fail on every fallback.
  const PRIMARY_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
  const FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || "openai/gpt-oss-120b";
  const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
    fetch: async (url: string | URL | Request, opts?: RequestInit) => {
      const res = await globalThis.fetch(url, opts);
      if (res.ok) return res;
      if ([429, 400, 404, 500, 503].includes(res.status) && opts?.body) {
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

  const result = streamText({
    model: groq(PRIMARY_MODEL),
    // Arabic version of the site: answer in Arabic, keep technical terms as they are.
    system: getSystemPrompt(interviewMode) + (req.headers.get("x-locale") === "ar"
      ? "\n\nLANGUAGE: The visitor is using the Arabic version of the site. Answer in clear Modern Standard Arabic. Keep technical terms, product names and code identifiers in English."
      : ""),
    messages: await convertToModelMessages(normalizedMessages),
    tools,
    stopWhen: stepCountIs(4), // allow tool-call steps if needed, but in-context knowledge answers immediately
  });

  // AI SDK v6: toUIMessageStreamResponse() streams SSE data
  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => part.type === "finish"
      ? { outputTokens: part.totalUsage.outputTokens } : undefined,
    headers: {
      "X-RateLimit-Remaining": String(remaining),
    },
    // The visitor sees this text, so keep it short, but say what actually went wrong.
    // A blanket "an error occurred" is what let a provider-side failure (bad key, no
    // model access, rate limit) masquerade as a client-side React crash for days.
    onError: (error) => {
      const status = (error as { statusCode?: number }).statusCode;
      console.error(`[Chat Agent Error] status=${status ?? "none"}`, error);
      if (status === 401 || status === 403) return "The agent's model access is misconfigured on the server (check GROQ_API_KEY and model access).";
      if (status === 429) return "The agent is rate limited by the model provider. Try again in a minute.";
      return "The agent's model provider returned an error. Try again in a moment.";
    },
  });
}
