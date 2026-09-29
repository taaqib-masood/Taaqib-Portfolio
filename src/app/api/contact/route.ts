import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

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

    if (!process.env.RESEND_API_KEY) {
      // In production a missing key must fail loudly: a fake "sent" would silently drop a recruiter's message.
      if (process.env.NODE_ENV === "production") {
        console.error("[Contact] RESEND_API_KEY is not set; message not delivered");
        return NextResponse.json({ error: "Could not send your message. Please email directly." }, { status: 503 });
      }
      // Never log the sender's PII; lengths are enough to confirm the mock path works.
      console.log(`[Contact Form Mock] received message (${message.length} chars)`);
      return NextResponse.json(
        { success: true, message: "message queued (mock)" },
        { status: 200 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: "taaqib.masood@icloud.com",
      replyTo: email,
      subject: `New portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    if (error) {
      console.error("Resend error:", error.name);
      return NextResponse.json({ error: "Could not send your message. Please email directly." }, { status: 502 });
    }

    return NextResponse.json({ success: true, id: data?.id }, { status: 200 });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
