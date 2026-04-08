/**
 * POST /api/admin/upload
 * Receives a multipart/form-data with:
 *   - file: the image file
 *   - filename: desired safe filename
 *
 * Stores it in Cloudflare R2 (if configured) or just returns the expected path.
 * In Cloudflare Pages with an R2 binding "IMAGES_BUCKET", the file is stored there.
 * If no R2 is configured this still works - the client sets the path and the image
 * needs to be uploaded separately to the img/ folder.
 * 
 * R2 Configuration:
 * - Account ID: 025229e3c29465a894106a51f4e549ba
 * - S3 Endpoint: https://025229e3c29465a894106a51f4e549ba.r2.cloudflarestorage.com
 * - Bucket: beersnacks-images
 */

export async function onRequestPost(context) {
  const tr = (msg) => JSON.stringify({ error: msg });
  
  try {
    // Check authentication
    const authHeader = context.request.headers.get('authorization') || '';
    const adminPassword = context.env.ADMIN_PASSWORD || 'admin123';
    
    if (authHeader !== `Bearer ${adminPassword}` && authHeader !== adminPassword) {
      return new Response(tr('Unauthorized'), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

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

    const safeName = filename.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9._-]/g, '').substring(0, 200);
    if (!safeName) return new Response(tr('Invalid filename'), { status: 400, headers: { 'Content-Type': 'application/json' } });

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
      httpMetadata: { contentType: file.type || 'image/png', cacheControl: 'public, max-age=31536000' }
    });

    const finalUrl = `${publicBaseUrl.replace(/\/$/, '')}/${safeName}`;
    return new Response(JSON.stringify({ success: true, filename: safeName, url: finalUrl }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('Upload critical error:', err);
    return new Response(tr('Upload failed: ' + String(err)), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

