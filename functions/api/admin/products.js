import { json, error, readJsonBody, getCatalog, saveCatalog, sanitizeProduct } from '../../_lib/store.js';

export async function onRequestGet({ env }) {
  return json(await getCatalog(env.DB_KV), 200, { 'Cache-Control': 'no-store' });
}

// POST: add a new product
export async function onRequestPost({ request, env }) {
  const body = await readJsonBody(request);
  const catalog = await getCatalog(env.DB_KV);

  let id = typeof body.id === 'string' && /^[a-z0-9_-]{1,64}$/i.test(body.id) ? body.id : `item-${Date.now()}`;
  if (catalog.some(p => p.id === id)) {
    if (body.id) return error('Product with this id already exists', 409);
    id = `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const product = {
    in_stock: true, stock_oismae: false, stock_mahtra: false, sort_order: 0, price: 0,
    ...sanitizeProduct(body),
    id,
    updated_at: new Date().toISOString(),
  };
  if (!product.category) product.category = 'uncategorized';

  catalog.push(product);
  await saveCatalog(env.DB_KV, catalog);
  return json({ success: true, product });
}

// PATCH: bulk update [{ id, ...fields }] in ONE read-modify-write (bulk stock toggles etc.)
export async function onRequestPatch({ request, env }) {
  const body = await readJsonBody(request);
  if (!Array.isArray(body) || !body.length || body.length > 1000) return error('Expected a non-empty array');
  const catalog = await getCatalog(env.DB_KV);
  const byId = new Map(catalog.map((p, i) => [p.id, i]));
  const now = new Date().toISOString();
  let updated = 0;
  for (const u of body) {
    const i = byId.get(u && u.id);
    if (i === undefined) continue;
    catalog[i] = { ...catalog[i], ...sanitizeProduct(u), id: catalog[i].id, updated_at: now };
    updated++;
  }
  await saveCatalog(env.DB_KV, catalog);
  return json({ success: true, updated });
}

// DELETE: bulk delete { ids: [...] }
export async function onRequestDelete({ request, env }) {
  const { ids } = await readJsonBody(request);
  if (!Array.isArray(ids) || !ids.length) return error('Expected ids');
  const set = new Set(ids);
  const catalog = await getCatalog(env.DB_KV);
  const next = catalog.filter(p => !set.has(p.id));
  await saveCatalog(env.DB_KV, next);
  return json({ success: true, deleted: catalog.length - next.length });
}
