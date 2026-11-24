// Pickup orders: shared rules for the public order API and the admin.
// The server is the only place where prices and totals are computed — nothing from the browser is trusted.
import { withStoreDefaults } from './stores.js';

export const STATUSES = ['new', 'paid', 'ready', 'done', 'cancelled', 'expired'];
export const OPEN = ['new', 'paid', 'ready'];
export const ORDER_DEFAULTS = { enabled: false, pay_hours: 24, pickup_days: 1 };
export const MAX_QTY = 24;           // per line
export const MAX_LINES = 40;

const HOUR = 3600_000, DAY = 24 * HOUR;

// Same rule as the storefront: beer/cider unless clearly non-alcoholic.
export const isAlcohol = (p) => (p.category === 'beer' || p.category === 'cider') && !/^0([.,]0+)?\s*%/.test(String(p.abv || '')) &&
  p.subcategory !== 'non_alc_cider' && !/non-alcoholic|alcohol-free|kvass/i.test(`${p.name_en || ''} ${p.type_en || ''}`);

// Products sold by weight are not ordered online (the exact sum is only known at the counter).
export const orderable = (p) => p && p.in_stock !== false && Number(p.price) > 0 && (!p.price_unit || p.price_unit === 'pcs');

// Draft beer has two sizes: '05' = 0.5 L (price_05), '1' = 1 L (price). Everything else: size ''.
export function unitPrice(p, size) {
  if (p.price_05) {
    if (size === '05') return Math.round(Number(p.price_05) * 100);
    if (size === '1') return Math.round(Number(p.price) * 100);
    return null;
  }
  return size ? null : Math.round(Number(p.price) * 100);
}

export async function getSettings(env) {
  const s = withStoreDefaults((await env.DB_KV.get('site:settings', { type: 'json' })) || {});
  return { ...s, orders: { ...ORDER_DEFAULTS, ...(s.orders || {}) }, payment: s.payment || {} };
}

// Orders are offered only when the master switch is on (admin → settings) and the store takes pickup orders.
export const pickupStores = (settings) => (settings.orders?.enabled ? (settings.stores || []).filter(s => s.pickup && s.field) : []);

export function randomToken() {
  const b = crypto.getRandomValues(new Uint8Array(18));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sha256(text) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time compare for the status-page token.
export function sameToken(a, b) {
  a = String(a || ''); b = String(b || '');
  if (a.length !== b.length || !a) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// Orders that ran out of time: unpaid IBAN orders after pay_by, cash orders not collected by pickup_by.
// (Paid IBAN orders are never expired automatically: the money has to be dealt with by a person.)
export async function expireOld(env, now = Date.now()) {
  const due = await env.DB.prepare(
    `SELECT id FROM orders WHERE (status = 'new' AND pay = 'iban' AND pay_by IS NOT NULL AND pay_by < ?1)
       OR (status IN ('new', 'ready') AND pay = 'cash' AND pickup_by IS NOT NULL AND pickup_by < ?1) LIMIT 50`,
  ).bind(now).all();
  if (!due.results.length) return 0;
  const stmts = [];
  for (const { id } of due.results) {
    stmts.push(env.DB.prepare(`UPDATE orders SET status = 'expired', updated_at = ?2 WHERE id = ?1`).bind(id, now));
    stmts.push(env.DB.prepare(`INSERT INTO order_events (order_id, at, status, by, note) VALUES (?1, ?2, 'expired', 'system', '')`).bind(id, now));
  }
  await env.DB.batch(stmts);
  return due.results.length;
}

// Deadline that starts when an order is ready (or, for cash orders, right away: pick up within N days).
export const pickupDeadline = (settings, from = Date.now()) => from + settings.orders.pickup_days * DAY;
export const payDeadline = (settings, from = Date.now()) => from + settings.orders.pay_hours * HOUR;

export function rowToOrder(r, { full = false } = {}) {
  const o = {
    code: r.code, status: r.status, store: r.store, store_name: r.store_name, pay: r.pay,
    items: JSON.parse(r.items || '[]'), total: r.total, has_alcohol: !!r.has_alcohol,
    created_at: r.created_at, updated_at: r.updated_at, pay_by: r.pay_by, pickup_by: r.pickup_by,
  };
  if (full) Object.assign(o, { id: r.id, name: r.name, phone: r.phone, email: r.email, comment: r.comment, lang: r.lang });
  return o;
}

// ISO 13616 check (mod 97) — catches typos in the IBAN typed into the admin.
export function validIban(v) {
  const s = String(v || '').replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false;
  const moved = s.slice(4) + s.slice(0, 4);
  const digits = moved.replace(/[A-Z]/g, c => String(c.charCodeAt(0) - 55));
  let rem = 0; for (const ch of digits) rem = (rem * 10 + Number(ch)) % 97;
  return rem === 1;
}
export const formatIban = (v) => String(v || '').replace(/\s+/g, '').toUpperCase().replace(/(.{4})/g, '$1 ').trim();
