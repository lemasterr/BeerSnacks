/**
 * POST /api/admin/upload
 * Receives a multipart/form-data with:
 *   - file: the image file
 *   - filename: desired safe filename
 *
 * Stores it in Cloudflare R2 and returns the public URL.
 * R2 binding "IMAGES_BUCKET" must be configured in wrangler.toml.
 * Environment variables: PUBLIC_IMAGE_BASE_URL or R2_PUBLIC_URL
 */

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'
];

export async function onRequestPost(context) {
  const tr = (msg) => JSON.stringify({ error: msg });
  
  try {
    const contentType = context.request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(tr('Expected multipart/form-data'), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const formData = await context.request.formData();
    const file = formData.get('file');
    const filename = formData.get('filename') || (file && file.name ? file.name : 'upload.png');

    if (!file || typeof file === 'string') {
      return new Response(tr('No file provided'), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Validate MIME type — only allow images
    const mimeType = (file.type || '').toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return new Response(tr('Invalid file type. Only images are allowed (JPEG, PNG, WebP, GIF, SVG, AVIF).'), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const safeName = filename.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9._-]/g, '').substring(0, 200);
    if (!safeName) return new Response(tr('Invalid filename'), { status: 400, headers: { 'Content-Type': 'application/json' } });

    // Validate file extension matches image types
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'];
    const ext = '.' + safeName.split('.').pop();
    if (!validExtensions.includes(ext)) {
      return new Response(tr('Invalid file extension'), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!context.env.IMAGES_BUCKET) {
      return new Response(tr('IMAGES_BUCKET binding missing'), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const publicBaseUrl = context.env.PUBLIC_IMAGE_BASE_URL || context.env.R2_PUBLIC_URL;
    if (!publicBaseUrl) {
      return new Response(tr('PUBLIC_IMAGE_BASE_URL or R2_PUBLIC_URL environment variable not configured'), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > 5 * 1024 * 1024) {
      return new Response(tr('File too large (max 5MB)'), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    await context.env.IMAGES_BUCKET.put(safeName, arrayBuffer, {
      httpMetadata: { contentType: mimeType, cacheControl: 'public, max-age=31536000' }
    });

    const finalUrl = `${publicBaseUrl.replace(/\/$/, '')}/${safeName}`;
    return new Response(JSON.stringify({ success: true, filename: safeName, url: finalUrl }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('Upload error:', err.message);
    return new Response(tr('Upload failed'), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

