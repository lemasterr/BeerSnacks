export async function onRequestGet(context) {
  let compiledCatalog = await context.env.DB_KV.get("catalog:compiled", { type: "json" });
  if (!compiledCatalog) compiledCatalog = []; 
  
  return new Response(JSON.stringify(compiledCatalog), {
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "no-store" 
    }
  });
}
