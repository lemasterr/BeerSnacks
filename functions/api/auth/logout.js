export async function onRequestPost({ request, env }) {
  // Extract token from cookie
  const cookieHeader = request.headers.get("Cookie");
  let token = null;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim().split('='));
    const authCookie = cookies.find(c => c[0] === 'auth_session');
    if (authCookie) {
      token = authCookie[1];
    }
  }

  // Delete session from KV if exists
  if (token) {
    await env.DB_KV.delete(`session:${token}`);
  }

  // Clear cookie using a past expiration date
  const isHttps = new URL(request.url).protocol === 'https:';
  const secureFlag = isHttps ? 'Secure;' : '';
  const clearCookie = `auth_session=; HttpOnly; ${secureFlag} SameSite=Strict; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": clearCookie
    }
  });
}
