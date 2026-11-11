// Beer&Snacks — Admin (CRM).
// One product list + one editor drawer. Price, stock and stores edit inline; photos upload straight from the row.
(() => {
  'use strict';

  const LANGS = [['ru', 'RU'], ['uk', 'UK'], ['en', 'EN'], ['et', 'ET']];
  const PRICE_CHECK_SINCE = '2026-11-11';     // products not saved since then still carry old site prices
  const UNITS = { pcs: 'шт', kg: 'кг', '100g': '100 г' };

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => (n === '' || n == null || !Number.isFinite(Number(n))) ? '' : Number(n).toFixed(2);
  const parseNum = (s) => { const t = String(s ?? '').trim(); if (!t) return null; const n = Number(t.replace(',', '.').replace(/[^\d.]/g, '')); return Number.isFinite(n) ? n : null; };
  const ICON_PHOTO = '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="m21 17-5-5-8 7"/></svg>';
  const ICON_EDIT = '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/></svg>';

  const S = {
    products: [], cats: [], trans: {}, settings: {},
    kpi: 'all', cat: '', q: '', sort: 'cat',
    selected: new Set(),
    editing: null,               // product id or 'new'
    uploadFor: null,             // product id, or '__editor'
  };

  // ── API ──
  async function api(path, opts = {}) {
    const isForm = opts.body instanceof FormData;
    const init = { ...opts, headers: { ...(opts.body && !isForm ? { 'Content-Type': 'application/json' } : {}) } };
    if (opts.body && !isForm && typeof opts.body !== 'string') init.body = JSON.stringify(opts.body);
    const res = await fetch(path, init);
    if (res.status === 401) { showLogin(); throw new Error('Нужно войти заново'); }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Ошибка ${res.status}`);
    return data;
  }

  let toastTimer;
  function toast(msg, isError = false) {
    const el = $('#toast');
    el.textContent = msg; el.classList.toggle('is-error', isError); el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, isError ? 4000 : 2200);
  }
  const fail = (e) => toast(e.message || String(e), true);

  // ── Auth ──
  function showLogin() { $('#app').hidden = true; $('#drawer').hidden = true; $('#login').hidden = false; $('#login-password').focus(); }
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('#login-error'); err.hidden = true;
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: $('#login-password').value }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error === 'Invalid password' ? 'Неверный пароль' : (data.error || 'Ошибка входа'));
      $('#login-password').value = '';
      await start();
    } catch (ex) { err.textContent = ex.message; err.hidden = false; }
  });
  $('#logout').addEventListener('click', async () => { await fetch('/api/auth/logout', { method: 'POST' }); showLogin(); });

  $('#theme-toggle').addEventListener('click', () => {
    const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = t; localStorage.setItem('bs_theme', t);
  });

  // ── Helpers over data ──
  const catName = (slug) => S.trans.ru?.categories?.[slug] || slug || '—';
  const subName = (slug) => slug === 'all' ? 'Все' : (S.trans.ru?.subcategories?.[slug] || slug || '');
  const stores = () => (S.settings.stores || []).filter(s => s.field);
  const isOldPrice = (p) => !p.updated_at || p.updated_at < PRICE_CHECK_SINCE;
  const byId = (id) => S.products.find(p => p.id === id);

  const KPIS = [
    ['all', 'Все товары', () => true, ''],
    ['nophoto', 'Без фото', p => !p.image, 'kpi--warn'],
    ['oldprice', 'Цена не проверена', isOldPrice, 'kpi--warn'],
    ['out', 'Нет в наличии', p => p.in_stock === false, 'kpi--bad'],
    ['nostore', 'В наличии, но без магазина', p => p.in_stock !== false && stores().length > 0 && !stores().some(s => p[s.field]), ''],
  ];

  // ── Products view ──
  function renderKpis() {
    $('#kpis').innerHTML = KPIS.map(([k, label, fn, cls]) =>
      `<button type="button" class="kpi ${cls} ${S.kpi === k ? 'is-active' : ''}" data-kpi="${k}"><b>${S.products.filter(fn).length}</b><span>${label}</span></button>`).join('');
  }

  function renderCatFilter() {
    $('#f-cat').innerHTML = '<option value="">Все категории</option>' +
      S.cats.map(c => `<option value="${esc(c.slug)}" ${S.cat === c.slug ? 'selected' : ''}>${esc(catName(c.slug))}</option>`).join('');
  }

  function visibleProducts() {
    const kpi = KPIS.find(k => k[0] === S.kpi)[2];
    const q = S.q.trim().toLowerCase();
    const catOrder = Object.fromEntries(S.cats.map((c, i) => [c.slug, i]));
    const list = S.products.filter(p => kpi(p) && (!S.cat || p.category === S.cat) &&
      (!q || [p.id, p.name_ru, p.name_uk, p.name_en, p.name_et].join(' ').toLowerCase().includes(q)));
    const nm = (p) => (p.name_ru || p.name_en || '').toLowerCase();
    const sorters = {
      cat: (a, b) => (catOrder[a.category] ?? 99) - (catOrder[b.category] ?? 99) || (a.subcategory || '').localeCompare(b.subcategory || '') || (a.sort_order || 0) - (b.sort_order || 0) || nm(a).localeCompare(nm(b)),
      name: (a, b) => nm(a).localeCompare(nm(b)),
      price: (a, b) => (a.price || 0) - (b.price || 0),
      updated: (a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''),
    };
    return list.sort(sorters[S.sort]);
  }

  function rowHtml(p) {
    const name = p.name_ru || p.name_en || '(без названия)';
    const sub = p.name_en && p.name_en !== name ? p.name_en : '';
    const thumb = p.image
      ? `<button type="button" class="thumb" data-upload title="Заменить фото"><img src="${esc(p.image)}" alt="" loading="lazy"></button>`
      : `<button type="button" class="thumb thumb--none" data-upload title="Загрузить фото">${ICON_PHOTO}</button>`;
    const storeBtns = stores().map(s =>
      `<button type="button" class="store" data-store="${esc(s.field)}" aria-pressed="${!!p[s.field]}" title="${esc(s.name)}">${esc((s.name || '?')[0])}</button>`).join('');
    return `<tr data-id="${esc(p.id)}" class="${S.selected.has(p.id) ? 'is-selected' : ''}">
      <td class="c-check"><input type="checkbox" data-select ${S.selected.has(p.id) ? 'checked' : ''} aria-label="Выбрать"></td>
      <td class="c-img">${thumb}</td>
      <td class="c-name"><div class="pname">${esc(name)}${isOldPrice(p) ? '<span class="flag flag--old">старая цена</span>' : ''}<small>${esc(sub)} <span class="pid">${esc(p.id)}</span></small></div></td>
      <td class="c-cat"><div class="cat-cell">${esc(catName(p.category))}<small>${esc(subName(p.subcategory))}</small></div></td>
      <td class="c-price"><input class="price-in" data-price value="${money(p.price)}" inputmode="decimal" aria-label="Цена"><span class="price-unit">€${p.price_unit && p.price_unit !== 'pcs' ? '/' + UNITS[p.price_unit] : ''}</span>${p.price_05 ? `<span class="price-sub">0,5 л: ${money(p.price_05)} €</span>` : ''}</td>
      <td class="c-stock"><button type="button" class="switch" role="switch" data-stock aria-checked="${p.in_stock !== false}" aria-label="В наличии"></button></td>
      <td class="c-stores" ${stores().length ? '' : 'hidden'}>${storeBtns}</td>
      <td class="c-act"><button type="button" class="icon-btn" data-edit title="Редактировать">${ICON_EDIT}</button></td>
    </tr>`;
  }

  function renderRows() {
    const list = visibleProducts();
    let html = '', lastCat = null;
    for (const p of list) {
      if (S.sort === 'cat' && p.category !== lastCat) {
        lastCat = p.category;
        html += `<tr class="group"><td colspan="8">${esc(catName(p.category))}</td></tr>`;
      }
      html += rowHtml(p);
    }
    $('#rows').innerHTML = html;
    $('#empty').hidden = list.length > 0;
    $('#count').textContent = `${list.length} из ${S.products.length}`;
    $('#th-stores').hidden = !stores().length;
    $('#check-all').checked = list.length > 0 && list.every(p => S.selected.has(p.id));
    renderBulk();
  }

  function renderBulk() {
    $('#bulk').hidden = S.selected.size === 0;
    $('#bulk-n').textContent = `Выбрано: ${S.selected.size}`;
  }

  function renderProducts() { renderKpis(); renderCatFilter(); renderRows(); }

  function patchLocal(updated) {
    const i = S.products.findIndex(p => p.id === updated.id);
    if (i === -1) S.products.push(updated); else S.products[i] = updated;
  }

  async function saveField(id, fields, okMsg = 'Сохранено') {
    try {
      const { updatedProduct } = await api(`/api/admin/product/${encodeURIComponent(id)}`, { method: 'PUT', body: fields });
      patchLocal(updatedProduct);
      renderKpis();
      toast(okMsg);
      return updatedProduct;
    } catch (e) { fail(e); renderRows(); return null; }
  }

  // table events (delegated)
  $('#rows').addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-id]'); if (!tr) return;
    const id = tr.dataset.id;
    if (e.target.closest('[data-edit]')) return openEditor(id);
    if (e.target.closest('[data-upload]')) { S.uploadFor = id; $('#file').value = ''; return $('#file').click(); }
    const sw = e.target.closest('[data-stock]');
    if (sw) { const v = sw.getAttribute('aria-checked') !== 'true'; sw.setAttribute('aria-checked', v); return saveField(id, { in_stock: v }, v ? 'В наличии' : 'Нет в наличии'); }
    const st = e.target.closest('[data-store]');
    if (st) { const v = st.getAttribute('aria-pressed') !== 'true'; st.setAttribute('aria-pressed', v); return saveField(id, { [st.dataset.store]: v }); }
    if (e.target.closest('[data-select]')) {
      e.target.checked ? S.selected.add(id) : S.selected.delete(id);
      tr.classList.toggle('is-selected', e.target.checked); renderBulk(); return;
    }
    if (!e.target.closest('input, button')) openEditor(id);
  });
  $('#rows').addEventListener('keydown', (e) => {
    if (!e.target.matches('[data-price]')) return;
    if (e.key === 'Enter') e.target.blur();
    if (e.key === 'Escape') { e.target.value = money(byId(e.target.closest('tr').dataset.id).price); e.target.blur(); }
  });
  $('#rows').addEventListener('change', (e) => {
    if (!e.target.matches('[data-price]')) return;
    const id = e.target.closest('tr').dataset.id, v = parseNum(e.target.value);
    if (v === null) { toast('Цена должна быть числом', true); e.target.value = money(byId(id).price); return; }
    e.target.value = money(v);
    saveField(id, { price: v }, `Цена: ${money(v)} €`).then(() => { if (S.kpi === 'oldprice') renderRows(); });
  });
  $('#rows').addEventListener('focusin', (e) => { if (e.target.matches('[data-price]')) e.target.select(); });

  // drag & drop a photo onto a row
  $('#rows').addEventListener('dragover', (e) => { const tr = e.target.closest('tr[data-id]'); if (!tr) return; e.preventDefault(); tr.classList.add('is-drop'); });
  $('#rows').addEventListener('dragleave', (e) => { const tr = e.target.closest('tr[data-id]'); if (tr) tr.classList.remove('is-drop'); });
  $('#rows').addEventListener('drop', (e) => {
    const tr = e.target.closest('tr[data-id]'); if (!tr) return;
    e.preventDefault(); tr.classList.remove('is-drop');
    const f = e.dataTransfer.files[0]; if (f && f.type.startsWith('image/')) uploadPhotoFor(tr.dataset.id, f);
  });
  $('#file').addEventListener('change', () => {
    const f = $('#file').files[0]; if (!f || !S.uploadFor) return;
    if (S.uploadFor === '__editor') editorUpload(f); else uploadPhotoFor(S.uploadFor, f);
  });

  // photos: resize + WebP in the browser, upload to R2, attach to product
  async function toWebp(file, max = 1000, quality = 0.85) {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise(r => c.toBlob(r, 'image/webp', quality));
    if (!blob) throw new Error('Браузер не умеет WebP');
    return blob;
  }
  async function uploadFile(file, nameHint) {
    const webp = await toWebp(file);
    const base = String(nameHint || 'product').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-|-$/g, '') || 'product';
    const fd = new FormData();
    fd.append('file', webp, base + '.webp'); fd.append('filename', base);
    const { url } = await api('/api/admin/upload', { method: 'POST', body: fd });
    return url;
  }
  async function uploadPhotoFor(id, file) {
    const btn = $(`tr[data-id="${CSS.escape(id)}"] .thumb`); btn?.classList.add('is-busy');
    try {
      const url = await uploadFile(file, id);
      await saveField(id, { image: url }, 'Фото загружено');
      renderRows();
    } catch (e) { fail(e); btn?.classList.remove('is-busy'); }
  }

  // toolbar / filters
  $('#kpis').addEventListener('click', (e) => { const b = e.target.closest('[data-kpi]'); if (!b) return; S.kpi = b.dataset.kpi; renderKpis(); renderRows(); });
  $('#f-cat').addEventListener('change', (e) => { S.cat = e.target.value; renderRows(); });
  $('#f-sort').addEventListener('change', (e) => { S.sort = e.target.value; renderRows(); });
  let qTimer; $('#q').addEventListener('input', (e) => { clearTimeout(qTimer); qTimer = setTimeout(() => { S.q = e.target.value; renderRows(); }, 120); });
  $('#check-all').addEventListener('change', (e) => {
    visibleProducts().forEach(p => e.target.checked ? S.selected.add(p.id) : S.selected.delete(p.id)); renderRows();
  });
  $('#add').addEventListener('click', () => openEditor('new'));

  $('#bulk').addEventListener('click', async (e) => {
    const act = e.target.closest('[data-bulk]')?.dataset.bulk; if (!act) return;
    const ids = [...S.selected];
    if (act === 'clear') { S.selected.clear(); return renderRows(); }
    try {
      if (act === 'delete') {
        if (!confirm(`Удалить ${ids.length} товар(ов)? Это нельзя отменить.`)) return;
        await api('/api/admin/products', { method: 'DELETE', body: { ids } });
        S.products = S.products.filter(p => !S.selected.has(p.id));
        toast(`Удалено: ${ids.length}`);
      } else {
        const v = act === 'in';
        await api('/api/admin/products', { method: 'PATCH', body: ids.map(id => ({ id, in_stock: v })) });
        const now = new Date().toISOString();
        ids.forEach(id => { const p = byId(id); if (p) { p.in_stock = v; p.updated_at = now; } });
        toast(`${v ? 'В наличии' : 'Нет в наличии'}: ${ids.length}`);
      }
      S.selected.clear(); renderProducts();
    } catch (ex) { fail(ex); }
  });

  // ── Editor drawer (edit + create) ──
  function openEditor(id) {
    const p = id === 'new' ? { id: '', category: S.cat || S.cats[0]?.slug || '', subcategory: '', price: '', price_unit: 'pcs', in_stock: true } : byId(id);
    if (!p) return;
    S.editing = id;
    $('#ed-id').textContent = id === 'new' ? 'Новый товар' : p.id;
    $('#ed-title').textContent = id === 'new' ? 'Добавить товар' : (p.name_ru || p.name_en || 'Товар');
    $('#ed-delete').hidden = id === 'new';
    $('#ed-body').innerHTML = editorHtml(p);
    $('#drawer').hidden = false;
    updateSubOptions(p.subcategory);
    toggleDraftField();
    setTimeout(() => $('#editor').name_ru?.focus(), 60);
  }
  function closeEditor() { $('#drawer').hidden = true; S.editing = null; }

  function editorHtml(p) {
    const langTabs = LANGS.map(([l, L], i) => `<button type="button" data-lang-tab="${l}" class="${i === 0 ? 'is-active' : ''}">${L}${p['name_' + l] ? '' : '<span class="dot" title="нет названия"></span>'}</button>`).join('');
    const langPanes = LANGS.map(([l], i) => `<div class="sec" data-lang-pane="${l}" ${i ? 'hidden' : ''}>
        <label class="field"><span>Название</span><input name="name_${l}" value="${esc(p['name_' + l])}"></label>
        <label class="field"><span>Тип</span><input name="type_${l}" value="${esc(p['type_' + l])}" placeholder="напр. Светлое пиво, Соус"></label>
        <label class="field"><span>Описание</span><textarea name="description_${l}" rows="2">${esc(p['description_' + l])}</textarea></label>
      </div>`).join('');
    const storeChecks = stores().map(s => `<label class="check"><input type="checkbox" name="${esc(s.field)}" ${p[s.field] ? 'checked' : ''}> ${esc(s.name)}</label>`).join('');
    return `
      <div class="sec">
        <div class="photo">
          <div class="photo__img" id="ed-photo" title="Нажми или перетащи фото">${p.image ? `<img src="${esc(p.image)}" alt="">` : ICON_PHOTO}</div>
          <div class="photo__side">
            <button type="button" class="btn" id="ed-photo-btn">${p.image ? 'Заменить фото' : 'Загрузить фото'}</button>
            <label class="field"><span>Ссылка на фото</span><input name="image" value="${esc(p.image)}" placeholder="img/products/… или /media/…"></label>
            <small class="muted">Фото с телефона само уменьшится и сохранится в WebP.</small>
          </div>
        </div>
      </div>
      <div class="sec"><div class="tabs">${langTabs}</div>${langPanes}</div>
      <div class="sec"><h3>Категория и цена</h3>
        <div class="grid2">
          <label class="field"><span>Категория</span><select name="category">${S.cats.map(c => `<option value="${esc(c.slug)}" ${c.slug === p.category ? 'selected' : ''}>${esc(catName(c.slug))}</option>`).join('')}</select></label>
          <label class="field"><span>Подкатегория</span><select name="subcategory"></select></label>
        </div>
        <div class="grid3">
          <label class="field"><span>Цена, €</span><input name="price" value="${esc(money(p.price))}" inputmode="decimal"></label>
          <label class="field"><span>Цена за</span><select name="price_unit">${Object.entries(UNITS).map(([k, v]) => `<option value="${k}" ${(p.price_unit || 'pcs') === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
          <label class="field" id="ed-draft"><span>Цена 0,5 л, €</span><input name="price_05" value="${esc(p.price_05 ? money(p.price_05) : '')}" inputmode="decimal"><small>для разливного; основная цена — за 1 л</small></label>
        </div>
      </div>
      <div class="sec"><h3>Характеристики</h3>
        <div class="grid3">
          <label class="field"><span>Объём / вес</span><input name="volume" value="${esc(p.volume)}" placeholder="0.5L, 100г"></label>
          <label class="field"><span>Алкоголь</span><input name="abv" value="${esc(p.abv)}" placeholder="5%"></label>
          <label class="field"><span>IBU</span><input name="ibu" value="${esc(p.ibu)}" inputmode="numeric"></label>
        </div>
        <label class="field" style="max-width:180px"><span>Порядок в списке</span><input name="sort_order" value="${esc(p.sort_order ?? '')}" inputmode="numeric"><small>меньше — выше</small></label>
      </div>
      <div class="sec"><h3>Наличие</h3>
        <div class="row"><label class="check"><input type="checkbox" name="in_stock" ${p.in_stock !== false ? 'checked' : ''}> В наличии</label>${storeChecks}</div>
      </div>`;
  }

  function updateSubOptions(selected) {
    const f = $('#editor'); const subs = (S.cats.find(c => c.slug === f.category.value)?.subcategories || []).filter(s => s !== 'all');
    f.subcategory.innerHTML = '<option value="">—</option>' + subs.map(s => `<option value="${esc(s)}" ${s === selected ? 'selected' : ''}>${esc(subName(s))}</option>`).join('');
  }
  function toggleDraftField() {
    const f = $('#editor');
    $('#ed-draft').hidden = !(f.subcategory.value === 'draft' || parseNum(f.price_05.value) !== null);
  }

  $('#editor').addEventListener('change', (e) => {
    if (e.target.name === 'category') { updateSubOptions(''); toggleDraftField(); }
    if (e.target.name === 'subcategory') toggleDraftField();
  });
  $('#editor').addEventListener('click', (e) => {
    const tab = e.target.closest('[data-lang-tab]');
    if (tab) {
      $$('[data-lang-tab]').forEach(b => b.classList.toggle('is-active', b === tab));
      $$('[data-lang-pane]').forEach(p => { p.hidden = p.dataset.langPane !== tab.dataset.langTab; });
    }
    if (e.target.closest('#ed-photo, #ed-photo-btn')) { S.uploadFor = '__editor'; $('#file').value = ''; $('#file').click(); }
  });
  $('#editor').addEventListener('dragover', (e) => { if (e.target.closest('#ed-photo')) { e.preventDefault(); $('#ed-photo').classList.add('is-drop'); } });
  $('#editor').addEventListener('dragleave', (e) => { if (e.target.closest('#ed-photo')) $('#ed-photo').classList.remove('is-drop'); });
  $('#editor').addEventListener('drop', (e) => {
    if (!e.target.closest('#ed-photo')) return;
    e.preventDefault(); $('#ed-photo').classList.remove('is-drop');
    const f = e.dataTransfer.files[0]; if (f) editorUpload(f);
  });
  async function editorUpload(file) {
    const box = $('#ed-photo'); box.textContent = '…';
    try {
      const url = await uploadFile(file, S.editing !== 'new' ? S.editing : ($('#editor').name_en.value || 'product'));
      $('#editor').image.value = url; box.innerHTML = `<img src="${esc(url)}" alt="">`;
      toast('Фото загружено — не забудь сохранить');
    } catch (e) { fail(e); box.innerHTML = ICON_PHOTO; }
  }

  $('#editor').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    if (!f.name_ru.value.trim()) { toast('Заполни название (RU)', true); $('[data-lang-tab="ru"]').click(); f.name_ru.focus(); return; }
    const price = parseNum(f.price.value);
    if (price === null) { toast('Укажи цену', true); f.price.focus(); return; }
    const data = { category: f.category.value, subcategory: f.subcategory.value, price, price_unit: f.price_unit.value,
      price_05: $('#ed-draft').hidden ? null : parseNum(f.price_05.value),
      image: f.image.value.trim(), volume: f.volume.value.trim(), abv: f.abv.value.trim(), ibu: f.ibu.value.trim(),
      sort_order: parseNum(f.sort_order.value) ?? 0, in_stock: f.in_stock.checked };
    for (const [l] of LANGS) for (const k of ['name', 'type', 'description']) data[`${k}_${l}`] = f[`${k}_${l}`].value.trim();
    for (const s of stores()) data[s.field] = !!f[s.field]?.checked;
    const btn = $('#ed-save'); btn.disabled = true;
    try {
      if (S.editing === 'new') {
        const { product } = await api('/api/admin/products', { method: 'POST', body: data });
        patchLocal(product); toast('Товар добавлен');
      } else {
        const { updatedProduct } = await api(`/api/admin/product/${encodeURIComponent(S.editing)}`, { method: 'PUT', body: data });
        patchLocal(updatedProduct); toast('Сохранено');
      }
      closeEditor(); renderProducts();
    } catch (ex) { fail(ex); } finally { btn.disabled = false; }
  });

  $('#ed-delete').addEventListener('click', async () => {
    const p = byId(S.editing); if (!p) return;
    if (!confirm(`Удалить «${p.name_ru || p.id}»? Это нельзя отменить.`)) return;
    try {
      await api(`/api/admin/product/${encodeURIComponent(p.id)}`, { method: 'DELETE' });
      S.products = S.products.filter(x => x.id !== p.id); S.selected.delete(p.id);
      closeEditor(); renderProducts(); toast('Удалено');
    } catch (e) { fail(e); }
  });
  $('#drawer').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeEditor(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#drawer').hidden) closeEditor(); });

  // ── Categories view ──
  let draftCats = null, draftTrans = null;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const countIn = (cat, sub) => S.products.filter(p => p.category === cat && (!sub || p.subcategory === sub)).length;
  const ICON_UP = '<svg viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>';
  const ICON_DOWN = '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>';
  const ICON_DEL = '<svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>';

  function namesInputs(kind, slug) {
    return `<div class="names">${LANGS.map(([l, L]) => `<input class="input" data-name="${kind}" data-slug="${esc(slug)}" data-lang="${l}" value="${esc(draftTrans[l]?.[kind]?.[slug] || '')}" placeholder="${L}" aria-label="${L}">`).join('')}</div>`;
  }
  function renderCats() {
    if (!draftCats) { draftCats = clone(S.cats); draftTrans = clone(S.trans); }
    $('#cats').innerHTML = draftCats.map((c, i) => `
      <div class="cat" data-cat="${esc(c.slug)}">
        <div class="cat__head">
          <button type="button" class="mini" data-move="-1" ${i === 0 ? 'disabled' : ''} title="Выше">${ICON_UP}</button>
          <button type="button" class="mini" data-move="1" ${i === draftCats.length - 1 ? 'disabled' : ''} title="Ниже">${ICON_DOWN}</button>
          <h3>${esc(draftTrans.ru?.categories?.[c.slug] || c.slug)}</h3>
          <span class="cat__slug">${esc(c.slug)}</span>
          <span class="cat__count">${countIn(c.slug)} товаров</span>
          <span class="spacer"></span>
          <button type="button" class="mini" data-del-cat title="Удалить категорию">${ICON_DEL}</button>
        </div>
        ${namesInputs('categories', c.slug)}
        <div style="margin-top:12px">
          ${(c.subcategories || []).filter(s => s !== 'all').map((s, j, arr) => `
            <div class="sub-row" data-sub="${esc(s)}">
              <button type="button" class="mini" data-sub-move="-1" ${j === 0 ? 'disabled' : ''}>${ICON_UP}</button>
              <button type="button" class="mini" data-sub-move="1" ${j === arr.length - 1 ? 'disabled' : ''}>${ICON_DOWN}</button>
              <span class="cat__slug">${esc(s)}</span>
              ${namesInputs('subcategories', s)}
              <span class="cat__count">${countIn(c.slug, s)}</span>
              <button type="button" class="mini" data-del-sub title="Удалить подкатегорию">${ICON_DEL}</button>
            </div>`).join('')}
          <button type="button" class="btn btn--sm btn--ghost" data-add-sub>+ Подкатегория</button>
        </div>
      </div>`).join('');
  }
  const catsDirty = () => { $('#cats-save').disabled = false; };
  const askSlug = (what) => {
    const s = (prompt(`Код ${what} латиницей (например: craft_beer):`) || '').trim().toLowerCase();
    if (!s) return null;
    if (!/^[a-z0-9_]{2,32}$/.test(s)) { toast('Только латиница, цифры и _', true); return null; }
    return s;
  };
  $('#cats').addEventListener('input', (e) => {
    const el = e.target.closest('[data-name]'); if (!el) return;
    const { name, slug, lang } = el.dataset;
    draftTrans[lang] = draftTrans[lang] || {}; draftTrans[lang][name] = draftTrans[lang][name] || {};
    draftTrans[lang][name][slug] = el.value; catsDirty();
  });
  $('#cats').addEventListener('click', (e) => {
    const card = e.target.closest('[data-cat]'); if (!card) return;
    const ci = draftCats.findIndex(c => c.slug === card.dataset.cat), cat = draftCats[ci];
    const mv = e.target.closest('[data-move]');
    if (mv) { const j = ci + Number(mv.dataset.move); [draftCats[ci], draftCats[j]] = [draftCats[j], draftCats[ci]]; catsDirty(); return renderCats(); }
    if (e.target.closest('[data-del-cat]')) {
      const n = countIn(cat.slug); if (n) return toast(`В категории ${n} товаров — сначала перенеси их`, true);
      if (!confirm('Удалить пустую категорию?')) return;
      draftCats.splice(ci, 1); catsDirty(); return renderCats();
    }
    const row = e.target.closest('[data-sub]');
    const subs = cat.subcategories || [];
    const smv = e.target.closest('[data-sub-move]');
    if (row && smv) {
      const real = subs.filter(s => s !== 'all'); const k = real.indexOf(row.dataset.sub); const j = k + Number(smv.dataset.subMove);
      [real[k], real[j]] = [real[j], real[k]]; cat.subcategories = ['all', ...real]; catsDirty(); return renderCats();
    }
    if (row && e.target.closest('[data-del-sub]')) {
      const n = countIn(cat.slug, row.dataset.sub); if (n) return toast(`В подкатегории ${n} товаров — сначала перенеси их`, true);
      cat.subcategories = subs.filter(s => s !== row.dataset.sub); catsDirty(); return renderCats();
    }
    if (e.target.closest('[data-add-sub]')) {
      const s = askSlug('подкатегории'); if (!s) return;
      if (subs.includes(s)) return toast('Такая подкатегория уже есть', true);
      cat.subcategories = [...(subs.includes('all') ? subs : ['all', ...subs]), s]; catsDirty(); renderCats();
      $(`[data-sub="${s}"] input[data-lang="ru"]`)?.focus();
    }
  });
  $('#cat-add').addEventListener('click', () => {
    const s = askSlug('категории'); if (!s) return;
    if (draftCats.some(c => c.slug === s)) return toast('Такая категория уже есть', true);
    draftCats.push({ slug: s, sort_order: draftCats.length, subcategories: ['all'] }); catsDirty(); renderCats();
    $(`[data-cat="${s}"] input[data-lang="ru"]`)?.focus();
  });
  $('#cats-save').addEventListener('click', async () => {
    try {
      await api('/api/admin/categories', { method: 'PUT', body: { categories: draftCats, translations: draftTrans } });
      S.cats = clone(draftCats).map((c, i) => ({ ...c, sort_order: i })); S.trans = clone(draftTrans);
      $('#cats-save').disabled = true; toast('Категории сохранены'); renderCats(); renderCatFilter();
    } catch (e) { fail(e); }
  });

  // ── Settings view ──
  function renderSettings() {
    const s = S.settings; const so = s.socials || {}; const d = s.delivery || {};
    const inp = (path, label, val, ph = '') => `<label class="field"><span>${label}</span><input data-path="${path}" value="${esc(val)}" placeholder="${esc(ph)}"></label>`;
    $('#settings-form').innerHTML = `<div class="settings">
      <div class="sec"><h3>Контакты</h3><div class="grid2">${inp('phone', 'Телефон', s.phone, '+372 …')}</div></div>
      <div class="sec"><h3>Соцсети</h3><div class="grid3">${inp('socials.instagram', 'Instagram', so.instagram)}${inp('socials.facebook', 'Facebook', so.facebook)}${inp('socials.tiktok', 'TikTok', so.tiktok)}</div></div>
      <div class="sec"><h3>Доставка</h3><div class="grid2">${inp('delivery.wolt', 'Wolt', d.wolt)}${inp('delivery.bolt', 'Bolt Food', d.bolt)}</div></div>
      <div class="sec"><h3>Магазины</h3>${(s.stores || []).map((st, i) => `<div class="grid2">${inp(`stores.${i}.name`, 'Название', st.name)}${inp(`stores.${i}.address`, 'Адрес', st.address)}</div>`).join('')}</div>
    </div>`;
  }
  $('#settings-form').addEventListener('input', () => { $('#settings-save').disabled = false; });
  $('#settings-form').addEventListener('submit', (e) => e.preventDefault());
  $('#settings-save').addEventListener('click', async () => {
    const next = clone(S.settings);
    $$('#settings-form [data-path]').forEach(el => {
      const keys = el.dataset.path.split('.'); let o = next;
      keys.slice(0, -1).forEach(k => { o[k] = o[k] ?? {}; o = o[k]; });
      o[keys.at(-1)] = el.value.trim();
    });
    try {
      const { settings } = await api('/api/admin/settings', { method: 'PUT', body: next });
      S.settings = settings; $('#settings-save').disabled = true; toast('Настройки сохранены'); renderProducts();
    } catch (e) { fail(e); }
  });

  // ── Routing ──
  function route() {
    const h = location.hash.slice(1);
    const v = ['products', 'categories', 'settings'].includes(h) ? h : 'products';
    $$('.view').forEach(el => { el.hidden = el.id !== `view-${v}`; });
    $$('.side a').forEach(a => a.classList.toggle('is-active', a.dataset.view === v));
    if (v === 'categories') renderCats();
    if (v === 'settings') renderSettings();
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', (e) => {
    if (!$('#cats-save').disabled || !$('#settings-save').disabled) { e.preventDefault(); e.returnValue = ''; }
  });

  // ── Boot ──
  async function start() {
    const [products, catData, settings] = await Promise.all([
      api('/api/admin/products'), api('/api/admin/categories'), api('/api/admin/settings'),
    ]);
    S.products = products;
    S.cats = (catData.categories || []).slice().sort((a, b) => a.sort_order - b.sort_order);
    S.trans = catData.translations || {};
    S.settings = settings || {};
    if (!Object.keys(S.trans).length) {
      try { S.trans = await (await fetch('data/translations.json')).json(); } catch { /* ignore */ }
    }
    draftCats = null;
    $('#login').hidden = true; $('#app').hidden = false;
    renderProducts(); route();
  }

  (async () => {
    try {
      const { authenticated } = await (await fetch('/api/auth/check')).json();
      if (authenticated) await start(); else showLogin();
    } catch { showLogin(); }
  })();
})();
