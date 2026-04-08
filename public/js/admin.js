// ============================================================
//  Beer&Snacks — Admin Panel JS
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ── State ──
  let catalog = [];
  let isDetailedView = false;
  let editingId = null;
  let currentSortField = 'id';
  let currentSortDir = 'asc';
  let adminLang = localStorage.getItem('bs_admin_lang') || 'en';

  // ── Categories / Subcategories map ──
  const CATEGORY_SUBS = {
    beer:   ['ukraine', 'poland', 'czech', 'germany', 'estonia'],
    cider:  ['fruit_cider', 'berry_cider', 'non_alc_cider'],
    drinks: ['juices', 'sodas', 'water', 'energy', 'tea_coffee'],
    sweets: ['candies', 'dragee', 'wafers', 'desserts', 'cakes'],
    snacks: ['chips', 'crackers', 'seeds', 'seafood', 'nuts']
  };

  // ── Translations ──
  const T = {
    en: {
      admin: 'Admin', login: 'Admin Panel', password: 'Password', loginBtn: 'Login',
      invalidPwd: 'Invalid password', logout: 'Logout', search: 'Search…',
      allCats: 'All Categories', sortById: 'Sort: ID', sortByCat: 'Sort: Category',
      sortByPrice: 'Sort: Price', detailed: 'Detailed', compact: 'Compact', addProduct: '+ Add Product',
      thId: 'ID', thName: 'Name', thCat: 'Category', thPrice: 'Price', thStatus: 'Status', thActions: 'Actions',
      basicInfo: 'Basic Info', imageSection: 'Image', stockSection: 'Stock',
      namesSection: 'Names', typesSection: 'Type / Variety', descSection: 'Description',
      labelId: 'ID', labelSort: 'Sort Order', labelCat: 'Category', labelSubcat: 'Subcategory',
      labelPrice: 'Price (€)', labelVol: 'Volume / Weight', labelAbv: 'ABV', labelIbu: 'IBU',
      labelImgPath: 'Image path', uploadClick: 'Click or drag', uploadDrop: 'to upload image',
      availability: 'Availability', inStock: 'In Stock (global)', cancel: 'Cancel',
      saveChanges: 'Save Changes', editProduct: 'Edit Product', addNew: 'Add New Product',
      deleted: 'Deleted!', saved: 'Saved!', failDelete: 'Delete failed', failSave: 'Save failed',
      confirmDelete: 'Delete this product?', uploading: 'Uploading…', uploadDone: 'Uploaded ✓',
      uploadErr: 'Upload failed',
      subcats: {
        ukraine:'Ukraine', poland:'Poland', czech:'Czech', germany:'Germany', estonia:'Estonia',
        fruit_cider:'Fruit', berry_cider:'Berry', non_alc_cider:'Non-alc',
        juices:'Juices', sodas:'Sodas', water:'Water', energy:'Energy', tea_coffee:'Tea & Coffee',
        chips:'Chips', crackers:'Crackers', seeds:'Seeds', seafood:'Seafood', nuts:'Nuts',
        candies:'Candies', dragee:'Dragee', wafers:'Wafers', desserts:'Desserts', cakes:'Cakes'
      }
    },
    uk: {
      admin: 'Адмін', login: 'Панель адміністратора', password: 'Пароль', loginBtn: 'Увійти',
      invalidPwd: 'Невірний пароль', logout: 'Вийти', search: 'Пошук…',
      allCats: 'Усі категорії', sortById: 'Сорт: ID', sortByCat: 'Сорт: Категорія',
      sortByPrice: 'Сорт: Ціна', detailed: 'Деталі', compact: 'Компакт', addProduct: '+ Додати товар',
      thId: 'ID', thName: 'Назва', thCat: 'Категорія', thPrice: 'Ціна', thStatus: 'Статус', thActions: 'Дії',
      basicInfo: 'Основне', imageSection: 'Зображення', stockSection: 'Наявність',
      namesSection: 'Назви', typesSection: 'Тип / Різновид', descSection: 'Опис',
      labelId: 'ID', labelSort: 'Порядок', labelCat: 'Категорія', labelSubcat: 'Підкатегорія',
      labelPrice: 'Ціна (€)', labelVol: 'Обʼєм / Вага', labelAbv: 'ABV', labelIbu: 'IBU',
      labelImgPath: 'Шлях до зображення', uploadClick: 'Натисни або перетягни', uploadDrop: 'для завантаження',
      availability: 'Наявність', inStock: 'В наявності (глобал)', cancel: 'Скасувати',
      saveChanges: 'Зберегти', editProduct: 'Редагувати товар', addNew: 'Додати товар',
      deleted: 'Видалено!', saved: 'Збережено!', failDelete: 'Помилка видалення', failSave: 'Помилка збереження',
      confirmDelete: 'Видалити цей товар?', uploading: 'Завантаження…', uploadDone: 'Завантажено ✓',
      uploadErr: 'Помилка завантаження',
      subcats: {
        ukraine:'Україна', poland:'Польща', czech:'Чехія', germany:'Німеччина', estonia:'Естонія',
        fruit_cider:'Фруктовий', berry_cider:'Ягідний', non_alc_cider:'Безалк.',
        juices:'Соки', sodas:'Газовані', water:'Вода', energy:'Енергетики', tea_coffee:'Чай і Кава',
        chips:'Чіпси', crackers:'Сухарики', seeds:'Насіння', seafood:'Морепродукти', nuts:'Горішки',
        candies:'Цукерки', dragee:'Драже', wafers:'Вафлі', desserts:'Десерти', cakes:'Кекси'
      }
    },
    et: {
      admin: 'Admin', login: 'Administraatori paneel', password: 'Parool', loginBtn: 'Logi sisse',
      invalidPwd: 'Vale parool', logout: 'Logi välja', search: 'Otsing…',
      allCats: 'Kõik kategooriad', sortById: 'Sort: ID', sortByCat: 'Sort: kategooria',
      sortByPrice: 'Sort: hind', detailed: 'Detailne', compact: 'Kompaktne', addProduct: '+ Lisa toode',
      thId: 'ID', thName: 'Nimi', thCat: 'Kategooria', thPrice: 'Hind', thStatus: 'Olek', thActions: 'Toimingud',
      basicInfo: 'Põhiinfo', imageSection: 'Pilt', stockSection: 'Laoseis',
      namesSection: 'Nimed', typesSection: 'Tüüp', descSection: 'Kirjeldus',
      labelId: 'ID', labelSort: 'Järjekord', labelCat: 'Kategooria', labelSubcat: 'Alakategooria',
      labelPrice: 'Hind (€)', labelVol: 'Maht / Kaal', labelAbv: 'ABV', labelIbu: 'IBU',
      labelImgPath: 'Pildi tee', uploadClick: 'Klõpsa või lohista', uploadDrop: 'pildi üleslaadimiseks',
      availability: 'Saadavus', inStock: 'Laos (globaalne)', cancel: 'Tühista',
      saveChanges: 'Salvesta', editProduct: 'Muuda toodet', addNew: 'Lisa toode',
      deleted: 'Kustutatud!', saved: 'Salvestatud!', failDelete: 'Kustutamine ebaõnnestus', failSave: 'Salvestamine ebaõnnestus',
      confirmDelete: 'Kustutada see toode?', uploading: 'Laaditakse üles…', uploadDone: 'Üles laaditud ✓',
      uploadErr: 'Üleslaadimine ebaõnnestus',
      subcats: {
        ukraine:'Ukraina', poland:'Poola', czech:'Tšehhi', germany:'Saksamaa', estonia:'Eesti',
        fruit_cider:'Puuvilja', berry_cider:'Marja', non_alc_cider:'Alkoholivaba',
        juices:'Mahlad', sodas:'Gaseeritud', water:'Vesi', energy:'Energiajoogid', tea_coffee:'Tee ja kohv',
        chips:'Krõpsud', crackers:'Kuivikud', seeds:'Seemned', seafood:'Mereannid', nuts:'Pähklid',
        candies:'Kommid', dragee:'Dražee', wafers:'Vahvlid', desserts:'Magustoidud', cakes:'Koogid'
      }
    },
    ru: {
      admin: 'Админ', login: 'Панель администратора', password: 'Пароль', loginBtn: 'Войти',
      invalidPwd: 'Неверный пароль', logout: 'Выйти', search: 'Поиск…',
      allCats: 'Все категории', sortById: 'Сорт: ID', sortByCat: 'Сорт: Категория',
      sortByPrice: 'Сорт: Цена', detailed: 'Детально', compact: 'Компактно', addProduct: '+ Добавить товар',
      thId: 'ID', thName: 'Название', thCat: 'Категория', thPrice: 'Цена', thStatus: 'Статус', thActions: 'Действия',
      basicInfo: 'Основное', imageSection: 'Изображение', stockSection: 'Наличие',
      namesSection: 'Названия', typesSection: 'Тип / Разновидность', descSection: 'Описание',
      labelId: 'ID', labelSort: 'Порядок', labelCat: 'Категория', labelSubcat: 'Подкатегория',
      labelPrice: 'Цена (€)', labelVol: 'Объём / Вес', labelAbv: 'ABV', labelIbu: 'IBU',
      labelImgPath: 'Путь к изображению', uploadClick: 'Нажми или перетащи', uploadDrop: 'для загрузки фото',
      availability: 'Наличие', inStock: 'В наличии (глобал)', cancel: 'Отмена',
      saveChanges: 'Сохранить', editProduct: 'Редактировать товар', addNew: 'Добавить товар',
      deleted: 'Удалено!', saved: 'Сохранено!', failDelete: 'Ошибка удаления', failSave: 'Ошибка сохранения',
      confirmDelete: 'Удалить этот товар?', uploading: 'Загрузка…', uploadDone: 'Загружено ✓',
      uploadErr: 'Ошибка загрузки',
      subcats: {
        ukraine:'Украина', poland:'Польша', czech:'Чехия', germany:'Германия', estonia:'Эстония',
        fruit_cider:'Фруктовый', berry_cider:'Ягодный', non_alc_cider:'Безалк.',
        juices:'Соки', sodas:'Газировки', water:'Вода', energy:'Энергетики', tea_coffee:'Чай и Кофе',
        chips:'Чипсы', crackers:'Сухарики', seeds:'Семечки', seafood:'Морепродукты', nuts:'Орешки',
        candies:'Конфеты', dragee:'Драже', wafers:'Вафли', desserts:'Десерты', cakes:'Кексы'
      }
    }
  };

  const t = () => T[adminLang] || T.en;

  // ── DOM ──
  const loginOverlay = document.getElementById('login-overlay');
  const adminContent = document.getElementById('admin-content');
  const loginForm = document.getElementById('login-form');
  const loginPassword = document.getElementById('login-password');
  const btnLogout = document.getElementById('btn-logout');
  const loginError = document.getElementById('login-error');
  const tableBody = document.getElementById('table-body');
  const mobileCards = document.getElementById('mobile-cards');
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const sortMode = document.getElementById('sort-mode');
  const btnToggleView = document.getElementById('toggle-view');
  const modal = document.getElementById('edit-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const editForm = document.getElementById('edit-form');
  const btnAdd = document.getElementById('btn-add');
  const toast = document.getElementById('toast');
  const fieldCategory = document.getElementById('field-category');
  const subcategoryPicker = document.getElementById('subcategory-picker');
  const fieldSubcategory = document.getElementById('field-subcategory');
  const imageFileInput = document.getElementById('image-file-input');
  const imageUploadArea = document.getElementById('image-upload-area');
  const imagePreview = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');
  const previewFilename = document.getElementById('preview-filename');
  const previewStatus = document.getElementById('preview-status');
  const uploadBar = document.getElementById('upload-bar');
  const fieldImage = document.getElementById('field-image');

  // ── Theme ──
  const themeToggle = document.getElementById('theme-toggle');
  function getTheme() { return localStorage.getItem('bs_theme') || 'light'; }
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bs_theme', theme);
  }
  applyTheme(getTheme());
  themeToggle.addEventListener('click', () => {
    applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
  });

  // ── Language switcher ──
  const langSwitcherEl = document.getElementById('admin-lang-switcher');
  const langBtnEl = document.getElementById('admin-lang-btn');
  const langLabelEl = document.getElementById('admin-lang-label');
  const langDropdownEl = document.getElementById('admin-lang-dropdown');

  function buildLangDropdown() {
    langDropdownEl.innerHTML = '';
    ['uk', 'en', 'et', 'ru'].forEach(lang => {
      const btn = document.createElement('button');
      btn.className = 'admin-lang-option' + (lang === adminLang ? ' active' : '');
      btn.textContent = { uk:'🇺🇦 UA', en:'🇬🇧 EN', et:'🇪🇪 ET', ru:'🇷🇺 RU' }[lang];
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        adminLang = lang;
        localStorage.setItem('bs_admin_lang', lang);
        langSwitcherEl.classList.remove('open');
        applyUITranslations();
        renderAll();
      });
      langDropdownEl.appendChild(btn);
    });
    langLabelEl.textContent = { uk:'UA', en:'EN', et:'ET', ru:'RU' }[adminLang];
  }

  langBtnEl.addEventListener('click', (e) => {
    e.stopPropagation();
    langSwitcherEl.classList.toggle('open');
  });
  document.addEventListener('click', () => langSwitcherEl.classList.remove('open'));

  // ── Apply UI translations ──
  function applyUITranslations() {
    const tr = t();
    buildLangDropdown();

    // Header
    const headerAdminLabel = document.getElementById('header-admin-label');
    if (headerAdminLabel) headerAdminLabel.textContent = tr.admin;

    // Login
    const loginTitle = document.getElementById('login-title');
    if (loginTitle) loginTitle.textContent = tr.login;
    const loginPwdLabel = document.getElementById('login-password-label');
    if (loginPwdLabel) loginPwdLabel.textContent = tr.password;
    if (loginPassword) loginPassword.placeholder = tr.password;
    const btnLoginLabel = document.getElementById('btn-login-label');
    if (btnLoginLabel) btnLoginLabel.textContent = tr.loginBtn;
    // Update error text only if visible
    if (loginError && loginError.style.display !== 'none') loginError.textContent = tr.invalidPwd;
    if (btnLogout) btnLogout.textContent = tr.logout;

    // Toolbar
    if (searchInput) searchInput.placeholder = tr.search;
    const optAllCats = document.getElementById('opt-all-cats');
    if (optAllCats) optAllCats.textContent = tr.allCats;
    // Update sort mode options
    const sortOptId = document.getElementById('opt-sort-id');
    const sortOptCat = document.getElementById('opt-sort-cat');
    const sortOptPrice = document.getElementById('opt-sort-price');
    if (sortOptId) sortOptId.textContent = tr.sortById;
    if (sortOptCat) sortOptCat.textContent = tr.sortByCat;
    if (sortOptPrice) sortOptPrice.textContent = tr.sortByPrice;
    if (btnToggleView) btnToggleView.textContent = isDetailedView ? tr.compact : tr.detailed;
    if (btnAdd) btnAdd.textContent = tr.addProduct;

    // Table headers — use data-label span to preserve sort arrow
    const thHeaders = {
      'th-id': 'thId', 'th-name': 'thName', 'th-cat': 'thCat',
      'th-price': 'thPrice', 'th-status': 'thStatus', 'th-actions': 'thActions'
    };
    Object.entries(thHeaders).forEach(([id, key]) => {
      const th = document.getElementById(id);
      if (!th) return;
      const labelSpan = th.querySelector('.th-label');
      if (labelSpan) {
        labelSpan.textContent = tr[key];
      } else {
        // first text node for th-id (which has a sort arrow child)
        const firstText = Array.from(th.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
        if (firstText) firstText.textContent = tr[key] + ' ';
        else th.prepend(document.createTextNode(tr[key] + ' '));
      }
    });

    // Modal form sections
    const els = {
      'section-basic': 'basicInfo', 'section-image': 'imageSection', 'section-stock': 'stockSection',
      'section-names': 'namesSection', 'section-types': 'typesSection', 'section-desc': 'descSection',
      'label-id': 'labelId', 'label-sort': 'labelSort', 'label-category': 'labelCat',
      'label-subcategory': 'labelSubcat', 'label-price': 'labelPrice', 'label-vol': 'labelVol',
      'label-abv': 'labelAbv', 'label-ibu': 'labelIbu', 'label-image-path': 'labelImgPath',
      'upload-click-label': 'uploadClick', 'upload-drop-label': 'uploadDrop',
      'check-in-stock': 'inStock', 'btn-cancel-modal': 'cancel', 'btn-save-modal': 'saveChanges'
    };
    Object.entries(els).forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (el && tr[key]) el.textContent = tr[key];
    });

    const legendStock = document.getElementById('legend-stock');
    if (legendStock) legendStock.textContent = tr.availability;
  }

  // ── Toast ──
  let toastTimer = null;
  function showToast(msg, type = 'success') {
    toast.textContent = msg;
    toast.className = `toast ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
  }

  // ── Auth ──
  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      data.authenticated ? showAdmin() : showLogin();
    } catch { showLogin(); }
  }

  function showLogin() {
    loginOverlay.classList.remove('hidden');
    loginOverlay.style.display = '';
    adminContent.style.display = 'none';
    btnLogout.style.display = 'none';
    applyUITranslations();
  }

  function showAdmin() {
    loginOverlay.style.display = 'none';
    adminContent.style.display = 'block';
    btnLogout.style.display = '';
    applyUITranslations();
    loadData();
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: loginPassword.value })
    });
    if (res.ok) {
      loginError.style.display = 'none';
      loginPassword.value = '';
      showAdmin();
    } else {
      loginError.textContent = t().invalidPwd;
      loginError.style.display = 'block';
    }
  });

  btnLogout.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    catalog = [];
    showLogin();
  });

  // ── Load Data ──
  async function loadData() {
    try {
      const response = await fetch('/api/admin/products');
      if (response.status === 401) return showLogin();
      catalog = await response.json();
      renderAll();
    } catch (e) {
      console.error('Error fetching products:', e);
    }
  }

  // ── Sorting ──
  function getSortedFiltered() {
    const term = searchInput.value.toLowerCase();
    const cat = categoryFilter.value;

    let filtered = [...catalog];
    if (cat !== 'all') filtered = filtered.filter(p => p.category === cat);
    if (term) {
      filtered = filtered.filter(p =>
        (p.name_en || '').toLowerCase().includes(term) ||
        (p.name_uk || '').toLowerCase().includes(term) ||
        (p.id || '').toLowerCase().includes(term)
      );
    }

    // Sort by selected field
    const field = currentSortField;
    filtered.sort((a, b) => {
      let va, vb;
      if (field === 'id') {
        // Numeric sort for IDs that contain numbers
        const numA = parseInt((a.id || '').replace(/\D/g, '')) || 0;
        const numB = parseInt((b.id || '').replace(/\D/g, '')) || 0;
        va = numA; vb = numB;
        if (va !== vb) return currentSortDir === 'asc' ? va - vb : vb - va;
        // Fall back to string if numbers are equal
        va = (a.id || ''); vb = (b.id || '');
      } else if (field === 'price') {
        va = Number(a.price) || 0; vb = Number(b.price) || 0;
      } else if (field === 'category') {
        va = (a.category || ''); vb = (b.category || '');
      } else {
        va = (a[field] || ''); vb = (b[field] || '');
      }
      if (typeof va === 'string') {
        return currentSortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return currentSortDir === 'asc' ? va - vb : vb - va;
    });

    return filtered;
  }

  // ── Render All ──
  function renderAll() {
    renderTable();
    renderMobileCards();
  }

  // ── Table headers sorting ──
  document.querySelectorAll('.admin-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const sf = th.dataset.sort;
      if (currentSortField === sf) {
        currentSortDir = currentSortDir === 'asc' ? 'desc' : 'asc';
      } else {
        currentSortField = sf;
        currentSortDir = 'asc';
      }
      document.querySelectorAll('.admin-table th').forEach(t => t.classList.remove('sort-active'));
      th.classList.add('sort-active');
      const arrow = th.querySelector('.sort-arrow');
      if (arrow) arrow.textContent = currentSortDir === 'asc' ? '↑' : '↓';
      renderAll();
    });
  });

  // ── Render Table (desktop) ──
  function renderTable() {
    const filtered = getSortedFiltered();
    const tr = t();
    tableBody.innerHTML = '';
    let lastCategory = '';

    filtered.forEach((item, idx) => {
      if (currentSortField === 'category' && item.category !== lastCategory) {
        lastCategory = item.category;
        const catRow = document.createElement('tr');
        catRow.innerHTML = `<td colspan="7" class="">${(lastCategory || 'Uncategorized').toUpperCase()}</td>`;
        catRow.querySelector('td').className = '';
        catRow.className = 'category-header';
        tableBody.appendChild(catRow);
      }

      const infoHtml = isDetailedView ? buildDetailedInfo(item) : buildCompactInfo(item);
      const row = document.createElement('tr');
      row.style.animationDelay = `${idx * 0.01}s`;
      row.innerHTML = `
        <td><img src="${item.image}" alt="" class="table-img" loading="lazy" onerror="this.style.opacity=0.3"></td>
        <td><span style="font-size:12px;font-weight:600;font-family:monospace;color:var(--text-muted)">${escHtml(item.id || '')}</span></td>
        <td style="min-width:180px">${infoHtml}</td>
        <td>
          <select class="quick-select" data-id="${item.id}" data-field="category" aria-label="Category">
            ${['beer','cider','drinks','sweets','snacks'].map(c => `<option value="${c}"${item.category===c?' selected':''}>${c}</option>`).join('')}
          </select>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:11px;color:var(--text-muted)">€</span>
            <input class="quick-input" type="number" step="0.01" data-id="${item.id}" data-field="price" value="${Number(item.price||0).toFixed(2)}" min="0" aria-label="Price">
          </div>
        </td>
        <td>
          <select class="quick-select" data-id="${item.id}" data-field="in_stock" aria-label="Status">
            <option value="1"${item.in_stock!==false?' selected':''}>✅ In Stock</option>
            <option value="0"${item.in_stock===false?' selected':''}>❌ Out</option>
          </select>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn--edit btn--sm" onclick="adminActions.edit('${item.id}')">Edit</button>
            <button class="btn btn--danger btn--sm" onclick="adminActions.del('${item.id}')">✕</button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Quick-edit listeners
    tableBody.querySelectorAll('.quick-select, .quick-input').forEach(el => {
      el.addEventListener('change', handleQuickEdit);
      if (el.tagName === 'INPUT') {
        el.addEventListener('blur', handleQuickEdit);
      }
    });
  }

  function buildCompactInfo(item) {
    return `
      <div style="font-weight:600;font-size:14px;color:var(--text-primary)">${escHtml(item.name_en || '')}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${escHtml(item.name_uk || '')}</div>
    `;
  }

  function buildDetailedInfo(item) {
    return `
      <div style="display:flex;gap:12px;flex-wrap:wrap;font-size:12px">
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-muted);margin-bottom:4px">Names</div>
          <dl class="detail-grid">
            <dt><span class="lang-badge">UK</span></dt><dd><span class="editable" data-id="${item.id}" data-field="name_uk">${escHtml(item.name_uk||'')}</span></dd>
            <dt><span class="lang-badge">EN</span></dt><dd><span class="editable" data-id="${item.id}" data-field="name_en">${escHtml(item.name_en||'')}</span></dd>
            <dt><span class="lang-badge">ET</span></dt><dd><span class="editable" data-id="${item.id}" data-field="name_et">${escHtml(item.name_et||'')}</span></dd>
            <dt><span class="lang-badge">RU</span></dt><dd><span class="editable" data-id="${item.id}" data-field="name_ru">${escHtml(item.name_ru||'')}</span></dd>
          </dl>
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:var(--text-muted);margin-bottom:4px">Specs</div>
          <dl class="detail-grid">
            <dt>Vol:</dt><dd><span class="editable" data-id="${item.id}" data-field="volume">${escHtml(item.volume||'')}</span></dd>
            <dt>ABV:</dt><dd><span class="editable" data-id="${item.id}" data-field="abv">${escHtml(item.abv||'')}</span></dd>
            <dt>IBU:</dt><dd><span class="editable" data-id="${item.id}" data-field="ibu">${escHtml(String(item.ibu||''))}</span></dd>
          </dl>
        </div>
      </div>
    `;
  }

  // ── Mobile Cards ──
  function renderMobileCards() {
    const filtered = getSortedFiltered();
    const tr = t();
    mobileCards.innerHTML = '';
    filtered.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'product-mobile-card';
      card.style.animationDelay = `${idx * 0.02}s`;
      card.innerHTML = `
        <div class="product-mobile-card__header">
          <img src="${item.image}" alt="" class="product-mobile-card__img" loading="lazy" onerror="this.style.opacity=0.3">
          <div class="product-mobile-card__meta">
            <div class="product-mobile-card__name">${escHtml(item.name_en || item.id)}</div>
            <div class="product-mobile-card__sub">${escHtml(item.name_uk || '')} · <span style="font-family:monospace;font-size:11px">${escHtml(item.id)}</span></div>
          </div>
        </div>
        <div class="product-mobile-card__row">
          <span class="badge badge--cat">${escHtml(item.category || '')}</span>
          <span class="${item.in_stock !== false ? 'badge badge--in-stock' : 'badge badge--out-stock'}">${item.in_stock !== false ? '✅ In Stock' : '❌ Out'}</span>
          <strong style="font-size:15px">€${Number(item.price||0).toFixed(2)}</strong>
        </div>
        <div class="product-mobile-card__actions">
          <button class="btn btn--edit btn--sm" onclick="adminActions.edit('${item.id}')">Edit</button>
          <button class="btn btn--danger btn--sm" onclick="adminActions.del('${item.id}')">Delete</button>
        </div>
      `;
      mobileCards.appendChild(card);
    });
  }

  // ── Inline quick-edit for price, status, category ──
  async function handleQuickEdit(e) {
    const el = e.target;
    const id = el.dataset.id;
    const field = el.dataset.field;
    if (!id || !field) return;

    let value = el.value;
    if (field === 'price') value = Number(value) || 0;
    else if (field === 'in_stock') value = value === '1';

    const payload = { [field]: value };
    try {
      const res = await fetch(`/api/admin/product/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.status === 401) return showLogin();
      if (res.ok) {
        const idx = catalog.findIndex(p => p.id === id);
        if (idx > -1) catalog[idx][field] = value;
        showToast(t().saved);
        renderMobileCards();
      } else {
        showToast(t().failSave, 'error');
      }
    } catch {
      showToast(t().failSave, 'error');
    }
  }

  // ── Toggles ──
  searchInput.addEventListener('input', renderAll);
  categoryFilter.addEventListener('change', renderAll);
  sortMode.addEventListener('change', () => {
    currentSortField = sortMode.value;
    currentSortDir = 'asc';
    renderAll();
  });
  btnToggleView.addEventListener('click', () => {
    isDetailedView = !isDetailedView;
    btnToggleView.textContent = isDetailedView ? t().compact : t().detailed;
    renderTable();
  });

  // ── Actions ──
  window.adminActions = {
    edit: (id) => {
      const item = catalog.find(p => p.id === id);
      if (!item) return;
      editingId = id;
      const fields = ['id', 'sort_order', 'category', 'subcategory', 'image', 'price', 'volume', 'abv', 'ibu',
        'name_uk', 'name_en', 'name_et', 'name_ru',
        'type_uk', 'type_en', 'type_et', 'type_ru',
        'description_uk', 'description_en', 'description_et', 'description_ru'];
      fields.forEach(f => {
        const el = document.getElementById('field-' + f);
        if (el) el.value = item[f] !== undefined ? item[f] : '';
      });
      document.getElementById('field-in_stock').checked = item.in_stock !== false;
      document.getElementById('field-stock_oismae').checked = item.stock_oismae !== false;
      document.getElementById('field-stock_mahtra').checked = item.stock_mahtra !== false;
      document.getElementById('modal-title').textContent = `${t().editProduct}: ${item.name_en || item.id}`;
      resetImagePreview();
      buildSubcategoryPicker(item.category, item.subcategory);
      modal.classList.add('open');
    },
    del: async (id) => {
      if (!confirm(t().confirmDelete)) return;
      try {
        const res = await fetch(`/api/admin/product/${id}`, { method: 'DELETE' });
        if (res.status === 401) return showLogin();
        if (res.ok) {
          catalog = catalog.filter(p => p.id !== id);
          showToast(t().deleted);
          renderAll();
        } else showToast(t().failDelete, 'error');
      } catch { showToast(t().failDelete, 'error'); }
    }
  };

  btnAdd.addEventListener('click', () => {
    editingId = null;
    editForm.reset();
    document.getElementById('field-id').value = 'item-' + Date.now();
    document.getElementById('modal-title').textContent = t().addNew;
    resetImagePreview();
    buildSubcategoryPicker('beer', '');
    modal.classList.add('open');
  });

  const closeModal = () => modal.classList.remove('open');
  btnCloseModal.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // ── Subcategory Chip Picker ──
  function buildSubcategoryPicker(category, selectedSub) {
    subcategoryPicker.innerHTML = '';
    const subs = CATEGORY_SUBS[category] || [];
    const tr = t();
    subs.forEach(sub => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'subcategory-chip' + (sub === selectedSub ? ' active' : '');
      chip.textContent = (tr.subcats && tr.subcats[sub]) || sub;
      chip.addEventListener('click', () => {
        subcategoryPicker.querySelectorAll('.subcategory-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        fieldSubcategory.value = sub;
      });
      subcategoryPicker.appendChild(chip);
    });
    // If the existing subcategory isn't in the list, keep it as hidden value
    if (selectedSub && !subs.includes(selectedSub)) {
      fieldSubcategory.value = selectedSub;
    }
  }

  // Update picker when category changes in modal
  fieldCategory.addEventListener('change', () => {
    buildSubcategoryPicker(fieldCategory.value, '');
    fieldSubcategory.value = '';
  });

  // ── Save Form ──
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-modal');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span>`;

    const updatedProduct = {};
    const fields = ['id', 'sort_order', 'category', 'subcategory', 'image', 'price', 'volume', 'abv', 'ibu',
      'name_uk', 'name_en', 'name_et', 'name_ru',
      'type_uk', 'type_en', 'type_et', 'type_ru',
      'description_uk', 'description_en', 'description_et', 'description_ru'];
    fields.forEach(f => {
      const el = document.getElementById('field-' + f);
      if (el) updatedProduct[f] = el.value || '';
    });
    updatedProduct.in_stock = document.getElementById('field-in_stock').checked;
    updatedProduct.stock_oismae = document.getElementById('field-stock_oismae').checked;
    updatedProduct.stock_mahtra = document.getElementById('field-stock_mahtra').checked;
    updatedProduct.price = Number(updatedProduct.price) || 0;
    updatedProduct.sort_order = Number(updatedProduct.sort_order) || 0;

    try {
      if (editingId) {
        updatedProduct.id = editingId;
        const res = await fetch(`/api/admin/product/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProduct)
        });
        if (res.status === 401) return showLogin();
        if (res.ok) {
          const idx = catalog.findIndex(p => p.id === editingId);
          if (idx > -1) catalog[idx] = { ...catalog[idx], ...updatedProduct };
          showToast(t().saved);
        } else showToast(t().failSave, 'error');
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProduct)
        });
        if (res.status === 401) return showLogin();
        if (res.ok) {
          const json = await res.json();
          catalog.push(json.product || updatedProduct);
          showToast(t().saved);
        } else showToast(t().failSave, 'error');
      }
    } catch { showToast(t().failSave, 'error'); }

    btn.disabled = false;
    btn.textContent = t().saveChanges;
    closeModal();
    renderAll();
  });

  // ── Image Upload ──
  function resetImagePreview() {
    imagePreview.style.display = 'none';
    previewImg.src = '';
    previewFilename.textContent = '';
    previewStatus.textContent = '';
    uploadBar.style.width = '0%';
    imageFileInput.value = '';
  }

  imageFileInput.addEventListener('change', async () => {
    const file = imageFileInput.files[0];
    if (!file) return;
    await handleFileUpload(file);
  });

  // Drag and drop
  imageUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageUploadArea.classList.add('drag-over');
  });
  imageUploadArea.addEventListener('dragleave', () => imageUploadArea.classList.remove('drag-over'));
  imageUploadArea.addEventListener('drop', async (e) => {
    e.preventDefault();
    imageUploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await handleFileUpload(file);
    }
  });

  async function handleFileUpload(file) {
    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    previewImg.src = localUrl;
    previewFilename.textContent = file.name;
    previewStatus.textContent = t().uploading;
    uploadBar.style.width = '30%';
    imagePreview.style.display = 'flex';

    // Generate safe filename
    const safeName = file.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9._-]/g, '');
    const imagePath = `img/${safeName}`;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', safeName);

      // Progress simulation
      let progress = 30;
      const progressInterval = setInterval(() => {
        progress = Math.min(progress + 15, 85);
        uploadBar.style.width = `${progress}%`;
      }, 200);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      uploadBar.style.width = '100%';

      if (res.ok) {
        const json = await res.json();
        const finalPath = (json && json.path) ? json.path : imagePath;
        fieldImage.value = finalPath;
        previewStatus.textContent = t().uploadDone;
        previewStatus.style.color = 'var(--green)';
        showToast(t().uploadDone);
      } else {
        // Fallback: just set the path to what we'd expect
        fieldImage.value = imagePath;
        previewStatus.textContent = t().uploadErr + ' — path set manually';
        previewStatus.style.color = 'var(--amber)';
      }
    } catch (err) {
      uploadBar.style.width = '0%';
      fieldImage.value = `img/${safeName}`;
      previewStatus.textContent = t().uploadErr + ' (offline)';
      previewStatus.style.color = 'var(--red)';
    }
  }

  // ── Inline editing (detailed view) ──
  tableBody.addEventListener('click', (e) => {
    const target = e.target;
    if (!target.classList.contains('editable')) return;
    if (target.querySelector('input, textarea')) return;

    const currentText = target.innerText;
    const field = target.getAttribute('data-field');
    const id = target.getAttribute('data-id');

    const isTextArea = field && field.startsWith('description');
    const input = document.createElement(isTextArea ? 'textarea' : 'input');
    if (!isTextArea) input.type = 'text';
    input.value = currentText;
    input.className = 'inline-edit-input';
    target.innerHTML = '';
    target.appendChild(input);
    input.focus();

    const finishEdit = async () => {
      const newVal = input.value.trim();
      if (newVal === currentText) { target.innerText = newVal || ''; return; }
      target.innerText = '…';
      target.style.opacity = '0.5';
      try {
        const res = await fetch(`/api/admin/product/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: newVal })
        });
        if (res.status === 401) return showLogin();
        if (res.ok) {
          const idx = catalog.findIndex(p => p.id === id);
          if (idx > -1) catalog[idx][field] = newVal;
          target.innerText = newVal;
          target.style.opacity = '';
          showToast(t().saved);
        } else {
          target.innerText = currentText;
          target.style.opacity = '';
          showToast(t().failSave, 'error');
        }
      } catch {
        target.innerText = currentText;
        target.style.opacity = '';
        showToast(t().failSave, 'error');
      }
    };

    input.addEventListener('blur', finishEdit);
    if (!isTextArea) {
      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') input.blur();
        if (ev.key === 'Escape') { input.value = currentText; input.blur(); }
      });
    }
  });

  // ── Utils ──
  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Init ──
  buildLangDropdown();
  checkAuth();
});
