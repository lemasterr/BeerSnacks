// GET /api/admin/orders            — open orders + everything from the last 14 days (newest first)
// GET /api/admin/orders?since=<ms> — only orders changed after that time (the admin polls this every few seconds)
import { json } from '../../_lib/store.js';
import { expireOld, rowToOrder } from '../../_lib/orders.js';

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ orders: [], now: Date.now(), disabled: true });
  const now = Date.now();
  await expireOld(env, now);
  const since = Number(new URL(request.url).searchParams.get('since')) || 0;
  const q = since
    ? env.DB.prepare(`SELECT * FROM orders WHERE updated_at > ?1 ORDER BY id DESC LIMIT 200`).bind(since)
    : env.DB.prepare(`SELECT * FROM orders WHERE status IN ('new','paid','ready') OR created_at > ?1 ORDER BY id DESC LIMIT 300`).bind(now - 14 * 86400_000);
  const { results } = await q.all();
  return json({ orders: results.map(r => rowToOrder(r, { full: true })), now });
}
