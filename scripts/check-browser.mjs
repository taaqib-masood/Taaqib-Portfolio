// Run against `npm run start -- -p 3100` after building.
// PLAYWRIGHT_MODULE points to an existing Playwright installation; no app dependency needed.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.route('**/_vercel/**', route => route.fulfill({ status: 200, body: '' }));
await page.route('https://api.github.com/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
let requests = 0;
let scenario = 'success';
await page.route('**/api/chat/stream', async route => {
  requests++;
  const request = route.request().postDataJSON();
  assert.ok(request.messages.at(-1).parts[0].text.trim(), 'Never send an empty message');
  if (scenario === 'error') return route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Mock provider unavailable"}' });
  const chunks = [
    { type: 'start', messageId: `mock-${requests}` },
    { type: 'start-step' },
    { type: 'tool-input-start', toolCallId: `call-${requests}`, toolName: 'get_project' },
    { type: 'tool-input-delta', toolCallId: `call-${requests}`, inputTextDelta: '{"slug":"reva-ai"}' },
    { type: 'tool-input-available', toolCallId: `call-${requests}`, toolName: 'get_project', input: { slug: 'reva-ai' } },
  ];
  if (scenario !== 'interrupted') chunks.push(scenario === 'tool-error'
    ? { type: 'tool-output-error', toolCallId: `call-${requests}`, errorText: 'Mock tool failed' }
    : { type: 'tool-output-available', toolCallId: `call-${requests}`, output: '{"title":"Reva AI"}' });
  if (scenario === 'success') chunks.push(
    { type: 'text-start', id: 'text-1' },
    { type: 'text-delta', id: 'text-1', delta: 'Mock portfolio answer.' },
    { type: 'text-end', id: 'text-1' },
  );
  chunks.push({ type: 'finish-step' }, { type: 'finish', ...(scenario === 'success' ? { messageMetadata: { outputTokens: 12 } } : {}) });
  await route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream', 'x-vercel-ai-ui-message-stream': 'v1' }, body: chunks.map(chunk => `data: ${JSON.stringify(chunk)}\n\n`).join('') + 'data: [DONE]\n\n' });
});
try {
  await page.goto(process.env.TEST_URL || 'http://localhost:3100', { waitUntil: 'domcontentloaded' });
  const input = page.getByRole('textbox', { name: 'Chat input' });
  assert.equal(await input.inputValue(), '');
  await page.getByRole('button', { name: 'Wake Up Agent', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[aria-label="Chat input"]').value === 'Access Neural Web');
  assert.equal(requests, 0, 'Prefill must not auto-send');
  await input.fill('   ');
  assert.ok(await page.getByRole('button', { name: 'Send message', exact: true }).isDisabled());
  await input.press('Enter');
  assert.equal(requests, 0);
  await input.fill('Show me Reva AI');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await page.getByText('Mock portfolio answer.', { exact: true }).waitFor();
  await page.getByRole('list', { name: 'Tool activity' }).getByText('✓ complete', { exact: true }).waitFor();
  await page.getByTestId('agent-metrics').filter({ hasText: /complete.*FIRST TEXT \d+ms.*AVG.*tok\/s/ }).waitFor();
  for (const [next, label] of [['tool-error', '× failed'], ['interrupted', '· interrupted']]) {
    scenario = next;
    await input.fill(`Test ${next}`);
    await page.getByRole('button', { name: 'Send message', exact: true }).click();
    await page.getByRole('list', { name: 'Tool activity' }).last().getByText(label, { exact: true }).waitFor();
  }
  scenario = 'error';
  await input.fill('Test API error');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await page.getByText('[SYSTEM ERROR]:', { exact: false }).waitFor();
  await page.getByTestId('agent-metrics').filter({ hasText: 'error · FIRST TEXT --' }).waitFor();
  assert.ok(!(await page.getByTestId('agent-metrics').innerText()).includes('tok/s'));
  await page.locator('#agent').screenshot({ path: '/tmp/portfolio-agent-desktop.png' });
  assert.deepEqual(errors, [], 'No uncaught browser errors');
  console.log('PASS: wakeUpAgent prefill, empty-submit guard, mocked SDK stream, tool-only failure/interruption, API error, zero page errors');
} finally { await browser.close(); }
