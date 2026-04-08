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
 */

export async function onRequestPost(context) {
  try {
    const contentType = context.request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ error: 'Expected multipart/form-data' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await context.request.formData();
    const file = formData.get('file');
    const filename = formData.get('filename') || (file && file.name ? file.name : 'upload.png');

    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sanitize filename
    const safeName = filename.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9._-]/g, '');

    const imagePath = `img/${safeName}`;

    // Try to store in R2 bucket if available
    if (context.env.IMAGES_BUCKET) {
      const arrayBuffer = await file.arrayBuffer();
      await context.env.IMAGES_BUCKET.put(safeName, arrayBuffer, {
        httpMetadata: { contentType: file.type || 'image/png' }
      });
      return new Response(JSON.stringify({
        success: true,
        path: imagePath,
        filename: safeName,
        size: arrayBuffer.byteLength
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fallback: no R2 — return the expected path so the admin can set it
    // The actual file needs to be placed in the public/img/ folder manually or via CI/CD
    return new Response(JSON.stringify({
      success: true,
      path: imagePath,
      filename: safeName,
      note: 'No R2 bucket configured — path set but file not stored server-side. Place the file manually in public/img/'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
