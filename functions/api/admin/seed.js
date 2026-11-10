// POST /api/admin/seed — (admin only) load public/data/catalog.json into KV.
// Refuses to overwrite a non-empty catalog unless ?force=1 is passed.
// Previously this was a PUBLIC GET /api/seed: anyone could wipe all admin edits.
import initCatalog from '../../../public/data/catalog.json';
import { json, error, getCatalog, saveCatalog } from '../../_lib/store.js';

export async function onRequestPost({ request, env }) {
  const force = new URL(request.url).searchParams.get('force') === '1';
  const existing = await getCatalog(env.DB_KV);
  if (existing.length && !force) return error(`Catalog already has ${existing.length} products; pass ?force=1 to overwrite`, 409);
  await saveCatalog(env.DB_KV, initCatalog.slice());
  return json({ success: true, count: initCatalog.length });
}
