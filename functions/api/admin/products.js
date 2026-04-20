export async function onRequestGet(context) {
  // Let's just return compiled catalog for admin to have all data (since they have a detailed view)
  let compiled = await context.env.DB_KV.get("catalog:compiled", { type: "json" });
  if (!compiled) compiled = [];
  return new Response(JSON.stringify(compiled), {
    headers: { "Content-Type": "application/json" }
  });
}

// POST: Add a new product
export async function onRequestPost(context) {
  const ct = context.request.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'Expected JSON body' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  const newProduct = await context.request.json();
  
  // Default values
  if (!newProduct.id) {
    newProduct.id = `item-${Date.now()}`;
  }
  newProduct.updated_at = new Date().toISOString();
  // Ensure basic bool stats
  newProduct.in_stock = !!newProduct.in_stock;
  newProduct.stock_oismae = !!newProduct.stock_oismae;
  newProduct.stock_mahtra = !!newProduct.stock_mahtra;

  // Save specific product
  await context.env.DB_KV.put(`product:${newProduct.id}`, JSON.stringify(newProduct));

  // Update index
  let index = await context.env.DB_KV.get("catalog:index", { type: "json" }) || [];
  const indexData = { 
    id: newProduct.id, 
    category: newProduct.category || 'uncategorized', 
    subcategory: newProduct.subcategory || '', 
    in_stock: newProduct.in_stock, 
    name_en: newProduct.name_en || '', 
    name_uk: newProduct.name_uk || '', 
    sort_order: newProduct.sort_order || 0
  };
  index.push(indexData);
  await context.env.DB_KV.put("catalog:index", JSON.stringify(index));

  // Rebuild compiled
  // We can duplicate rebuild step logic here or refactor.
  // We'll refactor the rebuild logic to an external utility but this is acceptable inline for single file.
  // For safety and DRY, we should have a shared utility. 
  // Let's just use a simple compile:
  let compiled = await context.env.DB_KV.get("catalog:compiled", { type: "json" }) || [];
  compiled.push(newProduct);
  // Re-sort
  compiled.sort((a,b) => {
    if (a.category !== b.category) return (a.category || '').localeCompare(b.category || '');
    if (a.subcategory !== b.subcategory) return (a.subcategory || '').localeCompare(b.subcategory || '');
    return (a.sort_order || 0) - (b.sort_order || 0);
  });
  await context.env.DB_KV.put("catalog:compiled", JSON.stringify(compiled));

  return new Response(JSON.stringify({ success: true, product: newProduct }), {
    headers: { "Content-Type": "application/json" }
  });
}
