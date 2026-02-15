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

    // When running locally, don't make requests to Google Chat and simulate a
    // successful registration. But strip the HTTPS, because that's not available.
    if(url.host.indexOf('localhost') === 0){
      const redirectUrl = `${baseUrl}/success`.replace('https', 'http');
      console.log('Local run: email would be sent to Google Chat:', email);
      return redirect(redirectUrl);
    }

    // Server-side Bot Protection: Check for honeypot (full_name)
    // Bots usually fill all fields. Humans won't see this one.
    const { full_name } = Object.fromEntries(formBody);
    if(full_name){
      console.warn('Honeypot triggered by bot:', email);
      // Return a fake success to not tip off the bot
      return redirect(`${baseUrl}/success`);
    }

    const slackResponse = await notifySlack(email, request, env);
    
    if(slackResponse.ok){
      return redirect(`${baseUrl}/success`);
    } else {
      const errorText = await slackResponse.text();
      console.error('Google Chat API failed:', errorText);
      return redirect(`${baseUrl}/failed?reason=webhook`);
    }
  }catch(e){
    console.error('Worker internal error:', e);
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

async function notifySlack(email, req, env){
  const botScore = req.cf?.botManagement?.score || 'unknown';
  const country = req.cf?.country || 'unknown';
  
  return fetch(env.GOOGLE_CHAT_WEBHOOK, {
    method: 'POST',
    body: JSON.stringify({
      text: `🏎️ *New Subscriber*\n*Email:* ${email}\n*Country:* ${country}\n*Bot Score:* ${botScore}`,
    }),
    headers: {
      'content-type': 'application/json'
    }
  });
}
