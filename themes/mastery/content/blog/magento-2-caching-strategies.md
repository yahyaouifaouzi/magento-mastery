---
title: "Magento 2 Caching Strategies: Full Guide (2026)"
seo_title: "Magento 2 Caching Strategies Guide | Magento Mastery"
date: 2026-06-29
lastmod: 2026-06-29
draft: false
author: "Faouzi Yahyaoui"
description: "Complete guide to Magento 2 caching strategies — full-page cache, Varnish, Redis, cache tagging, private content, and hole punching for production stores."
summary: "Master Magento 2 caching from FPC to Varnish to Redis. Learn cache tagging, hole punching, private content, and how to achieve 90%+ cache hit rates in production."
tags: ["magento 2", "caching", "varnish", "redis", "full-page cache", "performance optimization", "e-commerce"]
categories: ["Magento 2", "Performance"]
keywords: ["magento 2 caching", "magento 2 varnish", "magento 2 redis cache", "magento 2 full page cache", "magento 2 cache tagging", "magento 2 private content", "magento 2 hole punch"]
slug: "magento-2-caching-strategies"
hub: "performance"
pillar: true
---

Caching is the single highest-impact performance lever in Magento 2. A properly configured cache stack delivers pages in single-digit milliseconds, reduces server load by 90%+, and dramatically improves Core Web Vitals scores. This guide covers the full caching architecture — built-in Magento cache, full-page cache (FPC), Varnish, Redis, cache tagging, private content, and hole punching — with production configurations and tuning tips.

> **In short:** Magento 2 has a layered cache architecture: configuration cache (files or Redis), full-page cache (built-in or Varnish), and application-level caches (block HTML, layout, translations, etc.). Each layer serves a different purpose, and each needs specific configuration to work efficiently in production.

## Table of Contents

1. [Magento 2 Cache Architecture Overview](#magento-2-cache-architecture-overview)
2. [Configuration & Application Caches (cache.xml)](#configuration--application-caches-cachexml)
3. [Full-Page Cache: Built-in vs Varnish](#full-page-cache-built-in-vs-varnish)
4. [Varnish Configuration for Magento 2](#varnish-configuration-for-magento-2)
5. [Redis as Session & Cache Backend](#redis-as-session--cache-backend)
6. [Cache Tagging and Invalidation](#cache-tagging-and-invalidation)
7. [Private Content and Hole Punching](#private-content-and-hole-punching)
8. [Cache-Related Indexers and Their Impact](#cache-related-indexers-and-their-impact)
9. [Common Caching Pitfalls in Production](#common-caching-pitfalls-in-production)
10. [FAQ](#faq)

## Magento 2 Cache Architecture Overview

Magento 2 uses a multi-layered cache system:

```
                     ┌─────────────────────────┐
                     │  Varnish (or Built-in FPC)│
                     │  Full-page HTML cache    │
                     └─────────────────────────┘
                                │
                     ┌─────────────────────────┐
                     │  Redis (config/default)  │
                     │  Sessions, cache data    │
                     └─────────────────────────┘
                                │
                     ┌─────────────────────────┐
                     │  File System Cache       │
                     │  Generated files, static │
                     └─────────────────────────┘
```

Each layer has its own caching strategy, TTL, and invalidation mechanism. A page request typically checks Varnish first (which serves cached HTML in microseconds), then falls through to Magento (which checks Redis-backed caches), and finally to the database as a last resort.

## Configuration & Application Caches (cache.xml)

Magento defines cache types in `app/etc/di.xml` and modules can declare custom caches via `etc/cache.xml`:

```xml
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:Cache/etc/cache.xsd">
    <type name="my_custom_cache" translate="label,description">
        <label>My Custom Cache</label>
        <description>Stores precomputed data for custom features</description>
    </type>
</config>
```

You can manage all cache types from the CLI:

```bash
# List all cache types and their status
bin/magento cache:status

# Enable/disable specific types
bin/magento cache:enable block_html layout
bin/magento cache:disable full_page

# Clean (flush) specific cache types
bin/magento cache:clean config layout block_html

# Flush all cache storage (Redis + filesystem)
bin/magento cache:flush
```

The most important cache types for performance:

| Cache type | What it stores | Impact if disabled |
|------------|---------------|-------------------|
| `config` | Merged XML config from all modules | Every request re-reads and merges XML |
| `layout` | Compiled layout handles and XML | Every request recompiles layout |
| `block_html` | Rendered block output (child of FPC) | FPC still works but inner blocks re-render |
| `full_page` | Fully rendered HTML pages | Every request is a full Magento bootstrap |
| `translate` | Translation dictionaries | Translations loaded from files on every request |

## Full-Page Cache: Built-in vs Varnish

Magento 2 ships with two FPC implementations.

**Built-in FPC** (`Magento_PageCache`): Stores cached HTML in the default cache backend (usually Redis). Good for single-server setups or environments where Varnish is unavailable (shared hosting, some PaaS platforms). Performance is decent but not optimal.

**Varnish**: An HTTP accelerator that serves cached pages before they reach Magento. It's faster because it operates at the HTTP level — no PHP execution, no framework bootstrap. Adobe officially recommends Varnish for production.

Switch between them in `app/etc/env.php`:

```php
'http_cache_hosts' => [
    [
        'host' => '127.0.0.1',
        'port' => '80',
    ]
],
```

When Varnish hosts are configured, Magento disables its built-in FPC and sends `Cache-Control` headers for Varnish to interpret.

## Varnish Configuration for Magento 2

Magento generates a Varnish VCL for you:

```bash
bin/magento varnish:vcl:generate --export-version=7 > default.vcl
```

Key Varnish settings for Magento:

```
vcl 4.1;

backend default {
    .host = "127.0.0.1";
    .port = "8080";
}

sub vcl_recv {
    # Never cache admin, checkout, or customer pages
    if (req.url ~ "^/(admin|customer|checkout|sales)") {
        return (pass);
    }

    # Purge on cache cleaning
    if (req.method == "PURGE") {
        if (client.ip ~ purge_acl) {
            return (purge);
        }
        return (synth(405));
    }

    # Strip cookies for static content
    if (req.url ~ "^/(pub/)?(media|static)/") {
        unset req.http.cookie;
        return (hash);
    }

    # Strip GA cookies before cache lookup
    if (req.http.cookie) {
        set req.http.cookie = regsuball(req.http.cookie, "__utm[^=]+=[^;]+(; )?", "");
        if (req.http.cookie == "") {
            unset req.http.cookie;
        }
    }

    return (hash);
}
```

Monitor cache hit rate with `varnishstat`. A well-tuned Magento 2 store should achieve **90–95% cache hit rate**.

## Redis as Session & Cache Backend

Redis is the recommended cache and session backend for production Magento 2 stores. Configure it in `app/etc/env.php`:

```php
'session' => [
    'save' => 'redis',
    'redis' => [
        'host' => '127.0.0.1',
        'port' => '6379',
        'database' => 0
    ]
],
'cache' => [
    'frontend' => [
        'default' => [
            'backend' => 'Cm_Cache_Backend_Redis',
            'backend_options' => [
                'server' => '127.0.0.1',
                'port' => '6379',
                'database' => 1
            ]
        ],
        'page_cache' => [
            'backend' => 'Cm_Cache_Backend_Redis',
            'backend_options' => [
                'server' => '127.0.0.1',
                'port' => '6379',
                'database' => 2,
                'compress_data' => '1'
            ]
        ]
    ]
]
```

Database separation is critical — sessions (0), default cache (1), and page cache (2) should never share the same Redis database. The page cache backend benefits from compression (`compress_data: 1`) since it stores full HTML blocks.

## Cache Tagging and Invalidation

Magento 2 uses a sophisticated cache tagging system. Every cached piece of content — block HTML, full page, layout output — is tagged with identifiers that describe what it depends on:

- A category page is tagged with `cat_c_{category_id}`
- A product page is tagged with `cat_p_{product_id}`
- Block HTML is tagged with its block class and template

When you save a product or category, Magento clears only the caches tagged with that entity's ID — not the entire cache storage. This is why `cache:clean` scoped by tag is faster than `cache:flush`.

You can extend cache tagging in custom modules:

```php
$cacheKey = 'my_module_data_' . $id;
$tags = ['my_module', 'my_module_' . $id];
$this->cache->save($data, $cacheKey, $tags);
```

Then invalidate by tag:

```php
$this->cache->clean(\Zend_Cache::CLEANING_MODE_MATCHING_ANY_TAG, ['my_module_42']);
```

## Private Content and Hole Punching

Pages served from the FPC cannot contain customer-specific content — the same cached HTML must be suitable for all visitors. Magento solves this with **private content** and **hole punching**.

**Private content** is loaded asynchronously via AJAX after the page loads. Customer data (cart items, wishlist, compare products) is fetched from `/customer/section/load` and injected into the DOM by `Magento_Customer/js/section-config` and `Magento_Customer/js/customer-data`.

**Hole punching** is handled automatically by Magento's `$_isScopePrivate` flag. Blocks marked as private are excluded from the FPC and rendered dynamically:

```php
protected $_isScopePrivate = true;
```

Customer sections in `etc/sections.xml`:

```xml
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:module:Magento_Customer:etc/sections.xsd">
    <action name="checkout/cart/add">
        <section name="cart"/>
    </action>
</config>
```

This tells Magento to refresh the `cart` customer section after a product is added — ensuring the mini-cart updates without invalidating the full page cache.

## Cache-Related Indexers and Their Impact

Indexers and caches are closely related. Indexers precompute data that the cache layer then stores for fast retrieval:

| Indexer | Cache relationship | Impact |
|---------|-------------------|--------|
| `catalog_product_price` | Product price cache depends on this | Stale index → wrong prices cached |
| `catalog_category_product` | Category page cache depends on index | Stale index → missing products in cached pages |
| `catalogsearch_fulltext` | Search results cache | Stale index → outdated search results |

When an indexer runs (via `bin/magento indexer:reindex`), related cache tags are automatically invalidated. This is why reindexing triggers a cache clean — but only for affected entities, not the entire cache pool.

## Common Caching Pitfalls in Production

1. **Not separating Redis databases.** Sessions, default cache, and page cache on the same Redis database causes eviction pressure and mixed data.

2. **Varnish without proper health checks.** If the Magento backend goes down, Varnish should serve stale content instead of returning errors. Configure `grace` mode in VCL.

3. **Over-invalidation.** Modules that flush all caches instead of using targeted tag cleaning degrade cache hit rates significantly.

4. **Disabling cache during development and forgetting to re-enable.** A store running with disabled caches in production will be 10-50x slower.

5. **Serving customer data from the FPC.** Never mark blocks as non-private if they contain user-specific data — this caches one customer's data and serves it to others.

6. **Ignoring cache backend eviction.** Monitor Redis `maxmemory` and `evicted_keys`. If Redis runs out of memory, it evicts cache entries (including active sessions).

## FAQ

**Q: What is the fastest cache configuration for Magento 2?**  
Varnish as FPC with Redis for sessions, default cache, and page cache storage. Separate Redis databases for each. Database 0 for sessions, 1 for default cache, 2 for page cache.

**Q: How do I check the Varnish cache hit rate in production?**  
Run `varnishstat -1 -f MAIN.cache_hit,MAIN.cache_miss`. A hit rate below 85% indicates misconfiguration.

**Q: Does Redis persist cache data across restarts?**  
Only if configured with `save` directives (RDB snapshots) or AOF persistence. By default, Redis cache data is ephemeral and survives restarts only if persistence is enabled.

**Q: Should I use `cache:clean` or `cache:flush` in deployment?**  
`cache:clean` is safer — it only clears invalidated cache entries. `cache:flush` removes everything including valid entries, causing a cold cache and slow initial requests after deployment.

**Q: How do I debug which cache tag is being invalidated?**  
Enable cache debug logging in `app/etc/di.xml` or use a monitoring tool like New Relic to track cache invalidation patterns.

---

Need hands-on help tuning your Magento 2 cache stack? Check my [performance optimization service](/services/performance-optimization/) and [VPS optimization service](/services/vps-optimization/). Also read about [Magento 2 indexers](/blog/magento-2-indexers-complete-guide/) and [Core Web Vitals](/blog/magento-2-core-web-vitals/) for the full performance picture.
