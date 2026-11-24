// Beer&Snacks — pickup orders: cart, checkout, hand-off to the order page.
// Prices shown here are for the customer's convenience; the server recomputes everything.
(() => {
  'use strict';
  const BS = window.BS;
  if (!BS) return;

  const T = {
    ru: {
      add: 'В корзину', added: 'В корзине', size: 'Объём', weight: 'Товар на развес — купить можно только в магазине.',
      cart: 'Корзина', empty: 'Корзина пуста.', total: 'Итого', incl: 'Цены включают НДС и залог за тару.', checkout: 'Оформить заказ',
      remove: 'Убрать', back: '← Назад', store: 'Где забрать', name: 'Имя', phone: 'Телефон', email: 'Email (необязательно)',
      comment: 'Комментарий (необязательно)', pay: 'Оплата', iban: 'Перевод на счёт (IBAN) — заранее', cash: 'На кассе при получении',
      cashNo: 'Заказ с алкоголем оплачивается заранее переводом.', adult: 'Мне исполнилось 18 лет. При получении покажу документ.',
      terms: 'Я согласен с {a}условиями продажи{/a}.', submit: 'Заказать с обязательством оплаты', sending: 'Отправляем…',
      pickupNote: 'Самовывоз из магазина. Заказ ждёт оплаты {h} ч, после оплаты — забрать в течение {d} дн.',
      off: 'Заказы сейчас не принимаются.', items: '{n} шт.',
      err: {
        name: 'Укажите имя.', phone: 'Проверьте номер телефона.', email: 'Проверьте email.', terms: 'Нужно согласиться с условиями продажи.',
        adult: 'Подтвердите, что вам есть 18 лет.', pay_alcohol: 'Заказ с алкоголем оплачивается переводом заранее.', store: 'Выберите магазин.',
        rate: 'Слишком много заказов. Попробуйте позже или позвоните нам.', unavailable: 'Товара «{p}» уже нет — уберите его из корзины.',
        pay_unavailable: 'Оплата переводом временно недоступна.', captcha: 'Проверка не пройдена, попробуйте ещё раз.', default: 'Не получилось отправить заказ. Попробуйте ещё раз.',
      },
    },
    uk: {
      add: 'У кошик', added: 'У кошику', size: 'Обʼєм', weight: 'Товар на вагу — купити можна лише в магазині.',
      cart: 'Кошик', empty: 'Кошик порожній.', total: 'Разом', incl: 'Ціни включають ПДВ і заставу за тару.', checkout: 'Оформити замовлення',
      remove: 'Прибрати', back: '← Назад', store: 'Де забрати', name: 'Імʼя', phone: 'Телефон', email: 'Email (необовʼязково)',
      comment: 'Коментар (необовʼязково)', pay: 'Оплата', iban: 'Переказ на рахунок (IBAN) — заздалегідь', cash: 'На касі під час отримання',
      cashNo: 'Замовлення з алкоголем оплачується заздалегідь переказом.', adult: 'Мені виповнилося 18 років. Під час отримання покажу документ.',
      terms: 'Я погоджуюся з {a}умовами продажу{/a}.', submit: 'Замовити з обовʼязком оплати', sending: 'Надсилаємо…',
      pickupNote: 'Самовивіз із магазину. Замовлення чекає оплати {h} год, після оплати — забрати протягом {d} дн.',
      off: 'Замовлення зараз не приймаються.', items: '{n} шт.',
      err: {
        name: 'Вкажіть імʼя.', phone: 'Перевірте номер телефону.', email: 'Перевірте email.', terms: 'Потрібно погодитися з умовами продажу.',
        adult: 'Підтвердіть, що вам є 18 років.', pay_alcohol: 'Замовлення з алкоголем оплачується переказом заздалегідь.', store: 'Оберіть магазин.',
        rate: 'Забагато замовлень. Спробуйте пізніше або зателефонуйте нам.', unavailable: 'Товару «{p}» уже немає — приберіть його з кошика.',
        pay_unavailable: 'Оплата переказом тимчасово недоступна.', captcha: 'Перевірку не пройдено, спробуйте ще раз.', default: 'Не вдалося надіслати замовлення. Спробуйте ще раз.',
      },
    },
    et: {
      add: 'Lisa korvi', added: 'Korvis', size: 'Maht', weight: 'Kaalukaup — saab osta ainult poest.',
      cart: 'Ostukorv', empty: 'Ostukorv on tühi.', total: 'Kokku', incl: 'Hinnad sisaldavad käibemaksu ja pakendi panti.', checkout: 'Vormista tellimus',
      remove: 'Eemalda', back: '← Tagasi', store: 'Kust kätte saada', name: 'Nimi', phone: 'Telefon', email: 'E-post (vabatahtlik)',
      comment: 'Kommentaar (vabatahtlik)', pay: 'Makse', iban: 'Pangaülekanne (IBAN) — ette', cash: 'Kassas kättesaamisel',
      cashNo: 'Alkoholiga tellimus tasutakse ette pangaülekandega.', adult: 'Olen vähemalt 18-aastane. Kättesaamisel näitan isikut tõendavat dokumenti.',
      terms: 'Nõustun {a}müügitingimustega{/a}.', submit: 'Tellin kohustusega maksta', sending: 'Saadame…',
      pickupNote: 'Kättesaamine poest. Tellimus ootab makset {h} h, pärast makset tuleb see kätte saada {d} päeva jooksul.',
      off: 'Tellimusi praegu vastu ei võeta.', items: '{n} tk',
      err: {
        name: 'Sisestage nimi.', phone: 'Kontrollige telefoninumbrit.', email: 'Kontrollige e-posti aadressi.', terms: 'Palun nõustuge müügitingimustega.',
        adult: 'Kinnitage, et olete vähemalt 18-aastane.', pay_alcohol: 'Alkoholiga tellimus tasutakse ette pangaülekandega.', store: 'Valige pood.',
        rate: 'Liiga palju tellimusi. Proovige hiljem või helistage meile.', unavailable: 'Toodet „{p}” enam ei ole — eemaldage see korvist.',
        pay_unavailable: 'Pangaülekanne ei ole ajutiselt saadaval.', captcha: 'Kontroll ebaõnnestus, proovige uuesti.', default: 'Tellimuse saatmine ebaõnnestus. Proovige uuesti.',
      },
    },
    en: {
      add: 'Add to cart', added: 'In cart', size: 'Size', weight: 'Sold by weight — available in store only.',
      cart: 'Cart', empty: 'Your cart is empty.', total: 'Total', incl: 'Prices include VAT and the container deposit.', checkout: 'Checkout',
      remove: 'Remove', back: '← Back', store: 'Pick up at', name: 'Name', phone: 'Phone', email: 'Email (optional)',
      comment: 'Comment (optional)', pay: 'Payment', iban: 'Bank transfer (IBAN) — in advance', cash: 'At the till on pickup',
      cashNo: 'Orders with alcohol are paid in advance by bank transfer.', adult: 'I am 18 or older. I will show an ID on pickup.',
      terms: 'I agree to the {a}terms of sale{/a}.', submit: 'Order with obligation to pay', sending: 'Sending…',
      pickupNote: 'Pickup from the store. The order waits for payment {h} h; after payment, pick it up within {d} day(s).',
      off: 'Orders are not accepted at the moment.', items: '{n} pcs',
      err: {
        name: 'Please enter your name.', phone: 'Please check the phone number.', email: 'Please check the email.', terms: 'Please accept the terms of sale.',
        adult: 'Please confirm you are 18 or older.', pay_alcohol: 'Orders with alcohol are paid in advance by bank transfer.', store: 'Please choose a store.',
        rate: 'Too many orders. Please try later or call us.', unavailable: '“{p}” is no longer available — remove it from the cart.',
        pay_unavailable: 'Bank transfer is temporarily unavailable.', captcha: 'Check failed, please try again.', default: 'Could not send the order. Please try again.',
      },
    },
  };
  const t = () => T[BS.lang] || T.et;
  const { esc, fmt } = BS;
  const MAX_QTY = 24;
  const eur = (cents) => `${(cents / 100).toFixed(2).replace('.', ',')} €`;
  const $ = (id) => document.getElementById(id);

  // ── Cart state (this browser only) ──
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('bs_cart') || '[]').filter(l => l && l.id && l.qty > 0); } catch { cart = []; }
  const save = () => { localStorage.setItem('bs_cart', JSON.stringify(cart)); renderFab(); };

  const product = (id) => (BS.data.catalog || []).find(p => p.id === id);
  const orderable = (p) => p && Number(p.price) > 0 && (!p.price_unit || p.price_unit === 'pcs');
  const unit = (p, size) => Math.round(Number(p.price_05 ? (size === '05' ? p.price_05 : p.price) : p.price) * 100);
  const settings = () => BS.data.settings || {};
  const stores = () => (settings().orders?.enabled ? (settings().stores || []).filter(s => s.pickup && s.field) : []);
  const ordersOn = () => stores().length > 0;
  // Lines whose product disappeared from the catalog are dropped quietly.
  const lines = () => cart.map(l => ({ ...l, p: product(l.id) })).filter(l => orderable(l.p));
  const sizeLabel = (p, size) => p.price_05 ? (size === '05' ? BS.ui().half : BS.ui().litre) : '';

  function addLine(id, size, qty) {
    const l = cart.find(x => x.id === id && x.size === size);
    if (l) l.qty = Math.min(MAX_QTY, l.qty + qty); else cart.push({ id, size, qty: Math.min(MAX_QTY, qty) });
    save();
  }

  // ── Floating cart button ──
  function renderFab() {
    const fab = $('cart-fab');
    const ls = lines();
    const n = ls.reduce((s, l) => s + l.qty, 0);
    fab.hidden = !ordersOn() || !n;
    fab.querySelector('.cart-fab__n').textContent = n;
    fab.querySelector('.cart-fab__sum').textContent = eur(ls.reduce((s, l) => s + unit(l.p, l.size) * l.qty, 0));
    fab.setAttribute('aria-label', `${t().cart}: ${n}`);
  }

  // ── "Add to cart" in the product sheet ──
  function renderBuy(id) {
    const box = $('sheet-buy');
    if (!box || box.dataset.id !== id) return;
    const p = product(id);
    if (!ordersOn() || !p) { box.innerHTML = ''; return; }
    if (!orderable(p)) { box.innerHTML = `<p class="buy__note">${esc(t().weight)}</p>`; return; }
    const sizes = p.price_05 ? ['05', '1'] : [''];
    box.innerHTML = `
      ${p.price_05 ? `<div class="buy__sizes" role="radiogroup" aria-label="${esc(t().size)}">${sizes.map((s, i) =>
        `<label class="buy__size"><input type="radio" name="buy-size" value="${s}"${i === 0 ? ' checked' : ''}><span>${esc(sizeLabel(p, s))} · ${eur(unit(p, s))}</span></label>`).join('')}</div>` : ''}
      <div class="buy__row">
        <div class="qty"><button type="button" data-q="-1" aria-label="−">−</button><output id="buy-qty">1</output><button type="button" data-q="1" aria-label="+">+</button></div>
        <button type="button" class="buy__add" id="buy-add">${esc(t().add)}</button>
      </div>`;
    let qty = 1;
    box.addEventListener('click', (e) => {
      const q = e.target.closest('[data-q]');
      if (q) { qty = Math.min(MAX_QTY, Math.max(1, qty + Number(q.dataset.q))); $('buy-qty').textContent = qty; return; }
      if (e.target.closest('#buy-add')) {
        const size = p.price_05 ? box.querySelector('[name="buy-size"]:checked').value : '';
        addLine(p.id, size, qty);
        const b = $('buy-add'); b.textContent = `✓ ${t().added}`; b.classList.add('is-done');
        setTimeout(() => { if (b.isConnected) { b.textContent = t().add; b.classList.remove('is-done'); } }, 1400);
      }
    });
  }

  // ── Cart dialog: list → form ──
  const dlg = $('cart');
  let step = 'list';

  function open() { step = 'list'; render(); dlg.showModal(); dlg.focus({ preventScroll: true }); document.documentElement.classList.add('sheet-open'); }
  function close() { dlg.close(); document.documentElement.classList.remove('sheet-open'); }
  dlg.addEventListener('close', () => document.documentElement.classList.remove('sheet-open'));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });

  function render() {
    const u = t(), ls = lines();
    const total = ls.reduce((s, l) => s + unit(l.p, l.size) * l.qty, 0);
    const alc = ls.some(l => BS.isAlcohol(l.p));
    const body = $('cart-body');
    $('cart-title').textContent = u.cart;
    if (!ordersOn()) { body.innerHTML = `<p class="cart__empty">${esc(u.off)}</p>`; return; }
    if (!ls.length) { body.innerHTML = `<p class="cart__empty">${esc(u.empty)}</p>`; return; }

    if (step === 'list') {
      body.innerHTML = `
        <ul class="cart__lines">${ls.map((l, i) => `
          <li class="cart__line">
            ${l.p.image ? `<img src="${esc(l.p.image)}" alt="" loading="lazy">` : '<span class="cart__noimg"></span>'}
            <div class="cart__info"><strong>${esc(BS.field(l.p, 'name'))}</strong>
              <span>${esc([sizeLabel(l.p, l.size), eur(unit(l.p, l.size))].filter(Boolean).join(' · '))}</span>
              <button type="button" class="link" data-del="${i}">${esc(u.remove)}</button></div>
            <div class="qty"><button type="button" data-dq="${i}" data-d="-1" aria-label="−">−</button><output>${l.qty}</output><button type="button" data-dq="${i}" data-d="1" aria-label="+">+</button></div>
          </li>`).join('')}</ul>
        <div class="cart__total"><span>${esc(u.total)}</span><strong>${eur(total)}</strong></div>
        <p class="cart__small">${esc(u.incl)}</p>
        ${alc ? `<p class="warn">${BS.warnHtml()}</p>` : ''}
        <button type="button" class="cart__go" data-step="form">${esc(u.checkout)}</button>`;
      return;
    }

    // form
    const ss = stores(), o = settings().orders || { pay_hours: 24, pickup_days: 1 };
    const saved = JSON.parse(localStorage.getItem('bs_buyer') || '{}');
    body.innerHTML = `
      <form class="cart__form" id="cart-form" novalidate>
        <button type="button" class="link" data-step="list">${esc(u.back)}</button>
        <fieldset><legend>${esc(u.store)}</legend>${ss.map((s, i) => `
          <label class="opt"><input type="radio" name="store" value="${esc(s.field)}"${i === 0 ? ' checked' : ''}>
            <span><strong>${esc(s.name)}</strong> ${esc(s.address)}<small>${esc(BS.hoursText(s.hours || [], BS.ui()).join(' · '))}</small></span></label>`).join('')}
        </fieldset>
        <label class="fld"><span>${esc(u.name)}</span><input name="name" autocomplete="name" maxlength="80" required value="${esc(saved.name || '')}"></label>
        <label class="fld"><span>${esc(u.phone)}</span><input name="phone" type="tel" autocomplete="tel" maxlength="30" required value="${esc(saved.phone || '')}" placeholder="+372 5xx xxxx"></label>
        <label class="fld"><span>${esc(u.email)}</span><input name="email" type="email" autocomplete="email" maxlength="120" value="${esc(saved.email || '')}"></label>
        <label class="fld"><span>${esc(u.comment)}</span><input name="comment" maxlength="300"></label>
        <fieldset><legend>${esc(u.pay)}</legend>
          <label class="opt"><input type="radio" name="pay" value="iban" checked><span>${esc(u.iban)}</span></label>
          <label class="opt${alc ? ' is-off' : ''}"><input type="radio" name="pay" value="cash"${alc ? ' disabled' : ''}><span>${esc(u.cash)}${alc ? `<small>${esc(u.cashNo)}</small>` : ''}</span></label>
        </fieldset>
        ${alc ? `<label class="chk"><input type="checkbox" name="adult"> <span>${esc(u.adult)}</span></label>` : ''}
        <label class="chk"><input type="checkbox" name="terms"> <span>${fmt(esc(u.terms), { a: `<a href="terms.html?lang=${BS.lang}" target="_blank" rel="noopener">`, '/a': '</a>' }).replace('{/a}', '</a>')}</span></label>
        <div class="cart__total"><span>${esc(u.total)}</span><strong>${eur(total)}</strong></div>
        <p class="cart__small">${esc(fmt(u.pickupNote, { h: o.pay_hours, d: o.pickup_days }))} ${esc(u.incl)}</p>
        ${alc ? `<p class="warn">${BS.warnHtml()}</p>` : ''}
        <p class="cart__err" id="cart-err" role="alert" hidden></p>
        <button type="submit" class="cart__go" id="cart-submit">${esc(u.submit)}</button>
      </form>`;
  }

  dlg.addEventListener('click', (e) => {
    const st = e.target.closest('[data-step]');
    if (st) { step = st.dataset.step; render(); dlg.querySelector('.cart__body').scrollTop = 0; return; }
    if (e.target.closest('#cart-close')) return close();
    const ls = lines();
    const del = e.target.closest('[data-del]');
    if (del) { const l = ls[Number(del.dataset.del)]; cart = cart.filter(x => !(x.id === l.id && x.size === l.size)); save(); render(); return; }
    const dq = e.target.closest('[data-dq]');
    if (dq) {
      const l = ls[Number(dq.dataset.dq)]; const c = cart.find(x => x.id === l.id && x.size === l.size);
      c.qty = Math.min(MAX_QTY, Math.max(1, c.qty + Number(dq.dataset.d))); save(); render();
    }
  });

  dlg.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target, f = form.elements, u = t(), err = $('cart-err'), btn = $('cart-submit');
    const show = (code, extra = {}) => { err.textContent = fmt(u.err[code] || u.err.default, extra); err.hidden = false; err.scrollIntoView({ block: 'nearest' }); };
    err.hidden = true;
    const data = {
      store: (form.querySelector('[name=store]:checked') || {}).value,
      name: f.name.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(), comment: f.comment.value.trim(),
      pay: (form.querySelector('[name=pay]:checked') || {}).value || 'iban',
      adult: f.adult ? f.adult.checked : false, terms: f.terms.checked, lang: BS.lang,
      items: lines().map(l => ({ id: l.id, size: l.size || '', qty: l.qty })),
      captcha: window.turnstile && $('cart-captcha') ? window.turnstile.getResponse($('cart-captcha')) : undefined,
    };
    // Quick checks before sending (the server checks the same and more).
    if (data.name.length < 2) return show('name');
    if (!/^\+?[\d\s()-]{7,20}$/.test(data.phone)) return show('phone');
    if (data.email && !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(data.email)) return show('email');
    if (f.adult && !data.adult) return show('adult');
    if (!data.terms) return show('terms');
    btn.disabled = true; btn.textContent = u.sending;
    try {
      const res = await fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code = String(out.error || 'default');
        if (code.startsWith('unavailable:')) { const p = product(code.split(':')[1]); return show('unavailable', { p: p ? BS.field(p, 'name') : '' }); }
        return show(code);
      }
      localStorage.setItem('bs_buyer', JSON.stringify({ name: data.name, phone: data.phone, email: data.email }));
      const mine = JSON.parse(localStorage.getItem('bs_orders') || '[]').slice(-9);
      mine.push({ c: out.code, t: out.token, at: Date.now() });
      localStorage.setItem('bs_orders', JSON.stringify(mine));
      cart = []; save();
      location.href = `order?c=${encodeURIComponent(out.code)}&t=${encodeURIComponent(out.token)}&lang=${BS.lang}`;
    } catch { show('default'); } finally { if (btn.isConnected) { btn.disabled = false; btn.textContent = u.submit; } }
  });

  $('cart-fab').addEventListener('click', open);
  document.addEventListener('bs:sheet', (e) => renderBuy(e.detail.id));
  document.addEventListener('bs:render', () => { renderFab(); if (dlg.open) render(); });
  // Another tab changed the cart.
  window.addEventListener('storage', (e) => { if (e.key === 'bs_cart') { try { cart = JSON.parse(e.newValue || '[]'); } catch { cart = []; } renderFab(); } });
  renderFab();
})();
