---
title: "Custom Module Packages"
description: "Purpose-built Magento 2 modules for checkout, tax, localisation, catalog, and store-specific business logic. Clean code, upgrade-safe."
label: "custom modules"
hero_title: "Purpose-built modules for <em>your business logic</em>"
summary: "When no extension fits your exact requirement, I build it from scratch — following Magento's native patterns so it installs cleanly, compiles without errors, and survives future upgrades."

stats:
  - num: "<em>0</em>"
    label: "ObjectManager::getInstance() calls in delivered code"
  - num: "<em>100%</em>"
    label: "Modules tested on staging before delivery"

avail_status: "Available for new projects"
avail_sub: "contact me to check the next slot"

features:
  - icon: "💳"
    title: "Checkout & Payment"
    desc: "Custom checkout steps, payment method validation, local gateway integrations (Konnect, Flouci, Paymee), and cart/quote manipulation."
  - icon: "🏷️"
    title: "Tax & Localisation"
    desc: "Country-specific tax logic, Tunisian TVA validation, locale-aware formatting, Arabic/French RTL support, and multi-currency handling."
  - icon: "📋"
    title: "Catalog & EAV"
    desc: "Custom product attributes, attribute sets, catalog rules, tier pricing logic, and product type extensions that survive reindexing."
  - icon: "🔔"
    title: "Observers & Events"
    desc: "Hooking into Magento's event system to react to order placement, customer actions, and admin operations — zero core edits."
  - icon: "🔌"
    title: "Plugins & Interceptors"
    desc: "Before, after, and around plugins to modify third-party extension behaviour cleanly. I don't edit vendor source code."
  - icon: "🗂️"
    title: "Admin UI Components"
    desc: "Custom grids, forms, and UI components in the Magento Admin using ui_component XML, DataProviders, and mass actions."

process:
  - title: "Requirement analysis"
    desc: "I translate your business requirement into a Magento architecture decision — plugin vs observer vs new entity — before any code is written."
  - title: "Module scaffold"
    desc: "Proper module structure from day one: registration.php, module.xml, di.xml, and all required interfaces."
  - title: "Development with previews"
    desc: "Iterative development with early functional previews. You test against real data, not mock fixtures."
  - title: "Unit & integration tests"
    desc: "PHPUnit tests for business logic. Integration tests for database interactions where coverage matters most."
  - title: "Composer package delivery"
    desc: "Delivered as a proper Composer package, ready to install via your private Satis repository or direct path repository."

why:
  - icon: "🏗️"
    title: "Architecture first"
    desc: "I choose the right Magento pattern before writing a line. Plugin vs observer vs preference — the wrong choice costs you later."
  - icon: "🔄"
    title: "Upgrade-safe by design"
    desc: "No core file edits, no preference rewrites unless necessary. Your store updates without breaking custom logic."
  - icon: "🌐"
    title: "Multilingual & RTL ready"
    desc: "Built with i18n in mind from the start. Arabic, French, and English — including admin UI labels and validation messages."
  - icon: "📦"
    title: "Proper Composer packaging"
    desc: "Every module delivered as a Composer package with semantic versioning. Drop it in your private Satis repo and install normally."

testimonial:
  quote: "The custom TVA validation module saved us hours of manual order checks every week. It handles edge cases we didn't even think of, and the code is clean enough that our team can maintain it."
  initials: "SA"
  name: "Sami A."
  role: "Technical Lead, Tunisian retail group"

stack:
  - "PHP 8.2 / 8.3"
  - "Magento 2.4.x"
  - "Plugin / Observer system"
  - "Dependency Injection"
  - "EAV Architecture"
  - "ui_component XML"
  - "RequireJS / AMD"
  - "Alpine.js (Hyva)"
  - "Breeze / Luma"
  - "PHPUnit"
  - "Composer"
  - "GraphQL"
  - "REST API"
  - "Less / BEM"

faq:
  - q: "Can you override a third-party extension without editing its source?"
    a: "Yes — that's what plugins and preferences are for. I can intercept methods from any installed extension and modify their behaviour without touching a file in vendor/. This keeps your setup upgrade-safe."
  - q: "Do you build modules that work with Breeze or Hyva themes?"
    a: "Yes. I work on Breeze Evolution regularly and have built Alpine.js-compatible module frontends for Hyva. RequireJS AMD is fine for standard Luma setups."
  - q: "What format is the deliverable?"
    a: "A proper Composer package with a composer.json, registration.php, README, and inline DocBlocks. You can install it via a path repository locally or add it to your private Satis server for team use."
  - q: "Can you build something that also has an admin configuration panel?"
    a: "Yes. System configuration (system.xml), admin grids, and custom admin pages using ui_component are all standard parts of my module development work."

cta_title: "Have a module idea?"
cta_desc: "Describe the business problem — not the technical solution — and I'll tell you the cleanest Magento 2 pattern to build it with. Response within 24 hours."

related:
  - icon: "🧩"
    title: "Magento 2 Development"
    desc: "Full-stack development including themes, integrations, and architecture decisions."
    url: "/services/magento-2-development/"
  - icon: "⚡"
    title: "Performance Optimization"
    desc: "FPC audit, Varnish VCL, slow query elimination, and Core Web Vitals improvement."
    url: "/services/performance-optimization/"
  - icon: "📦"
    title: "Migration & Upgrades"
    desc: "Version upgrades with compatibility review, data migration, and post-launch stabilisation."
    url: "/services/migration/"
---

## What makes a Magento module "good"

A good Magento module doesn't touch the core, doesn't use `ObjectManager::getInstance()`, and doesn't break when you run `bin/magento setup:di:compile`.

It uses the right patterns: plugins for modifying existing behaviour, observers for reacting to events, and proper service contracts for shared logic. That's what I build.

## Module types I've shipped

From Tunisian TVA validation mixins to full custom checkout flows, Cloudflare Turnstile reCAPTCHA integration, international telephone input with per-context toggles, and blog plugin overrides on top of Mageplaza. If it's Magento 2 PHP and needs to be custom, I've probably built something similar.