---
title: "Building a Custom Magento 2 Module from Scratch (2026 Guide)"
date: 2026-06-10
lastmod: 2026-06-10
summary: "Learn how to build a production-ready Magento 2 custom module step by step."
description: "Complete guide to building a Magento 2 custom module from scratch, including registration, module.xml, controllers, models, DI, observers, and deployment."
slug: "building-custom-magento-2-module"
tags:
  - magento2
  - php
  - ecommerce
  - adobe-commerce
  - module-development
categories:
  - Magento 2
  - PHP Development
draft: false
---

# Building a Custom Magento 2 Module from Scratch (2026 Guide)

Magento 2 is one of the most extensible eCommerce platforms available. Creating a custom module from scratch is a fundamental skill that enables business customizations, third-party integrations, and performance optimizations without modifying Magento core files.

## Table of Contents

1. Prerequisites
2. Module Structure
3. Create the Directory Structure
4. registration.php
5. module.xml
6. Enable the Module
7. Add a Controller and Route
8. Create a Model and ResourceModel
9. Dependency Injection
10. Observer / Event
11. Deployment Best Practices
12. Common Errors
13. FAQ

## Prerequisites

| Component | Recommended Version |
|------------|-------------------|
| Magento / Adobe Commerce | 2.4.7 – 2.4.8 |
| PHP | 8.2 or 8.3 |
| Composer | 2.x |
| MySQL / MariaDB | 8.0+ |
| Elasticsearch / OpenSearch | 8.x |

> SEO Tip: If you are building an extension for Adobe Commerce Marketplace distribution, follow the official coding standards from the start.

## Module Structure

A typical Magento 2 module follows a strict architecture:

```text
app/code/Vendor/ModuleName/
├── registration.php
├── etc/
├── Controller/
├── Model/
├── Block/
├── view/
└── Setup/
```

## Step 1 — Create the Directory Structure

```bash
mkdir -p app/code/MagentoMastery/HelloWorld/etc/frontend
mkdir -p app/code/MagentoMastery/HelloWorld/Controller/Index
mkdir -p app/code/MagentoMastery/HelloWorld/Model/ResourceModel/ExampleModel
mkdir -p app/code/MagentoMastery/HelloWorld/view/frontend/{layout,templates}
mkdir -p app/code/MagentoMastery/HelloWorld/Setup
```

## Step 2 — registration.php

```php
use Magento\Framework\Component\ComponentRegistrar;

ComponentRegistrar::register(
    ComponentRegistrar::MODULE,
    'MagentoMastery_HelloWorld',
    __DIR__
);
```

## Step 3 — module.xml

```xml
<module name="MagentoMastery_HelloWorld" setup_version="1.0.0">
</module>
```

## Step 4 — Enable the Module

```bash
php bin/magento module:enable MagentoMastery_HelloWorld
php bin/magento setup:upgrade
php bin/magento setup:di:compile
php bin/magento cache:flush
```

## Step 5 — Add a Controller and Route

Define your route in `routes.xml` and create a controller implementing `HttpGetActionInterface`.

Best practice for 2026: Prefer `HttpGetActionInterface` and `HttpPostActionInterface` over extending the legacy `Action` class.

## Step 6 — Create a Model and ResourceModel

Magento uses the Model / ResourceModel / Collection pattern:

- Model: Business logic
- ResourceModel: Database access
- Collection: Data retrieval and filtering

## Step 7 — Dependency Injection

Example `di.xml`:

```xml
<preference for="Vendor\Module\Api\ExampleInterface"
            type="Vendor\Module\Model\ExampleModel"/>
```

## Step 8 — Observer / Event

Observers allow you to react to Magento events without modifying core classes.

Example event:

```xml
<event name="catalog_product_save_after">
    <observer name="vendor_product_save"
              instance="Vendor\Module\Observer\ProductSaveAfter"/>
</event>
```

## Step 9 — Deployment Best Practices

```bash
php bin/magento setup:upgrade
php bin/magento setup:di:compile
php bin/magento setup:static-content:deploy -f
php bin/magento cache:flush
```

### Development Best Practices

- Use `declare(strict_types=1)`.
- Prefer constructor dependency injection.
- Avoid direct use of ObjectManager.
- Use Schema/Data Patches instead of legacy InstallSchema when possible.
- Write unit and integration tests.
- Follow PSR-12 coding standards.

## Common Errors

| Error | Cause | Solution |
|---------|---------|---------|
| Module not found | Incorrect module name | Verify registration.php and module.xml |
| Area code not set | Incorrect controller implementation | Use HttpGetActionInterface |
| Cannot instantiate interface | Missing DI preference | Configure di.xml |
| Blank page | PHP error | Check logs |
| Cache issues | Stale configuration | Flush cache |

## FAQ

### Should I use InstallSchema or DB Patches?

DB Patches (`DataPatchInterface` and `SchemaPatchInterface`) are the recommended approach in modern Magento versions.

### My module returns a 404. What should I check?

1. Verify `routes.xml`
2. Verify controller naming and casing
3. Flush cache
4. Recompile DI

## Conclusion

You now have the foundation for a production-ready Magento 2 module including controllers, models, dependency injection, and observers.

Next steps:

- Implement Service Contracts
- Build custom REST APIs
- Explore GraphQL resolvers
- Add integration tests