---
title: "Magento 2 Indexers Explained: Complete Developer Guide (2026)"
date: 2026-06-19
lastmod: 2026-06-19
draft: false
author: "Faouzi Yahyaoui"
description: "Complete guide to Magento 2 indexers: how they work, CLI commands, mview changelog, troubleshooting stuck indexers, and performance tuning for 2026."
summary: "Understand Magento 2 indexers from the ground up — catalog, price, stock, and search indexers, Update on Schedule vs Update on Save, mview changelog tables, CLI commands, and how to fix stuck or invalid indexers in production."
tags: ["magento 2", "magento development", "performance optimization", "devops", "magento caching", "e-commerce", "tutorial"]
categories: ["Magento 2", "Développement", "Tutoriels"]
keywords: ["magento 2 indexers", "magento indexer reindex", "magento indexer status", "magento 2 update on schedule", "magento mview changelog", "stuck indexer magento 2", "catalog_product_price indexer", "magento 2 cron indexers"]
slug: "magento-2-indexers-complete-guide"
---

Magento 2 indexers keep your storefront fast by pre-computing data that would otherwise require expensive joins at runtime — product prices, stock status, category assignments, and search results. When indexers fall behind or get stuck, you see wrong prices, empty categories, and search that returns nothing. This guide explains how indexers work, how to manage them from the CLI, and how to keep them healthy in production.

> **In short:** Indexers transform raw database data into optimized flat tables and search indexes. Run them on a schedule in production (`Update on Schedule`), monitor `indexer_status`, and never leave a store in `Update on Save` mode under real traffic.

## Table of Contents

1. [What Are Magento 2 Indexers?](#what-are-magento-2-indexers)
2. [Update on Save vs Update on Schedule](#update-on-save-vs-update-on-schedule)
3. [Key Indexers Every Developer Should Know](#key-indexers-every-developer-should-know)
4. [CLI Commands Reference](#cli-commands-reference)
5. [How mview and Changelog Tables Work](#how-mview-and-changelog-tables-work)
6. [Troubleshooting Stuck or Invalid Indexers](#troubleshooting-stuck-or-invalid-indexers)
7. [Performance Tuning for High-Traffic Stores](#performance-tuning-for-high-traffic-stores)
8. [Best Practices for Production](#best-practices-for-production)
9. [Technical FAQ](#technical-faq)

---

## What Are Magento 2 Indexers?

In Magento 2, many storefront operations rely on **pre-computed data** stored in flat tables and search indexes rather than live SQL queries across dozens of joined tables.

For example, when a customer views a category page, Magento reads from `catalog_product_index_price` and `catalog_category_product_index` instead of recalculating tier prices, special prices, and category rules on every request.

**Without indexers:** Every product listing would run complex price rules, inventory checks, and attribute lookups in real time — unacceptable at scale.

**With indexers:** Data is rebuilt in the background and served from optimized tables in milliseconds.

```
Product saved in Admin
        ↓
Changelog entry written (mview)
        ↓
Cron job picks up pending changes
        ↓
Indexer processes affected rows
        ↓
Flat tables / Elasticsearch updated
        ↓
Storefront serves fresh data
```

---

## Update on Save vs Update on Schedule

Magento 2 supports two indexer modes, configured per indexer:

| Mode | Behavior | Best For |
|------|----------|----------|
| **Update on Save** | Reindexes immediately when data changes | Local development, small catalogs |
| **Update on Schedule** | Queues changes; cron processes them | **Production stores (always)** |

### Switch all indexers to Update on Schedule

```bash
bin/magento indexer:set-mode schedule
```

### Switch back to Update on Save (dev only)

```bash
bin/magento indexer:set-mode realtime
```

> **Production rule:** Never use `Update on Save` on a live store. A single bulk import can trigger full reindexes that lock tables and spike CPU for minutes.

---

## Key Indexers Every Developer Should Know

| Indexer ID | Purpose | Common Symptoms When Broken |
|------------|---------|----------------------------|
| `catalog_product_price` | Final customer-facing prices (special, tier, catalog rules) | Wrong prices on PLP/PDP |
| `cataloginventory_stock` | Salable quantity per website/stock | "Out of stock" when items exist |
| `catalog_product_attribute` | EAV → flat attribute values | Missing filters, blank attributes |
| `catalog_category_product` | Category ↔ product assignments | Products missing from categories |
| `catalogsearch_fulltext` | Search index (Elasticsearch/OpenSearch) | Search returns no results |
| `catalogrule_product` | Catalog price rules | Promotional prices not applied |
| `inventory` | MSI (Multi-Source Inventory) stock index | Wrong stock per source/website |

Check current status:

```bash
bin/magento indexer:status
```

Example output:

```text
+----------------------------------+-------------+-----------+---------------------+---------------------+
| ID                               | Title       | Status    | Update On           | Schedule Status     |
+----------------------------------+-------------+-----------+---------------------+---------------------+
| catalog_product_price            | Product Price | Ready   | Schedule            | idle (0 in backlog) |
| catalogsearch_fulltext           | Catalog Search| Reindex required | Schedule | suspended           |
+----------------------------------+-------------+-----------+---------------------+---------------------+
```

---

## CLI Commands Reference

### Reindex everything

```bash
bin/magento indexer:reindex
```

### Reindex a specific indexer

```bash
bin/magento indexer:reindex catalog_product_price
bin/magento indexer:reindex catalogsearch_fulltext
```

### Reindex multiple indexers

```bash
bin/magento indexer:reindex catalog_product_price cataloginventory_stock
```

### Reset an indexer (marks it invalid)

```bash
bin/magento indexer:reset catalog_product_price
```

Use `reset` when an indexer is stuck in `Processing` state before running `reindex` again.

### Show indexer info

```bash
bin/magento indexer:info
```

### Temporarily disable an indexer (advanced)

```bash
bin/magento indexer:set-dimensions-mode catalog_product_price none
```

Use dimension modes only when you understand MSI/website-scoped indexing — incorrect configuration can cause silent data mismatches.

---

## How mview and Changelog Tables Work

When indexers run in **Update on Schedule** mode, Magento uses the **Materialized View (mview)** framework:

1. A database trigger writes a row to a **changelog table** (e.g. `catalog_product_price_cl`) when source data changes.
2. The `indexer_update_all_views` cron job reads pending changelog entries.
3. The indexer processes only **changed entity IDs** — not the entire catalog.

### Inspect changelog backlog

```sql
SELECT COUNT(*) FROM catalog_product_price_cl;
SELECT COUNT(*) FROM catalogsearch_fulltext_cl;
```

A growing backlog means cron is not keeping up. Check:

```bash
bin/magento cron:run --group=index
grep -i indexer var/log/cron.log
grep -i indexer var/log/system.log
```

### Reset a suspended mview

```bash
bin/magento indexer:reset catalog_product_price
bin/magento cron:run --group=index
```

If the view stays suspended, check `mview_state` in the database:

```sql
SELECT * FROM mview_state WHERE view_id = 'catalog_product_price';
```

Set `status = 'idle'` only after confirming no indexer process is running — otherwise you risk duplicate processing.

---

## Troubleshooting Stuck or Invalid Indexers

### Symptom: Indexer stuck in "Processing"

**Cause:** A previous reindex was killed (OOM, timeout, manual `kill`).

**Fix:**

```bash
# Confirm no PHP process is still running
ps aux | grep indexer

# Reset and reindex
bin/magento indexer:reset catalog_product_price
bin/magento indexer:reindex catalog_product_price
```

If it persists, check for lock files:

```bash
ls -la var/locks/
```

Remove stale locks only when no indexer process is active.

### Symptom: "Could not rebuild index for empty catalog"

**Cause:** Usually a data integrity issue — orphaned rows, missing attribute values, or corrupt EAV data.

**Fix:** Enable indexer logging and inspect the exception:

```bash
bin/magento indexer:reindex catalog_product_attribute -vvv
```

Then query for products with missing required attributes or broken category links.

### Symptom: Search index out of sync

After bulk imports or Elasticsearch cluster restarts:

```bash
bin/magento indexer:reindex catalogsearch_fulltext
bin/magento cache:flush
```

Verify Elasticsearch connectivity:

```bash
curl -s http://localhost:9200/_cluster/health?pretty
```

### Symptom: Prices wrong after catalog price rule change

Catalog rules require two indexers:

```bash
bin/magento indexer:reindex catalogrule_rule catalogrule_product catalog_product_price
```

Always reindex in dependency order — `catalogrule_product` before `catalog_product_price`.

---

## Performance Tuning for High-Traffic Stores

### 1. Run indexers off-peak via cron

Ensure these cron groups are active in `crontab`:

```cron
* * * * * /usr/bin/php /var/www/html/bin/magento cron:run --group=index
* * * * * /usr/bin/php /var/www/html/bin/magento cron:run --group=default
```

### 2. Parallel reindexing (Magento 2.4.4+)

Magento supports parallel indexers for some types. Check `env.php`:

```php
'indexer' => [
    'use_parallel' => true,
    'threads' => 4,
],
```

Increase `threads` based on available CPU — monitor memory usage; price indexing is memory-intensive.

### 3. Bulk operations: use the Bulk API

For large imports, use Magento's **Bulk API** or `Magento_Indexer` mass actions rather than saving products one-by-one in Admin. Each save triggers changelog writes; batch operations reduce overhead.

### 4. Separate indexer workers (Adobe Commerce / custom setup)

On high-volume stores, run a dedicated cron worker for the `index` group:

```bash
bin/magento cron:run --group=index --bootstrap=standaloneProcessStarted=1
```

This prevents indexer jobs from competing with order processing crons.

### 5. Monitor backlog as a metric

Alert when changelog tables exceed a threshold (e.g. 10,000 rows). A growing backlog is an early warning before customers see stale data.

---

## Best Practices for Production

1. **Always use Update on Schedule** — never Update on Save on live stores.
2. **Reindex after deployments** that touch `di.xml`, price rules, or attribute configuration.
3. **Never run `indexer:reindex` during peak traffic** unless urgent — schedule maintenance windows.
4. **Verify cron is running** — a silent cron failure is the #1 cause of stale storefront data.
5. **Check indexer status after bulk imports** — import modules often skip automatic reindex.
6. **Keep Elasticsearch/OpenSearch healthy** — search indexer failures cascade to empty SERP pages.
7. **Log and alert** on `Reindex required` status — treat it like a production incident for catalog stores.

### Post-deployment checklist

```bash
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento setup:static-content:deploy -f
bin/magento indexer:reindex
bin/magento cache:flush
bin/magento indexer:status
```

---

## Technical FAQ

### How often should indexers run?

With `Update on Schedule`, the `index` cron group processes changelogs every minute. Full reindexes are only needed after major data changes or when status shows `Reindex required`.

### Does `cache:flush` replace reindexing?

No. Cache flush clears block/FPC/config cache. Indexers rebuild **database flat tables and search indexes** — completely separate systems.

### Can I disable an indexer I don't use?

Some indexers (e.g. `design_config_grid`) are Admin-only and low impact. Never disable `catalog_product_price`, `cataloginventory_stock`, or `catalogsearch_fulltext` on a live storefront.

### Why does reindexing use so much memory?

Price and catalog rule indexers load large product collections into memory. Increase PHP `memory_limit` for CLI (e.g. `-d memory_limit=2G`) and use parallel threads cautiously.

### What's the difference between `indexer:reset` and `cache:clean`?

`indexer:reset` marks an indexer as **invalid** so the next reindex runs from scratch. `cache:clean` only clears cached blocks and configuration — it does not rebuild index tables.

---

## Conclusion

Magento 2 indexers are the backbone of storefront performance and data accuracy. Treat **Update on Schedule + healthy cron** as non-negotiable in production, monitor changelog backlogs, and know how to reset stuck indexers before they affect customers.

Need help tuning indexers or fixing a production indexing crisis? [Get in touch](/contact/) — I work with Magento 2 and Adobe Commerce stores on [performance optimization](/services/performance-optimization/), DevOps, and custom module development.
