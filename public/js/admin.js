document.addEventListener('DOMContentLoaded', () => {
  let catalog = [];
  let isDetailedView = false;
  let editingId = null;
  
  // Auth Elements
  const loginOverlay = document.getElementById('login-overlay');
  const adminContent = document.getElementById('admin-content');
  const loginForm = document.getElementById('login-form');
  const loginPassword = document.getElementById('login-password');
  const btnLogout = document.getElementById('btn-logout');
  const loginError = document.getElementById('login-error');

  // Elements
  const tableBody = document.getElementById('table-body');
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const btnToggleView = document.getElementById('toggle-view');
  
  const modal = document.getElementById('edit-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const editForm = document.getElementById('edit-form');
  
  const btnAdd = document.getElementById('btn-add');

  // Initial Auth Check
  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      if (data.authenticated) {
        showAdmin();
      } else {
        showLogin();
      }
    } catch {
      showLogin();
    }
  }

  function showLogin() {
    if (loginOverlay) loginOverlay.style.display = 'flex';
    if (adminContent) adminContent.style.display = 'none';
    if (btnLogout) btnLogout.style.display = 'none';
  }

  function showAdmin() {
    if (loginOverlay) loginOverlay.style.display = 'none';
    if (adminContent) adminContent.style.display = 'block';
    if (btnLogout) btnLogout.style.display = 'inline-block';
    loadData();
  }

  if (loginForm) {
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
        loginError.style.display = 'block';
      }
    });
  }

  btnLogout.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    catalog = [];
    renderTable();
    showLogin();
  });

  // Load Data
  async function loadData() {
    try {
      const response = await fetch('/api/admin/products');
      if (response.status === 401) return showLogin();
      catalog = await response.json();
      renderTable();
    } catch (e) {
      console.error('Error fetching admin products:', e);
    }
  }

  // Render Table
  function renderTable() {
    const term = searchInput.value.toLowerCase();
    const cat = categoryFilter.value;

    let filtered = catalog;

    if (cat !== 'all') {
      filtered = filtered.filter(p => p.category === cat);
    }
    if (term) {
      filtered = filtered.filter(p => 
        (p.name_en || '').toLowerCase().includes(term) ||
        (p.name_uk || '').toLowerCase().includes(term) ||
        (p.id || '').toLowerCase().includes(term)
      );
    }

    filtered.sort((a,b) => {
      if (a.category !== b.category) return (a.category || '').localeCompare(b.category || '');
      if (a.subcategory !== b.subcategory) return (a.subcategory || '').localeCompare(b.subcategory || '');
      return (a.sort_order || 0) - (b.sort_order || 0);
    });

    tableBody.innerHTML = '';
    
    let lastCategory = '';

    filtered.forEach((item) => {
      if (item.category !== lastCategory) {
        lastCategory = item.category;
        const catRow = document.createElement('tr');
        catRow.innerHTML = `<td colspan="7" class="category-header">${(lastCategory || 'Uncategorized').toUpperCase()}</td>`;
        tableBody.appendChild(catRow);
      }

      const tr = document.createElement('tr');
      
      let infoHtml = '';
      if (isDetailedView) {
        infoHtml = `
          <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; font-size: 0.85rem;">
            <div style="flex: 1; min-width: 140px;">
                <div style="font-weight:bold;margin-bottom:6px;color:#0d6efd;font-size:0.75rem;text-transform:uppercase;">Names</div>
               <dl class="detail-grid" style="margin-bottom:0;gap:4px 8px;">
                 <dt><span class="lang-badge">UK</span></dt><dd><span class="editable" data-id="${item.id}" data-field="name_uk">${item.name_uk || ''}</span></dd>
                 <dt><span class="lang-badge">EN</span></dt><dd><span class="editable" data-id="${item.id}" data-field="name_en">${item.name_en || ''}</span></dd>
                 <dt><span class="lang-badge">ET</span></dt><dd><span class="editable" data-id="${item.id}" data-field="name_et">${item.name_et || ''}</span></dd>
                 <dt><span class="lang-badge">RU</span></dt><dd><span class="editable" data-id="${item.id}" data-field="name_ru">${item.name_ru || ''}</span></dd>
               </dl>
            </div>
            
            <div style="flex: 1; min-width: 140px;">
               <div style="font-weight:bold;margin-bottom:6px;color:#0d6efd;font-size:0.75rem;text-transform:uppercase;">Types</div>
               <dl class="detail-grid" style="margin-bottom:0;gap:4px 8px;">
                 <dt><span class="lang-badge">UK</span></dt><dd><span class="editable" data-id="${item.id}" data-field="type_uk">${item.type_uk || ''}</span></dd>
                 <dt><span class="lang-badge">EN</span></dt><dd><span class="editable" data-id="${item.id}" data-field="type_en">${item.type_en || ''}</span></dd>
                 <dt><span class="lang-badge">ET</span></dt><dd><span class="editable" data-id="${item.id}" data-field="type_et">${item.type_et || ''}</span></dd>
                 <dt><span class="lang-badge">RU</span></dt><dd><span class="editable" data-id="${item.id}" data-field="type_ru">${item.type_ru || ''}</span></dd>
               </dl>
            </div>

            <div style="flex: 2; min-width: 250px;">
               <div style="font-weight:bold;margin-bottom:6px;color:#0d6efd;font-size:0.75rem;text-transform:uppercase;">Descriptions</div>
               <dl class="detail-grid" style="margin-bottom:0;gap:4px 8px;">
                 <dt><span class="lang-badge">UK</span></dt><dd><span class="editable" data-id="${item.id}" data-field="description_uk">${item.description_uk || ''}</span></dd>
                 <dt><span class="lang-badge">EN</span></dt><dd><span class="editable" data-id="${item.id}" data-field="description_en">${item.description_en || ''}</span></dd>
                 <dt><span class="lang-badge">ET</span></dt><dd><span class="editable" data-id="${item.id}" data-field="description_et">${item.description_et || ''}</span></dd>
                 <dt><span class="lang-badge">RU</span></dt><dd><span class="editable" data-id="${item.id}" data-field="description_ru">${item.description_ru || ''}</span></dd>
               </dl>
            </div>

            <div style="flex: 0; min-width: 100px;">
               <div style="font-weight:bold;margin-bottom:6px;color:#0d6efd;font-size:0.75rem;text-transform:uppercase;">Specs</div>
               <dl class="detail-grid" style="margin-bottom:0;gap:4px 8px;">
                 <dt style="font-size:0.75rem;color:#666;">Vol/Wt:</dt><dd><span class="editable" data-id="${item.id}" data-field="volume">${item.volume || ''}</span></dd>
                 <dt style="font-size:0.75rem;color:#666;">ABV:</dt><dd><span class="editable" data-id="${item.id}" data-field="abv">${item.abv || ''}</span></dd>
                 <dt style="font-size:0.75rem;color:#666;">IBU:</dt><dd><span class="editable" data-id="${item.id}" data-field="ibu">${item.ibu !== undefined && item.ibu !== "" ? item.ibu : ''}</span></dd>
               </dl>
            </div>
          </div>
        `;
      } else {
        infoHtml = `
          <div style="font-weight:600;font-size:0.95rem;color:#212529;">EN: ${item.name_en || ''}</div>
          <div style="font-size:0.85rem;color:#6c757d;margin-top:2px;">UK: ${item.name_uk || ''}</div>
        `;
      }

      tr.innerHTML = `
        <td style="vertical-align:top;padding-top:1rem;"><img src="${item.image}" alt="" class="table-img" loading="lazy"></td>
        <td style="vertical-align:top;padding-top:1rem;"><strong>${item.id}</strong></td>
        <td style="vertical-align:top;padding-top:1rem; width: 55%;">${infoHtml}</td>
        <td style="vertical-align:top;padding-top:1rem;">
          <span style="display:inline-block;padding:3px 6px;background:#e2e8f0;border-radius:4px;font-size:0.75rem;font-weight:600;color:#334155;">${(item.category || '').toUpperCase()}</span>
        </td>
        <td style="vertical-align:top;padding-top:1rem;font-weight:500;">€${Number(item.price || 0).toFixed(2)}</td>
        <td style="vertical-align:top;padding-top:1rem;font-size:0.85rem;line-height:1.4;" nowrap>
          <div style="margin-bottom:4px;font-weight:500;">
            <span style="color:${item.in_stock ? '#10b981' : '#ef4444'};">●</span> Global
          </div>
        </td>
        <td style="vertical-align:top;padding-top:1rem;">
          <div class="table-actions" style="display:flex;flex-direction:column;gap:0.3rem;">
            <button class="btn btn--sm btn--primary" onclick="editProduct('${item.id}')">Edit</button>
            <button class="btn btn--sm btn--danger" onclick="deleteProduct('${item.id}')">Del</button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // Bind Filters
  searchInput.addEventListener('input', renderTable);
  categoryFilter.addEventListener('change', renderTable);
  btnToggleView.addEventListener('click', () => {
    isDetailedView = !isDetailedView;
    btnToggleView.innerText = isDetailedView ? 'Switch to Compact View' : 'Switch to Detailed View';
    renderTable();
  });

  // Actions
  window.editProduct = (id) => {
    const item = catalog.find(p => p.id === id);
    if (!item) return;
    editingId = id;
    
    const fields = ['id', 'sort_order', 'category', 'subcategory', 'image', 'price', 'volume', 'abv', 'ibu',
      'name_uk', 'name_en', 'name_et', 'name_ru',
      'type_uk', 'type_en', 'type_et', 'type_ru',
      'description_uk', 'description_en', 'description_et', 'description_ru'];
    
    fields.forEach(f => {
      const el = document.getElementById('field-' + f);
      if(el) el.value = item[f] !== undefined ? item[f] : '';
    });

    document.getElementById('field-in_stock').checked = item.in_stock !== false;
    document.getElementById('field-stock_oismae').checked = item.stock_oismae !== false;
    document.getElementById('field-stock_mahtra').checked = item.stock_mahtra !== false;

    document.getElementById('modal-title').innerText = `Edit: ${item.name_en || item.id}`;
    modal.classList.add('open');
  };

  window.deleteProduct = async (id) => {
    if (confirm(`Are you sure you want to delete ${id}?`)) {
      try {
        const res = await fetch(`/api/admin/product/${id}`, { method: 'DELETE' });
        if (res.status === 401) return showLogin();
        if (res.ok) {
          catalog = catalog.filter(p => p.id !== id);
          renderTable();
        }
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  btnAdd.addEventListener('click', () => {
    editingId = null;
    editForm.reset();
    document.getElementById('field-id').value = 'new-' + Date.now();
    document.getElementById('modal-title').innerText = `Add New Product`;
    modal.classList.add('open');
  });

  const closeModal = () => modal.classList.remove('open');
  btnCloseModal.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
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

    if (editingId) {
      updatedProduct.id = editingId;
      try {
        const res = await fetch(`/api/admin/product/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProduct)
        });
        if (res.status === 401) return showLogin();
        if (res.ok) {
          const index = catalog.findIndex(p => p.id === editingId);
          if (index > -1) catalog[index] = { ...catalog[index], ...updatedProduct };
        }
      } catch (err) {
        alert('Update failed');
      }
    } else {
      // Create new
      try {
        const res = await fetch(`/api/admin/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProduct)
        });
        if (res.status === 401) return showLogin();
        if (res.ok) {
          const jsonRes = await res.json();
          catalog.push(jsonRes.product || updatedProduct);
        }
      } catch (err) {
        alert('Add failed');
      }
    }
    closeModal();
    renderTable();
  });

  // --- INLINE EDITING LOGIC ---
  tableBody.addEventListener('dblclick', (e) => {
    // We can use single click or double click. Double click prevents misfires, but I will use
    // single click since the user asked "когда мы включали режим детейлд мы могла прям нажать..."
  });

  tableBody.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('editable')) {
      if (target.querySelector('input, textarea')) return; // Already editing
      
      const currentText = target.innerText;
      const field = target.getAttribute('data-field');
      const id = target.getAttribute('data-id');

      const isTextArea = field.startsWith('description');
      const input = document.createElement(isTextArea ? 'textarea' : 'input');
      if (!isTextArea) input.type = 'text';
      input.value = currentText === 'Edit...' ? '' : currentText;
      input.className = 'inline-edit-input';

      target.innerHTML = '';
      target.appendChild(input);
      input.focus();

      const finishInlineEdit = async () => {
        const newValue = input.value.trim();
        if (newValue === (currentText === 'Edit...' ? '' : currentText)) { // No changes
          target.innerText = newValue || 'Edit...';
          return;
        }

        target.innerText = 'Saving...';
        target.style.color = '#10b981';

        const payload = { [field]: newValue };

        try {
          const res = await fetch(`/api/admin/product/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (res.status === 401) return showLogin();
          
          if (res.ok) {
            // Success
            const idx = catalog.findIndex(p => p.id === id);
            if (idx > -1) catalog[idx][field] = newValue;
            target.innerText = newValue || 'Edit...';
            target.style.color = '#0d6efd'; // saved success color revert
            setTimeout(() => target.style.color = '', 1000);
          } else {
            alert('Failed to save.');
            target.innerText = currentText || 'Edit...';
            target.style.color = '';
          }
        } catch {
          alert('Network error.');
          target.innerText = currentText || 'Edit...';
          target.style.color = '';
        }
      };

      input.addEventListener('blur', finishInlineEdit);
      if (!isTextArea) {
        input.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') input.blur();
          if (ev.key === 'Escape') {
            input.value = currentText; // cancel changes
            input.blur();
          }
        });
      }
    }
  });

  // Start auth check
  checkAuth();
});
