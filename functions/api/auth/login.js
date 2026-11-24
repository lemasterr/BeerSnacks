import { json, error, safeEqual } from '../../_lib/store.js';
import { sha256 } from '../../_lib/orders.js';

// Brute-force protection: at most 5 wrong passwords per IP in 15 minutes, and at most 30 wrong passwords
// from everyone together per 15 minutes (stops guessing spread over many IPs). Counted in D1.
const WINDOW_MS = 15 * 60_000;
const PER_IP = 5;
const GLOBAL = 30;

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) return error('ADMIN_PASSWORD is not configured', 500);
  if (!env.DB) return error('Login is temporarily unavailable', 503);

  const now = Date.now();
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const ipHash = (await sha256(`${ip}|login`)).slice(0, 32);
  const since = now - WINDOW_MS;
  const [mine, all] = await env.DB.batch([
    env.DB.prepare(`SELECT COUNT(*) AS n FROM login_failures WHERE ip_hash = ?1 AND at > ?2`).bind(ipHash, since),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM login_failures WHERE at > ?1`).bind(since),
  ]);
  if (mine.results[0].n >= PER_IP || all.results[0].n >= GLOBAL) {
    return json({ error: 'Too many login attempts. Try again in 15 minutes.' }, 429, { 'Retry-After': '900' });
  }

  let password;
  try {
    ({ password } = await request.json());
  } catch {
    return error('Bad request', 400);
  }
  if (!password || typeof password !== 'string' || password.length > 200) return error('Password required', 400);

  if (!safeEqual(password, env.ADMIN_PASSWORD)) {
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO login_failures (ip_hash, at) VALUES (?1, ?2)`).bind(ipHash, now),
      env.DB.prepare(`DELETE FROM login_failures WHERE at < ?1`).bind(now - 24 * 3600_000),
    ]);
    return error('Invalid password', 401);
  }

  await env.DB.prepare(`DELETE FROM login_failures WHERE ip_hash = ?1`).bind(ipHash).run();

  const token = crypto.randomUUID();
  await env.DB_KV.put(`session:${token}`, JSON.stringify({ created_at: now }), { expirationTtl: 86400 });

  const secure = new URL(request.url).protocol === 'https:' ? ' Secure;' : '';
  return json({ success: true }, 200, {
    'Set-Cookie': `auth_session=${token}; HttpOnly;${secure} SameSite=Strict; Path=/; Max-Age=86400`,
  });
}
