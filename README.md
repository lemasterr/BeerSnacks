# Beer&Snacks

Bilingual-plus catalog for a beer and snack shop: a fast static storefront and a small CRM-style admin, running entirely on Cloudflare's free tier.

**Live:** [beersnacks.pages.dev](https://beersnacks.pages.dev)

## Features

- **Storefront** — shelf-style layout, instant search, product cards, an "open now" status, light and dark themes.
- **Four languages** — Ukrainian, English, Estonian and Russian for products, categories and UI.
- **Flexible pricing** — per item, per kg or per 100 g, and two prices for draft drinks (0.5 l and 1 l).
- **Admin** — one product table with inline price edits, stock toggles and per-store availability; drag-and-drop photo upload with in-browser WebP compression; filters for missing photos, unchecked prices and out-of-stock items; bulk actions; category translations and site settings.
- **Light on bandwidth** — product imagery is WebP, and the whole catalog arrives in one cached `/api/site` request.

## Architecture

| Part | Where | Notes |
| --- | --- | --- |
| Storefront and admin UI | [`public/`](public/) | Plain HTML, CSS and JavaScript |
| API | [`functions/api/`](functions/api/) | Cloudflare Pages Functions: catalog, categories, translations, auth and admin routes |
| Catalog data | Cloudflare KV | A single compiled catalog key plus categories, translations and settings |
| Uploaded photos | Cloudflare R2 | Served through the site at `/media/<name>` |
| Static fallback | [`public/data/`](public/data/) | Catalog JSON used by preview builds without a database |
| Content pipeline | [`pipeline/`](pipeline/) | Python and Node tools that build the catalog and cut out product photos |

Security basics are built in: session-based admin login with rate limiting, CSRF protection, validated product fields and no SVG uploads.

## Local development

```bash
npm install
npx wrangler login
cp wrangler.toml.example wrangler.toml   # fill in your KV namespace id
echo "ADMIN_PASSWORD=local-only-password" > .dev.vars
npm run dev
```

The dev server uses a local copy of KV under `.wrangler/state`. To load the bundled catalog into it:

```bash
npx wrangler kv key put catalog:compiled --path public/data/catalog.json --binding DB_KV --local
```

## Deployment

Every push to `main` is published by Cloudflare Pages; any other branch gets a preview at `https://<branch>.beersnacks.pages.dev` (static catalog only, no admin). Manual deploy: `npm run deploy`.

Project status and open content tasks are tracked in [`HANDOFF.md`](HANDOFF.md).
