import { json, error, safeEqual } from '../../_lib/store.js';

const MAX_ATTEMPTS = 5;
const WINDOW_SEC = 900;

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) return error('ADMIN_PASSWORD is not configured', 500);

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey = `ratelimit:login:${ip}`;
  const rl = await env.DB_KV.get(rlKey, { type: 'json' });
  if (rl && rl.attempts >= MAX_ATTEMPTS) {
    return json({ error: 'Too many login attempts. Try again in 15 minutes.' }, 429, { 'Retry-After': String(WINDOW_SEC) });
  }

  let password;
  try {
    ({ password } = await request.json());
  } catch {
    return error('Bad request', 400);
  }
  if (!password || typeof password !== 'string') return error('Password required', 400);

  if (!safeEqual(password, env.ADMIN_PASSWORD)) {
    await env.DB_KV.put(rlKey, JSON.stringify({ attempts: (rl?.attempts || 0) + 1 }), { expirationTtl: WINDOW_SEC });
    return error('Invalid password', 401);
  }

  if (rl) await env.DB_KV.delete(rlKey);

  const token = crypto.randomUUID();
  await env.DB_KV.put(`session:${token}`, JSON.stringify({ created_at: Date.now() }), { expirationTtl: 86400 });

  const secure = new URL(request.url).protocol === 'https:' ? ' Secure;' : '';
  return json({ success: true }, 200, {
    'Set-Cookie': `auth_session=${token}; HttpOnly;${secure} SameSite=Strict; Path=/; Max-Age=86400`,
  });
}
