import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

const headers = await readFile(new URL('../_site/_headers', import.meta.url), 'utf8');
const policies = [...headers.matchAll(/^ {2}Content-Security-Policy:\s*(.+)$/gm)].map((match) => match[1]);
const turnstileOrigin = 'https://challenges.cloudflare.com';

function sources(policy, directive) {
  const part = policy.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${directive} `));
  assert.ok(part, `missing ${directive}`);
  return part.slice(directive.length).trim().split(/\s+/);
}

describe('Turnstile content security policy', () => {
  it('allows the Turnstile origin in script, frame, and connect directives', () => {
    assert.equal(policies.length, 2);
    for (const policy of policies) {
      for (const directive of ['script-src', 'frame-src', 'connect-src']) {
        assert.ok(
          sources(policy, directive).includes(turnstileOrigin),
          `${directive} does not allow ${turnstileOrigin}`,
        );
      }
    }
  });
});
