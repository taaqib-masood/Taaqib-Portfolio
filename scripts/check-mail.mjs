// Verifies Resend wiring without a dev server or a browser. Needs a real key in
// RESEND_API_KEY (or .env.local) and will send one real email to the owner.
//   RESEND_API_KEY=re_xxx node scripts/check-mail.mjs
//   RESEND_API_KEY=re_xxx node scripts/check-mail.mjs --send   (also sends)
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const env = existsSync('.env.local') ? readFileSync('.env.local', 'utf8') : '';
const key = process.env.RESEND_API_KEY || env.match(/^RESEND_API_KEY=(.+)$/m)?.[1]?.trim();
const from = process.env.RESEND_FROM || 'Portfolio AI Agent <onboarding@resend.dev>';
const to = 'taaqib.masood@icloud.com';

assert.ok(key && !key.startsWith('your_'), 'No usable RESEND_API_KEY. Set it in the environment or .env.local.');
console.log('key present   :', key.slice(0, 6) + '...' + key.slice(-4));
console.log('from          :', from);
console.log('to            :', to);

// 1. The key must authenticate.
const auth = await fetch('https://api.resend.com/domains', { headers: { Authorization: `Bearer ${key}` } });
const authBody = await auth.json().catch(() => ({}));
assert.equal(auth.status, 200, `Key rejected (${auth.status}): ${JSON.stringify(authBody)}`);
console.log('auth          : OK');
console.log('domains       :', (authBody.data ?? []).map(d => `${d.name} (${d.status})`).join(', ') || 'none verified');

// 2. The sender must be allowed to reach the recipient. This is the check that actually
//    catches the onboarding@resend.dev trap: it only delivers to the account's own email.
if (process.argv.includes('--send')) {
  const resend = createRequire(import.meta.url)('resend');
  const { data, error } = await new resend.Resend(key).emails.send({
    from, to, subject: 'Portfolio: Resend setup check', text: 'Resend is wired up correctly. You can ignore this email.',
  });
  assert.ok(!error, `Send failed: ${error?.message} (${error?.statusCode})`);
  console.log('send          : OK, id =', data?.id);
} else {
  console.log('send          : skipped (pass --send to deliver a real test email)');
}
console.log('PASS: Resend is configured correctly');
