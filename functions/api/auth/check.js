import { json, hasValidSession } from '../../_lib/store.js';

export async function onRequestGet({ request, env }) {
  return json({ authenticated: await hasValidSession(request, env) }, 200, { 'Cache-Control': 'no-store' });
}
