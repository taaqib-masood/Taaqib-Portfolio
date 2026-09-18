// Requires GROQ_API_KEY in the environment or .env.local, plus an existing Playwright installation.
// Run: PLAYWRIGHT_MODULE=/absolute/path/to/playwright node scripts/check-chat-e2e.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const port = 3101;
const url = `http://localhost:${port}`;
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '-p', String(port)], {
  cwd: process.cwd(), env: process.env, detached: true, stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
server.stdout.on('data', data => { serverLog += data; });
server.stderr.on('data', data => { serverLog += data; });
const errors = [];
const responses = [];
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 90; attempt++) {
    if (server.exitCode !== null) throw new Error(`Dev server exited: ${serverLog}`);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (response.ok) { ready = true; break; }
    } catch { /* Wait for our server to compile. */ }
    await delay(1000);
  }
  assert.ok(ready, 'Dev server did not become ready');
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(`Uncaught: ${error.message}`));
  page.on('console', message => {
    // Vercel-hosted analytics are unavailable on localhost; ignore only those endpoints.
    if (message.type() === 'error' && !message.location().url.includes('/_vercel/')) {
      errors.push(`${message.text()} (${message.location().url})`);
    }
  });
  page.on('response', async response => {
    if (new URL(response.url()).pathname === '/api/chat/stream') {
      const item = { status: response.status(), body: '' };
      responses.push(item);
      try { item.body = await response.text(); } catch (error) { item.body = error.message; }
    }
  });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const input = page.getByRole('textbox', { name: 'Chat input' });
  await input.fill('Tell me briefly about Reva AI.');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  // Wait for either a rendered assistant answer or the real error surface.
  await page.waitForFunction(() => {
    const agent = document.querySelector('#agent');
    return agent?.querySelector('.prose')?.textContent?.trim() || agent?.textContent?.includes('[SYSTEM ERROR]:');
  }, { timeout: 60000 });
  await page.getByRole('button', { name: 'Send message', exact: true }).waitFor({ timeout: 60000 });
  await delay(500);
  const reply = (await page.locator('#agent .prose').allTextContents()).join('\n').trim();
  const systemError = await page.locator('#agent').getByText('[SYSTEM ERROR]:', { exact: false }).allTextContents();
  await page.locator('#agent').screenshot({ path: '/tmp/portfolio-chat-e2e.png' });
  console.log(JSON.stringify({ responses, reply, systemError, errors }, null, 2));
  assert.ok(reply, 'No assistant reply rendered');
  assert.ok(responses.some(response => response.status === 200), 'No successful real chat response');
  assert.deepEqual(systemError, [], 'Chat displayed an error');
  assert.deepEqual(errors, [], 'App-level browser errors occurred');
  console.log('PASS: real chat request, rendered assistant reply, no app-level browser errors');
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
} finally {
  await writeFile('/tmp/portfolio-chat-e2e-server.log', serverLog);
  await browser?.close();
  try { process.kill(-server.pid, 'SIGTERM'); } catch { /* Server already exited. */ }
}
