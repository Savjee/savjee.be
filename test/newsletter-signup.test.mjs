import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it as nodeIt } from 'node:test';
import { pathToFileURL } from 'node:url';

const source = await readFile(new URL('../functions/newsletter/signup.js', import.meta.url), 'utf8');
const compiled = join(await mkdtemp(join(tmpdir(), 'newsletter-signup-')), 'signup.mjs');
await writeFile(compiled, source);
const { onRequestPost } = await import(pathToFileURL(compiled).href);

const PASS_SECRET = '1x0000000000000000000000000000000AA';
const SPENT_SECRET = '3x0000000000000000000000000000000AA';
const DUMMY_TOKEN = 'XXXX.DUMMY.TOKEN.XXXX';
const WEBHOOK = 'https://chat.example/webhook';

const originalFetch = globalThis.fetch;

// node:test runs cases concurrently. Keep the global fetch mock exclusive.
let tail = Promise.resolve();
function it(name, fn) {
  return nodeIt(name, { timeout: 20_000 }, () => {
    const run = tail.then(async () => {
      globalThis.fetch = originalFetch;
      try {
        await fn();
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
    tail = run.then(() => {}, () => {});
    return run;
  });
}

function productionEnv(overrides = {}) {
  return {
    TURNSTILE_SECRET: 'unit-test-secret',
    TURNSTILE_HOSTNAMES: 'simplyexplained.com,www.simplyexplained.com',
    GOOGLE_CHAT_WEBHOOK: WEBHOOK,
    ...overrides,
  };
}

function signupRequest({
  host = 'simplyexplained.com',
  token = 'fresh-token',
  email = 'reader@example.com',
  fullName,
  ip = '203.0.113.4',
  includeToken = true,
  includeEmail = true,
} = {}) {
  const body = new URLSearchParams();
  if (includeEmail) body.set('email', email);
  if (includeToken) body.set('cf-turnstile-response', token);
  if (fullName !== undefined) body.set('full_name', fullName);
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (ip) headers['CF-Connecting-IP'] = ip;
  return new Request(`https://${host}/newsletter/signup`, {
    method: 'POST',
    headers,
    body,
  });
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function installFetch(handler) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    const target = String(url);
    const requestBody = await readBody(init?.body);
    calls.push({ url: target, init, body: requestBody });
    return handler({ url: target, init, body: requestBody, calls });
  };
  return calls;
}

async function readBody(body) {
  if (body == null) return '';
  if (typeof body === 'string') return body;
  if (body instanceof URLSearchParams) return body.toString();
  return new Response(body).text();
}

function siteverifyOk(hostname = 'simplyexplained.com') {
  return jsonResponse({
    success: true,
    action: 'signup',
    hostname,
  });
}

describe('newsletter signup Turnstile gate', () => {
  it('rejects a missing token before siteverify or the webhook', async () => {
    const calls = installFetch(() => {
      throw new Error('fetch should not be called');
    });
    const response = await onRequestPost({
      request: signupRequest({ includeToken: false }),
      env: productionEnv(),
    });
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), 'https://simplyexplained.com/newsletter/signup/failed?reason=turnstile');
    assert.equal(calls.length, 0);
  });

  it('rejects an oversized token without calling siteverify', async () => {
    const calls = installFetch(() => {
      throw new Error('fetch should not be called');
    });
    const response = await onRequestPost({
      request: signupRequest({ token: 'x'.repeat(2049) }),
      env: productionEnv(),
    });
    assert.equal(response.headers.get('location'), 'https://simplyexplained.com/newsletter/signup/failed?reason=turnstile');
    assert.equal(calls.length, 0);
  });

  it('fails closed when the secret or hostname allowlist is missing', async () => {
    for (const env of [
      productionEnv({ TURNSTILE_SECRET: '' }),
      productionEnv({ TURNSTILE_SECRET: '   ' }),
      productionEnv({ TURNSTILE_HOSTNAMES: '' }),
      productionEnv({ TURNSTILE_HOSTNAMES: ' , ' }),
      productionEnv({ TURNSTILE_HOSTNAMES: 'localhost,simplyexplained.com' }),
    ]) {
      const calls = installFetch(() => {
        throw new Error('fetch should not be called');
      });
      const response = await onRequestPost({
        request: signupRequest(),
        env,
      });
      assert.equal(response.headers.get('location'), 'https://simplyexplained.com/newsletter/signup/failed?reason=turnstile');
      assert.equal(calls.length, 0);
    }
  });

  it('posts the token to siteverify and only then notifies Google Chat', async () => {
    const calls = installFetch(({ url }) => {
      if (url === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') {
        return siteverifyOk();
      }
      if (url === WEBHOOK) return new Response('ok', { status: 200 });
      throw new Error(`unexpected url ${url}`);
    });

    const response = await onRequestPost({
      request: signupRequest({ token: 'fresh-token', email: 'reader@example.com' }),
      env: productionEnv(),
    });

    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), 'https://simplyexplained.com/newsletter/signup/success');
    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    assert.equal(calls[0].init.method, 'POST');
    assert.equal(calls[0].init.headers['Content-Type'], 'application/x-www-form-urlencoded');
    const params = new URLSearchParams(calls[0].body);
    assert.equal(params.get('secret'), 'unit-test-secret');
    assert.equal(params.get('response'), 'fresh-token');
    assert.equal(params.get('remoteip'), '203.0.113.4');
    assert.equal(calls[0].url.includes('unit-test-secret'), false);

    const webhook = JSON.parse(calls[1].body);
    assert.match(webhook.text, /reader@example.com/);
    assert.equal(webhook.text.includes('fresh-token'), false);
  });

  it('accepts www.simplyexplained.com when that hostname is allowlisted', async () => {
    installFetch(({ url }) => {
      if (url.includes('siteverify')) return siteverifyOk('www.simplyexplained.com');
      return new Response('ok', { status: 200 });
    });
    const response = await onRequestPost({
      request: signupRequest({ host: 'www.simplyexplained.com' }),
      env: productionEnv(),
    });
    assert.equal(response.headers.get('location'), 'https://www.simplyexplained.com/newsletter/signup/success');
  });

  it('rejects an action or hostname mismatch without notifying', async () => {
    for (const payload of [
      { success: true, action: 'login', hostname: 'simplyexplained.com' },
      { success: true, action: 'signup', hostname: 'evil.example' },
      { success: true, hostname: 'simplyexplained.com' },
      { success: false, 'error-codes': ['invalid-input-response'] },
    ]) {
      const calls = installFetch(() => jsonResponse(payload));
      const response = await onRequestPost({
        request: signupRequest(),
        env: productionEnv(),
      });
      assert.equal(response.headers.get('location'), 'https://simplyexplained.com/newsletter/signup/failed?reason=turnstile');
      assert.equal(calls.length, 1);
    }
  });

  it('fails closed when siteverify errors, and rejects a replayed token', async () => {
    const errorCalls = installFetch(() => {
      throw new Error('network down');
    });
    const errored = await onRequestPost({
      request: signupRequest(),
      env: productionEnv(),
    });
    assert.equal(errored.headers.get('location'), 'https://simplyexplained.com/newsletter/signup/failed?reason=turnstile');
    assert.equal(errorCalls.length, 1);

    const nonOk = installFetch(() => jsonResponse({ success: false }, 500));
    const badStatus = await onRequestPost({
      request: signupRequest(),
      env: productionEnv(),
    });
    assert.equal(badStatus.headers.get('location'), 'https://simplyexplained.com/newsletter/signup/failed?reason=turnstile');
    assert.equal(nonOk.length, 1);

    let verifications = 0;
    const calls = installFetch(({ url }) => {
      if (url.includes('siteverify')) {
        verifications += 1;
        if (verifications === 1) return siteverifyOk();
        return jsonResponse({ success: false, 'error-codes': ['timeout-or-duplicate'] });
      }
      return new Response('ok', { status: 200 });
    });

    const first = await onRequestPost({
      request: signupRequest({ token: 'one-time-token' }),
      env: productionEnv(),
    });
    const second = await onRequestPost({
      request: signupRequest({ token: 'one-time-token' }),
      env: productionEnv(),
    });
    assert.equal(first.headers.get('location'), 'https://simplyexplained.com/newsletter/signup/success');
    assert.equal(second.headers.get('location'), 'https://simplyexplained.com/newsletter/signup/failed?reason=turnstile');
    assert.equal(calls.filter((call) => call.url === WEBHOOK).length, 1);
  });

  it('keeps the honeypot and local webhook bypass behind a valid token', async () => {
    const honeypotCalls = installFetch(({ url }) => {
      if (url.includes('siteverify')) return siteverifyOk();
      throw new Error('webhook should not be called');
    });
    const honeypot = await onRequestPost({
      request: signupRequest({ fullName: 'Bot McBotface' }),
      env: productionEnv(),
    });
    assert.equal(honeypot.headers.get('location'), 'https://simplyexplained.com/newsletter/signup/success');
    assert.equal(honeypotCalls.length, 1);

    const localCalls = installFetch(({ url }) => {
      if (url.includes('siteverify')) return siteverifyOk('localhost');
      throw new Error('webhook should not be called');
    });
    const local = await onRequestPost({
      request: signupRequest({ host: 'localhost:8088' }),
      env: productionEnv({ TURNSTILE_HOSTNAMES: 'localhost,127.0.0.1' }),
    });
    assert.equal(local.headers.get('location'), 'http://localhost:8088/newsletter/signup/success');
    assert.equal(localCalls.length, 1);
  });

  it('does not notify when the email is missing or invalid', async () => {
    for (const request of [
      signupRequest({ includeEmail: false }),
      signupRequest({ email: 'not-an-email' }),
    ]) {
      const calls = installFetch(({ url }) => {
        if (url.includes('siteverify')) return siteverifyOk();
        throw new Error('webhook should not be called');
      });
      const response = await onRequestPost({
        request,
        env: productionEnv(),
      });
      assert.equal(response.headers.get('location'), 'https://simplyexplained.com/newsletter/signup/failed');
      assert.equal(calls.length, 1);
    }
  });

  it('still reports webhook failures after Turnstile succeeds', async () => {
    installFetch(({ url }) => {
      if (url.includes('siteverify')) return siteverifyOk();
      return new Response('nope', { status: 500 });
    });
    const response = await onRequestPost({
      request: signupRequest(),
      env: productionEnv(),
    });
    assert.equal(response.headers.get('location'), 'https://simplyexplained.com/newsletter/signup/failed?reason=webhook');
  });

  it('rejects Cloudflare testing keys against the live siteverify API', async () => {
    const cases = [
      { secret: PASS_SECRET, token: DUMMY_TOKEN },
      { secret: PASS_SECRET, token: 'not-a-real-token' },
      { secret: SPENT_SECRET, token: DUMMY_TOKEN },
    ];

    for (const testCase of cases) {
      const calls = installFetch(async ({ url, init }) => {
        if (url === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') {
          return originalFetch(url, init);
        }
        throw new Error(`unexpected fetch ${url}`);
      });
      const response = await onRequestPost({
        request: signupRequest({ token: testCase.token, ip: '' }),
        env: productionEnv({
          TURNSTILE_SECRET: testCase.secret,
          TURNSTILE_HOSTNAMES: 'simplyexplained.com,example.com',
        }),
      });
      assert.equal(response.status, 303);
      assert.equal(response.headers.get('location'), 'https://simplyexplained.com/newsletter/signup/failed?reason=turnstile');
      assert.equal(calls.some((call) => call.url === WEBHOOK), false);
      assert.equal(calls[0].url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    }
  });
});
