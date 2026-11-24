// GET /api/site — everything the public catalog needs in ONE request:
// products, categories, translations and public settings (stores, socials, delivery).
// The built response is kept in the Cloudflare edge cache for 60 s, so a crowd of visitors costs
// one set of KV reads per minute per data centre (admin edits appear within about a minute).
import { json } from '../_lib/store.js';
import { withStoreDefaults } from '../_lib/stores.js';

const TTL = 60;

export async function onRequestGet({ request, env, waitUntil }) {
  const cache = caches.default;
  const key = new Request(new URL('/api/site', request.url).toString(), { method: 'GET' });
  const hit = await cache.match(key);
  if (hit) return hit;

  const kv = env.DB_KV;
  const opts = { type: 'json', cacheTtl: TTL };
  const [catalog, categories, translations, settings] = await Promise.all([
    kv.get('catalog:compiled', opts),
    kv.get('site:categories', opts),
    kv.get('site:translations', opts),
    kv.get('site:settings', opts),
  ]);

  const cats = {};
  (categories || []).slice().sort((a, b) => a.sort_order - b.sort_order)
    .forEach(c => { cats[c.slug] = c.subcategories || ['all']; });

  // Visitors only see products in stock, and never need internal fields: a lighter response.
  const visible = (catalog || []).filter(p => p.in_stock !== false).map(({ updated_at, ...p }) => {
    for (const k in p) if (p[k] === '' || p[k] === null) delete p[k];
    return p;
  });

  const res = json(
    { catalog: visible, categories: cats, translations: translations || {}, settings: withStoreDefaults(settings || {}) },
    200,
    { 'Cache-Control': `public, max-age=${TTL}, stale-while-revalidate=300` },
  );
  waitUntil(cache.put(key, res.clone()));
  return res;
}
