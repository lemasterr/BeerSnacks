export async function onRequestPost({ request, env }) {
  try {
    const { password } = await request.json();
    
    // Check password from environment variables (.dev.vars locally)
    if (password !== env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Generate session token
    const token = crypto.randomUUID();
    
    // Store in KV with a 24-hour expiration (86400 seconds)
    await env.DB_KV.put(`session:${token}`, JSON.stringify({
      created_at: Date.now()
    }), { expirationTtl: 86400 });

    // Set secure cookie
    // SameSite=Strict helps protect against CSRF
    // HttpOnly makes it inaccessible to client-side JavaScript
    const isHttps = new URL(request.url).protocol === 'https:';
    const secureFlag = isHttps ? 'Secure;' : '';
    const cookie = `auth_session=${token}; HttpOnly; ${secureFlag} SameSite=Strict; Path=/; Max-Age=86400`;

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookie
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Bad request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}
