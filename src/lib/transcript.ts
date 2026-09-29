import { z } from "zod";

// An AI-interview transcript the visitor's browser sends so Taaqib can follow up.
// Client-supplied, so it's bounded and treated as plain text; the email says so.
export const transcriptSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(4_000) }))
    .min(2)
    .max(60),
  // Optional: the visitor asked to be followed up with. Becomes the email's reply-to.
  email: z.string().trim().email().max(200).optional(),
  mode: z.string().max(40).regex(/^[a-z-]*$/).optional(),
  locale: z.enum(["en", "ar"]).optional(),
});
export type Transcript = z.infer<typeof transcriptSchema>;

/** Plain-text email body; also rejects transcripts with no question from the visitor. */
export function formatTranscript(t: Transcript): { subject: string; text: string } | null {
  const questions = t.messages.filter((m) => m.role === "user" && m.text.trim()).length;
  if (!questions) return null;
  const lines = t.messages
    .filter((m) => m.text.trim())
    .map((m) => `${m.role === "user" ? "VISITOR" : "AI AGENT"}:\n${m.text.trim()}`);
  const who = t.email ? `Follow-up requested by ${t.email}` : "No email left (anonymous visitor)";
  return {
    subject: `Portfolio AI interview: ${questions} question${questions === 1 ? "" : "s"}${t.email ? ` · follow-up from ${t.email}` : ""}`,
    text: [
      who,
      `Mode: ${t.mode || "general"} · Language: ${t.locale || "en"}`,
      "Sent by the visitor's browser (unverified content).",
      "",
      lines.join("\n\n---\n\n"),
    ].join("\n"),
  };
}

/** UI messages → the transcript shape: text parts only (tool calls and metadata are dropped). */
export function toTranscriptMessages(messages: { role: string; parts: { type: string; text?: string }[] }[]) {
  return messages
    .filter((m): m is typeof m & { role: "user" | "assistant" } => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, text: m.parts.filter((p) => p.type === "text").map((p) => p.text ?? "").join("").slice(0, 4_000) }))
    .filter((m) => m.text.trim())
    .slice(-60);
}
