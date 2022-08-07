export async function onRequestPost({request, env}) {
  try{
    const url = new URL(request.url);
    const baseUrl = url.host;

    const revueUrl = "https://www.getrevue.co/api/v2/subscribers";
    const token = env.REVUE_TOKEN;
    const body = await request.json();

    if(!body.email){
      return Response.redirect(`https://${baseUrl}/newsletter/signup/failed`, 303);
    }

    const response = await fetch(revueUrl,  {
      body: JSON.stringify({
        email: body.email,
        double_opt_in: true,
      }),
      method: 'POST',
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        'Authorization': 'Token ' + token,
      },
    });

    const res = await response.json();
    if(res.error){
      if(res.error.email && res.error.email[0] === "This email address has already been confirmed"){
        // TODO: try to resend the confirmation email
        return Response.redirect(`https://${baseUrl}/newsletter/signup/already`, 303);
      }

      return Response.redirect(`https://${baseUrl}/newsletter/signup/failed`, 303);
    }

    return Response.redirect(`https://${baseUrl}/newsletter/signup/success`, 303);
  }catch(e){
    return new Response("Error: " + JSON.stringify(e) + " " + e);
  }
}