// ── Public Translations API ──
// Returns translations for the frontend (no auth required)

export async function onRequestGet(context) {
  // Try KV first
  let translations = await context.env.DB_KV.get('site:translations', { type: 'json' });

  if (translations) {
    return new Response(JSON.stringify(translations), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    });
  }

  // Fallback: return empty — frontend will try static file
  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
