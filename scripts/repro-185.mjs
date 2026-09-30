// Repro for the agent terminal's React #185 "Maximum update depth exceeded" loop.
//
// Boots the dev server, mocks /api/chat/stream with a tool call plus a burst of text
// deltas (the update pressure a real Groq stream applies), sends a prompt and fails if
// React throws #185 or the "agent is offline" banner appears.
//
// Run: PLAYWRIGHT_MODULE=/abs/path/to/playwright node scripts/repro-185.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { appendFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const port = Number(process.env.PORT || 3140);
const url = process.env.LIVE_URL || `http://localhost:${port}`;

const LIVE = !!process.env.LIVE_URL;
const REAL = !!process.env.REAL;
// Must match src/app/api/chat/stream/route.ts onError text for 401/403.
const PROVIDER_ERROR_TEXT = "The agent's model access is misconfigured on the server (check GROQ_API_KEY and model access).";
const server = LIVE ? { pid: 0, exitCode: null, stdout: { on() {} }, stderr: { on() {} } }
  : spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '-p', String(port)], {
      cwd: process.cwd(), env: process.env, detached: true, stdio: ['ignore', 'pipe', 'pipe'],
    });
let serverLog = '';
const log = m => { serverLog += m; appendFileSync('/tmp/repro-server.log', m); };
server.stdout.on('data', log);
server.stderr.on('data', log);

let browser;
try {
  if (!LIVE) {
    let ready = false;
    for (let i = 0; i < 180; i++) {
      if (server.exitCode !== null) throw new Error(`Dev server exited:\n${serverLog}`);
      try { if ((await fetch(url, { signal: AbortSignal.timeout(5000) })).ok) { ready = true; break; } } catch {}
      await delay(1000);
    }
    assert.ok(ready, 'Dev server never became ready');
  }

  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error' && !m.location().url.includes('/_vercel/')) errors.push(`console: ${m.text().slice(0, 200)}`); });
  await page.route('**/_vercel/**', r => r.fulfill({ status: 200, body: '' }));
  await page.route('https://api.github.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  // A real stream delivers deltas over time, so `fetch` is patched in-page to answer
  // /api/chat/stream with a ReadableStream that emits one SSE chunk every 20ms
  // (~50 deltas/second, the rate Groq streams at). route.fulfill cannot stream.
  // REAL=1 talks to the deployed API instead of mocking it.
  if (!REAL) await page.addInitScript(({ failStatus, providerErrorText }) => {
    const PROVIDER_ERROR_TEXT = providerErrorText;
    window.__FAIL_STATUS__ = failStatus;
    // The exact text the route's onError returns for a 401/403.
    window.__PROVIDER_ERROR__ = PROVIDER_ERROR_TEXT;
    const realFetch = window.fetch;
    let turn = 0;
    window.fetch = (input, init) => {
      const url = typeof input === 'string' ? input : input?.url ?? String(input);
      if (!url.includes('/api/chat/stream')) return realFetch(input, init);
      const n = ++turn;
      // Two steps with a real tool call (the route allows stepCountIs(4)), and the tool
      // input streamed one character at a time, which is what Groq actually sends.
      const toolJson = '{"slug":"reva-ai"}';
      const answer = (n, tag) => 'I built a WhatsApp receptionist with a Supabase RLS schema, a Razorpay payment flow and a Meta Cloud API webhook. '.repeat(4).split(' ').map(w => `${w}${tag} `);
      const steps = [];
      steps.push({ type: 'start', messageId: `mock-${n}` });
      for (const step of [1, 2]) {
        steps.push({ type: 'start-step' });
        if (step === 1) {
          steps.push({ type: 'tool-input-start', toolCallId: `call-${n}`, toolName: 'get_project' });
          for (const ch of toolJson) steps.push({ type: 'tool-input-delta', toolCallId: `call-${n}`, inputTextDelta: ch });
          steps.push({ type: 'tool-input-available', toolCallId: `call-${n}`, toolName: 'get_project', input: { slug: 'reva-ai' } });
          steps.push({ type: 'tool-output-available', toolCallId: `call-${n}`, output: '{"title":"Reva AI"}' });
        }
        const words = answer(n, step === 1 ? 'A' : 'B');
        steps.push({ type: 'text-start', id: `text-${step}` });
        // Two characters per frame, ~50 frames/second: the real token rate.
        for (let i = 0; i < words.length; i += 2) steps.push({ type: 'text-delta', id: `text-${step}`, delta: words.slice(i, i + 2).join('') });
        steps.push({ type: 'text-end', id: `text-${step}` });
        steps.push({ type: 'finish-step' });
      }
      steps.push({ type: 'finish', messageMetadata: { outputTokens: 160 } });
      // FAIL_STATUS=1 makes the mocked provider reject, to exercise the error path.
      const frames = window.__FAIL_STATUS__ && n === 1
        ? [`data: ${JSON.stringify({ type: 'error', errorText: PROVIDER_ERROR_TEXT })}\n\n`, 'data: [DONE]\n\n']
        : steps.map(c => `data: ${JSON.stringify(c)}\n\n`).concat('data: [DONE]\n\n');
      const encoder = new TextEncoder();
      const body = new ReadableStream({
        async start(controller) {
          for (const frame of frames) {
            await new Promise(r => setTimeout(r, 5));
            controller.enqueue(encoder.encode(frame));
          }
          controller.close();
        },
      });
      return Promise.resolve(new Response(body, {
        status: 200,
        headers: { 'content-type': 'text/event-stream', 'x-vercel-ai-ui-message-stream': 'v1' },
      }));
    };
  }, { failStatus: !!process.env.FAIL_STATUS, providerErrorText: PROVIDER_ERROR_TEXT });

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  // The Agent section is lazy-mounted by the <Near> gate, so bring it into range first.
  await page.evaluate(() => {
    const el = document.querySelector('#agent');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 200 });
  });
  await page.waitForSelector('textarea[aria-label="Chat input"]', { timeout: 60000 });

  // Two turns: the loop can also come from re-entering the streaming state.
  // The error scenario needs just one turn, since sending again clears the banner.
  const questions = process.env.FAIL_STATUS
    ? ['Tell me about Reva AI.']
    : ['Tell me about Reva AI.', 'And what did you build at LTTS?'];
  for (const question of questions) {
    await page.fill('textarea[aria-label="Chat input"]', question);
    await page.click('button[aria-label="Send message"]');
    await page.waitForFunction(() => {
      const a = document.querySelector('#agent');
      return a?.querySelector('.prose')?.textContent?.trim() || a?.querySelector('[role=alert]');
    }, { timeout: 30000 });
    await delay(1000);
  }

  const alert = await page.locator('#agent [role=alert]').first().textContent().catch(() => null);
  const metrics = await page.locator('[data-testid=agent-metrics]').textContent().catch(() => null);
  console.log('alert         :', JSON.stringify(alert));
  console.log('status-bar    :', metrics);
  console.log('page errors   :', errors.length ? errors : 'none');

  if (process.env.EXPECT_ERROR) {
    // A provider failure must name its real cause, not claim "the agent is offline".
    assert.match(alert || '', new RegExp(process.env.EXPECT_ERROR), 'the alert hid the real provider error');
    console.log('PASS: the alert named the real cause');
  } else {
    assert.ok(!errors.some(e => /185|Maximum update depth/.test(e)), 'React #185 was thrown');
    assert.ok(!alert, 'the offline fallback banner was shown');
    assert.match(metrics || '', /complete/, 'the request never reached the complete state');
    console.log('PASS: two streamed turns, no React 185, no offline banner');
  }
} finally {
  await browser?.close().catch(() => {});
  if (!LIVE) { try { process.kill(-server.pid); } catch {} }
}
