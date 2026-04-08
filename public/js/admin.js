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
  const detailView = document.getElementById('detail-view');
  const detailContainer = document.getElementById('detail-container');
  const btnBackDetail = document.getElementById('btn-back-detail');

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

    // Sort: Primary = in_stock (true first), Secondary = selected field
    filtered.sort((a, b) => {
      const aStock = a.in_stock !== false;
      const bStock = b.in_stock !== false;
      if (aStock !== bStock) return aStock ? -1 : 1;

      const field = currentSortField;
      let va, vb;
      if (field === 'id') {
        const numA = parseInt((a.id || '').replace(/\D/g, '')) || 0;
        const numB = parseInt((b.id || '').replace(/\D/g, '')) || 0;
        va = numA; vb = numB;
        if (va !== vb) return currentSortDir === 'asc' ? va - vb : vb - va;
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
        catRow.innerHTML = `<td colspan="7">${(lastCategory || 'Uncategorized').toUpperCase()}</td>`;
        catRow.className = 'category-header';
        tableBody.appendChild(catRow);
      }

      if (isDetailedView) {
        const detailedRow = document.createElement('tr');
        detailedRow.className = 'detailed-row-container';
        detailedRow.innerHTML = `<td colspan="7">${buildDetailedRowHtml(item)}</td>`;
        tableBody.appendChild(detailedRow);
      } else {
        const row = document.createElement('tr');
        row.style.animationDelay = `${idx * 0.01}s`;
        row.innerHTML = `
          <td><img src="${item.image}" alt="" class="table-img" loading="lazy" onerror="this.style.opacity=0.3"></td>
          <td><span class="id-badge">${escHtml(item.id || '')}</span></td>
          <td style="min-width:180px">${buildCompactInfo(item)}</td>
          <td>
            <select class="quick-select" data-id="${item.id}" data-field="category">
              ${['beer','cider','drinks','sweets','snacks'].map(c => `<option value="${c}"${item.category===c?' selected':''}>${c}</option>`).join('')}
            </select>
          </td>
          <td>
            <div class="quick-price">
              <span>€</span>
              <input class="quick-input" type="number" step="0.01" data-id="${item.id}" data-field="price" value="${Number(item.price||0).toFixed(2)}">
            </div>
          </td>
          <td>
            <select class="quick-select" data-id="${item.id}" data-field="in_stock">
              <option value="1"${item.in_stock!==false?' selected':''}>✅ In Stock</option>
              <option value="0"${item.in_stock===false?' selected':''}>❌ Out</option>
            </select>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn btn--secondary btn--sm" onclick="adminActions.view('${item.id}')">View</button>
              <button class="btn btn--edit btn--sm" onclick="adminActions.edit('${item.id}')">Edit</button>
              <button class="btn btn--danger btn--sm" onclick="adminActions.del('${item.id}')">✕</button>
            </div>
          </td>
        `;
        tableBody.appendChild(row);
      }
    });

    // Re-bind change listeners for quick edits
    tableBody.querySelectorAll('.quick-select, .quick-input, .detailed-input').forEach(el => {
      el.addEventListener('change', handleQuickEdit);
    });
  }

  function buildDetailedRowHtml(item) {
    const categories = ['beer','cider','drinks','sweets','snacks'];
    const currentSubcats = CATEGORY_SUBS[item.category] || [];
    
    return `
      <div class="detailed-edit-grid">
        <!-- Section: Media & Identity -->
        <div class="de-col de-media">
          <div class="de-img-container">
            <img src="${item.image}" alt="" class="de-preview-img" onerror="this.style.opacity=0.3">
            <div class="de-img-overlay" onclick="adminActions.edit('${item.id}')">Edit</div>
          </div>
          <div class="field">
            <label>Image URL</label>
            <input class="detailed-input de-input-sm" data-id="${item.id}" data-field="image" value="${escHtml(item.image||'')}">
          </div>
          <div class="de-id-tag">ID: ${item.id}</div>
        </div>

        <!-- Section: Multilingual Names -->
        <div class="de-col de-multiline">
          <label class="de-section-label">Names</label>
          <div class="de-field-group">
            <div class="field-row"><span class="de-lang">UK</span><input class="detailed-input" data-id="${item.id}" data-field="name_uk" value="${escHtml(item.name_uk||'')}"></div>
            <div class="field-row"><span class="de-lang">EN</span><input class="detailed-input" data-id="${item.id}" data-field="name_en" value="${escHtml(item.name_en||'')}"></div>
            <div class="field-row"><span class="de-lang">ET</span><input class="detailed-input" data-id="${item.id}" data-field="name_et" value="${escHtml(item.name_et||'')}"></div>
            <div class="field-row"><span class="de-lang">RU</span><input class="detailed-input" data-id="${item.id}" data-field="name_ru" value="${escHtml(item.name_ru||'')}"></div>
          </div>
        </div>

        <!-- Section: Multilingual Types -->
        <div class="de-col de-multiline">
          <label class="de-section-label">Types / Varieties</label>
          <div class="de-field-group">
            <div class="field-row"><span class="de-lang">UK</span><input class="detailed-input" data-id="${item.id}" data-field="type_uk" value="${escHtml(item.type_uk||'')}"></div>
            <div class="field-row"><span class="de-lang">EN</span><input class="detailed-input" data-id="${item.id}" data-field="type_en" value="${escHtml(item.type_en||'')}"></div>
            <div class="field-row"><span class="de-lang">ET</span><input class="detailed-input" data-id="${item.id}" data-field="type_et" value="${escHtml(item.type_et||'')}"></div>
            <div class="field-row"><span class="de-lang">RU</span><input class="detailed-input" data-id="${item.id}" data-field="type_ru" value="${escHtml(item.type_ru||'')}"></div>
          </div>
        </div>

        <!-- Section: Multilingual Descriptions -->
        <div class="de-col de-multiline de-desc">
          <label class="de-section-label">Descriptions</label>
          <div class="de-field-group">
            <textarea class="detailed-input de-textarea" data-id="${item.id}" data-field="description_uk" placeholder="UK">${escHtml(item.description_uk||'')}</textarea>
            <textarea class="detailed-input de-textarea" data-id="${item.id}" data-field="description_en" placeholder="EN">${escHtml(item.description_en||'')}</textarea>
            <textarea class="detailed-input de-textarea" data-id="${item.id}" data-field="description_et" placeholder="ET">${escHtml(item.description_et||'')}</textarea>
            <textarea class="detailed-input de-textarea" data-id="${item.id}" data-field="description_ru" placeholder="RU">${escHtml(item.description_ru||'')}</textarea>
          </div>
        </div>

        <!-- Section: Specs & Pricing (Row) -->
        <div class="de-footer-row">
          <div class="de-specs-grid">
            <div class="field">
              <label>Category</label>
              <select class="detailed-input" data-id="${item.id}" data-field="category">
                ${categories.map(c => `<option value="${c}"${item.category===c?' selected':''}>${c}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label>Price (€)</label>
              <input type="number" step="0.01" class="detailed-input" data-id="${item.id}" data-field="price" value="${Number(item.price||0).toFixed(2)}">
            </div>
            <div class="field">
              <label>Status</label>
              <select class="detailed-input" data-id="${item.id}" data-field="in_stock">
                <option value="true"${item.in_stock!==false?' selected':''}>✅ In Stock</option>
                <option value="false"${item.in_stock===false?' selected':''}>❌ Out of Stock</option>
              </select>
            </div>
            <div class="field"><label>Vol</label><input class="detailed-input" data-id="${item.id}" data-field="volume" value="${escHtml(item.volume||'')}"></div>
            <div class="field"><label>ABV%</label><input class="detailed-input" data-id="${item.id}" data-field="abv" value="${escHtml(item.abv||'')}"></div>
            <div class="field"><label>IBU</label><input class="detailed-input" data-id="${item.id}" data-field="ibu" value="${escHtml(String(item.ibu||''))}"></div>
            <div class="field"><label>Order</label><input type="number" class="detailed-input" data-id="${item.id}" data-field="sort_order" value="${item.sort_order||0}"></div>
          </div>
          <div class="de-actions">
             <button class="btn btn--danger btn--sm" onclick="adminActions.del('${item.id}')">Delete Product</button>
             <button class="btn btn--secondary btn--sm" onclick="adminActions.edit('${item.id}')">Full Edit Modal</button>
          </div>
        </div>
      </div>
    `;
  }

  function buildCompactInfo(item) {
    return `
      <div class="compact-name">${escHtml(item.name_en || '')}</div>
      <div class="compact-sub">${escHtml(item.name_uk || '')}</div>
    `;
  }

  // ── Mobile Cards ──
  function renderMobileCards() {
    const filtered = getSortedFiltered();
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
            <div class="product-mobile-card__sub">${escHtml(item.name_uk || '')} · <span class="id-badge">${escHtml(item.id)}</span></div>
          </div>
        </div>
        <div class="product-mobile-card__row">
          <span class="badge badge--cat">${escHtml(item.category || '')}</span>
          <button class="mobile-stock-btn ${item.in_stock !== false ? 'in-stock' : 'out-stock'}" 
                  data-id="${item.id}" data-field="in_stock" data-value="${item.in_stock !== false ? '0' : '1'}">
            ${item.in_stock !== false ? '✅ In Stock' : '❌ Out'}
          </button>
          <strong style="font-size:15px">€${Number(item.price||0).toFixed(2)}</strong>
        </div>
        <div class="product-mobile-card__actions">
          <button class="btn btn--secondary btn--sm" onclick="adminActions.view('${item.id}')">View</button>
          <button class="btn btn--edit btn--sm" onclick="adminActions.edit('${item.id}')">Edit</button>
          <button class="btn btn--danger btn--sm" onclick="adminActions.del('${item.id}')">Delete</button>
        </div>
      `;
      mobileCards.appendChild(card);
    });

    mobileCards.querySelectorAll('.mobile-stock-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        const val = btn.dataset.value === '1';
        handleQuickEdit({ target: { dataset: { id, field: 'in_stock' }, value: val ? '1' : '0' } });
      });
    });
  }

  // ── Inline quick-edit for price, status, category ──
  async function handleQuickEdit(e) {
    const el = e.target;
    const id = el.dataset.id;
    const field = el.dataset.field;
    if (!id || !field) return;

    let value = el.value;
    if (field === 'price' || field === 'sort_order') value = Number(value) || 0;
    else if (field === 'in_stock') value = (value === '1' || value === 'true');

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
    view: (id) => {
      const item = catalog.find(p => p.id === id);
      if (!item) return;
      showDetailView(item);
    },
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
    previewImg.style.opacity = '0.5';
    previewFilename.textContent = file.name;
    previewStatus.textContent = t().uploading;
    previewStatus.style.color = 'var(--text-muted)';
    uploadBar.style.width = '30%';
    imagePreview.style.display = 'flex';

    // Generate safe filename for local display fallback
    const safeName = file.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9._-]/g, '');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', safeName);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();

      if (res.ok && json.url) {
        fieldImage.value = json.url;
        previewImg.src = json.url;
        previewImg.style.opacity = '1';
        previewStatus.textContent = t().uploadDone;
        previewStatus.style.color = 'var(--green)';
        uploadBar.style.width = '100%';
        showToast(t().uploadDone);
      } else {
        throw new Error(json.error || 'Server error during upload');
      }
    } catch (err) {
      console.error('Upload error:', err);
      uploadBar.style.width = '0%';
      previewImg.style.opacity = '0.3';
      previewStatus.textContent = t().uploadErr + ': ' + err.message;
      previewStatus.style.color = 'var(--red)';
      showToast(t().uploadErr, 'error');
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

  // ── Detail View ──
  function showDetailView(item) {
    tableBody.parentElement.parentElement.style.display = 'none';
    mobileCards.style.display = 'none';
    detailView.style.display = 'block';
    editingId = item.id;

    const tr = t();
    
    // Build category subcategory options
    const categories = ['beer', 'cider', 'drinks', 'sweets', 'snacks'];
    const categoryOptions = categories.map(c => `<option value="${c}"${item.category === c ? ' selected' : ''}>${c}</option>`).join('');
    
    const subCats = CATEGORY_SUBS[item.category] || [];
    const subCatOptions = subCats.map(s => `<option value="${s}"${item.subcategory === s ? ' selected' : ''}>${tr.subcats && tr.subcats[s] || s}</option>`).join('');

    const html = `
      <div class="detail-header">
        <img src="${escHtml(item.image)}" alt="" class="detail-img" onerror="this.style.opacity=0.3">
        <div class="detail-title">
          <h1>${escHtml(item.name_en || item.id)}</h1>
          <div class="detail-id">${escHtml(item.id)}</div>
        </div>
      </div>

      <div class="detail-grid">
        <!-- Left column -->
        <div class="detail-section">
          <h3>${tr.basicInfo}</h3>
          
          <div class="detail-field">
            <label>${tr.labelCat}</label>
            <select class="detail-input" id="detail-field-category">
              ${categoryOptions}
            </select>
          </div>

          <div class="detail-field">
            <label>${tr.labelSubcat}</label>
            <select class="detail-input" id="detail-field-subcategory">
              ${subCatOptions}
            </select>
          </div>

          <div class="detail-field">
            <label>${tr.labelSort}</label>
            <input type="number" class="detail-input" id="detail-field-sort_order" value="${item.sort_order || 0}">
          </div>

          <div class="detail-field">
            <label>${tr.labelPrice}</label>
            <input type="number" step="0.01" class="detail-input" id="detail-field-price" value="${Number(item.price || 0).toFixed(2)}">
          </div>

          <div class="detail-field">
            <label>${tr.labelVol}</label>
            <input type="text" class="detail-input" id="detail-field-volume" value="${escHtml(item.volume || '')}">
          </div>

          <div class="detail-field">
            <label>${tr.labelAbv}</label>
            <input type="text" class="detail-input" id="detail-field-abv" value="${escHtml(item.abv || '')}">
          </div>

          <div class="detail-field">
            <label>${tr.labelIbu}</label>
            <input type="text" class="detail-input" id="detail-field-ibu" value="${escHtml(item.ibu || '')}">
          </div>

          <div class="detail-field">
            <label>${tr.labelImgPath}</label>
            <input type="text" class="detail-input" id="detail-field-image" value="${escHtml(item.image || '')}">
          </div>

          <div class="detail-section" style="margin-top: 20px;">
            <h3>${tr.availability}</h3>
            <div class="detail-checkboxes">
              <div class="detail-field-checkbox">
                <input type="checkbox" id="detail-field-in_stock" ${item.in_stock !== false ? 'checked' : ''}>
                <label for="detail-field-in_stock">${tr.inStock}</label>
              </div>
              <div class="detail-field-checkbox">
                <input type="checkbox" id="detail-field-stock_oismae" ${item.stock_oismae !== false ? 'checked' : ''}>
                <label for="detail-field-stock_oismae">Õismäe</label>
              </div>
              <div class="detail-field-checkbox">
                <input type="checkbox" id="detail-field-stock_mahtra" ${item.stock_mahtra !== false ? 'checked' : ''}>
                <label for="detail-field-stock_mahtra">Mahtra</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div class="detail-section">
          <h3>${tr.namesSection}</h3>
          
          <div class="detail-field">
            <label>🇺🇦 ${tr.labelId}</label>
            <input type="text" class="detail-input" id="detail-field-name_uk" value="${escHtml(item.name_uk || '')}">
          </div>

          <div class="detail-field">
            <label>🇬🇧 EN</label>
            <input type="text" class="detail-input" id="detail-field-name_en" value="${escHtml(item.name_en || '')}">
          </div>

          <div class="detail-field">
            <label>🇪🇪 ET</label>
            <input type="text" class="detail-input" id="detail-field-name_et" value="${escHtml(item.name_et || '')}">
          </div>

          <div class="detail-field">
            <label>🇷🇺 RU</label>
            <input type="text" class="detail-input" id="detail-field-name_ru" value="${escHtml(item.name_ru || '')}">
          </div>

          <h3 style="margin-top: 20px;">${tr.typesSection}</h3>

          <div class="detail-field">
            <label>🇺🇦 UK</label>
            <input type="text" class="detail-input" id="detail-field-type_uk" value="${escHtml(item.type_uk || '')}">
          </div>

          <div class="detail-field">
            <label>🇬🇧 EN</label>
            <input type="text" class="detail-input" id="detail-field-type_en" value="${escHtml(item.type_en || '')}">
          </div>

          <div class="detail-field">
            <label>🇪🇪 ET</label>
            <input type="text" class="detail-input" id="detail-field-type_et" value="${escHtml(item.type_et || '')}">
          </div>

          <div class="detail-field">
            <label>🇷🇺 RU</label>
            <input type="text" class="detail-input" id="detail-field-type_ru" value="${escHtml(item.type_ru || '')}">
          </div>

          <h3 style="margin-top: 20px;">${tr.descSection}</h3>

          <div class="detail-field">
            <label>🇺🇦 UK</label>
            <textarea class="detail-input" id="detail-field-description_uk">${escHtml(item.description_uk || '')}</textarea>
          </div>

          <div class="detail-field">
            <label>🇬🇧 EN</label>
            <textarea class="detail-input" id="detail-field-description_en">${escHtml(item.description_en || '')}</textarea>
          </div>

          <div class="detail-field">
            <label>🇪🇪 ET</label>
            <textarea class="detail-input" id="detail-field-description_et">${escHtml(item.description_et || '')}</textarea>
          </div>

          <div class="detail-field">
            <label>🇷🇺 RU</label>
            <textarea class="detail-input" id="detail-field-description_ru">${escHtml(item.description_ru || '')}</textarea>
          </div>
        </div>
      </div>

      <div class="detail-footer">
        <button type="button" class="btn btn--danger" id="detail-btn-delete">🗑 ${tr.cancel}</button>
        <button type="button" class="btn btn--secondary" id="detail-btn-cancel">${tr.cancel}</button>
        <button type="button" class="btn btn--primary" id="detail-btn-save">${tr.saveChanges}</button>
      </div>
    `;

    detailContainer.innerHTML = html;

    // Bind events
    document.getElementById('detail-btn-cancel').addEventListener('click', hideDetailView);
    document.getElementById('detail-btn-save').addEventListener('click', saveDetailView);
    document.getElementById('detail-btn-delete').addEventListener('click', () => {
      adminActions.del(item.id);
      hideDetailView();
    });

    // Update subcategory options when category changes
    document.getElementById('detail-field-category').addEventListener('change', (e) => {
      const newCategory = e.target.value;
      const newSubs = CATEGORY_SUBS[newCategory] || [];
      const subSelect = document.getElementById('detail-field-subcategory');
      subSelect.innerHTML = newSubs.map(s => `<option value="${s}">${tr.subcats && tr.subcats[s] || s}</option>`).join('');
    });
  }

  function hideDetailView() {
    detailView.style.display = 'none';
    tableBody.parentElement.parentElement.style.display = '';
    mobileCards.style.display = '';
    editingId = null;
  }

  async function saveDetailView() {
    const tr = t();
    const fields = ['id', 'sort_order', 'category', 'subcategory', 'image', 'price', 'volume', 'abv', 'ibu',
      'name_uk', 'name_en', 'name_et', 'name_ru',
      'type_uk', 'type_en', 'type_et', 'type_ru',
      'description_uk', 'description_en', 'description_et', 'description_ru'];
    
    const payload = {};
    fields.forEach(f => {
      const el = document.getElementById(`detail-field-${f}`);
      if (el) {
        let val = el.value;
        if (f === 'price') val = Number(val) || 0;
        if (f === 'sort_order') val = Number(val) || 0;
        payload[f] = val;
      }
    });

    payload.in_stock = document.getElementById('detail-field-in_stock').checked;
    payload.stock_oismae = document.getElementById('detail-field-stock_oismae').checked;
    payload.stock_mahtra = document.getElementById('detail-field-stock_mahtra').checked;

    try {
      const res = await fetch(`/api/admin/product/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.status === 401) return showLogin();
      if (res.ok) {
        const idx = catalog.findIndex(p => p.id === editingId);
        if (idx > -1) Object.assign(catalog[idx], payload);
        showToast(tr.saved);
        hideDetailView();
        renderAll();
      } else showToast(tr.failSave, 'error');
    } catch { showToast(tr.failSave, 'error'); }
  }

  // ── Init ──
  buildLangDropdown();
  btnBackDetail.addEventListener('click', hideDetailView);
  checkAuth();
});
