# Portfolio recreate (local)

A local recreation of [sugandhadesigns.me](https://www.sugandhadesigns.me/) as a **static multi-page site** with **dummy images**.

Built to match the original stack: plain HTML + CSS + vanilla JS, packaged with Vite for local dev and Vercel deploy. No React, Ant Design, or Paper.

## Stack

- Vite 6 (MPA)
- Shared `src/styles/main.css` + `src/js/main.js`
- Dummy SVG placeholders under `public/assets/`

## Pages

| Route | File |
| --- | --- |
| `/` | `index.html` |
| `/about` | `about/index.html` |
| `/art` | `art/index.html` |
| `/more-work` | `more-work/index.html` |
| `/work/redesigned-ai-agents` | `work/redesigned-ai-agents/index.html` |
| `/work/redesigned-payment-pages` | `work/redesigned-payment-pages/index.html` |

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

Output is static files in `dist/`.

## Deploy (GitHub + Vercel)

1. Create a GitHub repo and push this project.
2. In Vercel: **Add New Project** → import the repo.
3. Framework preset: **Vite** (or Other). Build command `npm run build`, output `dist`.
4. Deploy.

`vercel.json` enables clean URLs without trailing slashes.

## Before publishing as your portfolio

Replace the scaffold copy, contact links, and case-study writing with your own content. Swap dummy SVGs in `public/assets/` for real images. Do not publish someone else’s case studies as yours.

## Notes

- Analytics (GA / Vercel Insights) are omitted locally.
- Motion follows the original interactions, with light Emil Kowalski polish (`:active` press scale, reduced-motion, hover gating).
