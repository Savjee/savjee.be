let turnstileScript;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileScript) return turnstileScript;

  turnstileScript = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = setTimeout(fail, 15_000);

    function cleanup() {
      clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
    }

    function fail() {
      cleanup();
      script.remove();
      turnstileScript = undefined;
      reject(new Error('Turnstile could not load'));
    }

    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onerror = fail;
    script.onload = () => {
      if (!window.turnstile) return fail();
      cleanup();
      resolve(window.turnstile);
    };
    document.head.append(script);
  });

  return turnstileScript;
}

document.querySelectorAll('form[data-newsletter-signup]').forEach((form) => {
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('[data-newsletter-status]');
  const container = form.querySelector('[data-turnstile-widget]');
  const buttonText = button.textContent;
  let pending = false;
  let response;

  function reset() {
    response?.remove();
    response = undefined;
    pending = false;
    button.disabled = false;
    button.textContent = buttonText;
    status.hidden = true;
  }

  // A page restored with Back can retain the disabled button and the spent token.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) reset();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;

    pending = true;
    button.disabled = true;
    button.textContent = 'Verifying…';
    form.setAttribute('aria-busy', 'true');
    status.hidden = false;
    status.textContent = 'Verifying your signup…';
    let turnstile;
    let widgetId;

    try {
      turnstile = await loadTurnstile();
      const token = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Verification timed out')), 120_000);
        const finish = (callback, value) => {
          clearTimeout(timeout);
          callback(value);
        };
        try {
          widgetId = turnstile.render(container, {
            sitekey: form.dataset.turnstileSitekey,
            action: 'signup',
            appearance: 'interaction-only',
            theme: 'auto',
            'response-field': false,
            retry: 'never',
            'refresh-expired': 'never',
            'refresh-timeout': 'never',
            callback: (token) => finish(resolve, token),
            'error-callback': () => finish(reject, new Error('Verification failed')),
            'expired-callback': () => finish(reject, new Error('Verification expired')),
            'timeout-callback': () => finish(reject, new Error('Verification timed out')),
            'unsupported-callback': () => finish(reject, new Error('Browser unsupported')),
          });
        } catch (error) {
          finish(reject, error);
        }
      });

      // Recheck fields in case the visitor edited them during verification.
      if (!form.reportValidity()) throw new Error('Invalid form');
      response = document.createElement('input');
      response.type = 'hidden';
      response.name = 'cf-turnstile-response';
      response.value = token;
      form.append(response);
      status.textContent = 'Submitting your signup…';
      // Submit once without starting another challenge through the submit listener.
      HTMLFormElement.prototype.submit.call(form);
    } catch {
      reset();
      status.hidden = false;
      status.textContent = 'Verification failed. Please try again. If this continues, check whether your browser blocks Cloudflare.';
    } finally {
      form.removeAttribute('aria-busy');
      if (widgetId !== undefined) turnstile.remove(widgetId);
    }
  });
});
