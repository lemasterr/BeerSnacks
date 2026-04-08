// ============================================================
// Beer&Snacks — Application Logic
// ============================================================

(() => {
  'use strict';

  // ── State ──
  let translations = {};
  let categorySubcategories = {};
  let catalog = [];

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
  const themeToggle = document.getElementById('theme-toggle');

  // Footer
  const footerAbout = document.getElementById('footer-about');
  const footerPhoneLabel = document.getElementById('footer-phone-label');
  const footerAddressLabel = document.getElementById('footer-address-label');
  const footerAddressValue = document.getElementById('footer-address-value');
  const footerHoursLabel = document.getElementById('footer-hours-label');
  const footerHoursValue = document.getElementById('footer-hours-value');
  const footerRights = document.getElementById('footer-rights');

  // ── Theme Toggle ──
  function getPreferredTheme() {
    const saved = localStorage.getItem('bs_theme');
    if (saved) return saved;
    return 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bs_theme', theme);
  }

  applyTheme(getPreferredTheme());

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // ── Logo Navigation ──
  const headerLogo = document.querySelector('.header__logo');
  if (headerLogo) {
    headerLogo.addEventListener('click', () => {
      currentCategory = 'beer';
      currentSubcategory = 'all';
      renderCategories();
      renderSubcategories();
      renderProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

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

    let items = catalog.filter(p => p.category === cat);

    // Filter by subcategory
    if (sub && sub !== 'all') {
      items = items.filter(p => p.subcategory === sub);
    }

    // Sort: Primary = in_stock (true first), Secondary = sort_order
    items.sort((a, b) => {
      const aStock = a.in_stock !== false;
      const bStock = b.in_stock !== false;
      if (aStock !== bStock) return aStock ? -1 : 1;
      return (a.sort_order || 0) - (b.sort_order || 0);
    });

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

      const stockBadge = item.in_stock !== false
        ? `<div class="product-card__badge in-stock">${lang === 'uk' ? 'В наявності' : lang === 'ru' ? 'В наличии' : lang === 'et' ? 'Laos' : 'In Stock'}</div>`
        : `<div class="product-card__badge out-of-stock">${lang === 'uk' ? 'Немає в наявності' : lang === 'ru' ? 'Нет в наличии' : lang === 'et' ? 'Otsas' : 'Out of Stock'}</div>`;

      card.innerHTML = `
        <div class="product-card__info">
          <div class="product-card__name">${item['name_' + lang] || ''}</div>
          <div class="product-card__specs">${specsHtml}</div>
          <div class="product-card__divider"></div>
          <div class="product-card__description">${item['description_' + lang] || ''}</div>
          <div class="product-card__price">${t.currency}${Number(item.price).toFixed(2)}</div>
        </div>
        <div class="product-card__image-wrap">
          <img class="product-card__image" src="${item.image}" alt="${item['name_' + lang] || ''}" loading="lazy" />
          ${stockBadge}
        </div>
      `;

      productItems.appendChild(card);
    });
  }

  function buildSpecs(item, cat, lang) {
    const parts = [];
    const typeStr = item['type_' + lang] || '';

    if (cat === 'beer') {
      if (item.volume) parts.push(item.volume);
      if (item.abv) parts.push(item.abv);
      if (typeStr) parts.push(typeStr);
      if (item.ibu !== undefined && item.ibu !== "") parts.push('IBU ' + item.ibu);
    } else if (cat === 'cider') {
      if (item.volume) parts.push(item.volume);
      if (item.abv) parts.push(item.abv);
      if (typeStr) parts.push(typeStr);
    } else if (cat === 'drinks') {
      if (item.volume) parts.push(item.volume);
      if (typeStr) parts.push(typeStr);
    } else if (cat === 'sweets' || cat === 'snacks') {
      if (item.volume) parts.push(item.volume);
      if (typeStr) parts.push(typeStr);
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

    const footerEmailLabel = document.getElementById('footer-email-label');
    if (footerEmailLabel && t.footer.email) {
      footerEmailLabel.textContent = t.footer.email;
    }
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

  // ── Scroll to Top ──
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  if (scrollToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    });

    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Init Data ──
  async function loadData() {
    try {
      console.log('Fetching catalog data...');
      const [transRes, catsRes, catRes] = await Promise.all([
        fetch('data/translations.json'),
        fetch('data/categories.json'),
        fetch('/api/catalog')
      ]);
      
      if (!transRes.ok) throw new Error('Failed to load translations');
      if (!catsRes.ok) throw new Error('Failed to load categories');
      if (!catRes.ok) throw new Error('Failed to load products API');

      translations = await transRes.json();
      categorySubcategories = await catsRes.json();
      catalog = await catRes.json();

      console.log('Data loaded successfully:', {
        catalogEntries: catalog.length,
        lang: currentLang
      });

      if (currentLang) {
        overlay.classList.add('hidden');
        mainContent.style.display = '';
        renderAll();
      } else {
        mainContent.style.display = 'none';
      }
    } catch (e) {
      console.error('CRITICAL ERROR loading catalog:', e);
      // Only show alert if basic UI data failed to load
      if (!translations || Object.keys(translations).length === 0) {
        alert('Error loading application data: ' + e.message);
      }
    }
  }

  loadData();
})();
