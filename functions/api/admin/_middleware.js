import { error, hasValidSession, HttpError } from '../../_lib/store.js';

export async function onRequest({ request, env, next }) {
  if (!(await hasValidSession(request, env))) return error('Unauthorized', 401);

  // CSRF guard: state-changing admin calls must come from our own origin.
  if (request.method !== 'GET') {
    const origin = request.headers.get('Origin');
    if (origin && origin !== new URL(request.url).origin) return error('Bad origin', 403);
  }

  try {
    return await next();
  } catch (e) {
    if (e instanceof HttpError) return error(e.message, e.status);
    console.error('Admin API error:', e && e.stack || e);
    return error('Server error', 500);
  }
}
