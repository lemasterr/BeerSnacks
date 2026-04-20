// ── Admin Settings API ──
// GET → return site settings
// PUT → update site settings

const DEFAULT_SETTINGS = {
  phone: '',
  socials: {
    facebook: 'https://www.facebook.com/people/BeerSnacks/61574467306145/',
    instagram: 'https://www.instagram.com/tallinnbeersnacks',
    tiktok: 'https://www.tiktok.com/@beer_and_snacks.tallinn'
  },
  delivery: {
    wolt: 'https://wolt.com/en/est/tallinn/venue/beer-snacks-beer',
    bolt: 'https://food.bolt.eu/en/1-tallinn/p/143802-beersnacks/'
  },
  stores: [
    { name: 'Õismäe', address: 'Õismäe tee 1a, 13514 Tallinn', field: 'stock_oismae' },
    { name: 'Mahtra', address: 'Mahtra tn 1, 13811 Tallinn', field: 'stock_mahtra' }
  ]
};

export async function onRequestGet(context) {
  let settings = await context.env.DB_KV.get('site:settings', { type: 'json' });
  if (!settings) {
    settings = DEFAULT_SETTINGS;
    await context.env.DB_KV.put('site:settings', JSON.stringify(settings));
  }

  return new Response(JSON.stringify(settings), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPut(context) {
  const updates = await context.request.json();

  let settings = await context.env.DB_KV.get('site:settings', { type: 'json' });
  if (!settings) settings = DEFAULT_SETTINGS;

  // Merge updates
  const merged = { ...settings, ...updates };
  if (updates.socials) merged.socials = { ...settings.socials, ...updates.socials };
  if (updates.delivery) merged.delivery = { ...settings.delivery, ...updates.delivery };
  if (updates.stores) merged.stores = updates.stores;

  await context.env.DB_KV.put('site:settings', JSON.stringify(merged));

  return new Response(JSON.stringify({ success: true, settings: merged }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
