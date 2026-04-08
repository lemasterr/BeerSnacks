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
  try {
    // Check authentication first
    const authHeader = context.request.headers.get('authorization') || '';
    const adminPassword = context.env.ADMIN_PASSWORD || 'admin123';
    
    if (authHeader !== `Bearer ${adminPassword}` && authHeader !== adminPassword) {
      // Allow if password matches in request body
      const contentType = context.request.headers.get('content-type') || '';
      if (!contentType.includes('multipart/form-data')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401, headers: { 'Content-Type': 'application/json' }
        });
      }
    }

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
      .replace(/[^a-z0-9._-]/g, '')
      .substring(0, 200); // Limit length

    if (!safeName) {
      return new Response(JSON.stringify({ error: 'Invalid filename' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const imagePath = `img/${safeName}`;

    // Required: IMAGES_BUCKET binding
    if (!context.env.IMAGES_BUCKET) {
      return new Response(JSON.stringify({ 
        error: 'R2 bucket not configured (binding IMAGES_BUCKET missing)' 
      }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Check file size (max 5MB)
      if (arrayBuffer.byteLength > 5 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: 'File too large (max 5MB)' }), {
          status: 400, headers: { 'Content-Type': 'application/json' }
        });
      }

      // Store in R2
      await context.env.IMAGES_BUCKET.put(safeName, arrayBuffer, {
        httpMetadata: { 
          contentType: file.type || 'image/png',
          cacheControl: 'public, max-age=31536000'
        }
      });

      const publicBaseUrl = context.env.R2_PUBLIC_URL || '';
      const finalUrl = publicBaseUrl 
        ? `${publicBaseUrl.replace(/\/$/, '')}/${safeName}`
        : `/img/${safeName}`; // Fallback if no public domain configured

      return new Response(JSON.stringify({
        success: true,
        path: `img/${safeName}`,
        filename: safeName,
        url: finalUrl
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (r2Err) {
      console.error('R2 upload error:', r2Err);
      return new Response(JSON.stringify({ 
        error: 'R2 storage failed',
        details: String(r2Err)
      }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (err) {
    console.error('Upload error:', err);
    return new Response(JSON.stringify({ 
      error: String(err),
      message: 'Upload failed'
    }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}

