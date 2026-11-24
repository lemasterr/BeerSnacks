// Beer&Snacks — the customer's order page: status, payment details, where to pick up.
(() => {
  'use strict';
  const LANGS = ['et', 'ru', 'uk', 'en'];
  const params = new URLSearchParams(location.search);
  const lang = LANGS.includes(params.get('lang')) ? params.get('lang') : (LANGS.includes(localStorage.getItem('bs_lang')) ? localStorage.getItem('bs_lang') : 'et');
  document.documentElement.lang = lang;
  const WARN = 'Tähelepanu! Tegemist on alkoholiga. Alkohol võib kahjustada teie tervist.';

  const T = {
    ru: {
      home: '← В каталог', title: 'Заказ {c}', placed: 'Оформлен {d}', notFound: 'Заказ не найден. Проверьте ссылку.', load: 'Не удалось загрузить заказ. Обновите страницу.',
      s: { new: 'Ждёт оплаты', newCash: 'Принят', paid: 'Оплачен — собираем', ready: 'Готов к выдаче', done: 'Выдан', cancelled: 'Отменён', expired: 'Срок истёк' },
      h: {
        new: 'Переведите сумму до {t}. После поступления оплаты мы соберём заказ.', newCash: 'Мы соберём заказ. Забрать и оплатить на кассе до {t}.',
        paid: 'Оплата получена. Сообщим статус здесь — заказ скоро будет готов.', ready: 'Можно забирать до {t}. Покажите номер заказа и документ.',
        done: 'Спасибо за покупку!', cancelled: 'Заказ отменён. Если вы уже заплатили, мы вернём деньги на ваш счёт.', expired: 'Заказ не был оплачен или получен вовремя.',
      },
      pay: 'Оплата переводом', recipient: 'Получатель', iban: 'IBAN', amount: 'Сумма', ref: 'Пояснение', copy: 'Копировать', copied: 'Скопировано',
      payNote: 'В пояснении к платежу обязательно укажите номер заказа.', pickup: 'Где забрать', items: 'Состав заказа', total: 'Итого',
      incl: 'Цены включают НДС и залог за тару.', id: 'При получении продавец проверит документ (алкоголь продаётся с 18 лет).', save: 'Сохраните эту страницу — по ссылке всегда виден статус заказа.',
      size: { '05': '0,5 л', 1: '1 л' }, terms: 'Условия продажи',
    },
    uk: {
      home: '← До каталогу', title: 'Замовлення {c}', placed: 'Оформлено {d}', notFound: 'Замовлення не знайдено. Перевірте посилання.', load: 'Не вдалося завантажити замовлення. Оновіть сторінку.',
      s: { new: 'Чекає оплати', newCash: 'Прийнято', paid: 'Оплачено — збираємо', ready: 'Готове до видачі', done: 'Видано', cancelled: 'Скасовано', expired: 'Термін минув' },
      h: {
        new: 'Перекажіть суму до {t}. Після надходження оплати ми зберемо замовлення.', newCash: 'Ми зберемо замовлення. Забрати й оплатити на касі до {t}.',
        paid: 'Оплату отримано. Статус буде тут — замовлення скоро буде готове.', ready: 'Можна забирати до {t}. Покажіть номер замовлення і документ.',
        done: 'Дякуємо за покупку!', cancelled: 'Замовлення скасовано. Якщо ви вже заплатили, ми повернемо гроші на ваш рахунок.', expired: 'Замовлення не було оплачене або отримане вчасно.',
      },
      pay: 'Оплата переказом', recipient: 'Отримувач', iban: 'IBAN', amount: 'Сума', ref: 'Призначення', copy: 'Копіювати', copied: 'Скопійовано',
      payNote: 'У призначенні платежу обовʼязково вкажіть номер замовлення.', pickup: 'Де забрати', items: 'Склад замовлення', total: 'Разом',
      incl: 'Ціни включають ПДВ і заставу за тару.', id: 'Під час отримання продавець перевірить документ (алкоголь продається з 18 років).', save: 'Збережіть цю сторінку — за посиланням завжди видно статус замовлення.',
      size: { '05': '0,5 л', 1: '1 л' }, terms: 'Умови продажу',
    },
    et: {
      home: '← Kataloog', title: 'Tellimus {c}', placed: 'Esitatud {d}', notFound: 'Tellimust ei leitud. Kontrollige linki.', load: 'Tellimuse laadimine ebaõnnestus. Värskendage lehte.',
      s: { new: 'Ootab makset', newCash: 'Vastu võetud', paid: 'Makstud — komplekteerime', ready: 'Valmis kättesaamiseks', done: 'Väljastatud', cancelled: 'Tühistatud', expired: 'Aegunud' },
      h: {
        new: 'Palun tasuge kuni {t}. Pärast makse laekumist komplekteerime tellimuse.', newCash: 'Komplekteerime tellimuse. Saate selle kätte ja tasute kassas kuni {t}.',
        paid: 'Makse on laekunud. Olek kuvatakse siin — tellimus on varsti valmis.', ready: 'Kättesaadav kuni {t}. Näidake tellimuse numbrit ja isikut tõendavat dokumenti.',
        done: 'Täname ostu eest!', cancelled: 'Tellimus on tühistatud. Kui olete juba maksnud, tagastame raha teie kontole.', expired: 'Tellimust ei makstud või ei võetud õigel ajal vastu.',
      },
      pay: 'Pangaülekanne', recipient: 'Saaja', iban: 'IBAN', amount: 'Summa', ref: 'Selgitus', copy: 'Kopeeri', copied: 'Kopeeritud',
      payNote: 'Märkige makse selgitusse kindlasti tellimuse number.', pickup: 'Kättesaamise koht', items: 'Tellimuse sisu', total: 'Kokku',
      incl: 'Hinnad sisaldavad käibemaksu ja pakendi panti.', id: 'Kättesaamisel kontrollib müüja isikut tõendavat dokumenti (alkoholi müüakse alates 18. eluaastast).', save: 'Salvestage see leht — lingilt näete alati tellimuse olekut.',
      size: { '05': '0,5 l', 1: '1 l' }, terms: 'Müügitingimused',
    },
    en: {
      home: '← Catalog', title: 'Order {c}', placed: 'Placed {d}', notFound: 'Order not found. Please check the link.', load: 'Could not load the order. Please refresh.',
      s: { new: 'Awaiting payment', newCash: 'Received', paid: 'Paid — being prepared', ready: 'Ready for pickup', done: 'Picked up', cancelled: 'Cancelled', expired: 'Expired' },
      h: {
        new: 'Please pay by {t}. We will prepare the order once the payment arrives.', newCash: 'We will prepare the order. Pick it up and pay at the till by {t}.',
        paid: 'Payment received. The status will update here — the order will be ready soon.', ready: 'Ready for pickup until {t}. Show the order number and an ID.',
        done: 'Thank you for your purchase!', cancelled: 'The order is cancelled. If you have already paid, we will refund the money to your account.', expired: 'The order was not paid or picked up in time.',
      },
      pay: 'Bank transfer', recipient: 'Recipient', iban: 'IBAN', amount: 'Amount', ref: 'Reference', copy: 'Copy', copied: 'Copied',
      payNote: 'Be sure to put the order number in the payment reference.', pickup: 'Pick up at', items: 'Items', total: 'Total',
      incl: 'Prices include VAT and the container deposit.', id: 'The seller will check your ID on pickup (alcohol is sold to persons 18+).', save: 'Keep this page — the link always shows the order status.',
      size: { '05': '0.5 L', 1: '1 L' }, terms: 'Terms of sale',
    },
  };
  const u = T[lang];
  const DAYS = { ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], uk: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'], et: ['E', 'T', 'K', 'N', 'R', 'L', 'P'], en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }[lang];
  const CLOSED = { ru: 'закрыто', uk: 'зачинено', et: 'suletud', en: 'closed' }[lang];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
  const eur = (c) => `${(c / 100).toFixed(2).replace('.', ',')} €`;
  const when = (ms) => new Intl.DateTimeFormat(lang === 'uk' ? 'uk-UA' : lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-GB' : 'et-EE',
    { timeZone: 'Europe/Tallinn', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(ms));
  function hoursText(h) {
    const out = [];
    for (let d = 0; d < 7;) { let e = d; while (e + 1 < 7 && (h[e + 1] || '') === (h[d] || '')) e++; out.push(`${d === e ? DAYS[d] : `${DAYS[d]}–${DAYS[e]}`} ${h[d] ? h[d].replace('-', '–') : CLOSED}`); d = e + 1; }
    return out.join(' · ');
  }

  const home = document.getElementById('home'); home.textContent = u.home; home.href = `./?lang=${lang}`;
  const out = document.getElementById('out');
  const code = params.get('c') || '', token = params.get('t') || '';

  async function load() {
    try {
      const res = await fetch(`/api/order?c=${encodeURIComponent(code)}&t=${encodeURIComponent(token)}`, { cache: 'no-store' });
      if (res.status === 404) { out.innerHTML = `<p class="err">${esc(u.notFound)}</p>`; return false; }
      if (!res.ok) throw new Error();
      render(await res.json());
      return true;
    } catch { out.innerHTML = `<p class="err">${esc(u.load)}</p>`; return true; }
  }

  function render({ order: o, payment: p, store: s }) {
    document.title = `${fmt(u.title, { c: o.code })} · Beer&Snacks`;
    const key = o.status === 'new' && o.pay === 'cash' ? 'newCash' : o.status;
    const deadline = o.status === 'new' ? (o.pay === 'iban' ? o.pay_by : o.pickup_by) : o.pickup_by;
    const showPay = o.pay === 'iban' && o.status === 'new';
    const name = (i) => (i.name && (i.name[lang] || i.name.en || i.name.et)) || i.id;
    out.innerHTML = `
      <h1>${esc(fmt(u.title, { c: o.code }))}</h1>
      <p class="ord__date">${esc(fmt(u.placed, { d: when(o.created_at) }))}</p>
      <span class="ord__status" data-s="${esc(o.status)}">${esc(u.s[key] || o.status)}</span>
      <p class="ord__hint">${esc(fmt(u.h[key] || '', { t: deadline ? when(deadline) : '' }))}</p>
      ${showPay ? `<section class="box"><h2>${esc(u.pay)}</h2>
        <dl class="kv">
          <dt>${esc(u.recipient)}</dt><dd>${esc(p.recipient)}</dd>
          <dt>${esc(u.iban)}</dt><dd><span>${esc(p.iban)}</span><button class="copy" data-copy="${esc(p.iban.replace(/\s/g, ''))}">${esc(u.copy)}</button></dd>
          <dt>${esc(u.amount)}</dt><dd><span>${eur(o.total)}</span><button class="copy" data-copy="${(o.total / 100).toFixed(2)}">${esc(u.copy)}</button></dd>
          <dt>${esc(u.ref)}</dt><dd><span>${esc(o.code)}</span><button class="copy" data-copy="${esc(o.code)}">${esc(u.copy)}</button></dd>
        </dl><p class="small">${esc(u.payNote)}</p></section>` : ''}
      <section class="box"><h2>${esc(u.pickup)}</h2>
        <p><strong>${esc(s.name)}</strong> · ${esc(s.address)}</p>
        ${s.hours && s.hours.length ? `<p class="small">${esc(hoursText(s.hours))}</p>` : ''}
        ${o.has_alcohol ? `<p class="small">${esc(u.id)}</p>` : ''}
      </section>
      <section class="box"><h2>${esc(u.items)}</h2>
        <ul class="items">${o.items.map(i => `<li><span>${esc(name(i))}${i.size ? ` · ${esc(u.size[i.size])}` : ''} × ${i.qty}</span><span>${eur(i.price * i.qty)}</span></li>`).join('')}</ul>
        <div class="ord__total"><span>${esc(u.total)}</span><span>${eur(o.total)}</span></div>
        <p class="small">${esc(u.incl)}</p>
        ${o.has_alcohol ? `<p class="small"><b lang="et">${WARN}</b></p>` : ''}
      </section>
      <p class="small" style="margin-top:18px">${esc(u.save)} · <a href="terms.html?lang=${lang}">${esc(u.terms)}</a></p>`;
  }

  out.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = u.copied; setTimeout(() => { b.textContent = u.copy; }, 1500); } catch { /* no clipboard */ }
  });

  load().then(found => {
    // Keep the status fresh while the page is open (paid → ready happens in the shop).
    if (found) setInterval(() => { if (!document.hidden) load(); }, 30_000);
  });
})();
