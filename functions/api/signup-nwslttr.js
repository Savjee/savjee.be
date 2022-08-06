export async function onRequestPost({request, env}) {
  const url = "https://www.getrevue.co/api/v2/subscribers";
  const token = env.REVUE_TOKEN;
  const body = await request.json();

  if(!body.email){
    return new Response(JSON.stringify({
      success: false,
      error: "No email address provided",
    }), { status: 400});
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
    return new Response(JSON.stringify({
      success: false,
      error: res.error,
    }), { status: 500});
  }

  return new Response(JSON.stringify({
    success: true,
    error: null,
  }));
}
