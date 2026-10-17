/**
 * Newsletter signup. Runs as a Cloudflare Pages Function.
 *
 * Visitors send the form on /newsletter/signup. Before the existing signup
 * logic runs, the request must present a Turnstile token that siteverify
 * accepts for action "signup" and for a hostname in TURNSTILE_HOSTNAMES.
 *
 * Required bindings (Pages → Settings → Variables and Secrets):
 *   TURNSTILE_SECRET     Encrypt. Widget secret. Never the public test secret.
 *   TURNSTILE_HOSTNAMES  Comma-separated frontend hostnames for this deployment.
 *                        Production example: simplyexplained.com,www.simplyexplained.com
 *                        Do not mix localhost or 127.0.0.1 into that list.
 *   GOOGLE_CHAT_WEBHOOK  Existing webhook. Unchanged.
 *
 * The public sitekey is build-time only (TURNSTILE_SITEKEY). It is not read here.
 *
 * Redirects:
 *   /newsletter/signup/success   subscriber accepted
 *   /newsletter/signup/failed    validation, Turnstile, or webhook failure
 */
const EXPECTED_ACTION = 'signup';
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1']);

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);

  try {
    const formBody = await request.formData().catch(() => {
      console.error('No form data provided');
      return null;
    });
    if (!formBody) {
      return redirect(signupUrl(url, '/failed'));
    }

    const fields = Object.fromEntries(formBody);
    const turnstile = await verifyTurnstile({
      token: fields['cf-turnstile-response'],
      request,
      env,
    });
    if (!turnstile.ok) {
      console.warn(`Turnstile rejected newsletter signup: ${turnstile.reason}`);
      return redirect(signupUrl(url, '/failed?reason=turnstile'));
    }

    const { email } = fields;

    if (!email) {
      console.error('No email address provided');
      return redirect(signupUrl(url, '/failed'));
    }

    // Make an attempt at validating the email address. Doesn't need to be 100%
    // fool-proof, as the downstream signup path validates as well.
    // Source: https://emailregex.com
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (emailRegex.test(email) === false) {
      console.error('No valid email address provided');
      return redirect(signupUrl(url, '/failed'));
    }

    // When running locally, don't make requests to Google Chat and simulate a
    // successful registration.
    if (isLocalHost(url.hostname)) {
      console.log('Local run: email would be sent to Google Chat:', email);
      return redirect(signupUrl(url, '/success'));
    }

    // Server-side Bot Protection: Check for honeypot (full_name)
    // Bots usually fill all fields. Humans won't see this one.
    const { full_name } = fields;
    if (full_name) {
      console.warn('Honeypot triggered by bot:', email);
      // Return a fake success to not tip off the bot
      return redirect(signupUrl(url, '/success'));
    }

    const slackResponse = await notifySlack(email, request, env);

    if (slackResponse.ok) {
      return redirect(signupUrl(url, '/success'));
    } else {
      const errorText = await slackResponse.text();
      console.error('Google Chat API failed:', errorText);
      return redirect(signupUrl(url, '/failed?reason=webhook'));
    }
  } catch (e) {
    console.error('Worker internal error:', e);
    return redirect(signupUrl(url, '/failed?reason=internal'));
  }
}

/**
 * Canonical Turnstile siteverify. Fails closed.
 * Testing keys are rejected: Cloudflare marks them with
 * metadata.result_with_testing_key, and their tokens do not carry action "signup".
 */
export async function verifyTurnstile({ token, request, env }) {
  const hostnames = expectedHostnames(env);
  const secret = env?.TURNSTILE_SECRET;

  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) {
    return { ok: false, reason: 'missing-token' };
  }
  if (typeof secret !== 'string' || secret.trim() === '' || !allowlistIsSafe(hostnames)) {
    return { ok: false, reason: 'missing-config' };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });
  const remoteip = request.headers.get('CF-Connecting-IP');
  if (typeof remoteip === 'string' && remoteip.length > 0) {
    body.set('remoteip', remoteip);
  }

  let result;
  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body,
    });
    if (!response.ok) {
      throw new Error(`siteverify ${response.status}`);
    }
    result = await response.json();
  } catch {
    console.error('Turnstile siteverify failed');
    return { ok: false, reason: 'siteverify-error' };
  }

  if (result?.metadata?.result_with_testing_key === true) {
    return { ok: false, reason: 'testing-key' };
  }
  if (
    result?.success !== true ||
    result.action !== EXPECTED_ACTION ||
    !hostnames.has(result.hostname)
  ) {
    return { ok: false, reason: 'rejected' };
  }

  return { ok: true };
}

function expectedHostnames(env) {
  return new Set(
    String(env?.TURNSTILE_HOSTNAMES ?? '')
      .split(',')
      .map((hostname) => hostname.trim())
      .filter(Boolean),
  );
}

// A production allowlist that also contains localhost would accept a token
// minted on a developer's machine. Keep those deployments separate.
function allowlistIsSafe(hostnames) {
  if (hostnames.size === 0) return false;
  let hasLocal = false;
  let hasPublic = false;
  for (const hostname of hostnames) {
    if (LOCAL_HOSTNAMES.has(hostname)) hasLocal = true;
    else hasPublic = true;
  }
  return !(hasLocal && hasPublic);
}

function isLocalHost(hostname) {
  return LOCAL_HOSTNAMES.has(hostname);
}

function signupUrl(url, suffix) {
  const protocol = isLocalHost(url.hostname) ? 'http' : 'https';
  return `${protocol}://${url.host}/newsletter/signup${suffix}`;
}

/**
 * HTTP 303 - See Other
 * The server sent this response to direct the client to get the requested
 * resource at another URI with a GET request.
 */
function redirect(url) {
  return Response.redirect(url, 303);
}

async function notifySlack(email, req, env) {
  const botScore = req.cf?.botManagement?.score || 'unknown';
  const country = req.cf?.country || 'unknown';

  return fetch(env.GOOGLE_CHAT_WEBHOOK, {
    method: 'POST',
    body: JSON.stringify({
      text: `🏎️ *New Subscriber*\n*Email:* ${email}\n*Country:* ${country}\n*Bot Score:* ${botScore}`,
    }),
    headers: {
      'content-type': 'application/json',
    },
  });
}
