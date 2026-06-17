---
title: "Magento 2 Plugins: Before, After & Around Methods Explained"
date: 2026-06-12
lastmod: 2026-06-17
draft: false
author: "Faouzi Yahyaoui"
description: "Complete guide to Magento 2 plugins (before, after, around). Learn how to modify public methods without core changes, with examples and best practices."
summary: "Master the 3 types of Magento 2 plugins (interceptors): before, after, and around. This technical guide covers syntax, use cases, limitations, and best practices for clean and maintainable code."
tags: ["magento 2", "plugins", "interceptors", "before after around", "magento development", "php", "e-commerce", "tutorial"]
categories: ["Magento 2", "Développement", "Tutoriels"]
keywords: ["magento 2 plugin before after around", "magento 2 interceptor", "magento 2 before plugin example", "magento 2 after plugin", "magento 2 around plugin", "magento plugin sortOrder", "create plugin magento 2", "magento 2 interception"]
slug: "magento-2-plugins-before-after-around-complete-guide"
---

Magento 2 plugins (also called interceptors) let you customize core or third-party behavior without touching the original source code — a critical requirement for staying upgrade-safe. This guide breaks down the three plugin types — **before**, **after**, and **around** — with real-world examples, `di.xml` syntax, common pitfalls, and the rules Magento enforces under the hood.

> **In short:** A Magento 2 plugin intercepts a public method on a class to run code **before**, **after**, or **around** it, without modifying the original class. Use `before` to alter arguments, `after` to alter the result, and `around` only when you need both — or need to block execution entirely.

## Table of Contents

1. [What is a Magento 2 Plugin (Interceptor)?](#what-is-a-magento-2-plugin-interceptor)
2. [The 3 Types of Plugins: Before, After, Around](#the-3-types-of-plugins-before-after-around)
3. [Before Plugin: Modifying Arguments Before Execution](#before-plugin-modifying-arguments-before-execution)
4. [After Plugin: Transforming the Result](#after-plugin-transforming-the-result)
5. [Around Plugin: Total Control (Use with Caution)](#around-plugin-total-control-use-with-caution)
6. [Declaration in di.xml: Syntax and sortOrder](#declaration-in-dixml-syntax-and-sortorder)
7. [Limitations and Forbidden Methods](#limitations-and-forbidden-methods)
8. [Plugins vs Event Observers: When to Choose What?](#plugins-vs-event-observers-when-to-choose-what)
9. [Best Practices and Performance](#best-practices-and-performance)
10. [Technical FAQ](#technical-faq)

---

## What is a Magento 2 Plugin (Interceptor)?

A **plugin**, also called an **interceptor**, is a class that modifies the behavior of public functions in a class by intercepting the function call and executing code **before**, **after**, or **around** that call.

Unlike class rewrites (*class preferences*), plugins do not modify the target class itself. They allow extending or altering core code in a **safe and update-compatible** way. Adobe Commerce and Magento Open Source execute these interceptors sequentially according to a configured `sortOrder`, thus avoiding conflicts between extensions.

---

## The 3 Types of Plugins: Before, After, Around

| Type | Prefix | Execution Time | Primary Use Case | Performance Impact |
|------|---------|-------------------|----------------------|--------------|
| **Before** | `before` + MethodName | Before the observed method | Modify input arguments | Low |
| **After** | `after` + MethodName | After the observed method | Modify returned result | Low |
| **Around** | `around` + MethodName | Before **AND** after | Total control, conditional | ⚠️ High |

---

## Before Plugin: Modifying Arguments Before Execution

**Before Plugins** execute first, before the observed method. They must carry the prefix `before` followed by the exact name of the target method.

### Typical Use Case
Modify the customer group based on the email domain before saving.

```php
<?php
declare(strict_types=1);

namespace Vendor\Module\Plugin;

use Magento\Customer\Api\CustomerRepositoryInterface;
use Magento\Customer\Api\Data\CustomerInterface;
use Magento\Framework\App\Config\ScopeConfigInterface;

class SetCustomerGroupByEmailDomain
{
    private const XML_PATH_SPECIAL_DOMAINS = 'customer/groups/special_email_domains';
    private const SPECIAL_GROUP_ID = 2;

    public function __construct(
        private ScopeConfigInterface $scopeConfig,
    ) {}

    public function beforeSave(
        CustomerRepositoryInterface $subject,
        CustomerInterface $customer,
        $passwordHash = null,
    ) {
        $email = $customer->getEmail();
        $domains = $this->getSpecialDomains();

        foreach ($domains as $domain) {
            if (str_ends_with($email, '@' . trim($domain))) {
                $customer->setGroupId(self::SPECIAL_GROUP_ID);
                break;
            }
        }

        return [$customer, $passwordHash];
    }

    private function getSpecialDomains(): array
    {
        $domainsString = $this->scopeConfig->getValue(self::XML_PATH_SPECIAL_DOMAINS);
        return $domainsString ? explode(',', $domainsString) : [];
    }
}
```

### Before Plugin Rules
- Return an **array of modified arguments** in the same order as the original method signature.
- If you don't modify anything, return `null` (not an empty array).
- If a parameter is optional (`= null`) in the original method, it must be optional in the plugin too.

---

## After Plugin: Transforming the Result

**After Plugins** intervene right after the observed method executes. They receive the original result and can modify it before returning.

### Example: Loyalty Discount on Product Price

```php
<?php
declare(strict_types=1);

namespace Vendor\Module\Plugin;

use Magento\Catalog\Model\Product;
use Magento\Customer\Model\Session as CustomerSession;

class LoggedInCustomerLoyaltyDiscount
{
    private const XML_PATH_DISCOUNT = 'sales/loyalty/discount_percent';

    public function __construct(
        private CustomerSession $customerSession,
        private ScopeConfigInterface $scopeConfig,
    ) {}

    public function afterGetPrice(Product $subject, $result)
    {
        if ($this->customerSession->isLoggedIn()) {
            $discount = (float) $this->scopeConfig->getValue(self::XML_PATH_DISCOUNT) ?: 0;
            $result = $result * (1 - $discount / 100);
        }

        return $result;
    }
}
```

## Around Plugin: Total Control (Use with Caution)

The **Around Plugin** offers maximum control: it executes **before and after** the observed method. It receives a `callable $proceed` that represents the original method (or the next plugin in the chain).

### ⚠️ Critical Warning
Magento **strongly discourages** the use of Around Plugins unless absolutely necessary. They:
- Increase the call stack size
- Degrade performance
- Complicate debugging
- Encourage spaghetti code

### Valid Example: Conditional Logging

```php
<?php
declare(strict_types=1);

namespace Vendor\Module\Plugin;

use Magento\Catalog\Model\Product;
use Psr\Log\LoggerInterface;

class ProductSaveLogger
{
    public function __construct(
        private LoggerInterface $logger,
    ) {}

    public function aroundSave(
        Product $subject,
        callable $proceed,
    ) {
        $this->logger->info('Before save: ID ' . $subject->getId());

        $result = $proceed(); // Executes the original method

        $this->logger->info('After save: ID ' . $subject->getId());

        return $result;
    }
}
```

### When to Use Around?
- You need to **modify both arguments AND the result**.
- You need to **condition the execution** of the original method (e.g., feature flag).
- In **all other cases**, prefer `before` + `after`.

---

## Declaration in di.xml: Syntax and sortOrder

Every plugin must be declared in the `etc/di.xml` file (or `etc/frontend/di.xml`, `etc/adminhtml/di.xml` depending on the area).

```xml
<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:ObjectManager/etc/config.xsd">

    <type name="Magento\Customer\Api\CustomerRepositoryInterface">
        <plugin name="vendor_module_set_customer_group"
                type="Vendor\Module\Plugin\SetCustomerGroupByEmailDomain"
                sortOrder="10"
                disabled="false" />
    </type>

    <type name="Magento\Catalog\Model\Product">
        <plugin name="vendor_module_loyalty_discount"
                type="Vendor\Module\Plugin\LoggedInCustomerLoyaltyDiscount"
                sortOrder="20" />
    </type>

</config>
```

### `<plugin>` Node Attributes

| Attribute | Required | Description |
|----------|-------------|-------------|
| `name` | ✅ | Unique plugin identifier (used for config merging) |
| `type` | ✅ | PHP class of the plugin (FQCN) |
| `sortOrder` | ❌ | Execution order (smaller = executed first) |
| `disabled` | ❌ | `true` to disable a core/third-party plugin without removing the code |

> 🔗 If you're creating your first extension, start by understanding the fundamentals of Magento module development. Follow our step-by-step guide on [building a custom Magento 2 module](https://www.magento-mastery.com/blog/building-custom-magento-2-module/) before implementing plugins, observers, or preferences.

---

## Limitations and Forbidden Methods

Plugins **cannot** be used on:

- ❌ `final` methods and classes
- ❌ Non-public methods (`private`, `protected`)
- ❌ Static methods (`static`)
- ❌ `__construct` and `__destruct`
- ❌ Virtual types
- ❌ Objects instantiated before `Magento\Framework\Interception` initialization
- ❌ Classes implementing `Magento\Framework\ObjectManager\NoninterceptableInterface`

> 🚨 **Common Pitfall**: Trying to intercept a `protected` method generates a silent error — the plugin is simply ignored.

---

## Plugins vs Event Observers: When to Choose What?

| Criterion | Plugin | Event Observer |
|---------|--------|----------------|
| **Target** | Specific method of a class | Event dispersed throughout the system |
| **Control** | Fine (arguments, result, flow) | Limited (reaction to an event) |
| **Coupling** | Strong (tied to a class) | Low (decoupled) |
| **Performance** | Direct | May be triggered multiple times |

### Decision Rule
- **Plugin**: you need to modify the behavior of a specific method, its inputs, or its outputs.
- **Observer**: you need to react to an event that can occur in multiple places (e.g., `checkout_cart_save_after`).

> ⚠️ **Warning**: Do not mix plugins and observers for the same logic without mastering the execution order. An observer triggered before a `before` plugin modifies data can cause inconsistencies.

---

## Best Practices and Performance

### 1. Prefer Before + After Over Around
Each Around Plugin adds a frame to the call stack. On a high-traffic site, this translates to measurable latency.

### 2. Respect sortOrder
The execution order follows these rules:

1. All `before` plugins execute from smallest to largest `sortOrder`
2. Then `around` plugins (first half → `$proceed()` → second half)
3. Finally `after` plugins from smallest to largest `sortOrder`

### 3. Name Your Plugins Explicitly
```xml
<!-- ❌ Bad -->
<plugin name="my_plugin" ... />

<!-- ✅ Good -->
<plugin name="vendor_module_customer_group_by_email_domain" ... />
```

### 4. Avoid Plugins on Frequently Called Methods
Do not overload `getPrice()`, `getName()`, or `getId()` on entire collections. Prefer events or model rewrites if necessary.

### 5. Test with Plugins Disabled
```xml
<plugin name="vendor_module_logger" disabled="true" />
```
This allows quickly verifying whether a bug comes from your interception.

---

## Technical FAQ

### Can multiple plugins be stacked on the same method?
**Yes.** Magento chains them automatically according to their `sortOrder`. If two plugins have the same `sortOrder`, the module loading order (defined in `module.xml`) determines the sequence.

### Can a plugin prevent the original method from executing?
**Only an Around Plugin can do this** — by not calling `$proceed()`. This is **discouraged** except in exceptional cases (feature flags, maintenance mode).

### Why is my plugin not executing?
Check in this order:
1. Is the method `public`?
2. Is the class `final`?
3. Is the cache cleared (`bin/magento cache:clean`)?
4. Is the `di.xml` in the correct directory (`etc/` vs `etc/frontend/`)?
5. Is there a syntax error in the `type` FQCN?

### What is the difference between a plugin and a class preference?
A **preference** (`<preference>`) entirely replaces the target class. A **plugin** intercepts without replacing. Always prefer plugins for backward compatibility.

---

## Summary and Next Steps

| What You Learned | Immediate Action |
|------------------------|------------------|
| The 3 types of interceptors (Before, After, Around) | Identify a core method to modify in your project |
| The `di.xml` syntax and `sortOrder` | Create your first plugin on a test environment |
| Limitations and performance pitfalls | Audit your existing plugins — replace unnecessary `around` plugins |
| The difference between Plugin and Observer | Document your architectural choice |