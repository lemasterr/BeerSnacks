# BeerSnacks

A bilingual beer and snack catalog with a browser-based administration interface. The public catalog runs as a static site. A separate Cloudflare Pages Functions backend provides catalog editing and image upload.

| Path | Contents |
| --- | --- |
| [`public/`](public/) | Storefront, admin UI, product imagery, and static catalog data |
| [`functions/api/`](functions/api/) | Catalog, authentication, and admin API routes |
| [`package.json`](package.json) | Local development scripts |

## Local development

Install the locked dependencies with `npm ci` and run `npm run dev`. Use local bindings for the admin backend. The GitHub Pages build serves static files and does not provide the admin API.

This branch documents the existing catalog. The default branch is the source for the current [GitHub Pages site](https://lemasterr.github.io/BeerSnacks/).
