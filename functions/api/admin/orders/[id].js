// GET /api/admin/orders/:id — one order with its history
// PUT /api/admin/orders/:id — change status: { status, note }
import { json, error, readJsonBody } from '../../../_lib/store.js';
import { getSettings, pickupDeadline, payDeadline, rowToOrder } from '../../../_lib/orders.js';

// Allowed moves. IBAN orders must be marked paid before they can be handed out.
const NEXT = {
  new: ['paid', 'ready', 'cancelled'],
  paid: ['ready', 'cancelled'],
  ready: ['done', 'cancelled'],
  expired: ['new', 'cancelled'],
  cancelled: [],
  done: [],
};

async function load(env, id) {
  return env.DB.prepare(`SELECT * FROM orders WHERE id = ?1`).bind(id).first();
}

export async function onRequestGet({ env, params }) {
  if (!env.DB) return error('Orders are not available', 503);
  const r = await load(env, Number(params.id));
  if (!r) return error('Заказ не найден', 404);
  const { results } = await env.DB.prepare(`SELECT at, status, by, note FROM order_events WHERE order_id = ?1 ORDER BY id`).bind(r.id).all();
  return json({ order: rowToOrder(r, { full: true }), events: results });
}

export async function onRequestPut({ request, env, params }) {
  if (!env.DB) return error('Orders are not available', 503);
  const input = await readJsonBody(request);
  const r = await load(env, Number(params.id));
  if (!r) return error('Заказ не найден', 404);
  const to = String(input.status || '');
  if (!(NEXT[r.status] || []).includes(to)) return error(`Нельзя перевести заказ из «${r.status}» в «${to}»`, 409);
  if (to === 'ready' && r.pay === 'iban' && r.status === 'new') return error('Сначала отметь, что оплата пришла', 409);
  if (to === 'paid' && r.pay !== 'iban') return error('Этот заказ оплачивается на кассе', 409);

  const now = Date.now();
  const settings = await getSettings(env);
  let payBy = r.pay_by, pickupBy = r.pickup_by;
  if (to === 'paid') payBy = null;
  if (to === 'ready') pickupBy = pickupDeadline(settings, now);
  if (to === 'new') {                       // restored after expiry: give the full time again
    if (r.pay === 'iban') payBy = payDeadline(settings, now); else pickupBy = pickupDeadline(settings, now);
  }
  const note = String(input.note || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 300);
  // Only update if nobody changed the status meanwhile (two sellers clicking at once).
  const res = await env.DB.prepare(
    `UPDATE orders SET status = ?2, updated_at = ?3, pay_by = ?4, pickup_by = ?5 WHERE id = ?1 AND status = ?6`,
  ).bind(r.id, to, now, payBy, pickupBy, r.status).run();
  if (!res.meta.changes) return error('Заказ уже изменили — обнови список', 409);
  await env.DB.prepare(`INSERT INTO order_events (order_id, at, status, by, note) VALUES (?1, ?2, ?3, 'admin', ?4)`).bind(r.id, now, to, note).run();
  return json({ success: true, order: rowToOrder(await load(env, r.id), { full: true }) });
}
