// Helper function to rebuild the compiled catalog from the index
async function rebuildCatalogCompiled(db_kv) {
  const index = await db_kv.get("catalog:index", { type: "json" }) || [];
  
  // We fetch all product:<id> from KV in parallel
  // Cloudflare Workers allow subrequests. For large catalogs, KV .list() + KV .get() 
  // might be needed, but since we know all IDs from index, we can just fetch them concurrently.
  // Note: doing too many concurrent KV gets might hit limits (1000/sec), batching is safe.
  
  let compiled = [];
  const batchSize = 50;
  for (let i = 0; i < index.length; i += batchSize) {
    const batch = index.slice(i, i + batchSize);
    const promises = batch.map(item => db_kv.get(`product:${item.id}`, { type: "json" }));
    const results = await Promise.all(promises);
    
    results.forEach((product) => {
      if (product) {
        compiled.push(product);
      }
    });
  }
  
  // Sort compiled according to index (or just based on subcategory / sort_order logic)
  compiled.sort((a,b) => {
    if (a.category !== b.category) return (a.category || '').localeCompare(b.category || '');
    if (a.subcategory !== b.subcategory) return (a.subcategory || '').localeCompare(b.subcategory || '');
    return (a.sort_order || 0) - (b.sort_order || 0);
  });
  
  await db_kv.put("catalog:compiled", JSON.stringify(compiled));
}

export async function onRequestPut(context) {
  const productId = context.params.id;
  const updates = await context.request.json();
  
  let product = await context.env.DB_KV.get(`product:${productId}`, { type: "json" });
  if (!product) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  
  // Update it
  const updatedProduct = { ...product, ...updates, updated_at: new Date().toISOString() };
  await context.env.DB_KV.put(`product:${productId}`, JSON.stringify(updatedProduct));
  
  // Update index
  let index = await context.env.DB_KV.get("catalog:index", { type: "json" }) || [];
  const idxPos = index.findIndex(p => p.id === productId);
  const indexData = { 
    id: updatedProduct.id, 
    category: updatedProduct.category, 
    subcategory: updatedProduct.subcategory, 
    in_stock: updatedProduct.in_stock, 
    name_en: updatedProduct.name_en, 
    name_uk: updatedProduct.name_uk, 
    sort_order: updatedProduct.sort_order 
  };
  if (idxPos !== -1) {
    index[idxPos] = indexData;
  } else {
    index.push(indexData);
  }
  await context.env.DB_KV.put("catalog:index", JSON.stringify(index));
  
  // Rebuild compiled
  await rebuildCatalogCompiled(context.env.DB_KV);
  
  return new Response(JSON.stringify({ success: true, updatedProduct }), {
    headers: { "Content-Type": "application/json" }
  });
}

export async function onRequestDelete(context) {
  const productId = context.params.id;
  
  // Delete from products
  await context.env.DB_KV.delete(`product:${productId}`);
  
  // Update index
  let index = await context.env.DB_KV.get("catalog:index", { type: "json" }) || [];
  index = index.filter(p => p.id !== productId);
  await context.env.DB_KV.put("catalog:index", JSON.stringify(index));
  
  // Rebuild compiled
  await rebuildCatalogCompiled(context.env.DB_KV);
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
