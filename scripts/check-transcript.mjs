import assert from "node:assert/strict";
const { transcriptSchema, formatTranscript, toTranscriptMessages } = await import("../src/lib/transcript.ts");

// UI messages → transcript: text only, tool parts and system turns dropped.
const msgs = toTranscriptMessages([
  { role: "system", parts: [{ type: "text", text: "secret" }] },
  { role: "user", parts: [{ type: "text", text: "Why LiveKit?" }] },
  { role: "assistant", parts: [{ type: "tool-get_project" }, { type: "text", text: "SFU scales " }, { type: "text", text: "better." }] },
]);
assert.deepEqual(msgs, [{ role: "user", text: "Why LiveKit?" }, { role: "assistant", text: "SFU scales better." }]);

const mail = formatTranscript(transcriptSchema.parse({ messages: msgs, email: "hr@careem.com", mode: "architecture" }));
assert.match(mail.subject, /1 question · follow-up from hr@careem\.com/);
assert.match(mail.text, /VISITOR:\nWhy LiveKit\?/);
assert.match(mail.text, /unverified/);

// Rejected: no visitor question, header-injection email, oversize, unknown role.
assert.equal(formatTranscript({ messages: [{ role: "assistant", text: "hi" }, { role: "assistant", text: "?" }] }), null);
assert.ok(!transcriptSchema.safeParse({ messages: msgs, email: "a@b.co\nBcc: x@y.z" }).success);
assert.ok(!transcriptSchema.safeParse({ messages: [{ role: "user", text: "x".repeat(4001) }, msgs[1]] }).success);
assert.ok(!transcriptSchema.safeParse({ messages: [{ role: "system", text: "x" }, msgs[1]] }).success);
console.log("PASS: transcript extraction, email formatting, and input bounds");
