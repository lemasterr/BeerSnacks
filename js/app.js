// ============================================================
// Beer&Snacks — Application Logic
// ============================================================

(() => {
  'use strict';

  // ── State ──
  let currentLang = localStorage.getItem('bs_lang') || null;
  let currentCategory = 'beer';
  let currentSubcategory = 'all';

  // ── DOM Elements ──
  const overlay = document.getElementById('lang-overlay');
  const mainContent = document.getElementById('main-content');
  const categoriesList = document.getElementById('categories-list');
  const subcategoriesWrap = document.getElementById('subcategories');
  const subcategoriesList = document.getElementById('subcategories-list');
  const productItems = document.getElementById('product-items');
  const langSwitcher = document.getElementById('lang-switcher');
  const langCurrent = document.getElementById('lang-current');
  const langDropdown = document.getElementById('lang-dropdown');
  const siteTitle = document.getElementById('site-title');

  // Footer
  const footerAbout = document.getElementById('footer-about');
  const footerPhoneLabel = document.getElementById('footer-phone-label');
  const footerAddressLabel = document.getElementById('footer-address-label');
  const footerAddressValue = document.getElementById('footer-address-value');
  const footerHoursLabel = document.getElementById('footer-hours-label');
  const footerHoursValue = document.getElementById('footer-hours-value');
  const footerRights = document.getElementById('footer-rights');

  // ── Language Overlay ──
  document.querySelectorAll('.lang-overlay__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      selectLanguage(lang);
    });
  });

  function selectLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('bs_lang', lang);
    overlay.classList.add('hidden');
    mainContent.style.display = '';
    renderAll();
  }

  // ── Language Switcher ──
  langCurrent.addEventListener('click', (e) => {
    e.stopPropagation();
    langSwitcher.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    langSwitcher.classList.remove('open');
  });

  function buildLangDropdown() {
    langDropdown.innerHTML = '';
    const langs = ['uk', 'en', 'et', 'ru'];
    langs.forEach(lang => {
      const btn = document.createElement('button');
      btn.className = 'lang-switcher__option' + (lang === currentLang ? ' active' : '');
      btn.textContent = translations[lang].langName;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectLanguage(lang);
        langSwitcher.classList.remove('open');
      });
      langDropdown.appendChild(btn);
    });
  }

  // ── Render Categories ──
  function renderCategories() {
    const t = translations[currentLang];
    categoriesList.innerHTML = '';
    const cats = ['beer', 'cider', 'drinks', 'sweets', 'snacks'];
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'category-tab' + (cat === currentCategory ? ' active' : '');
      btn.textContent = t.categories[cat];
      btn.addEventListener('click', () => {
        if (cat === currentCategory) return;
        currentCategory = cat;
        currentSubcategory = 'all';
        renderCategories();
        renderSubcategories();
        renderProducts();
      });
      categoriesList.appendChild(btn);
    });
  }

  // ── Render Subcategories ──
  function renderSubcategories() {
    const t = translations[currentLang];
    const subs = categorySubcategories[currentCategory];

    if (!subs || subs.length === 0) {
      subcategoriesWrap.classList.add('hidden');
      return;
    }

    subcategoriesWrap.classList.remove('hidden');
    subcategoriesList.innerHTML = '';

    subs.forEach(sub => {
      const btn = document.createElement('button');
      btn.className = 'subcategory-tab' + (sub === currentSubcategory ? ' active' : '');
      btn.textContent = t.subcategories[sub];
      btn.addEventListener('click', () => {
        if (sub === currentSubcategory) return;
        currentSubcategory = sub;
        renderSubcategories();
        renderProducts();
      });
      subcategoriesList.appendChild(btn);
    });
  }

  // ── Render Products ──
  function renderProducts() {
    const lang = currentLang;
    const cat = currentCategory;
    const sub = currentSubcategory;
    const t = translations[lang];

    let items = products[cat] || [];

    // Filter by subcategory
    if (sub && sub !== 'all') {
      items = items.filter(p => p.subcategory === sub);
    }

    productItems.innerHTML = '';

    if (items.length === 0) {
      productItems.innerHTML = '<div class="empty-state">—</div>';
      return;
    }

    items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.style.animationDelay = `${index * 0.03}s`;

      // Build specs line based on category
      const specsHtml = buildSpecs(item, cat, lang);

      card.innerHTML = `
        <div class="product-card__info">
          <div class="product-card__name">${item.name[lang]}</div>
          <div class="product-card__specs">${specsHtml}</div>
          <div class="product-card__divider"></div>
          <div class="product-card__description">${item.description[lang]}</div>
          <div class="product-card__price">${t.currency}${item.price.toFixed(2)}</div>
        </div>
        <div class="product-card__image-wrap">
          <img class="product-card__image" src="${item.image}" alt="${item.name[lang]}" loading="lazy" />
        </div>
      `;

      productItems.appendChild(card);
    });
  }

  function buildSpecs(item, cat, lang) {
    const parts = [];

    if (cat === 'beer') {
      if (item.volume) parts.push(item.volume);
      if (item.abv) parts.push(item.abv);
      if (item.type && item.type[lang]) parts.push(item.type[lang]);
      if (item.ibu !== undefined) parts.push('IBU ' + item.ibu);
    } else if (cat === 'cider') {
      if (item.volume) parts.push(item.volume);
      if (item.abv) parts.push(item.abv);
      if (item.type && item.type[lang]) parts.push(item.type[lang]);
    } else if (cat === 'drinks') {
      if (item.volume) parts.push(item.volume);
      if (item.type && item.type[lang]) parts.push(item.type[lang]);
    } else if (cat === 'sweets' || cat === 'snacks') {
      if (item.weight) parts.push(item.weight);
      if (item.type && item.type[lang]) parts.push(item.type[lang]);
    }

    return parts.map((p, i) =>
      `<span class="product-card__spec-item">${p}</span>${i < parts.length - 1 ? '<span class="product-card__spec-divider">|</span>' : ''}`
    ).join('');
  }

  // ── Render Footer ──
  function renderFooter() {
    const t = translations[currentLang];
    footerAbout.textContent = t.footer.about;
    footerPhoneLabel.textContent = t.footer.phone;
    footerAddressLabel.textContent = t.footer.address;
    footerAddressValue.textContent = t.footer.addressValue;
    footerHoursLabel.textContent = t.footer.hours;
    footerHoursValue.textContent = t.footer.hoursValue;
    footerRights.textContent = t.footer.rights;
  }

  // ── Render Header ──
  function renderHeader() {
    const t = translations[currentLang];
    langCurrent.querySelector('.lang-switcher__label').textContent = t.langName;
  }

  // ── Render All ──
  function renderAll() {
    renderHeader();
    buildLangDropdown();
    renderCategories();
    renderSubcategories();
    renderProducts();
    renderFooter();
  }

  // ── Init ──
  if (currentLang) {
    overlay.classList.add('hidden');
    mainContent.style.display = '';
    renderAll();
  } else {
    mainContent.style.display = 'none';
  }
})();
