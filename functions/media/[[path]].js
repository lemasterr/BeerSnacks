// GET /media/<key> — serves admin-uploaded images from R2 through the edge cache.
// Same-origin, cached for a year (keys are unique and never overwritten).
export async function onRequestGet({ request, env, params, waitUntil }) {
  const key = (params.path || []).join('/');
  if (!key || key.includes('..')) return new Response('Not found', { status: 404 });

  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) return cached;

  const obj = await env.IMAGES_BUCKET.get(key);
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('ETag', obj.httpEtag);
  headers.set('X-Content-Type-Options', 'nosniff');
  const res = new Response(obj.body, { headers });
  waitUntil(cache.put(request, res.clone()));
  return res;
}
