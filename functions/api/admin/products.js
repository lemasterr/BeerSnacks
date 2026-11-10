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
