import { NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { transcriptSchema, formatTranscript } from "@/lib/transcript";
import { contact } from "@/data/resume";

export const runtime = "edge";

// Emails Taaqib the visitor's AI-interview transcript (on leaving the page, or when they ask for a follow-up).
export async function POST(req: Request) {
  const parsed = transcriptSchema.safeParse(await req.json().catch(() => null));
  const mail = parsed.success ? formatTranscript(parsed.data) : null;
  if (!parsed.success || !mail) return NextResponse.json({ error: "Invalid transcript." }, { status: 400 });

  // A page-leave send plus a follow-up send per visit is normal; more than 6/hour from one IP is abuse.
  if (!rateLimit(`transcript:${getClientIp(req)}`, 6, 60 * 60 * 1000).allowed) {
    return NextResponse.json({ error: "Too many transcripts. Please try again later." }, { status: 429 });
  }

  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === "production") {
      console.error("[Transcript] RESEND_API_KEY is not set; transcript not delivered");
      return NextResponse.json({ error: "Could not send. Please email directly." }, { status: 503 });
    }
    console.log(`[Transcript Mock] ${parsed.data.messages.length} messages, follow-up: ${Boolean(parsed.data.email)}`);
    return NextResponse.json({ success: true, message: "transcript queued (mock)" });
  }

  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: "Portfolio AI Agent <onboarding@resend.dev>",
    to: contact.email,
    ...(parsed.data.email ? { replyTo: parsed.data.email } : {}),
    subject: mail.subject,
    text: mail.text,
  });
  if (error) {
    console.error("Resend error:", error.name);
    return NextResponse.json({ error: "Could not send. Please email directly." }, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
