// POST /api/admin/upload  (multipart: file, thumb, filename)
// Stores the photo in R2 as <key> and its 420 px card thumbnail as sm/<key>,
// returns a same-origin URL served by /media/*. The admin UI prepares both as WebP
// in the browser (with a WebAssembly encoder where the browser can't), so only real WebP is accepted.
import { json, error } from '../../_lib/store.js';

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_THUMB_BYTES = 1024 * 1024;

// RIFF....WEBP — checks the bytes, not the client-supplied MIME type.
async function isWebp(file) {
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const s = (i, n) => String.fromCharCode(...b.subarray(i, i + n));
  return b.length === 12 && s(0, 4) === 'RIFF' && s(8, 4) === 'WEBP';
}

export async function onRequestPost({ request, env }) {
  if (!env.IMAGES_BUCKET) return error('IMAGES_BUCKET binding missing', 500);
  const ct = request.headers.get('content-type') || '';
  if (!ct.includes('multipart/form-data')) return error('Expected multipart/form-data');

  const form = await request.formData();
  const file = form.get('file');
  const thumb = form.get('thumb');
  if (!file || typeof file === 'string') return error('No file provided');
  if (file.size > MAX_BYTES) return error('File too large (max 5MB)');
  if (!(await isWebp(file))) return error('Only WebP images are accepted — reload the admin page (Ctrl+Shift+R) and try again');
  const hasThumb = thumb && typeof thumb !== 'string' && thumb.size <= MAX_THUMB_BYTES && (await isWebp(thumb));

  const base = String(form.get('filename') || file.name || 'image')
    .toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '').slice(0, 80) || 'image';
  // Unique suffix so a new upload never silently overwrites another product's photo.
  const key = `${base}-${Date.now().toString(36)}.webp`;
  const httpMetadata = { contentType: 'image/webp', cacheControl: 'public, max-age=31536000, immutable' };

  await env.IMAGES_BUCKET.put(key, file.stream(), { httpMetadata });
  if (hasThumb) await env.IMAGES_BUCKET.put(`sm/${key}`, thumb.stream(), { httpMetadata });

  return json({ success: true, filename: key, url: `/media/${key}` });
}
