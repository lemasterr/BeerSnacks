// Shared helpers for KV-backed catalog storage.
// `catalog:compiled` is the single source of truth for products: one read,
// one write per change. (Old per-product `product:<id>` keys are no longer used.)

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });

export const error = (message, status = 400) => json({ error: message }, status);

export async function readJsonBody(request) {
  const ct = request.headers.get('content-type') || '';
  if (!ct.includes('application/json')) throw new HttpError('Expected JSON body', 400);
  try {
    return await request.json();
  } catch {
    throw new HttpError('Invalid JSON', 400);
  }
}

export class HttpError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

export async function getCatalog(kv) {
  return (await kv.get('catalog:compiled', { type: 'json' })) || [];
}

export async function saveCatalog(kv, catalog) {
  catalog.sort((a, b) =>
    (a.category || '').localeCompare(b.category || '') ||
    (a.subcategory || '').localeCompare(b.subcategory || '') ||
    (a.sort_order || 0) - (b.sort_order || 0));
  await kv.put('catalog:compiled', JSON.stringify(catalog));
}

const NUMBER_FIELDS = ['price', 'sort_order'];
const BOOL_FIELDS = ['in_stock', 'stock_oismae', 'stock_mahtra'];
const LANGS = ['uk', 'en', 'et', 'ru'];
const STRING_FIELDS = ['category', 'subcategory', 'image', 'volume', 'abv',
  ...LANGS.flatMap(l => [`name_${l}`, `type_${l}`, `description_${l}`])];

// Whitelist + coerce product fields so the admin UI can't store junk
// (e.g. price as "6,70" string, or overwrite `id`).
export function sanitizeProduct(input) {
  const out = {};
  for (const k of STRING_FIELDS) {
    if (k in input) out[k] = input[k] == null ? '' : String(input[k]).trim().slice(0, 2000);
  }
  for (const k of NUMBER_FIELDS) {
    if (k in input) {
      const n = Number(String(input[k]).replace(',', '.'));
      out[k] = Number.isFinite(n) ? n : 0;
    }
  }
  if ('ibu' in input) {
    const n = Number(input.ibu);
    out.ibu = input.ibu === '' || input.ibu == null || !Number.isFinite(n) ? '' : n;
  }
  for (const k of BOOL_FIELDS) {
    if (k in input) out[k] = input[k] === true || input[k] === 'true' || input[k] === 1;
  }
  return out;
}

// Constant-time string comparison (avoids timing leaks on the admin password).
export function safeEqual(a, b) {
  const enc = new TextEncoder();
  const x = enc.encode(String(a));
  const y = enc.encode(String(b));
  let diff = x.length ^ y.length;
  const len = Math.max(x.length, y.length);
  for (let i = 0; i < len; i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

export function getCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

export async function hasValidSession(request, env) {
  const token = getCookie(request, 'auth_session');
  if (!token || !/^[0-9a-f-]{36}$/.test(token)) return false;
  return !!(await env.DB_KV.get(`session:${token}`));
}
