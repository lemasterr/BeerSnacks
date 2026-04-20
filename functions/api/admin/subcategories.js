// ── Admin Subcategories API ──
// POST   → add subcategory to a category
// PUT    → update subcategory (rename, reorder)
// DELETE → remove subcategory from a category

async function getCategories(kv) {
  return await kv.get('site:categories', { type: 'json' }) || [];
}

export async function onRequestPost(context) {
  const ct = context.request.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'Expected JSON body' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  const { category_slug, slug, names } = await context.request.json();

  if (!category_slug || !slug || !slug.match(/^[a-z0-9_]+$/) || slug.length > 32) {
    return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  const categories = await getCategories(context.env.DB_KV);
  const cat = categories.find(c => c.slug === category_slug);
  if (!cat) {
    return new Response(JSON.stringify({ error: 'Category not found' }), {
      status: 404, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (cat.subcategories.includes(slug)) {
    return new Response(JSON.stringify({ error: 'Subcategory already exists' }), {
      status: 409, headers: { 'Content-Type': 'application/json' }
    });
  }

  cat.subcategories.push(slug);
  await context.env.DB_KV.put('site:categories', JSON.stringify(categories));

  // Update translations
  if (names) {
    let trans = await context.env.DB_KV.get('site:translations', { type: 'json' });
    if (trans) {
      for (const lang of Object.keys(names)) {
        if (trans[lang]) {
          if (!trans[lang].subcategories) trans[lang].subcategories = {};
          trans[lang].subcategories[slug] = names[lang];
        }
      }
      await context.env.DB_KV.put('site:translations', JSON.stringify(trans));
    }
  }

  return new Response(JSON.stringify({ success: true, categories }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPut(context) {
  const { category_slug, old_slug, new_slug, names, new_position } = await context.request.json();

  const categories = await getCategories(context.env.DB_KV);
  const cat = categories.find(c => c.slug === category_slug);
  if (!cat) {
    return new Response(JSON.stringify({ error: 'Category not found' }), {
      status: 404, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Rename slug if needed
  if (old_slug && new_slug && old_slug !== new_slug) {
    const idx = cat.subcategories.indexOf(old_slug);
    if (idx !== -1) {
      cat.subcategories[idx] = new_slug;
    }
  }

  // Reorder if position specified
  if (new_position !== undefined) {
    const targetSlug = new_slug || old_slug;
    const idx = cat.subcategories.indexOf(targetSlug);
    if (idx !== -1) {
      cat.subcategories.splice(idx, 1);
      cat.subcategories.splice(new_position, 0, targetSlug);
    }
  }

  await context.env.DB_KV.put('site:categories', JSON.stringify(categories));

  // Update translations
  if (names) {
    let trans = await context.env.DB_KV.get('site:translations', { type: 'json' });
    if (trans) {
      const slug = new_slug || old_slug;
      for (const lang of Object.keys(names)) {
        if (trans[lang]) {
          if (!trans[lang].subcategories) trans[lang].subcategories = {};
          trans[lang].subcategories[slug] = names[lang];
          // Remove old key if renamed
          if (old_slug && new_slug && old_slug !== new_slug && trans[lang].subcategories[old_slug]) {
            delete trans[lang].subcategories[old_slug];
          }
        }
      }
      await context.env.DB_KV.put('site:translations', JSON.stringify(trans));
    }
  }

  return new Response(JSON.stringify({ success: true, categories }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestDelete(context) {
  const url = new URL(context.request.url);
  const category_slug = url.searchParams.get('category');
  const slug = url.searchParams.get('slug');

  if (!category_slug || !slug) {
    return new Response(JSON.stringify({ error: 'Missing parameters' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  const categories = await getCategories(context.env.DB_KV);
  const cat = categories.find(c => c.slug === category_slug);
  if (!cat) {
    return new Response(JSON.stringify({ error: 'Category not found' }), {
      status: 404, headers: { 'Content-Type': 'application/json' }
    });
  }

  cat.subcategories = cat.subcategories.filter(s => s !== slug);
  await context.env.DB_KV.put('site:categories', JSON.stringify(categories));

  return new Response(JSON.stringify({ success: true, categories }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
