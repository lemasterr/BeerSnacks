export async function onRequest(context) {
  const { request, env, next } = context;

  // 1. Extract cookie
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const cookies = cookieHeader.split(';').map(c => c.trim().split('='));
  const authCookie = cookies.find(c => c[0] === 'auth_session');
  
  if (!authCookie || !authCookie[1]) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const token = authCookie[1];

  // 2. Validate token in KV
  const session = await env.DB_KV.get(`session:${token}`);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Session is valid, pass to the next handler
  return next();
}
