export async function onRequestPost({request, env}) {
  var err = "";
  try{
    const url = "https://www.getrevue.co/api/v2/subscribers";
    const token = env.REVUE_TOKEN;
    const body = await request.json();

    const response = await fetch(url,  {
      body: JSON.stringify(body),
      method: 'POST',
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        'Authorization': 'Token ' + token,
      },
    });

    err = await response.json();

    return new Response(JSON.stringify({
      success: true,
      error: null,
    }));
  }catch(e){
    return new Response("Something went wrong: " + e + " " + JSON.stringify(err));
  }
  
}