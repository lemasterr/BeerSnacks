import { json, getCookie } from '../../_lib/store.js';

export async function onRequestPost({ request, env }) {
  const token = getCookie(request, 'auth_session');
  if (token) await env.DB_KV.delete(`session:${token}`);
  const secure = new URL(request.url).protocol === 'https:' ? ' Secure;' : '';
  return json({ success: true }, 200, {
    'Set-Cookie': `auth_session=; HttpOnly;${secure} SameSite=Strict; Path=/; Max-Age=0`,
  });
}
