// Public pickup orders.
// POST /api/order          — place an order (JSON). Returns { code, token }.
// GET  /api/order?c=&t=    — the customer's status page data (needs the secret token from the order).
import { json, error, readJsonBody, HttpError } from '../_lib/store.js';
import {
  isAlcohol, orderable, unitPrice, getSettings, pickupStores, randomToken, sha256, sameToken,
  expireOld, payDeadline, pickupDeadline, rowToOrder, formatIban, MAX_QTY, MAX_LINES,
} from '../_lib/orders.js';

const LANGS = ['et', 'ru', 'uk', 'en'];
const NAMES = (p) => ({ et: p.name_et || p.name_en, ru: p.name_ru || p.name_en, uk: p.name_uk || p.name_en, en: p.name_en || p.name_ru });
const text = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

async function verifyTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET) return true;            // not configured (local dev)
  if (!token) return false;
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET); body.append('response', token); if (ip) body.append('remoteip', ip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const d = await r.json().catch(() => ({}));
  return d.success === true;
}

function publicPayment(settings) {
  const p = settings.payment || {};
  return { recipient: p.recipient || settings.company?.name || '', iban: p.iban ? formatIban(p.iban) : '' };
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return error('Orders are not available', 503);
  try {
    const input = await readJsonBody(request);
    const settings = await getSettings(env);
    const now = Date.now();

    // ── Who and where ──
    const stores = pickupStores(settings);
    if (!stores.length) return error('off', 503);
    const store = stores.find(s => s.field === input.store);
    if (!store) return error('store');
    const name = text(input.name, 80);
    if (name.length < 2) return error('name');
    const phone = text(input.phone, 30);
    if (!/^\+?[\d\s()-]{7,20}$/.test(phone)) return error('phone');
    const email = text(input.email, 120);
    if (email && !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(email)) return error('email');
    const comment = text(input.comment, 300);
    const lang = LANGS.includes(input.lang) ? input.lang : 'et';
    if (input.terms !== true) return error('terms');

    // ── What: prices come from the catalog, never from the browser ──
    const catalog = (await env.DB_KV.get('catalog:compiled', { type: 'json' })) || [];
    const byId = new Map(catalog.map(p => [p.id, p]));
    const lines = Array.isArray(input.items) ? input.items.slice(0, MAX_LINES + 1) : [];
    if (!lines.length) return error('empty');
    if (lines.length > MAX_LINES) return error('too_many');
    const items = []; const seen = new Set();
    for (const l of lines) {
      const p = byId.get(String(l && l.id));
      const size = l && (l.size === '05' || l.size === '1') ? l.size : '';
      const qty = Math.floor(Number(l && l.qty));
      if (!orderable(p)) return error(`unavailable:${l && l.id}`, 409);
      const price = unitPrice(p, size);
      if (price === null || !(qty >= 1 && qty <= MAX_QTY)) return error('item');
      const key = `${p.id}|${size}`; if (seen.has(key)) return error('item'); seen.add(key);
      items.push({ id: p.id, name: NAMES(p), size, qty, price, alcohol: isAlcohol(p) });
    }
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const hasAlcohol = items.some(i => i.alcohol);

    // ── How to pay: alcohol only with prepayment (the purchase is made and paid on the site) ──
    const pay = input.pay === 'cash' ? 'cash' : 'iban';
    if (hasAlcohol && pay !== 'iban') return error('pay_alcohol');
    if (pay === 'iban' && !publicPayment(settings).iban) return error('pay_unavailable', 503);
    if (hasAlcohol && input.adult !== true) return error('adult');

    // ── Abuse limits ──
    const ip = request.headers.get('CF-Connecting-IP') || '';
    // Bot check only when both halves are configured: the secret (Pages variable) and the public site key (admin).
    if (settings.turnstile_sitekey && !(await verifyTurnstile(env, input.captcha, ip))) return error('captcha', 403);
    const ipHash = (await sha256(`${ip}|orders`)).slice(0, 32);
    const recent = await env.DB.prepare(`SELECT COUNT(*) AS n FROM orders WHERE ip_hash = ?1 AND created_at > ?2`).bind(ipHash, now - 3600_000).first();
    if (recent.n >= 5) return error('rate', 429);
    const open = await env.DB.prepare(`SELECT COUNT(*) AS n FROM orders WHERE phone = ?1 AND status IN ('new','paid','ready')`).bind(phone).first();
    if (open.n >= 3) return error('rate', 429);

    // ── Save ──
    const token = randomToken();
    const payBy = pay === 'iban' ? payDeadline(settings, now) : null;
    const pickupBy = pay === 'cash' ? pickupDeadline(settings, now) : null;
    const ins = await env.DB.prepare(
      `INSERT INTO orders (code, token, status, store, store_name, name, phone, email, pay, comment, items, total, has_alcohol, lang, ip_hash, created_at, updated_at, pay_by, pickup_by)
       VALUES ('pending-' || ?1, ?1, 'new', ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?14, ?15, ?16)`,
    ).bind(token, store.field, store.name, name, phone, email, pay, comment, JSON.stringify(items), total, hasAlcohol ? 1 : 0, lang, ipHash, now, payBy, pickupBy).run();
    const id = ins.meta.last_row_id;
    const code = `BS-${1000 + id}`;
    await env.DB.batch([
      env.DB.prepare(`UPDATE orders SET code = ?2 WHERE id = ?1`).bind(id, code),
      env.DB.prepare(`INSERT INTO order_events (order_id, at, status, by, note) VALUES (?1, ?2, 'new', 'customer', '')`).bind(id, now),
    ]);
    return json({ success: true, code, token, total });
  } catch (e) {
    if (e instanceof HttpError) return error(e.message, e.status);
    console.error('order error', e && e.stack || e);
    return error('server', 500);
  }
}

export async function onRequestGet({ request, env }) {
  if (!env.DB) return error('Orders are not available', 503);
  const url = new URL(request.url);
  const code = String(url.searchParams.get('c') || '').toUpperCase();
  const token = url.searchParams.get('t') || '';
  if (!/^BS-\d{4,9}$/.test(code)) return error('not_found', 404);
  await expireOld(env);
  const r = await env.DB.prepare(`SELECT * FROM orders WHERE code = ?1`).bind(code).first();
  if (!r || !sameToken(r.token, token)) return error('not_found', 404);
  const settings = await getSettings(env);
  const store = (settings.stores || []).find(s => s.field === r.store) || { name: r.store_name };
  return json(
    { order: rowToOrder(r), payment: publicPayment(settings), store: { name: store.name, address: store.address || '', hours: store.hours || [] } },
    200, { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  );
}
