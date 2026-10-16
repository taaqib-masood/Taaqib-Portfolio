import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mail";
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

  // No key in development: log and pretend, so the form is testable without Resend.
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production") {
    console.log(`[Transcript Mock] ${parsed.data.messages.length} messages, follow-up: ${Boolean(parsed.data.email)}`);
    return NextResponse.json({ success: true, message: "transcript queued (mock)" });
  }

  const result = await sendMail({
    to: contact.email,
    ...(parsed.data.email ? { replyTo: parsed.data.email } : {}),
    subject: mail.subject,
    text: mail.text,
  });
  if (!result.ok) {
    // Never a fake "sent" in production: a dropped transcript is a lost recruiter.
    console.error(`[Transcript] not delivered (${result.status}): ${result.reason}`);
    return NextResponse.json({ error: "Could not send. Please email directly." }, { status: result.status });
  }
  return NextResponse.json({ success: true, id: result.id });
}
