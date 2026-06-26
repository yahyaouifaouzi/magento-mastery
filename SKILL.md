# SKILL: Magento Mastery Hugo Redesign

## Project context
- Hugo static site, source at repo root
- Layouts: `layouts/` (partials in `layouts/partials/`, base in `layouts/_default/`)
- Static assets: `static/` (CSS in `static/css/`, JS in `static/js/`)
- Content: `content/` (pages as `.md` files, blog under `content/blog/`)
- Config: `hugo.toml` or `config.toml`
- CSS is plain CSS (no Tailwind, no SCSS preprocessor unless confirmed)
- Brand accent: `#f97316` (orange), dark background preferred, CSS custom properties already in use
- Google Fonts loaded via Hugo Pipes (self-hosted for PageSpeed)
- GA4 deferred to preserve 100/100 PageSpeed — do NOT break this
- Live site: https://www.magento-mastery.com/

## Design direction for redesign
- Dark-first design: deep navy/charcoal base (`#0f1117` or similar), not pure black
- Orange accent `#f97316` for CTAs, highlights, and decorative elements only
- Clean, editorial typography — large bold headlines, generous line-height
- Subtle depth: soft gradients, thin borders (`1px solid rgba(255,255,255,0.07)`), mild box shadows
- Section rhythm: alternate background shades to create visual flow without color noise
- Sticky transparent nav that gains background on scroll (vanilla JS, no libraries)
- Hero: full-viewport, large headline, animated stat counters (JS on IntersectionObserver)
- Cards: hover lift effect (`transform: translateY(-4px)`), left-border accent on service cards
- Blog list: card grid layout instead of numbered list
- Testimonials: blockquote style with large quotation mark decorators
- CTA sections: full-width with a subtle diagonal or gradient background
- Responsive: mobile-first, hamburger nav on mobile
- Accessibility: WCAG AA contrast on all text, focus-visible outlines, skip-to-content link

## Hugo-specific rules
- Partials live in `layouts/partials/` — edit them, never duplicate logic in page templates
- Use `{{ partial "head.html" . }}` pattern — do not inline styles in base template
- For new CSS: add to `static/css/` and link in `layouts/partials/head.html`
- For new JS: add to `static/js/` and defer-load in `layouts/partials/footer.html`
- Front matter fields to preserve: `title`, `seo_title`, `description`, `date`, all existing schema/OG fields
- Do not modify `content/` files for visual changes — layout/CSS only unless explicitly asked
- Hugo templating: `{{ }}` for logic, `{{- -}}` to trim whitespace, `.Params` for front matter access
- Test locally with `hugo server --disableFastRender` before marking done

## File map (confirm paths before editing)
```
layouts/
  _default/
    baseof.html       ← base template, do not restructure unless asked
    list.html
    single.html
  partials/
    head.html         ← CSS/meta links go here
    header.html       ← nav redesign goes here
    footer.html       ← JS defer loads go here
    hero.html         ← hero section
    services.html     ← services/cards section
    testimonials.html ← client quotes section
    blog-preview.html ← blog cards on homepage
static/
  css/
    main.css          ← primary stylesheet, use CSS custom properties
  js/
    main.js           ← vanilla JS (scroll nav, counters, mobile menu)
```

## CSS custom properties to maintain/extend
```css
:root {
  --color-accent: #f97316;
  --color-bg: #0f1117;
  --color-surface: #1a1d27;
  --color-surface-2: #21253a;
  --color-text: #e2e8f0;
  --color-text-muted: #94a3b8;
  --color-border: rgba(255,255,255,0.07);
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius: 0.75rem;
  --shadow-card: 0 4px 24px rgba(0,0,0,0.3);
  --transition: 0.2s ease;
}
```

## What NOT to do
- Do not install npm packages or change the build pipeline
- Do not add jQuery or any CSS framework
- Do not break the cookie consent banner logic
- Do not change URL structure or slug patterns
- Do not remove structured data / JSON-LD from templates
- Do not use `!important` in CSS
- Do not inline critical CSS unless explicitly asked
