import { json } from '../_lib/store.js';

export async function onRequestGet({ env }) {
  const catalog = await env.DB_KV.get('catalog:compiled', { type: 'json', cacheTtl: 60 });
  return json(catalog || [], 200, { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' });
}
