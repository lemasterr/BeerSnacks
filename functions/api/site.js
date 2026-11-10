// GET /api/site — everything the public catalog needs in ONE request:
// products, categories, translations and public settings (stores, socials, delivery).
// Cached at the edge for 60 s, so admin edits appear within about a minute.
import { json } from '../_lib/store.js';

export async function onRequestGet({ env }) {
  const kv = env.DB_KV;
  const opts = { type: 'json', cacheTtl: 60 };
  const [catalog, categories, translations, settings] = await Promise.all([
    kv.get('catalog:compiled', opts),
    kv.get('site:categories', opts),
    kv.get('site:translations', opts),
    kv.get('site:settings', opts),
  ]);

  const cats = {};
  (categories || []).slice().sort((a, b) => a.sort_order - b.sort_order)
    .forEach(c => { cats[c.slug] = c.subcategories || ['all']; });

  return json(
    { catalog: catalog || [], categories: cats, translations: translations || {}, settings: settings || {} },
    200,
    { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
  );
}
