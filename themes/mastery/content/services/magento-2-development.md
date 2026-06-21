---
title: "Magento 2 Development"
description: "Custom Magento 2 development: modules, themes, integrations, and architecture. Built to Magento standards, tested in production."
label: "magento 2 development"
hero_title: "Magento 2 development that <em>survives upgrades</em>"
summary: "Full-stack Magento 2 development for merchants who need more than a plugin. From architecture decisions to production deployment — built to Magento's native patterns."

stats:
  - num: "<em>50+</em>"
    label: "Modules shipped across Magento 2.3–2.4"
  - num: "<em>24h</em>"
    label: "Response time on new project inquiries"

avail_status: "Available for new projects"
avail_sub: "contact me to check the next slot"

features:
  - icon: "🧩"
    title: "Custom Module Development"
    desc: "Business logic built as proper Magento 2 modules — DI, plugins, observers, EAV, layout XML, RequireJS. No hacks, no ObjectManager shortcuts."
  - icon: "🎨"
    title: "Theme & Frontend"
    desc: "Custom themes on top of Hyva or Breeze Evolution. LESS/BEM architecture, responsive, accessible, and optimised for Core Web Vitals."
  - icon: "🔗"
    title: "API & Integrations"
    desc: "REST and GraphQL integrations with payment gateways, ERPs, CRMs, and shipping providers. Clean service layer, proper error handling."
  - icon: "🛠️"
    title: "Debugging & Code Audit"
    desc: "Systematic production debugging: DI compilation errors, layout conflicts, JS errors, observer conflicts, and performance regressions."
  - icon: "🗄️"
    title: "Admin UI Components"
    desc: "Custom grids, forms, and UI components in the Magento Admin using ui_component XML and DataProviders — with proper ACL."
  - icon: "🔒"
    title: "Security & Best Practices"
    desc: "Code that passes Magento marketplace standards: no SQL injection, proper ACL, CSP headers, and input sanitisation."

process:
  - title: "Discovery call"
    desc: "We discuss the requirement, existing codebase, and constraints. I ask the questions that turn a vague request into a precise scope."
  - title: "Written scope & fixed price"
    desc: "Detailed scope with timeline and fixed price — or hourly for open-ended audits. No estimates that balloon mid-project."
  - title: "Development with early previews"
    desc: "Code in a dedicated branch, regular progress updates, and early functional previews on your staging environment."
  - title: "Testing & review"
    desc: "PHPUnit tests for business logic, manual QA on staging, and a code walkthrough for your team if needed."
  - title: "Composer package delivery"
    desc: "Delivered as a proper Composer package with DocBlocks, a README, and deployment docs. Ready for your private Satis repo."

why:
  - icon: "⚙️"
    title: "No ObjectManager abuse"
    desc: "Every dependency is injected through constructors. Your module compiles clean and stays clean on the next upgrade."
  - icon: "🧪"
    title: "Tested before delivery"
    desc: "I don't ship without staging validation. No exceptions — even 'simple' modules are where assumptions usually break."
  - icon: "📖"
    title: "Documented for your team"
    desc: "Inline DocBlocks, a technical README, and a handoff call if your team needs to own the code going forward."
  - icon: "🌍"
    title: "MENA market experience"
    desc: "Tunisian and North African e-commerce specifics: Arabic RTL, TVA logic, local payment gateways, and bilingual admin UIs."

testimonial:
  quote: "Faouzi rebuilt our entire checkout flow as a custom Magento 2 module. Clean code, delivered on time, and it survived our 2.4.6 → 2.4.7 upgrade without a single conflict."
  initials: "MK"
  name: "Mohamed K."
  role: "CTO, e-commerce platform · Tunisia"

stack:
  - "PHP 8.2 / 8.3"
  - "Magento 2.4.x"
  - "Dependency Injection"
  - "Plugin / Observer system"
  - "EAV Architecture"
  - "ui_component XML"
  - "RequireJS / AMD"
  - "Breeze Evolution"
  - "Hyva Theme"
  - "Less / BEM"
  - "PHPUnit"
  - "GraphQL"
  - "REST API"
  - "Composer"

faq:
  - q: "How long does a typical module take?"
    a: "Depends on complexity. A simple observer or admin grid takes 1–3 days. A full checkout flow or ERP integration takes 2–4 weeks. I'll give you a clear timeline estimate before any work starts."
  - q: "Do you work with existing codebases, or only greenfield?"
    a: "Mostly existing codebases. I'm comfortable reading unfamiliar Magento setups and working within their constraints — including overriding third-party extension behaviour without touching vendor source."
  - q: "What if I need changes after delivery?"
    a: "Small corrections within scope are included. Larger changes or new requirements are scoped and quoted separately. I'm available for ongoing retainer arrangements for stores that need regular development."
  - q: "Do you work with Hyva or Breeze themes?"
    a: "Yes. I work on Breeze Evolution regularly and have shipped modules with Alpine.js frontends for Hyva. RequireJS AMD modules are fine for standard Luma-based setups too."

cta_title: "Have a Magento project in mind?"
cta_desc: "Describe the business problem — not the technical solution — and I'll tell you the cleanest way to build it. Response within 24 hours."

related:
  - icon: "⚡"
    title: "Performance Optimization"
    desc: "FPC audit, Varnish VCL, slow query elimination, and Core Web Vitals improvement."
    url: "/services/performance-optimization/"
  - icon: "📦"
    title: "Migration & Upgrades"
    desc: "Version upgrades with full compatibility review, data migration, and post-launch stabilisation."
    url: "/services/migration/"
  - icon: "🖥️"
    title: "VPS Optimization"
    desc: "PHP-FPM tuning, Redis/Varnish setup, Nginx config, and server hardening."
    url: "/services/vps-optimization/"
---

## Why custom development?

Off-the-shelf extensions solve 80% of problems. Custom development solves the remaining 20% — the part that defines your store's competitive edge.

I've built modules for Tunisian tax logic, custom checkout flows, Cloudflare Turnstile integration, ERP connections, and store-specific catalog behaviour. Every project follows Magento's native patterns, which means your codebase survives upgrades.

## What I don't do

I don't use `ObjectManager` directly. I don't write raw SQL. I don't ship without testing on staging. If you've had bad experiences with developers who cut these corners, I understand — and I work differently.