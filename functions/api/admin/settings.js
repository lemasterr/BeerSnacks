// ── Admin Settings API ──
// GET → return site settings
// PUT → update site settings (only known fields; links must be http(s), texts are length-limited)
import { json, error, readJsonBody } from '../../_lib/store.js';

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

const SEASONS = ['', 'auto', 'newyear', 'valentine', 'independence', 'womensday', 'easter', 'midsummer', 'oktoberfest', 'halloween'];
const STORE_FIELDS = ['stock_oismae', 'stock_mahtra'];
const text = (v, max = 200) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
const url = (v) => {
  const s = text(v, 500);
  if (!s) return '';
  try { const u = new URL(s); return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null; } catch { return null; }
};

function clean(current, input) {
  const next = structuredClone(current);
  if ('phone' in input) next.phone = text(input.phone, 40);
  if ('email' in input) {
    const e = text(input.email, 120);
    if (e && !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(e)) throw new Error('Неверный email');
    next.email = e;
  }
  if ('season' in input) next.season = SEASONS.includes(input.season) ? input.season : '';
  if (input.company && typeof input.company === 'object') {
    next.company = { name: text(input.company.name, 120), reg: text(input.company.reg, 40), vat: text(input.company.vat, 40), address: text(input.company.address, 200) };
  }
  for (const group of ['socials', 'delivery']) {
    if (!input[group] || typeof input[group] !== 'object') continue;
    for (const [k, v] of Object.entries(input[group])) {
      if (!(k in (DEFAULT_SETTINGS[group]))) continue;
      const u = url(v);
      if (u === null) throw new Error(`Ссылка «${k}» должна начинаться с https://`);
      next[group] = { ...(next[group] || {}), [k]: u };
    }
  }
  if (Array.isArray(input.stores)) {
    next.stores = input.stores.slice(0, 10).map((s, i) => ({
      name: text(s && s.name, 60),
      address: text(s && s.address, 200),
      field: STORE_FIELDS.includes(s && s.field) ? s.field : (current.stores?.[i]?.field || ''),
    }));
  }
  return next;
}

export async function onRequestGet({ env }) {
  let settings = await env.DB_KV.get('site:settings', { type: 'json' });
  if (!settings) {
    settings = DEFAULT_SETTINGS;
    await env.DB_KV.put('site:settings', JSON.stringify(settings));
  }
  return json(settings, 200, { 'Cache-Control': 'no-store' });
}

export async function onRequestPut({ request, env }) {
  const input = await readJsonBody(request);
  if (!input || typeof input !== 'object' || Array.isArray(input)) return error('Expected an object');
  const current = (await env.DB_KV.get('site:settings', { type: 'json' })) || DEFAULT_SETTINGS;
  let merged;
  try { merged = clean(current, input); } catch (e) { return error(e.message, 400); }
  await env.DB_KV.put('site:settings', JSON.stringify(merged));
  return json({ success: true, settings: merged });
}
