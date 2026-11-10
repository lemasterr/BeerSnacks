// POST /api/admin/upload  (multipart: file, filename)
// Stores the image in R2 and returns a same-origin URL served by /media/*.
// The admin UI converts photos to WebP in the browser before uploading.
import { json, error } from '../../_lib/store.js';

const TYPES = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/avif': 'avif' };
const MAX_BYTES = 5 * 1024 * 1024;

export async function onRequestPost({ request, env }) {
  if (!env.IMAGES_BUCKET) return error('IMAGES_BUCKET binding missing', 500);
  const ct = request.headers.get('content-type') || '';
  if (!ct.includes('multipart/form-data')) return error('Expected multipart/form-data');

  const form = await request.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') return error('No file provided');

  const ext = TYPES[(file.type || '').toLowerCase()];
  if (!ext) return error('Only JPEG, PNG, WebP or AVIF images are allowed');
  if (file.size > MAX_BYTES) return error('File too large (max 5MB)');

  const base = String(form.get('filename') || file.name || 'image')
    .toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '').slice(0, 80) || 'image';
  // Unique suffix so a new upload never silently overwrites another product's photo.
  const key = `${base}-${Date.now().toString(36)}.${ext}`;

  await env.IMAGES_BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' },
  });

  return json({ success: true, filename: key, url: `/media/${key}` });
}
