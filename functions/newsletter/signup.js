/**
 * This function is called when a visitor signs up for the email newsletter.
 * It receives the email address from the user, adds it to Revue, and redirects
 * based on the response.
 * 
 * It runs as a Cloudflare Pages Function, which is based on their Workers
 * platform. However, it does receive parameters differently and has different
 * capabilities: https://developers.cloudflare.com/pages/platform/functions/
 * 
 * Redirects towards:
 *   - /newsletter/signup/success
 *     When subscriber was correctly added
 * 
 *   - /newsletter/signup/already
 *     When email address is already on the list
 * 
 *   - /newsletter/signup/failed
 *     When Revue API returned an error that couldn't be handled
 */
export async function onRequestPost({request, env})
{
    // Extract the domain from which this Function was called. Needed for the
    // redirect (which requires a full URL), and because I want to support
    // Cloudflare Pages preview deployments (which get unique subdomains).
    const url = new URL(request.url);
    const baseUrl = `https://${url.host}/newsletter/signup`;

  try{
    // Extract form data
    const formBody = await request.formData().catch(_ => {
      console.error('No form data provided');
      return redirect(`${baseUrl}/failed`);
    });

    const { email } = Object.fromEntries(formBody)

    if(!email){
      console.error('No email address provided');
      return redirect(`${baseUrl}/failed`);
    }

    // Make an attempt at validating the email address. Doesn't need to be 100%
    // fool-proof, as Revue will validate as well.
    // Source: https://emailregex.com
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(emailRegex.test(email) === false){
      console.error("No valid email address provided");
      return redirect(`${baseUrl}/failed`);
    }

    // When running locally, don't make requests to Revue and simulate a
    // successful registration. But strip the HTTPS, because that's not available.
    if(url.host.indexOf('localhost') === 0){
      const redirectUrl = `${baseUrl}/success`.replace('https', 'http');
      return redirect(redirectUrl);
    }

    const data = await notifySlack(email, request, env);
    return redirect(`${baseUrl }/success`);
  }catch(e){
    throw e;
    return redirect(`${baseUrl}/failed?reason=internal`);
  }
}

/**
 * Little helper function that redirects the user with HTTP code 303:
 * 
 * HTTP 303 - See Other
 * The server sent this response to direct the client to get the requested 
 * resource at another URI with a GET request.
 */
function redirect(url){
  return Response.redirect(url, 303);
}

function notifySlack(email, req, env){
  return fetch(new Request(env.GOOGLE_CHAT_WEBHOOK, {
    method: 'POST',
    body: JSON.stringify({
      text: "Someone subscribed to mailing list from the website: " + email,
    }),
    headers: {
      'content-type': 'application/json'
    }
  }));
}
