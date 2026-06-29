# Magento Mastery — AGENTS.md

**Hugo static site** (v0.163.3 extended, `hugo.toml` at root). Magento 2 freelance portfolio. **No JS build tools, no tests, no CI.**

## Commands

| Goal | Command |
|------|---------|
| Dev server | `hugo server -D` |
| Production build | `hugo --minify` |
| New blog post | `hugo new content/blog/post-name.md` (creates at root `content/`; the theme's `themes/mastery/content/` also contributes) |

Output to `public/` (gitignored).

## Key structural facts

- **Theme** is `themes/mastery/` — THAT is where layouts, assets, and content actually live
- **Homepage layout**: `themes/mastery/layouts/index.html` (NOT `home.html` — that file exists but is unused)
- **CSS**: single file `themes/mastery/assets/css/style.css`, minified + inlined via Hugo Pipes. **No Tailwind** — all custom CSS with custom properties
- **JS**: `assets/js/main.js` (Hugo Pipes, inlined in `<script>`) + `static/js/theme.js` (plain `<script src>`)
- **Pricing section**: rendered by `partials/pricing.html` in `baseof.html` after `<main>` — appears on every page before the footer
- **Icons**: partial at `layouts/partials/icon.html` — invoked as `{{ partial "icon" (dict "name" "icon-name") }}`
- **Config**: root `hugo.toml` overrides `themes/mastery/hugo.toml`; the root has extra menu items (Case Studies, Services) that the theme default lacks
- **`surface` class** had no CSS definition — was added to match `.shell` styling. If adding bento-style cards, check `.shell` / `.surface` carefully

## Content

- **Blog**: posts at `themes/mastery/content/blog/<slug>.md` — currently 13 published. Frontmatter: `title`, `date`, `lastmod`, `draft`, `description`, `summary`, `tags`, `categories`, `keywords`, `slug`. Permalink `/blog/:slug/` (frontmatter `slug` must match, not the filename)
- **Topic clusters**: some posts use `hub` and `pillar` frontmatter fields for a `/blog-guide/` page. Template at `layouts/_default/blog-guide.html`
- **Case studies**: `content/case-studies/` with `_index.md` + `single.html` layout. Array-driven frontmatter (`challenge`, `solution`, `results`)
- **Service pages**: `content/services/<name>.md` with `_index.md` for listing
- Blog listing template at `layouts/blog/list.html` (no hero images — was removed)

## Gotchas & constraints

- **Contact form** uses Formspree with `YOUR_FORM_ID` placeholder — must be replaced for production
- **Pricing cards** link to `/contact/?type=...` → JS in `main.js` pre-fills the subject field via URL param
- **Dark mode** is default; toggle persisted in `localStorage`. Page has `data-theme="dark"` on `<html>`; light mode via `[data-theme="light"]` overrides
- **Analytics** (G-PXSV18RMC2) lazy-loaded after 3s/scroll/click via `partials/analytics.html`; skipped in `hugo server`
- **Speculation rules** (prefetch/prerender) injected only in production builds (`partials/head/js.html`)
- **`hugo server`** excludes analytics, speculation rules, and SEO meta additions — test with `hugo --minify` to see full output
- `main.js` handles: scroll reveal (IntersectionObserver), stat counters, cookie consent, form validation, reading progress bar, TOC active-link tracking, pricing pre-fill, code copy buttons
- **`.claude/settings.local.json`** runs an Impeccable hook after Edit/Write on UI files — review its feedback
- LLMS plain-text output at `/llms.txt` (configured in `hugo.toml` `[outputs]`)

## Design conventions

- Accent color: `#f97316` (orange-500)
- Fonts: Plus Jakarta Sans (Google Fonts, non-blocking load) + JetBrains Mono (local WOFF2)
- All interactive elements need `:focus-visible` styles and proper ARIA attributes
- iOS form inputs must use `font-size: 1rem` minimum (prevents auto-zoom)
