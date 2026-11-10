import { json, error, readJsonBody, getCatalog, saveCatalog, sanitizeProduct } from '../../../_lib/store.js';

// Updates are applied directly to the compiled catalog. The previous version
// re-read every product key after writing, and KV's eventual consistency could
// put the *old* value back into the catalog ("I saved but the site shows old data").
export async function onRequestPut({ request, env, params }) {
  const updates = sanitizeProduct(await readJsonBody(request));
  const catalog = await getCatalog(env.DB_KV);
  const i = catalog.findIndex(p => p.id === params.id);
  if (i === -1) return error('Not found', 404);

  catalog[i] = { ...catalog[i], ...updates, id: params.id, updated_at: new Date().toISOString() };
  await saveCatalog(env.DB_KV, catalog);
  return json({ success: true, updatedProduct: catalog[i] });
}

export async function onRequestDelete({ env, params }) {
  const catalog = await getCatalog(env.DB_KV);
  const next = catalog.filter(p => p.id !== params.id);
  if (next.length === catalog.length) return error('Not found', 404);
  await saveCatalog(env.DB_KV, next);
  await env.DB_KV.delete(`product:${params.id}`); // clean legacy key if present
  return json({ success: true });
}
