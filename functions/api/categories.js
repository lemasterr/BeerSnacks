// ── Public Categories API ──
// Returns the category structure for the frontend (no auth required)

export async function onRequestGet(context) {
  // Try KV first
  let categories = await context.env.DB_KV.get('site:categories', { type: 'json' });

  if (categories) {
    // Convert to the format expected by the frontend: { beer: ["all","ukraine",...], ... }
    const result = {};
    categories.sort((a, b) => a.sort_order - b.sort_order);
    categories.forEach(cat => {
      result[cat.slug] = cat.subcategories || ['all'];
    });

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });
  }

  // Fallback: let the static file serve itself (categories.json)
  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
