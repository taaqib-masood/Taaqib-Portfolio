import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = 'edge';

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key_to_prevent_crash");

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.log(`[Contact Form Mock] Name: ${name}, Email: ${email}, Message: ${message}`);
      return NextResponse.json(
        { success: true, message: "message queued (mock)" },
        { status: 200 }
      );
    }

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
