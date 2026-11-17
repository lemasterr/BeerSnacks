// Beer&Snacks — public catalog
(() => {
  'use strict';

  const LANGS = ['uk', 'ru', 'et', 'en'];
  const TZ = 'Europe/Tallinn';
  // Opening hours: [weekday 0=Sun..6=Sat] -> [open, close] in minutes.
  const HOURS = { 0: [600, 1320], 1: [780, 1320], 2: [780, 1320], 3: [780, 1320], 4: [780, 1320], 5: [780, 1320], 6: [600, 1320] };

  // Interface strings (product data and category names come from the admin panel).
  const UI = {
    uk: {
      warnTr: 'Увага! Це алкоголь. Алкоголь може зашкодити вашому здоров’ю.',
      fxOff: 'Вимкнути анімацію', fxOn: 'Увімкнути анімацію',
      warnShort: 'Алкоголь може зашкодити вашому здоров’ю.', 
      snowOff: 'Вимкнути сніг', snowOn: 'Увімкнути сніг',
      ageQ: 'Вам уже є 18 років?', ageYes: 'Так, мені 18+', ageNo: 'Ні', ageDenied: 'Сайт містить інформацію про алкоголь і доступний лише особам від 18 років.',
      cookie: 'Ми не використовуємо рекламні чи аналітичні cookie. Сайт зберігає у браузері лише вибрану мову та тему.', ok: 'Зрозуміло', privacy: 'Політика конфіденційності',
      warn: 'Увага! Це алкогольний напій. Алкоголь може зашкодити вашому здоров’ю.', map: 'Як нас знайти', newyear: 'З Новим роком і Різдвом!',
      title: 'Пиво та снеки у Таллінні', search: 'Пошук: пиво, кальмар, сидр…', all: 'Усі',
      inStock: 'В наявності', outOfStock: 'Немає в наявності', openUntil: 'Відкрито до {t}', closedOpens: 'Зачинено · відкриємо о {t}',
      found: 'Знайдено: {n}', nothing: 'Нічого не знайшли за запитом «{q}». Спробуйте іншу назву.', empty: 'Тут поки порожньо.',
      stores: 'Магазини', contacts: 'Контакти', where: 'Є в магазинах', nowhere: 'Зараз немає в магазинах',
      age: 'Алкоголь продається особам від 18 років.', theme: 'Змінити тему', error: 'Не вдалося завантажити каталог. Оновіть сторінку.',
      kg: 'кг', g100: '100 г', half: '0,5 л', litre: '1 л',
      order: 'Замовити в {s}', route: 'Маршрут', phone: 'Телефон',
    },
    ru: {
      warnTr: 'Внимание! Это алкоголь. Алкоголь может навредить вашему здоровью.',
      fxOff: 'Выключить анимацию', fxOn: 'Включить анимацию',
      warnShort: 'Алкоголь может навредить вашему здоровью.', 
      snowOff: 'Выключить снег', snowOn: 'Включить снег',
      ageQ: 'Вам уже есть 18 лет?', ageYes: 'Да, мне 18+', ageNo: 'Нет', ageDenied: 'Сайт содержит информацию об алкоголе и доступен только лицам от 18 лет.',
      cookie: 'Мы не используем рекламные и аналитические cookie. Сайт хранит в браузере только выбранный язык и тему.', ok: 'Понятно', privacy: 'Политика конфиденциальности',
      warn: 'Внимание! Это алкогольный напиток. Алкоголь может навредить вашему здоровью.', map: 'Как нас найти', newyear: 'С Новым годом и Рождеством!',
      title: 'Пиво и снеки в Таллинне', search: 'Поиск: пиво, кальмар, сидр…', all: 'Все',
      inStock: 'В наличии', outOfStock: 'Нет в наличии', openUntil: 'Открыто до {t}', closedOpens: 'Закрыто · откроемся в {t}',
      found: 'Найдено: {n}', nothing: 'Ничего не нашли по запросу «{q}». Попробуйте другое название.', empty: 'Здесь пока пусто.',
      stores: 'Магазины', contacts: 'Контакты', where: 'Есть в магазинах', nowhere: 'Сейчас нет в магазинах',
      age: 'Алкоголь продаётся лицам старше 18 лет.', theme: 'Сменить тему', error: 'Не удалось загрузить каталог. Обновите страницу.',
      kg: 'кг', g100: '100 г', half: '0,5 л', litre: '1 л',
      order: 'Заказать в {s}', route: 'Маршрут', phone: 'Телефон',
    },
    et: {
      warnTr: '',
      fxOff: 'Lülita animatsioon välja', fxOn: 'Lülita animatsioon sisse',
      warnShort: 'Alkohol võib kahjustada teie tervist.', 
      snowOff: 'Lülita lumi välja', snowOn: 'Lülita lumi sisse',
      ageQ: 'Kas oled vähemalt 18-aastane?', ageYes: 'Jah, olen 18+', ageNo: 'Ei', ageDenied: 'Leht sisaldab teavet alkoholi kohta ja on mõeldud ainult vähemalt 18-aastastele.',
      cookie: 'Me ei kasuta reklaami- ega analüütikaküpsiseid. Leht salvestab brauserisse ainult valitud keele ja teema.', ok: 'Selge', privacy: 'Privaatsuspoliitika',
      warn: 'Tähelepanu! Tegemist on alkoholiga. Alkohol võib kahjustada teie tervist.', map: 'Kuidas meid leida', newyear: 'Head uut aastat ja häid jõule!',
      title: 'Õlu ja snäkid Tallinnas', search: 'Otsi: õlu, kalmaar, siider…', all: 'Kõik',
      inStock: 'Laos', outOfStock: 'Otsas', openUntil: 'Avatud kuni {t}', closedOpens: 'Suletud · avame {t}',
      found: 'Leitud: {n}', nothing: 'Päringule „{q}” ei leitud midagi. Proovi teist nime.', empty: 'Siin pole veel midagi.',
      stores: 'Poed', contacts: 'Kontakt', where: 'Saadaval poodides', nowhere: 'Hetkel poodides otsas',
      age: 'Alkoholi müüakse alates 18. eluaastast.', theme: 'Vaheta teemat', error: 'Kataloogi laadimine ebaõnnestus. Värskenda lehte.',
      kg: 'kg', g100: '100 g', half: '0,5 l', litre: '1 l',
      order: 'Telli {s} kaudu', route: 'Teekond', phone: 'Telefon',
    },
    en: {
      warnTr: 'Attention! This is alcohol. Alcohol may harm your health.',
      fxOff: 'Turn animation off', fxOn: 'Turn animation on',
      warnShort: 'Alcohol may harm your health.', 
      snowOff: 'Turn snow off', snowOn: 'Turn snow on',
      ageQ: 'Are you 18 or older?', ageYes: 'Yes, I am 18+', ageNo: 'No', ageDenied: 'This site contains information about alcohol and is only for persons aged 18 and over.',
      cookie: 'We use no advertising or analytics cookies. The site only stores your chosen language and theme in your browser.', ok: 'Got it', privacy: 'Privacy policy',
      warn: 'Attention! This is an alcoholic beverage. Alcohol may harm your health.', map: 'How to find us', newyear: 'Merry Christmas and Happy New Year!',
      title: 'Beer and snacks in Tallinn', search: 'Search: beer, squid, cider…', all: 'All',
      inStock: 'In stock', outOfStock: 'Out of stock', openUntil: 'Open until {t}', closedOpens: 'Closed · opens at {t}',
      found: 'Found: {n}', nothing: 'Nothing matches “{q}”. Try another name.', empty: 'Nothing here yet.',
      stores: 'Stores', contacts: 'Contact', where: 'Available at', nowhere: 'Not in stores right now',
      age: 'Alcohol is sold to persons aged 18 and over.', theme: 'Toggle theme', error: 'Could not load the catalog. Please reload the page.',
      kg: 'kg', g100: '100 g', half: '0.5 L', litre: '1 L',
      order: 'Order on {s}', route: 'Directions', phone: 'Phone',
    },
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    search: $('search'), searchClear: $('search-clear'), cats: $('cats'), subs: $('subs'), products: $('products'),
    note: $('result-note'), langBtn: $('lang-btn'), langMenu: $('lang-menu'), lang: $('lang'), theme: $('theme-toggle'),
    sheet: $('sheet'), sheetBody: $('sheet-body'), toTop: $('to-top'),
  };

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (str, vars) => str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

  // ── State ──
  const params = new URLSearchParams(location.search);
  const state = {
    lang: pickLang(),
    cat: params.get('c'),
    sub: params.get('s') || 'all',
    q: params.get('q') || '',
    data: { catalog: [], categories: {}, translations: {}, settings: {} },
  };

  function pickLang() {
    const fromUrl = params.get('lang');
    if (LANGS.includes(fromUrl)) return fromUrl;
    const saved = localStorage.getItem('bs_lang');
    if (LANGS.includes(saved)) return saved;
    for (const l of navigator.languages || [navigator.language || '']) {
      const code = l.slice(0, 2).toLowerCase();
      if (LANGS.includes(code)) return code;
    }
    return 'ru';
  }

  const ui = () => UI[state.lang];
  const tr = () => state.data.translations[state.lang] || {};
  const field = (p, name) => p[`${name}_${state.lang}`] || p[`${name}_en`] || p[`${name}_ru`] || '';
  const catName = (slug) => tr().categories?.[slug] || slug;
  const subName = (slug) => slug === 'all' ? ui().all : (tr().subcategories?.[slug] || slug);
  // "draft" / "bottled" are derived filters: a product is draft when it has a 0.5 L price,
  // so its real subcategory can stay the country.
  // Cards use a light copy (img/products/sm/, 420 px tall); the product sheet shows the full image.
  const thumb = (src) => /^img\/products\/[^/]+\.webp$/.test(src) ? src.replace('img/products/', 'img/products/sm/') : src;
  // Mandatory warning for alcohol advertising (Reklaamiseadus § 28 lg 4): always this exact Estonian text.
  const LEGAL_WARN = 'Tähelepanu! Tegemist on alkoholiga. Alkohol võib kahjustada teie tervist.';
  const warnHtml = () => `<b lang="et">${LEGAL_WARN}</b>${ui().warnTr ? `<span>${esc(ui().warnTr)}</span>` : ''}`;
  const isAlcohol = (p) => (p.category === 'beer' || p.category === 'cider') && !/^0([.,]0+)?\s*%/.test(String(p.abv || '')) &&
    p.subcategory !== 'non_alc_cider' && !/non-alcoholic|alcohol-free|kvass/i.test(`${p.name_en || ''} ${p.type_en || ''}`);
  const isDraft = (p) => !!p.price_05 || p.subcategory === 'draft';
  const inSub = (p, s) => s === 'all' || (s === 'draft' ? isDraft(p) : s === 'bottled' ? !isDraft(p) : p.subcategory === s);
  const price = (n, unit) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return '';
    const [eur, cents] = v.toFixed(2).split('.');
    const per = unit === 'kg' ? ui().kg : unit === '100g' ? ui().g100 : '';
    return `<span class="tag__eur">${eur}</span><span class="tag__cents">${cents}</span><span class="tag__cur">€${per ? `<small>/${esc(per)}</small>` : ''}</span>`;
  };
  // Price tag(s) for a product: draft beer shows both 0.5 L and 1 L prices.
  const priceTags = (p, big = false) => {
    const cls = big ? 'tag tag--big' : 'tag';
    if (p.price_05) {  // draft beer: one tag, two sizes
      return `<div class="${cls} tag--duo"><span class="tag__part"><span class="tag__vol">${esc(ui().half)}</span>${price(p.price_05)}</span>` +
        `<span class="tag__part"><span class="tag__vol">${esc(ui().litre)}</span>${price(p.price)}</span></div>`;
    }
    return `<div class="${cls}">${price(p.price, p.price_unit)}</div>`;
  };

  // ── Search ──
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ё/g, 'е').replace(/[ʼ'’]/g, '');
  let index = [];
  function buildIndex() {
    index = state.data.catalog.map(p => ({
      p,
      text: norm(LANGS.flatMap(l => [p[`name_${l}`], p[`type_${l}`]]).join(' ') + ' ' + (p.volume || '')),
    }));
  }

  // ── Visible products ──
  function visible() {
    const q = norm(state.q.trim());
    let items;
    if (q) {
      const words = q.split(/\s+/);
      items = index.filter(x => words.every(w => x.text.includes(w))).map(x => x.p);
    } else {
      items = state.data.catalog.filter(p => p.category === state.cat && inSub(p, state.sub));
    }
    // in stock first, then draft before bottled, then the manual order
    return items.slice().sort((a, b) =>
      (b.in_stock !== false) - (a.in_stock !== false) || isDraft(b) - isDraft(a) || (a.sort_order || 0) - (b.sort_order || 0));
  }

  // ── Render ──
  function renderStatic() {
    const t = tr(), u = ui();
    document.documentElement.lang = state.lang;
    $('intro-title').textContent = u.title;
    els.search.placeholder = u.search;
    els.search.setAttribute('aria-label', u.search);
    els.theme.setAttribute('aria-label', u.theme);
    els.langBtn.textContent = state.lang.toUpperCase();
    els.langMenu.innerHTML = LANGS.map(l =>
      `<li><button type="button" role="option" data-lang="${l}" aria-selected="${l === state.lang}">${esc(state.data.translations[l]?.langName || l.toUpperCase())}</button></li>`).join('');

    const f = t.footer || {};
    $('foot-about').textContent = f.about || '';
    $('foot-hours').textContent = f.hoursValue || '';
    $('foot-rights').textContent = f.rights || `© ${new Date().getFullYear()} Beer&Snacks`;
    $('foot-age').textContent = u.age;
    $('foot-warn').innerHTML = warnHtml();
    const pl = $('foot-privacy'); pl.textContent = u.privacy; pl.href = `privacy.html?lang=${state.lang}`;
    $('foot-contact-title').textContent = u.contacts;

    const s = state.data.settings || {};
    const phone = $('foot-phone');
    if (s.phone) { phone.hidden = false; phone.innerHTML = `<a href="tel:${esc(s.phone.replace(/\s/g, ''))}">${esc(s.phone)}</a>`; }

    const co = s.company || {};
    $('foot-company').textContent = [co.name, co.reg ? `${co.reg}` : '', co.address].filter(Boolean).join(' · ');
    if (s.email) { const em = $('foot-email'); em.textContent = s.email; em.href = `mailto:${s.email}`; }
    renderSeason(s.season, u);
    renderCookie(u);
    const stores = s.stores || [];
    // Each shop in the footer: a small map picture (served from our site) that opens directions, plus the address.
    $('foot-stores').innerHTML = `<h2>${esc(u.stores)}</h2><div class="stores">` + stores.map(st => {
      const m = MAPS[st.name];
      const dir = m ? `https://www.google.com/maps/dir/?api=1&amp;destination=${m[1]},${m[2]}` : `https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(st.address)}`;
      return `<a class="store" href="${dir}" target="_blank" rel="noopener" aria-label="${esc(u.route)}: ${esc(st.name)}, ${esc(st.address)}">
        ${m ? `<span class="store__map"><img src="img/map_${m[0]}_sm.webp" alt="" loading="lazy" decoding="async" width="480" height="304" /></span>` : ''}
        <strong>${esc(st.name)}</strong><span class="store__addr">${esc(st.address)}</span><span class="store__route">${esc(u.route)} →</span></a>`;
    }).join('') + '</div>';

    const icons = {  // solid glyphs (the stylesheet strips strokes from footer icons)
      instagram: '<path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>',
      facebook: '<path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14C17.17 2.1 15.94 2 14.64 2 11.93 2 10 3.66 10 6.7v2.8H7v4h3V22h4z"/>',
      tiktok: '<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .6.05.88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V8.66a8.2 8.2 0 0 0 4.77 1.52V6.73a4.85 4.85 0 0 1-1.04-.04z"/>',
    };
    $('socials').innerHTML = Object.entries(s.socials || {}).filter(([k, url]) => url && icons[k]).map(([k, url]) =>
      `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(k)}"><svg viewBox="0 0 24 24" fill="currentColor">${icons[k] || ''}</svg></a>`).join('');

    const d = s.delivery || {};
    $('delivery').innerHTML = [['wolt', 'Wolt'], ['bolt', 'Bolt Food']].filter(([k]) => d[k]).map(([k, label]) =>
      `<a class="pill pill--${k}" href="${esc(d[k])}" target="_blank" rel="noopener" aria-label="${esc(fmt(u.order, { s: label }))}"><span class="pill__verb">${esc(fmt(u.order, { s: '' }).trim())}&nbsp;</span>${esc(label)}</a>`).join('');

    renderOpenStatus();
  }

  // Shop coordinates for the footer map pictures and directions links
  const MAPS = { 'Õismäe': ['oismae', 59.41415, 24.65468], 'Mahtra': ['mahtra', 59.44219, 24.87358] };

  // ── Seasonal themes. The admin picks one, or "auto" (by the Tallinn calendar). ?season=<name> previews a theme. ──
  // fx = falling / rising particles: [type, count on desktop, count on phones]
  const SEASONS = {
    newyear: { fx: ['snow', 28, 14] }, valentine: { fx: ['hearts', 14, 7] }, independence: {},
    womensday: { fx: ['petals', 16, 8] }, easter: {}, midsummer: { fx: ['embers', 22, 11] },
    oktoberfest: {}, halloween: { fx: ['bats', 5, 3] },
  };
  function easterSunday(y) {  // anonymous Gregorian algorithm
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
      g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
      l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31);
    return Date.UTC(y, mo - 1, ((h + l - 7 * m + 114) % 31) + 1);
  }
  function seasonByDate(now = new Date()) {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric' })
      .formatToParts(now).map(x => [x.type, Number(x.value)]));
    const y = p.year, t = Date.UTC(y, p.month - 1, p.day), D = (m, d) => Date.UTC(y, m - 1, d), day = 864e5;
    const advent = (() => { let d = D(11, 27); while (new Date(d).getUTCDay() !== 0) d += day; return d; })();  // 1st Advent Sunday
    const octSun = (() => { let d = D(10, 1); while (new Date(d).getUTCDay() !== 0) d += day; return Math.max(d, D(10, 3)); })();
    const easter = easterSunday(y);
    const ranges = [
      ['newyear', advent, D(12, 31)], ['newyear', D(1, 1), D(1, 6)],
      ['valentine', D(2, 8), D(2, 15)], ['independence', D(2, 20), D(2, 25)], ['womensday', D(3, 5), D(3, 9)],
      ['easter', easter - 7 * day, easter + day], ['midsummer', D(6, 16), D(6, 26)],
      ['oktoberfest', D(9, 15), octSun], ['halloween', D(10, 24), D(11, 1)],
    ];
    return (ranges.find(([, from, to]) => t >= from && t <= to) || [''])[0];
  }
  function pickSeason(setting) {
    const preview = params.get('season');
    if (preview && (SEASONS[preview] || preview === 'none')) return preview === 'none' ? '' : preview;
    return setting === 'auto' ? seasonByDate() : (SEASONS[setting] ? setting : '');
  }
  const fxParticle = {
    snow: () => `--x:${(Math.random() * 100).toFixed(1)}vw;--s:${(4 + Math.random() * 6).toFixed(1)}px;--d:${(9 + Math.random() * 10).toFixed(1)}s;--o:${(.35 + Math.random() * .5).toFixed(2)}`,
    hearts: () => `--x:${(Math.random() * 100).toFixed(1)}vw;--s:${(9 + Math.random() * 8).toFixed(1)}px;--d:${(12 + Math.random() * 10).toFixed(1)}s;--o:${(.35 + Math.random() * .4).toFixed(2)};--c:${['#e5486b', '#f07a95', '#d92e5a', '#f4a6b8'][Math.floor(Math.random() * 4)]}`,
    petals: () => `--x:${(Math.random() * 100).toFixed(1)}vw;--s:${(8 + Math.random() * 7).toFixed(1)}px;--d:${(11 + Math.random() * 9).toFixed(1)}s;--o:${(.5 + Math.random() * .4).toFixed(2)};--c:${['#f7a9b8', '#f9c6a8', '#f48fb1', '#fbd3df'][Math.floor(Math.random() * 4)]};--r:${Math.floor(Math.random() * 360)}deg`,
    embers: () => `--x:${(Math.random() * 100).toFixed(1)}vw;--s:${(2.5 + Math.random() * 3.5).toFixed(1)}px;--d:${(7 + Math.random() * 8).toFixed(1)}s;--o:${(.5 + Math.random() * .5).toFixed(2)};--dx:${(Math.random() * 16 - 8).toFixed(1)}vw`,
    bats: () => `--y:${(6 + Math.random() * 40).toFixed(1)}vh;--s:${(16 + Math.random() * 12).toFixed(1)}px;--d:${(18 + Math.random() * 14).toFixed(1)}s;--o:${(.45 + Math.random() * .35).toFixed(2)}`,
  };
  function renderSeason(setting, u) {
    const root = document.documentElement, season = pickSeason(setting), conf = SEASONS[season];
    $('season-greet').hidden = true;
    const old = $('fx');
    if (!conf) { delete root.dataset.season; old?.remove(); return; }
    if (root.dataset.season !== season) old?.remove();
    root.dataset.season = season;
    const fx = conf.fx, on = localStorage.getItem('bs_snow') !== 'off';
    const sb = $('snow-toggle');
    sb.hidden = !fx; sb.setAttribute('aria-pressed', on);
    const label = season === 'newyear' ? (on ? u.snowOff : u.snowOn) : (on ? u.fxOff : u.fxOn);
    sb.setAttribute('aria-label', label); sb.title = label;
    if (!fx || !on) { $('fx')?.remove(); return; }
    if ($('fx') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const [type, many, few] = fx;
    const box = document.createElement('div'); box.id = 'fx'; box.className = `fx fx--${type}`; box.setAttribute('aria-hidden', 'true');
    // phones get about half as many particles: on a small screen the same number looks twice as dense
    box.innerHTML = Array.from({ length: matchMedia('(max-width: 760px)').matches ? few : many }, () =>
      `<i style="${fxParticle[type]()};--w:${(-Math.random() * 20).toFixed(1)}s"></i>`).join('');
    document.body.appendChild(box);
  }

  // ── Cookie notice: only language and theme are stored, so this is an information note, not a consent form ──
  function renderCookie(u) {
    const bar = $('cookie');
    if (localStorage.getItem('bs_cookie_ok')) { bar.hidden = true; return; }
    bar.hidden = false;
    bar.querySelector('p').innerHTML = `${esc(u.cookie)} <a href="privacy.html?lang=${state.lang}">${esc(u.privacy)}</a>`;
    bar.querySelector('button').textContent = u.ok;
  }
  $('snow-toggle').addEventListener('click', () => {
    localStorage.setItem('bs_snow', localStorage.getItem('bs_snow') === 'off' ? 'on' : 'off');
    renderSeason(state.data.settings?.season, ui());
  });
  $('cookie').querySelector('button').addEventListener('click', () => { localStorage.setItem('bs_cookie_ok', '1'); $('cookie').hidden = true; });

  function renderOpenStatus() {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).map(p => [p.type, p.value]));
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
    const mins = Number(parts.hour) * 60 + Number(parts.minute);
    const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    const [open, close] = HOURS[day];
    const el = $('open-status');
    if (mins >= open && mins < close) {
      el.textContent = fmt(ui().openUntil, { t: hhmm(close) });
      el.dataset.open = 'true';
    } else {
      const next = mins < open ? open : HOURS[(day + 1) % 7][0];
      el.textContent = fmt(ui().closedOpens, { t: hhmm(next) });
      el.dataset.open = 'false';
    }
  }

  function renderCats() {
    const counts = {};
    state.data.catalog.forEach(p => { if (p.in_stock !== false) counts[p.category] = (counts[p.category] || 0) + 1; });
    const searching = !!state.q.trim();
    els.cats.innerHTML = Object.keys(state.data.categories).map(slug =>
      `<button type="button" role="tab" class="cat" data-cat="${esc(slug)}" aria-selected="${!searching && slug === state.cat}">
        ${esc(catName(slug))}<sup>${counts[slug] || 0}</sup></button>`).join('');

    const subs = (state.data.categories[state.cat] || []).filter(s =>
      s === 'all' || state.data.catalog.some(p => p.category === state.cat && inSub(p, s)));
    els.subs.hidden = searching || subs.length <= 2;
    const subCount = (s) => state.data.catalog.filter(p => p.category === state.cat && inSub(p, s)).length;
    els.subs.innerHTML = subs.map(s =>
      `<button type="button" class="sub" data-sub="${esc(s)}" aria-pressed="${s === state.sub}">${esc(subName(s))}<span class="sub__n">${subCount(s)}</span></button>`).join('');
    // On narrow screens the tabs scroll sideways: keep the selected ones in view.
    for (const sel of [els.cats.querySelector('[aria-selected="true"]'), els.subs.querySelector('[aria-pressed="true"]')]) {
      if (!sel) continue;
      const box = sel.parentElement;
      const left = sel.offsetLeft - (box.clientWidth - sel.offsetWidth) / 2;
      box.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
    }
  }

  function specs(p) {
    const parts = [p.price_05 ? '' : p.volume, p.abv, field(p, 'type')];
    if (p.ibu !== undefined && p.ibu !== '' && p.ibu !== null && p.ibu !== 0) parts.push(`IBU ${p.ibu}`);
    return parts.filter(Boolean).map(x => `<span>${esc(x)}</span>`).join('');
  }

  function card(p, i) {
    const name = field(p, 'name');
    const out = p.in_stock === false;
    return `<article class="card${out ? ' card--out' : ''}" style="--i:${Math.min(i, 12)}">
      <button type="button" class="card__hit" data-id="${esc(p.id)}" aria-label="${esc(name)}"></button>
      <div class="card__img${p.image ? '' : ' card__img--none'}">
        ${p.image ? `<img src="${esc(thumb(p.image))}" alt="" loading="${i < 6 ? 'eager' : 'lazy'}"${i < 2 ? ' fetchpriority="high"' : ''} decoding="async" width="400" height="400" data-full="${esc(p.image)}" onerror="if(this.dataset.full&&this.src.indexOf('/sm/')>0){this.src=this.dataset.full}else{this.parentNode.classList.add('is-broken')}" />`
          : `<span class="ph-name">${esc(name)}</span>`}
        ${out ? `<span class="card__out">${esc(ui().outOfStock)}</span>` : ''}
      </div>
      ${priceTags(p)}
      <h3 class="card__name">${esc(name)}</h3>
      <p class="card__specs">${specs(p)}</p>
    </article>`;
  }

  function renderProducts({ animate = true } = {}) {
    const items = visible();
    const q = state.q.trim();
    els.note.hidden = !q;
    if (q) els.note.textContent = items.length ? fmt(ui().found, { n: items.length }) : '';
    if (!items.length) {
      els.products.innerHTML = `<p class="grid__empty">${esc(q ? fmt(ui().nothing, { q }) : ui().empty)}</p>`;
      return;
    }
    const aw = $('alc-warn'); aw.hidden = !items.some(isAlcohol); if (!aw.hidden) aw.innerHTML = warnHtml();
    els.products.classList.toggle('grid--animate', animate);
    els.products.innerHTML = items.map(card).join('');
  }

  function renderAll(opts) {
    renderStatic();
    renderCats();
    renderProducts(opts);
  }

  // Animate filter changes with the View Transitions API when available.
  // After a filter change, show the new list from its first product (not at the old scroll depth,
  // which in a shorter list can land below the last item). Only scrolls up, never down.
  function toListTop() {
    const bar = document.querySelector('.cats');
    const offset = (bar ? bar.getBoundingClientRect().height : 0) + 8;
    const target = els.products.getBoundingClientRect().top + window.scrollY - offset;
    if (window.scrollY > target + 1) window.scrollTo({ top: Math.max(0, target), behavior: 'instant' });
  }

  function update(fn) {
    const run = () => { fn(); renderCats(); renderProducts({ animate: false }); syncUrl(); toListTop(); };
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(run);
    else run();
  }

  function syncUrl() {
    const p = new URLSearchParams();
    if (state.q.trim()) p.set('q', state.q.trim());
    else {
      if (state.cat) p.set('c', state.cat);
      if (state.sub !== 'all') p.set('s', state.sub);
    }
    history.replaceState(null, '', p.toString() ? `?${p}` : location.pathname);
  }

  // ── Product sheet ──
  function openSheet(id) {
    const p = state.data.catalog.find(x => x.id === id);
    if (!p) return;
    const u = ui();
    const stores = (state.data.settings.stores || []).filter(s => p[s.field]);
    const desc = field(p, 'description');
    els.sheetBody.innerHTML = `
      <div class="sheet__img${p.image ? '' : ' card__img--none'}">${p.image ? `<img src="${esc(p.image)}" alt="" />` : `<span class="ph-name">${esc(field(p, 'name'))}</span>`}</div>
      <div class="sheet__info">
        <p class="sheet__cat">${esc(catName(p.category))}${p.subcategory && p.subcategory !== 'all' ? ` / ${esc(subName(p.subcategory))}` : ''}</p>
        <h2 id="sheet-title" class="sheet__title">${esc(field(p, 'name'))}</h2>
        <p class="card__specs">${specs(p)}</p>
        ${desc ? `<p class="sheet__desc">${esc(desc)}</p>` : ''}
        <div class="sheet__row">
          ${priceTags(p, true)}
          <span class="stock ${p.in_stock === false ? 'stock--out' : ''}">${esc(p.in_stock === false ? u.outOfStock : u.inStock)}</span>
        </div>
        ${p.in_stock === false || !stores.length ? '' : `<div class="sheet__stores">
          <p>${esc(u.where)}</p>
          ${stores.map(s => `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}" target="_blank" rel="noopener"><strong>${esc(s.name)}</strong> ${esc(s.address)}</a>`).join('')}
        </div>`}
        ${isAlcohol(p) ? `<p class="warn">${warnHtml()}</p>` : ''}
      </div>`;
    els.sheet.showModal();
    els.sheet.focus({ preventScroll: true });  // no focus ring on the first store link
    document.documentElement.classList.add('sheet-open');
    // The phone's Back button closes the product card instead of leaving the site.
    history.pushState({ sheet: true }, '', location.href);
  }

  // ── Events ──
  els.cats.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    update(() => { state.cat = b.dataset.cat; state.sub = 'all'; state.q = ''; els.search.value = ''; els.searchClear.hidden = true; });
  });
  els.subs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sub]');
    if (b) update(() => { state.sub = b.dataset.sub; });
  });
  els.products.addEventListener('click', (e) => {
    const b = e.target.closest('[data-id]');
    if (b) openSheet(b.dataset.id);
  });

  let searchTimer;
  els.search.addEventListener('input', () => {
    els.searchClear.hidden = !els.search.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.q = els.search.value; renderCats(); renderProducts({ animate: false }); syncUrl(); toListTop(); }, 120);
  });
  els.searchClear.addEventListener('click', () => {
    els.search.value = ''; state.q = ''; els.searchClear.hidden = true;
    renderCats(); renderProducts({ animate: false }); syncUrl(); toListTop(); els.search.focus();
  });
  // Enter on a phone keyboard: hide the keyboard so the results are visible.
  els.search.addEventListener('keydown', (e) => { if (e.key === 'Enter') els.search.blur(); });

  function sheetClosed() {
    document.documentElement.classList.remove('sheet-open');
    if (history.state && history.state.sheet) history.back();
  }
  const closeSheet = () => { if (els.sheet.open) els.sheet.close(); sheetClosed(); };
  $('sheet-close').addEventListener('click', closeSheet);
  els.sheet.addEventListener('close', sheetClosed);   // Esc key
  window.addEventListener('popstate', () => { document.documentElement.classList.remove('sheet-open'); if (els.sheet.open) els.sheet.close(); });
  els.sheet.addEventListener('click', (e) => { if (e.target === els.sheet) closeSheet(); });

  els.langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = els.lang.classList.toggle('open');
    els.langBtn.setAttribute('aria-expanded', open);
  });
  els.langMenu.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lang]');
    if (!b) return;
    state.lang = b.dataset.lang;
    localStorage.setItem('bs_lang', state.lang);
    els.lang.classList.remove('open');
    renderAll({ animate: false });
  });
  document.addEventListener('click', () => { els.lang.classList.remove('open'); els.langBtn.setAttribute('aria-expanded', 'false'); });

  els.theme.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('bs_theme', next);
  });

  window.addEventListener('scroll', () => els.toTop.classList.toggle('visible', scrollY > 600), { passive: true });
  els.toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  setInterval(renderOpenStatus, 60_000);

  // ── Load ──
  async function load() {
    try {
      // API first; if it is unavailable (e.g. a preview deployment without the database), use the static data files.
      let data = { catalog: [], categories: {}, translations: {}, settings: {} };
      try {
        const res = await fetch('/api/site');
        if (res.ok) data = { ...data, ...(await res.json()) };
      } catch { /* fall back below */ }
      await (async () => {
        if (data.settings && Object.keys(data.settings).length) return;
        const r = await fetch('data/settings.json');
        if (r.ok) data.settings = await r.json();
      })();
      // Static fallbacks if KV is empty (fresh deploy).
      const fallback = async (key, url) => {
        if (data[key] && Object.keys(data[key]).length) return;
        const r = await fetch(url);
        if (r.ok) data[key] = await r.json();
      };
      await Promise.all([
        fallback('translations', 'data/translations.json'),
        fallback('categories', 'data/categories.json'),
        data.catalog.length ? null : fallback('catalog', 'data/catalog.json'),
      ]);
      // Out-of-stock products stay in the database (and the admin) but are not shown to visitors.
      data.catalog = (data.catalog || []).filter(p => p.in_stock !== false);
      state.data = { ...state.data, ...data };
      const cats = Object.keys(state.data.categories);
      if (!cats.includes(state.cat)) state.cat = cats[0] || null;
      if (state.q) els.search.value = state.q;
      els.searchClear.hidden = !state.q;
      buildIndex();
      renderAll();
    } catch (err) {
      console.error(err);
      renderStatic();
      els.products.innerHTML = `<p class="grid__empty">${esc(ui().error)}</p>`;
    }
  }

  // ── Language gate: asked once per visit (browser session) ──
  const gate = $('gate');
  // Then (once per browser) the age question: the site shows alcohol, so it is meant for adults only.
  const ageOk = () => !!localStorage.getItem('bs_age_ok');
  function closeGate() {
    document.documentElement.classList.remove('gate-open');
    gate.hidden = true;
  }
  function showAge() {
    const u = ui();
    $('gate-langs').hidden = true; $('gate-title').hidden = true;
    const box = $('gate-age'); box.hidden = false;
    box.querySelector('h1').textContent = u.ageQ;
    box.querySelector('[data-age="yes"]').textContent = u.ageYes;
    box.querySelector('[data-age="no"]').textContent = u.ageNo;
    box.querySelector('p').textContent = '';
    setTimeout(() => box.querySelector('[data-age="yes"]').focus({ preventScroll: true }), 50);
  }
  const langOk = !!sessionStorage.getItem('bs_lang_ok');
  if (!langOk || !ageOk()) {
    gate.hidden = false;
    if (langOk) showAge();
    else {
      const cur = gate.querySelector(`[data-lang="${state.lang}"]`);
      if (cur) { cur.classList.add('is-last'); setTimeout(() => cur.focus({ preventScroll: true }), 50); }
    }
  }
  gate.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lang]');
    if (b) {
      state.lang = b.dataset.lang;
      localStorage.setItem('bs_lang', state.lang);
      sessionStorage.setItem('bs_lang_ok', '1');
      renderAll({ animate: true });
      if (ageOk()) closeGate(); else showAge();
      return;
    }
    const a = e.target.closest('[data-age]');
    if (!a) return;
    if (a.dataset.age === 'yes') { localStorage.setItem('bs_age_ok', '1'); closeGate(); }
    else $('gate-age').querySelector('p').textContent = ui().ageDenied;
  });

  renderStatic();
  load();
})();
