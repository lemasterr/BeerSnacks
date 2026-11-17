# Daily database backup

`beersnacks-backup` is a small Cloudflare Worker. Every day at 02:30 UTC it copies the site database
(Cloudflare KV: `catalog:compiled`, `site:categories`, `site:translations`, `site:settings`) into the
private R2 bucket `beersnacks-backups` as `backups/YYYY-MM-DD.json`. The last 60 days are kept.

Deploy after changes: `cd backup-worker && npx wrangler deploy`

Restore one key from a backup (example: catalog from 2026-11-20):

```
npx wrangler r2 object get beersnacks-backups/backups/2026-11-20.json --remote --file backup.json
python3 -c "import json; json.dump(json.load(open('backup.json'))['data']['catalog:compiled'], open('catalog.json','w'), ensure_ascii=False)"
npx wrangler kv key put catalog:compiled --path catalog.json --namespace-id 1673893bd1e04f2380804dc7263ea4b3 --remote
```
