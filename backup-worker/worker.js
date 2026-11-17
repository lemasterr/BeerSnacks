// Daily snapshot of the catalog, categories, translations and settings.
// Stored as backups/YYYY-MM-DD.json in the private "beersnacks-backups" bucket; the last 60 days are kept.
const KEYS = ['catalog:compiled', 'site:categories', 'site:translations', 'site:settings'];
const KEEP_DAYS = 60;

async function backup(env) {
  const data = {};
  for (const k of KEYS) data[k] = await env.DB_KV.get(k, { type: 'json' });
  const day = new Date().toISOString().slice(0, 10);
  const body = JSON.stringify({ created_at: new Date().toISOString(), data });
  await env.BACKUPS.put(`backups/${day}.json`, body, { httpMetadata: { contentType: 'application/json' } });

  const cutoff = new Date(Date.now() - KEEP_DAYS * 864e5).toISOString().slice(0, 10);
  let cursor;
  do {
    const list = await env.BACKUPS.list({ prefix: 'backups/', cursor });
    const old = list.objects.map(o => o.key).filter(k => k.slice(8, 18) < cutoff);
    if (old.length) await env.BACKUPS.delete(old);
    cursor = list.truncated ? list.cursor : undefined;
  } while (cursor);
  return { day, products: (data['catalog:compiled'] || []).length, bytes: body.length };
}

export default {
  async scheduled(event, env, ctx) { ctx.waitUntil(backup(env)); },
};
