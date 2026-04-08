export async function onRequestGet({ request, env }) {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) {
    return new Response(JSON.stringify({ authenticated: false }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  const cookies = cookieHeader.split(';').map(c => c.trim().split('='));
  const authCookie = cookies.find(c => c[0] === 'auth_session');
  
  if (!authCookie) {
    return new Response(JSON.stringify({ authenticated: false }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  const token = authCookie[1];
  const session = await env.DB_KV.get(`session:${token}`);

  if (session) {
    return new Response(JSON.stringify({ authenticated: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } else {
    return new Response(JSON.stringify({ authenticated: false }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
