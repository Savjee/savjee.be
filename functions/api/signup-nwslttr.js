export async function onRequestPost({request, env}) {
  try{
    const url = "https://www.getrevue.co/api/v2/subscribers";
    const token = env.REVUE_TOKEN;
    const body = await request.json();

    if(!body.email){
      return Response.redirect("/newsletter/signup/failed", 303);

      // return new Response(JSON.stringify({
      //   success: false,
      //   error: "No email address provided",
      // }), { status: 400});
    }

    const response = await fetch(url,  {
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
        return Response.redirect("/newsletter/signup/already", 303);

        // return new Response(JSON.stringify({
        //   success: true,
        //   error: "Already subscribed",
        // }));
      }

      return Response.redirect("/newsletter/signup/failed", 303);
      // return new Response(JSON.stringify({
      //   success: false,
      //   error: res.error,
      // }), { status: 500});
    }

    return Response.redirect("/newsletter/signup/success", 303);
    // return new Response(JSON.stringify({
    //   success: true,
    //   error: null,
    // }));
  }catch(e){
    return new Response("Error: " + JSON.stringify(e) + " " + e);
  }
}
