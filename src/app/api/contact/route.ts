import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "edge";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
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
      console.log(`[Contact Form Mock] Name: ${name}, Email: ${email}, Message: ${message}`);
      return NextResponse.json(
        { success: true, message: "message queued (mock)" },
        { status: 200 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: "taaqib.masood@icloud.com",
      subject: `New portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
