import initCatalog from '../../public/data/catalog.json';

export async function onRequestGet(context) {
  try {
    // 1. Save compiled
    await context.env.DB_KV.put("catalog:compiled", JSON.stringify(initCatalog));
    
    // 2. Create and save index
    const index = initCatalog.map(p => ({
      id: p.id,
      category: p.category || '',
      subcategory: p.subcategory || '',
      in_stock: !!p.in_stock,
      name_en: p.name_en || '',
      name_uk: p.name_uk || '',
      sort_order: p.sort_order || 0
    }));
    await context.env.DB_KV.put("catalog:index", JSON.stringify(index));
    
    // 3. Save individual products
    // We batch promises to avoid taking too long, but KV put takes a fraction of a ms locally.
    const promises = initCatalog.map(product => 
      context.env.DB_KV.put(`product:${product.id}`, JSON.stringify(product))
    );
    await Promise.all(promises);
    
    return new Response("Seeded successfully! You can now access the public site and admin panel.", {
      status: 200
    });
  } catch (err) {
    return new Response("Failed to seed: " + err.message, { status: 500 });
  }
}
