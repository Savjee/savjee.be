import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { it } from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../src/site/_assets/js/newsletter-signup.js', import.meta.url), 'utf8');

function setup(count = 1) {
  const scripts = [];
  const widgets = [];
  const removed = [];
  const timers = new Map();
  let timerId = 0;
  const forms = Array.from({ length: count }, () => {
    const button = { textContent: 'Subscribe', disabled: false };
    const status = { hidden: true, textContent: '' };
    const container = {};
    return {
      dataset: { turnstileSitekey: 'public-sitekey' },
      button, status, container,
      fields: [],
      submissions: 0,
      valid: true,
      querySelector(selector) {
        if (selector.startsWith('button')) return button;
        if (selector === '[data-newsletter-status]') return status;
        if (selector === '[data-turnstile-widget]') return container;
        throw new Error(`Unexpected selector: ${selector}`);
      },
      addEventListener(type, handler) {
        assert.equal(type, 'submit');
        this.submitHandler = handler;
      },
      setAttribute() {},
      removeAttribute() {},
      reportValidity() { return this.valid; },
      append(field) {
        this.fields.push(field);
        field.remove = () => { this.fields = this.fields.filter((entry) => entry !== field); };
      },
      submit() {
        return this.submitHandler({ preventDefault() {} });
      },
    };
  });
  const pageShowHandlers = [];
  const window = { addEventListener: (type, handler) => {
    assert.equal(type, 'pageshow');
    pageShowHandlers.push(handler);
  } };
  const api = {
    render(container, options) {
      widgets.push({ container, options });
      return widgets.length - 1;
    },
    remove(id) { removed.push(id); },
  };
  vm.runInNewContext(source, {
    window,
    document: {
      querySelectorAll: () => forms,
      createElement: () => ({ remove() { this.removed = true; } }),
      head: { append: (script) => scripts.push(script) },
    },
    HTMLFormElement: { prototype: { submit() { this.submissions++; } } },
    setTimeout(fn, delay) {
      timers.set(++timerId, { fn, delay });
      return timerId;
    },
    clearTimeout(id) { timers.delete(id); },
  });
  return {
    forms, scripts, widgets, removed, timers,
    restore() { pageShowHandlers.forEach((handler) => handler({ persisted: true })); },
    async load() {
      window.turnstile = api;
      scripts.at(-1).onload();
      await Promise.resolve();
    },
    expire(delay) {
      const timer = [...timers.values()].find((timer) => timer.delay === delay);
      assert.ok(timer, `No timer for ${delay}ms`);
      timer.fn();
    },
  };
}

it('loads nothing on page load or invalid submit, then waits for a token before posting once', async () => {
  const page = setup();
  const [form] = page.forms;
  assert.equal(page.scripts.length, 0);
  form.valid = false;
  await form.submit();
  assert.equal(page.scripts.length, 0);
  form.valid = true;
  const pending = form.submit();
  await form.submit();
  assert.equal(page.scripts.length, 1);
  assert.match(page.scripts[0].src, /api\.js\?render=explicit$/);
  assert.equal(form.button.disabled, true);
  assert.equal(form.submissions, 0);
  await page.load();
  assert.equal(page.widgets.length, 1);
  assert.equal(page.widgets[0].options.action, 'signup');
  assert.equal(page.widgets[0].options.sitekey, 'public-sitekey');
  assert.equal(form.submissions, 0);
  page.widgets[0].options.callback('fresh-token');
  await pending;
  assert.equal(form.submissions, 1);
  assert.equal(form.fields[0].name, 'cf-turnstile-response');
  assert.equal(form.fields[0].value, 'fresh-token');
  assert.deepEqual(page.removed, [0]);
  assert.equal(page.timers.size, 0);
});

it('shares one script across forms and verifies only submitted forms', async () => {
  const page = setup(3);
  const first = page.forms[0].submit();
  const second = page.forms[1].submit();
  assert.equal(page.scripts.length, 1);
  await page.load();
  assert.equal(page.widgets.length, 2);
  page.widgets[0].options.callback('first-token');
  page.widgets[1].options.callback('second-token');
  await Promise.all([first, second]);
  assert.equal(page.forms[0].fields[0].value, 'first-token');
  assert.equal(page.forms[1].fields[0].value, 'second-token');
  assert.equal(page.forms[2].submissions, 0);
  assert.equal(page.forms[2].button.disabled, false);
});

for (const failure of ['network', 'load-timeout', 'error-callback', 'expired-callback', 'timeout-callback', 'unsupported-callback', 'verification-timeout']) {
  it(`allows retry after ${failure} and ignores a late success`, async () => {
    const page = setup();
    const [form] = page.forms;
    const pending = form.submit();
    const scriptFailure = failure === 'network' || failure === 'load-timeout';
    if (failure === 'network') page.scripts[0].onerror();
    else if (failure === 'load-timeout') page.expire(15_000);
    else {
      await page.load();
      if (failure === 'verification-timeout') page.expire(120_000);
      else page.widgets[0].options[failure]();
    }
    await pending;
    assert.equal(form.submissions, 0);
    assert.equal(form.fields.length, 0);
    assert.equal(form.button.disabled, false);
    assert.match(form.status.textContent, /Please try again/);
    if (!scriptFailure) page.widgets[0].options.callback('late-token');
    assert.equal(form.submissions, 0);

    const retry = form.submit();
    if (scriptFailure) {
      assert.equal(page.scripts[0].removed, true);
      assert.equal(page.scripts.length, 2);
      await page.load();
    } else await Promise.resolve();
    page.widgets.at(-1).options.callback('retry-token');
    await retry;
    assert.equal(form.submissions, 1);
    assert.equal(form.fields[0].value, 'retry-token');
  });
}

it('rechecks email validity after verification before sending the form', async () => {
  const page = setup();
  const [form] = page.forms;
  const pending = form.submit();
  await page.load();
  form.valid = false;
  page.widgets[0].options.callback('token');
  await pending;
  assert.equal(form.submissions, 0);
  assert.equal(form.button.disabled, false);
  assert.deepEqual(page.removed, [0]);
});

it('allows a fresh signup after Back restores the page from the browser cache', async () => {
  const page = setup();
  const [form] = page.forms;
  const pending = form.submit();
  await page.load();
  page.widgets[0].options.callback('first-token');
  await pending;
  page.restore();
  assert.equal(form.button.disabled, false);
  assert.equal(form.fields.length, 0);
  const retry = form.submit();
  await Promise.resolve();
  page.widgets[1].options.callback('new-token');
  await retry;
  assert.equal(form.submissions, 2);
  assert.equal(form.fields.length, 1);
  assert.equal(form.fields[0].value, 'new-token');
});
