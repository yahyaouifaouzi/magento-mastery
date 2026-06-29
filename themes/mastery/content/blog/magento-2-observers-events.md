---
title: "Magento 2 Observers & Events: Complete Developer Guide"
seo_title: "Magento 2 Observers & Events Guide | Magento Mastery"
date: 2026-06-29
lastmod: 2026-06-29
draft: false
author: "Faouzi Yahyaoui"
description: "Complete guide to Magento 2 observers and events — how to hook into the event system, built-in events list, custom event dispatch, and best practices for upgrade-safe code."
summary: "Learn how to use Magento 2's event-driven architecture with observers and events. Covers events.xml configuration, built-in events, dispatching custom events, and best practices."
tags: ["magento 2", "observers", "events", "event-driven architecture", "magento development", "php", "tutorial"]
categories: ["Magento 2", "Développement", "Tutoriels"]
keywords: ["magento 2 observer", "magento 2 events", "magento 2 events.xml", "magento 2 custom event", "magento 2 event observer example", "magento 2 checkout events"]
slug: "magento-2-observers-events"
hub: "core-architecture"
pillar: false
---

Magento 2's event-driven architecture lets you react to almost anything that happens in the system — order placement, customer registration, product save, admin actions — without modifying core code or extending classes. Observers listen for named events and execute logic when those events fire. This guide covers how to declare observers, what built-in events are available, how to dispatch your own custom events, and when to choose observers over [plugins](/blog/magento-2-plugins-before-after-around-complete-guide/).

> **In short:** An observer is a class that listens for a named event and runs code when that event is dispatched. Declare it in `events.xml` (global) or `events.xml` scoped to an area (`frontend`, `adminhtml`, `webapi_rest`, `graphql`). Use observers when you need to react to an event that has no specific method you can plugin to — for example, "after order is placed" (`sales_order_place_after`) isn't tied to a single method call.

## Table of Contents

1. [Events vs Plugins: When to Use What](#events-vs-plugins-when-to-use-what)
2. [Declaring an Observer in events.xml](#declaring-an-observer-in-eventsxml)
3. [The Observer Class Signature](#the-observer-class-signature)
4. [Area-Scoped Events: Frontend, Adminhtml, Web API, GraphQL](#area-scoped-events-frontend-adminhtml-web-api-graphql)
5. [Most Useful Built-in Events in Magento 2](#most-useful-built-in-events-in-magento-2)
6. [Dispatching Custom Events](#dispatching-custom-events)
7. [Passing Data to Observers via the Event](#passing-data-to-observers-via-the-event)
8. [Observer Execution Order and Stopping Propagation](#observer-execution-order-and-stopping-propagation)
9. [Best Practices and Common Pitfalls](#best-practices-and-common-pitfalls)
10. [FAQ](#faq)

## Events vs Plugins: When to Use What

Before writing an observer, check if a [plugin](/blog/magento-2-plugins-before-after-around-complete-guide/) would be cleaner. Here's a rule of thumb:

| Scenario | Best approach |
|----------|--------------|
| Modify arguments or return value of a specific method | Plugin |
| React to "something happened" (order placed, customer logged in) | Observer |
| Execute logic that spans multiple unrelated classes | Observer |
| Need to wrap the entire method execution | Plugin (`around`) |
| The event you need doesn't exist yet | Plugin, or dispatch a custom event |

The key difference: **plugins hook into methods, observers hook into events.** Events can be dispatched from anywhere — models, controllers, helpers, even other observers — and multiple observers can listen to the same event without knowing about each other.

## Declaring an Observer in events.xml

Create `etc/events.xml` in your module (for global events) or scope it to an area:

```xml
<!-- app/code/Vendor/Module/etc/events.xml -->
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:Event/etc/events.xsd">
    <event name="sales_order_place_after">
        <observer name="vendor_module_order_placed"
                  instance="Vendor\Module\Observer\OrderPlaced"
                  shared="false"/>
    </event>
</config>
```

The `name` attribute on `<observer>` must be unique within the event scope. Use a prefix (your vendor/module name) to avoid conflicts. `shared="false"` creates a new instance each time — use this unless the observer is stateless.

## The Observer Class Signature

Every observer implements `\Magento\Framework\Event\ObserverInterface` with a single `execute()` method:

```php
<?php
declare(strict_types=1);

namespace Vendor\Module\Observer;

use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Event\Observer;

class OrderPlaced implements ObserverInterface
{
    public function __construct(
        private readonly \Psr\Log\LoggerInterface $logger
    ) {}

    public function execute(Observer $observer): void
    {
        $order = $observer->getEvent()->getOrder();
        $this->logger->info('Order placed: ' . $order->getIncrementId());
    }
}
```

The `Observer` object gives you access to `getEvent()`, which returns the event data object. From there, you retrieve the specific data using getters named after the event's data keys. Common getters: `getOrder()`, `getProduct()`, `getCustomer()`, `getQuote()`.

## Area-Scoped Events: Frontend, Adminhtml, Web API, GraphQL

Global `events.xml` fires in all areas. Scope it to a specific area by placing the file in the area's `etc/` directory:

```
app/code/Vendor/Module/
├── etc/
│   └── events.xml                    ← global (all areas)
├── etc/frontend/
│   └── events.xml                    ← frontend only
├── etc/adminhtml/
│   └── events.xml                    ← admin panel only
├── etc/webapi_rest/
│   └── events.xml                    ← REST API only
└── etc/graphql/
    └── events.xml                    ← GraphQL only
```

This is useful when the same module needs different behaviour in different areas. For example, log an order in frontend but send an admin notification in adminhtml.

## Most Useful Built-in Events in Magento 2

### Checkout & Sales Events

| Event name | Data available |
|------------|---------------|
| `sales_order_place_after` | `order` |
| `sales_order_save_after` | `order` |
| `checkout_cart_add_product_complete` | `product`, `request` |
| `checkout_onepage_controller_success_action` | `order_ids` |
| `sales_quote_collect_totals_after` | `quote` |

### Customer Events

| Event name | Data available |
|------------|---------------|
| `customer_register_success` | `customer`, `account_controller` |
| `customer_login` | `customer` |
| `customer_logout` | `customer` |
| `customer_address_save_after` | `customer_address`, `customer` |

### Catalog & Product Events

| Event name | Data available |
|------------|---------------|
| `catalog_product_save_after` | `product` |
| `catalog_product_load_after` | `product` |
| `catalog_category_save_after` | `category` |
| `catalog_product_is_salable_before` | `product` |

You can find the full list in `vendor/magento/framework/Event/etc/events.xsd` and by searching for `->dispatch(` in the Magento codebase.

## Dispatching Custom Events

Dispatching your own events makes your module extensible — other developers can hook into it without modifying your code.

```php
use Magento\Framework\Event\ManagerInterface;

class SomeService
{
    public function __construct(
        private readonly ManagerInterface $eventManager
    ) {}

    public function doSomething(string $sku, array $data): void
    {
        // ... business logic ...

        $this->eventManager->dispatch(
            'vendor_module_something_done',
            ['sku' => $sku, 'result' => $data]
        );
    }
}
```

Convention for event names: lowercase, vendor prefix, underscore-separated segments. The second argument is an associative array — each key becomes available via `getSku()`, `getResult()`, etc. on the observer's event object.

## Passing Data to Observers via the Event

When dispatching, the array keys become the getter names on the event data:

```php
$this->eventManager->dispatch('custom_event', [
    'order' => $order,
    'items' => $items,
    'source' => 'cron'
]);
```

In the observer:

```php
public function execute(Observer $observer): void
{
    $order = $observer->getEvent()->getOrder();
    $items = $observer->getEvent()->getItems();
    $source = $observer->getEvent()->getSource();
}
```

The data keys follow camelCase convention. Magento's built-in events use singular nouns for single objects (`order`, `product`, `customer`) and plural for collections (`order_ids`, `items`).

## Observer Execution Order and Stopping Propagation

Observers for the same event execute in the order they appear in `events.xml`. If you need to control ordering across modules, use the `sort_order` parameter on the `<observer>` element (lower numbers run first):

```xml
<event name="sales_order_place_after">
    <observer name="first_module" instance="Vendor\First\Observer" sort_order="10"/>
    <observer name="second_module" instance="Vendor\Second\Observer" sort_order="20"/>
</event>
```

To stop subsequent observers from executing, call `stopPropagation()`:

```php
public function execute(Observer $observer): void
{
    if (!$this->config->isEnabled()) {
        $observer->stopPropagation();
        return;
    }
    // ... process ...
}
```

Use this sparingly — stopping propagation silently breaks other modules that depend on the same event.

## Best Practices and Common Pitfalls

1. **Keep observers lightweight.** An observer should not contain complex business logic. Delegate to services or models. Observers are called synchronously — a slow observer blocks the entire request.

2. **Never inject a concrete class that triggers events in its constructor.** This creates infinite loops. For example, don't inject a repository in an observer that listens to the save event of that same entity.

3. **Use `shared="false"` for observers that hold state.** If an observer has dependencies that change between calls (like a registry value), creating a new instance each time prevents stale data.

4. **Prefer plugins over observers** when you need to modify method arguments or return values. Plugins are type-safe and more predictable. Use observers only for "reaction" scenarios.

5. **Don't rely on observer execution order across modules.** Only control order within your own module. If your observer must run before or after another module's observer, consider using a plugin instead.

6. **Test with event profiling enabled.** Add `?debug=events` to your URL (with developer mode) to see which events fire on a page. Verify your observer is called when expected and not called when it shouldn't be.

## FAQ

**Q: Can I use dependency injection in observers?**  
Yes. All observer dependencies are injected via the constructor. Magento's DI container resolves them automatically.

**Q: What is the difference between `events.xml` and `frontend/events.xml`?**  
Global `events.xml` fires in all areas. Area-scoped files only fire when Magento runs in that area (frontend store, admin panel, REST API, or GraphQL).

**Q: How do I find what data an event provides?**  
Check the `dispatch()` call in the source code. The array keys passed to `dispatch()` become the getter names. For example, if the code dispatches `['order' => $order]`, your observer calls `$observer->getEvent()->getOrder()`.

**Q: Can one observer listen to multiple events?**  
Not directly. Each observer class needs a separate declaration in `events.xml`. However, you can create a single service class and call it from multiple observer `execute()` methods.

**Q: Are observers available in GraphQL?**  
Yes. GraphQL is its own area (`graphql`). Place your `events.xml` in `etc/graphql/` to scope observers to GraphQL requests only.

---

Need a custom module with observers and events wired correctly? Check my [custom module development service](/services/custom-modules/) or read the [plugins guide](/blog/magento-2-plugins-before-after-around-complete-guide/) for the companion topic on interceptors.
