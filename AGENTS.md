# Magento Mastery — AGENTS.md

This is a **Hugo static site** (v0.163.3 extended) for a Magento 2 freelance portfolio. No JS build tools, no tests, no CI.

## Quick commands

| Goal | Command |
|------|---------|
| Dev server | `hugo server -D` |
| Production build | `hugo --minify` |
| Create new blog post | `hugo new blog/post-name.md` |

Output goes to `/public` (gitignored).

## Key structure

- **Theme**: `themes/mastery/` — all layouts, assets, content live here
- **Content**: `themes/mastery/content/` (no root `content/` directory)
- **CSS**: `themes/mastery/assets/css/style.css` — single file, Hugo Pipes minify + inline
- **JS**: `themes/mastery/assets/js/main.js` (Hugo Pipes) + `themes/mastery/static/js/theme.js` (plain `<script>`)
- **Fonts**: Plus Jakarta Sans (Google Fonts, loaded in `partials/head/css.html`), JetBrains Mono (local WOFF2)
- **Icons**: custom SVG partial at `layouts/partials/icon.html`
- **Config**: `hugo.toml` (root) + `themes/mastery/hugo.toml` (theme defaults)

## Content conventions

- Blog posts: `themes/mastery/content/blog/<slug>.md`
  - Frontmatter uses: `title`, `date`, `lastmod`, `draft`, `description`, `summary`, `tags`, `categories`, `keywords`, `slug`
  - Permalink: `/blog/:slug/` (note: `slug` in frontmatter must match, not the filename)
- Service pages: `themes/mastery/content/services/<name>.md` — uses `_index.md` for listing
- Portfolio, contact, legal: flat Markdown files at `themes/mastery/content/`
- Taxonomy: categories and tags with `_index.md` pages for descriptions
- Dark mode default; toggle persisted in `localStorage`

## Agent workflow notes

- **Design quality**: `.claude/settings.local.json` runs an Impeccable hook after edits. Review its feedback.
- **Analytics**: Google Analytics (`G-PXSV18RMC2`), lazy-loaded after 3s/scroll/click. Excluded in `hugo server` (dev mode).
- **LLMS output**: custom plain-text output for AI consumption at `/llms.txt` (configured in `hugo.toml`)
- **Speculation rules**: prefetch/prerender injected only in production builds (`partials/head/js.html`)
- **No README** in repo; the site is the documentation.
