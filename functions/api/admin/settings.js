// ── Admin Settings API ──
// GET → return site settings
// PUT → update site settings (only known fields; links must be http(s), texts are length-limited)
import { json, error, readJsonBody } from '../../_lib/store.js';
import { STORE_DEFAULTS, normalizeRange, withStoreDefaults } from '../../_lib/stores.js';
import { validIban, formatIban, ORDER_DEFAULTS } from '../../_lib/orders.js';

const DEFAULT_SETTINGS = {
  phone: '',
  socials: {
    facebook: 'https://www.facebook.com/people/BeerSnacks/61574467306145/',
    instagram: 'https://www.instagram.com/tallinnbeersnacks',
    tiktok: 'https://www.tiktok.com/@beer_and_snacks'
  },
  delivery: {
    wolt: 'https://wolt.com/en/est/tallinn/venue/beer-snacks-beer',
    bolt: 'https://food.bolt.eu/en/1-tallinn/p/143802-beersnacks/'
  },
  stores: [
    { name: 'Õismäe', address: 'Õismäe tee 1a, 13514 Tallinn', field: 'stock_oismae', ...STORE_DEFAULTS.stock_oismae },
    { name: 'Mahtra', address: 'Mahtra tn 1, 13811 Tallinn', field: 'stock_mahtra', ...STORE_DEFAULTS.stock_mahtra }
  ]
};
const DAYS_RU = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

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
  if (input.payment && typeof input.payment === 'object') {
    const iban = text(input.payment.iban, 50).replace(/\s+/g, '').toUpperCase();
    if (iban && !validIban(iban)) throw new Error('IBAN с ошибкой — проверь цифры');
    next.payment = { recipient: text(input.payment.recipient, 120), iban: iban ? formatIban(iban) : '' };
  }
  if (input.orders && typeof input.orders === 'object') {
    const num = (v, min, max, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d; };
    next.orders = {
      enabled: input.orders.enabled === true,
      pay_hours: num(input.orders.pay_hours, 1, 168, ORDER_DEFAULTS.pay_hours),
      pickup_days: num(input.orders.pickup_days, 1, 14, ORDER_DEFAULTS.pickup_days),
    };
  }
  if (Array.isArray(input.stores)) {
    const prev = withStoreDefaults(current).stores || [];
    next.stores = input.stores.slice(0, 10).map((s, i) => {
      s = s && typeof s === 'object' ? s : {};
      const field = STORE_FIELDS.includes(s.field) ? s.field : (prev[i]?.field || '');
      const name = text(s.name, 60);
      const hoursIn = Array.isArray(s.hours) ? s.hours : (prev[i]?.hours || Array(7).fill(''));
      const hours = Array.from({ length: 7 }, (_, d) => {
        const r = normalizeRange(hoursIn[d]);
        if (r === null) throw new Error(`${name || 'Магазин'}, ${DAYS_RU[d]}: время в виде 11:00-20:00 (пусто = закрыто)`);
        return r;
      });
      const pickup = 'pickup' in s ? s.pickup === true || s.pickup === 'true' : !!prev[i]?.pickup;
      return { name, address: text(s.address, 200), field, pickup, hours };
    });
  }
  return next;
}

export async function onRequestGet({ env }) {
  let settings = await env.DB_KV.get('site:settings', { type: 'json' });
  if (!settings) {
    settings = DEFAULT_SETTINGS;
    await env.DB_KV.put('site:settings', JSON.stringify(settings));
  }
  settings = withStoreDefaults(settings);
  return json({ ...settings, orders: { ...ORDER_DEFAULTS, ...(settings.orders || {}) }, payment: settings.payment || { recipient: '', iban: '' } }, 200, { 'Cache-Control': 'no-store' });
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
