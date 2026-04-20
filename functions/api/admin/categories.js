// ── Admin Categories API ──
// GET  → return full categories structure + translations
// POST → add new category
// PUT  → update full categories structure (reorder, rename)

const DEFAULT_CATEGORIES = [
  { slug: 'beer', sort_order: 0, subcategories: ['all','ukraine','poland','czech','germany','estonia'] },
  { slug: 'cider', sort_order: 1, subcategories: ['all','fruit_cider','berry_cider','non_alc_cider'] },
  { slug: 'drinks', sort_order: 2, subcategories: ['all','juices','sodas','water','energy','tea_coffee'] },
  { slug: 'sweets', sort_order: 3, subcategories: ['all','candies','dragee','wafers','desserts','cakes'] },
  { slug: 'snacks', sort_order: 4, subcategories: ['all','chips','crackers','seeds','seafood','nuts'] }
];

async function getCategories(kv) {
  let cats = await kv.get('site:categories', { type: 'json' });
  if (!cats) {
    cats = DEFAULT_CATEGORIES;
    await kv.put('site:categories', JSON.stringify(cats));
  }
  return cats;
}

async function getTranslations(kv) {
  let trans = await kv.get('site:translations', { type: 'json' });
  if (!trans) {
    // Try to read from static file fallback — but since we're in Workers,
    // we'll use the hardcoded defaults that match translations.json
    trans = null;
  }
  return trans;
}

export async function onRequestGet(context) {
  const categories = await getCategories(context.env.DB_KV);
  const translations = await getTranslations(context.env.DB_KV);

  return new Response(JSON.stringify({ categories, translations }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost(context) {
  const ct = context.request.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'Expected JSON body' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  const body = await context.request.json();
  const { slug, sort_order, subcategories, names } = body;

  if (!slug || !slug.match(/^[a-z0-9_]+$/) || slug.length > 32) {
    return new Response(JSON.stringify({ error: 'Invalid slug. Use lowercase letters, numbers, underscores (max 32 chars).' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  const categories = await getCategories(context.env.DB_KV);

  // Check duplicate
  if (categories.find(c => c.slug === slug)) {
    return new Response(JSON.stringify({ error: 'Category already exists' }), {
      status: 409, headers: { 'Content-Type': 'application/json' }
    });
  }

  const newCat = {
    slug,
    sort_order: sort_order !== undefined ? Number(sort_order) : categories.length,
    subcategories: subcategories || ['all']
  };
  categories.push(newCat);
  categories.sort((a, b) => a.sort_order - b.sort_order);
  await context.env.DB_KV.put('site:categories', JSON.stringify(categories));

  // Update translations if names provided
  if (names) {
    let trans = await context.env.DB_KV.get('site:translations', { type: 'json' });
    if (trans) {
      for (const lang of Object.keys(names)) {
        if (trans[lang]) {
          if (!trans[lang].categories) trans[lang].categories = {};
          trans[lang].categories[slug] = names[lang];
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
  const body = await context.request.json();
  const { categories, translations } = body;

  if (categories && Array.isArray(categories)) {
    // Re-assign sort_order based on array position
    categories.forEach((cat, i) => { cat.sort_order = i; });
    await context.env.DB_KV.put('site:categories', JSON.stringify(categories));
  }

  if (translations && typeof translations === 'object') {
    await context.env.DB_KV.put('site:translations', JSON.stringify(translations));
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestDelete(context) {
  const url = new URL(context.request.url);
  const slug = url.searchParams.get('slug');

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug parameter' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  let categories = await getCategories(context.env.DB_KV);
  categories = categories.filter(c => c.slug !== slug);
  categories.forEach((cat, i) => { cat.sort_order = i; });
  await context.env.DB_KV.put('site:categories', JSON.stringify(categories));

  // Remove from translations
  let trans = await context.env.DB_KV.get('site:translations', { type: 'json' });
  if (trans) {
    for (const lang of Object.keys(trans)) {
      if (trans[lang].categories) delete trans[lang].categories[slug];
      if (trans[lang].subcategories) {
        // We don't remove subcategory translations — they might be reused
      }
    }
    await context.env.DB_KV.put('site:translations', JSON.stringify(trans));
  }

  return new Response(JSON.stringify({ success: true, categories }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
