// GET /api/catalog — public product list (only products in stock, no internal fields).
import { json } from '../_lib/store.js';

export async function onRequestGet({ env }) {
  const catalog = await env.DB_KV.get('catalog:compiled', { type: 'json', cacheTtl: 60 });
  const visible = (catalog || []).filter(p => p.in_stock !== false).map(({ updated_at, ...p }) => p);
  return json(visible, 200, { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' });
}
