export async function onRequestPost({ request, env }) {
  try {
    // ── Rate Limiting ──
    // Track failed attempts per IP to prevent brute-force attacks
    const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `ratelimit:login:${clientIP}`;
    
    const rateLimitData = await env.DB_KV.get(rateLimitKey, { type: 'json' });
    if (rateLimitData && rateLimitData.attempts >= 5) {
      return new Response(JSON.stringify({ error: "Too many login attempts. Try again in 15 minutes." }), {
        status: 429,
        headers: { 
          "Content-Type": "application/json",
          "Retry-After": "900"
        }
      });
    }

    // ── Validate Content-Type ──
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: "Invalid content type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { password } = await request.json();
    
    if (!password || typeof password !== 'string') {
      return new Response(JSON.stringify({ error: "Password required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check password from environment variables (.dev.vars locally)
    if (password !== env.ADMIN_PASSWORD) {
      // Increment failed attempts
      const currentAttempts = rateLimitData ? rateLimitData.attempts : 0;
      await env.DB_KV.put(rateLimitKey, JSON.stringify({ 
        attempts: currentAttempts + 1, 
        last_attempt: Date.now() 
      }), { expirationTtl: 900 }); // 15 min TTL

      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Successful login — clear rate limit
    await env.DB_KV.delete(rateLimitKey);

    // Generate session token
    const token = crypto.randomUUID();
    
    // Store in KV with a 24-hour expiration (86400 seconds)
    await env.DB_KV.put(`session:${token}`, JSON.stringify({
      created_at: Date.now(),
      ip: clientIP
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
