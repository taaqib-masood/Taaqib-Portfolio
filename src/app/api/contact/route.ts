import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mail";

export const runtime = "edge";

const contactSchema = z.object({
  // No control characters: the name goes into the email subject line.
  name: z.string().trim().min(1).max(100).regex(/^[^\p{Cc}]+$/u),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(5_000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission. Check name, email, and message (max 5000 chars)." },
        { status: 400 }
      );
    }
    const { name, email, message } = parsed.data;

    // --- Rate limit: 5 submissions / hour / IP (prevents email bombing via Resend) ---
    const { allowed } = rateLimit(`contact:${getClientIp(req)}`, 5, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429 }
      );
    }

    // No key in development: log and pretend, so the form is testable without Resend.
    if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production") {
      // Never log the sender's PII; lengths are enough to confirm the mock path works.
      console.log(`[Contact Form Mock] received message (${message.length} chars)`);
      return NextResponse.json({ success: true, message: "message queued (mock)" }, { status: 200 });
    }

    const result = await sendMail({
      to: "taaqib.masood@icloud.com",
      replyTo: email,
      subject: `New portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });
    if (!result.ok) {
      // In production a failed send must fail loudly: a fake "sent" would drop a recruiter's message.
      console.error(`[Contact] not delivered (${result.status}): ${result.reason}`);
      return NextResponse.json({ error: "Could not send your message. Please email directly." }, { status: result.status });
    }

    return NextResponse.json({ success: true, id: result.id }, { status: 200 });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
