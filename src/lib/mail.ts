import { Resend } from "resend";

// Both email routes share this so the sender, the key check and the error wording
// can't drift apart. `RESEND_FROM` matters because Resend's test sender
// (onboarding@resend.dev) only delivers to the address on the Resend account: if the
// account was created with a different email, every send 403s until a real domain
// is verified and RESEND_FROM is set to an address on it.
const FROM = process.env.RESEND_FROM || "Portfolio AI Agent <onboarding@resend.dev>";

export type MailResult = { ok: true; id: string } | { ok: false; reason: string; status: number };

/** Human-readable cause, so the server log says which failure it actually was. */
function explain(error: { message?: string; statusCode?: number | null }): { reason: string; status: number } {
  const status = error.statusCode ?? 502;
  const message = error.message ?? "unknown Resend error";
  if (status === 401) return { reason: "RESEND_API_KEY is invalid or revoked (401). Check the key in Resend.", status };
  if (status === 403) return { reason: "Sender rejected (403). onboarding@resend.dev only sends to the Resend account's own email; verify a domain and set RESEND_FROM, or make the account email match.", status };
  if (status === 429) return { reason: "Resend rate limit or daily quota hit (429).", status };
  return { reason: `Resend rejected the send (${status}): ${message}`, status };
}

/** Sends one plain-text email. Returns a result instead of throwing, so callers map it to their own status. */
export async function sendMail(input: { to: string; subject: string; text: string; replyTo?: string }): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, reason: "RESEND_API_KEY is not set on the server.", status: 503 };
  try {
    const { data, error } = await new Resend(key).emails.send({
      from: FROM,
      to: input.to,
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
      subject: input.subject,
      text: input.text,
    });
    if (error) return { ok: false, ...explain(error) };
    return { ok: true, id: data?.id ?? "unknown" };
  } catch (error) {
    return { ok: false, reason: `Resend request threw: ${(error as Error).message}`, status: 502 };
  }
}
