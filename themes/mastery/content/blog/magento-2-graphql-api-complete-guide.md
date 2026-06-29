---
title: "Magento 2 GraphQL API: Complete Developer Guide (2026)"
seo_title: "Magento 2 GraphQL API Complete Guide | Magento Mastery"
date: 2026-06-20
lastmod: 2026-06-20
draft: false
author: "Faouzi Yahyaoui"
description: "Complete guide to Magento 2 GraphQL API: queries, mutations, schema, resolver patterns, authentication, caching, and custom endpoint development for headless commerce."
summary: "Learn how Magento 2 GraphQL works — from product and cart queries to custom resolvers and mutations. Includes schema examples, authentication headers, performance tips, and headless PWA best practices for 2026."
tags: ["magento 2", "magento development", "php", "e-commerce", "adobe-commerce", "tutorial", "module-development"]
categories: ["Magento 2", "Développement", "Tutoriels"]
keywords: ["magento 2 graphql", "magento graphql api", "magento 2 headless", "magento graphql query products", "magento graphql cart mutation", "custom graphql resolver magento 2", "magento 2 pwa studio", "magento graphql authentication"]
slug: "magento-2-graphql-api-complete-guide"
hub: "customization-api"
pillar: false
---

Magento 2's GraphQL API is the backbone of modern headless storefronts, PWAs, and mobile apps. Unlike REST — which often requires multiple round-trips — GraphQL lets a client request exactly the fields it needs in a single call. This guide covers the built-in schema, authentication, cart and checkout mutations, custom resolver development, and the performance patterns that matter in production.

> **In short:** GraphQL in Magento 2 exposes products, categories, cart, checkout, and customer data through a typed schema at `/graphql`. Use queries for reads, mutations for writes, and extend the schema with custom resolvers when built-in fields are not enough.

## Table of Contents

1. [Why GraphQL for Magento 2?](#why-graphql-for-magento-2)
2. [Endpoint, Headers, and First Query](#endpoint-headers-and-first-query)
3. [Core Schema: Products, Categories, Search](#core-schema-products-categories-search)
4. [Cart and Checkout Mutations](#cart-and-checkout-mutations)
5. [Customer Authentication](#customer-authentication)
6. [Building a Custom Query Resolver](#building-a-custom-query-resolver)
7. [Building a Custom Mutation](#building-a-custom-mutation)
8. [Performance and Caching](#performance-and-caching)
9. [GraphQL vs REST: When to Use What](#graphql-vs-rest-when-to-use-what)
10. [Technical FAQ](#technical-faq)

---

## Why GraphQL for Magento 2?

Adobe has invested heavily in GraphQL as the primary API for storefront-facing operations. REST remains available for Admin integrations and legacy systems, but new frontend work — Hyvä React Checkout, PWA Studio, custom Next.js storefronts — runs on GraphQL.

| Advantage | Detail |
|-----------|--------|
| **Single request** | Fetch product name, price, image, and stock in one call |
| **No over-fetching** | Client selects only the fields it renders |
| **Typed schema** | Self-documenting via introspection |
| **Cart state** | `cart_id` token model fits stateless frontends |
| **Version stability** | Schema evolves with backward-compatible deprecations |

**Endpoint:**

```text
POST https://your-store.com/graphql
Content-Type: application/json
```

---

## Endpoint, Headers, and First Query

### Basic product query

```graphql
{
  products(filter: { sku: { eq: "24-MB01" } }) {
    items {
      sku
      name
      price_range {
        minimum_price {
          regular_price {
            value
            currency
          }
        }
      }
      image {
        url
        label
      }
    }
  }
}
```

Send it with `curl`:

```bash
curl -X POST https://your-store.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ products(filter: { sku: { eq: \"24-MB01\" } }) { items { sku name } } }"}'
```

### Store header (multi-store setups)

When running multiple store views, pass the `Store` header:

```bash
-H "Store: default"
```

Without it, Magento may return data from the wrong store view — wrong prices, wrong language, wrong currency.

---

## Core Schema: Products, Categories, Search

### Category listing with filters

```graphql
{
  categoryList(filters: { url_key: { eq: "gear" } }) {
    id
    name
    products(pageSize: 12, currentPage: 1) {
      total_count
      items {
        sku
        name
        small_image { url }
        price_range {
          minimum_price {
            final_price { value currency }
          }
        }
      }
      page_info {
        current_page
        total_pages
      }
    }
  }
}
```

### Full-text search

```graphql
{
  products(search: "backpack", pageSize: 10) {
    total_count
    items {
      sku
      name
      url_key
    }
  }
}
```

Search relies on the `catalogsearch_fulltext` indexer and Elasticsearch/OpenSearch. If search returns empty results, reindex first:

```bash
bin/magento indexer:reindex catalogsearch_fulltext
```

### Configurable product options

```graphql
{
  products(filter: { sku: { eq: "MH01" } }) {
    items {
      sku
      name
      ... on ConfigurableProduct {
        configurable_options {
          attribute_code
          label
          values {
            value_index
            label
          }
        }
        variants {
          product {
            sku
            name
            price_range {
              minimum_price {
                final_price { value }
              }
            }
          }
        }
      }
    }
  }
}
```

Use inline fragments (`... on ConfigurableProduct`) to access type-specific fields — a core GraphQL pattern in Magento.

---

## Cart and Checkout Mutations

Guest carts use a `cart_id` (masked quote ID). Customer carts use the authenticated customer token.

### Create a guest cart

```graphql
mutation {
  createEmptyCart
}
```

Response:

```json
{ "data": { "createEmptyCart": "abc123xyz" } }
```

### Add a product to cart

```graphql
mutation {
  addProductsToCart(
    cartId: "abc123xyz"
    cartItems: [{ sku: "24-MB01", quantity: 1 }]
  ) {
    cart {
      items {
        quantity
        product {
          name
          sku
        }
      }
      prices {
        grand_total {
          value
          currency
        }
      }
    }
  }
}
```

### Merge guest cart after login

```graphql
mutation {
  mergeCarts(
    source_cart_id: "abc123xyz"
    destination_cart_id: "customer-cart-id"
  ) {
    items { quantity product { sku } }
  }
}
```

### Set shipping address and method

```graphql
mutation {
  setShippingAddressesOnCart(
    input: {
      cart_id: "abc123xyz"
      shipping_addresses: [{
        address: {
          firstname: "John"
          lastname: "Doe"
          street: ["123 Main St"]
          city: "Paris"
          postcode: "75001"
          country_code: FR
          telephone: "0600000000"
        }
      }]
    }
  ) {
    cart {
      shipping_addresses {
        available_shipping_methods {
          carrier_code
          method_code
          amount { value currency }
        }
      }
    }
  }
}
```

> **Headless checkout tip:** Always request `available_shipping_methods` and `available_payment_methods` after setting the address — rates depend on the cart contents and destination.

---

## Customer Authentication

### Generate a customer token

```graphql
mutation {
  generateCustomerToken(
    email: "customer@example.com"
    password: "Password123!"
  ) {
    token
  }
}
```

Use the token on subsequent requests:

```bash
-H "Authorization: Bearer <token>"
```

Tokens expire based on Admin configuration (`Stores → Configuration → Services → OAuth → Customer Token Lifetime`). Default is 1 hour — plan refresh logic in your frontend.

### Introspection query (dev only)

Disable introspection in production for security. In development, explore the schema:

```graphql
{
  __schema {
    types {
      name
      kind
    }
  }
}
```

Or use GraphQL Playground / Altair / Postman with introspection enabled.

---

## Building a Custom Query Resolver

When the built-in schema is not enough, extend it with a custom module.

### Directory structure

```text
app/code/MagentoMastery/GraphQlDemo/
├── registration.php
├── etc/
│   ├── module.xml
│   └── schema.graphqls
└── Model/
    └── Resolver/
        └── HelloWorld.php
```

### schema.graphqls

```graphql
type Query {
    helloWorld(name: String): String
      @resolver(class: "MagentoMastery\\GraphQlDemo\\Model\\Resolver\\HelloWorld")
      @doc(description: "Returns a greeting string")
}
```

### Resolver class

```php
<?php
declare(strict_types=1);

namespace MagentoMastery\GraphQlDemo\Model\Resolver;

use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;

class HelloWorld implements ResolverInterface
{
    public function resolve(
        Field $field,
        $context,
        ResolveInfo $info,
        ?array $value = null,
        ?array $args = null
    ): string {
        $name = $args['name'] ?? 'World';
        return "Hello, {$name}!";
    }
}
```

### Test the custom query

```graphql
{ helloWorld(name: "Magento") }
```

After deploying:

```bash
bin/magento setup:upgrade
bin/magento cache:flush
```

GraphQL schema changes require cache flush — Magento caches the compiled schema.

---

## Building a Custom Mutation

Mutations follow the same pattern but implement `ResolverInterface` on a `Mutation` type field.

### schema.graphqls

```graphql
type Mutation {
    subscribeNewsletter(email: String!): NewsletterOutput
      @resolver(class: "MagentoMastery\\GraphQlDemo\\Model\\Resolver\\SubscribeNewsletter")
}

type NewsletterOutput {
    success: Boolean!
    message: String
}
```

### Resolver with validation

```php
<?php
declare(strict_types=1);

namespace MagentoMastery\GraphQlDemo\Model\Resolver;

use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Exception\GraphQlInputException;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;

class SubscribeNewsletter implements ResolverInterface
{
    public function resolve(
        Field $field,
        $context,
        ResolveInfo $info,
        ?array $value = null,
        ?array $args = null
    ): array {
        $email = $args['email'] ?? '';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new GraphQlInputException(__('Invalid email address.'));
        }

        // Subscribe logic here...

        return [
            'success' => true,
            'message' => 'Subscribed successfully.',
        ];
    }
}
```

Throw `GraphQlInputException` for client errors (400-level) and `GraphQlAuthorizationException` for auth failures — Magento maps these to proper GraphQL error responses.

---

## Performance and Caching

GraphQL can be slower than expected if clients request too many nested fields. Apply these rules in production:

### 1. Limit query depth and complexity

Use a reverse proxy or Magento's built-in query complexity limits (Adobe Commerce) to block abusive queries.

### 2. Cache at the CDN for anonymous queries

Only cache queries that do not include customer tokens or cart IDs. Product listing queries are good CDN candidates when keyed by store + query hash.

### 3. Avoid N+1 in custom resolvers

When resolving lists, use batch resolvers or data loaders. A naive resolver that loads a product model per item will destroy performance on category pages.

### 4. Request only what you render

```graphql
# Bad — fetches entire description HTML on a listing page
items { sku name description { html } }

# Good — listing page fields only
items { sku name small_image { url } price_range { minimum_price { final_price { value } } } }
```

### 5. Keep indexers healthy

GraphQL reads from indexed flat tables and Elasticsearch. Stale indexers = stale API responses. See the [indexers guide](/blog/magento-2-indexers-complete-guide/) for maintenance.

---

## GraphQL vs REST: When to Use What

| Use Case | Recommended API |
|----------|----------------|
| Storefront / PWA / mobile app | **GraphQL** |
| Admin integrations (orders, catalog import) | **REST (Async Bulk API)** |
| Third-party ERP sync | **REST** |
| Real-time cart/checkout | **GraphQL** |
| Legacy integrations | **REST** |

Adobe's direction is clear: GraphQL for customer-facing, REST for operational/back-office bulk operations.

---

## Technical FAQ

### Where is the GraphQL schema defined?

Core schema files live in each module's `etc/schema.graphqls`. Magento merges them at runtime. Custom modules add their own `etc/schema.graphqls`.

### Can I use GraphQL in Admin?

GraphQL is designed for storefront operations. Admin functionality uses REST or the Admin UI — do not expose Admin operations via custom GraphQL without strict ACL checks.

### How do I debug GraphQL errors?

Enable developer mode and check `var/log/exception.log`. GraphQL returns errors in the `errors` array of the JSON response with `message` and `category` fields.

### Does GraphQL replace Knockout.js checkout?

Not automatically. The Luma checkout is still Knockout-based. Headless checkout requires a frontend that consumes GraphQL mutations (React, Vue, Hyvä Checkout, etc.). See the [checkout customization guide](/blog/magento-2-checkout-customization/) for working with the Knockout.js checkout or building a headless alternative.

### Is GraphQL available in Magento Open Source?

Yes. GraphQL has been part of Magento Open Source since 2.3.x. Some advanced features (query complexity limits, staging previews) are Adobe Commerce only.

---

## Conclusion

GraphQL is the standard API layer for modern Magento 2 storefronts. Master the built-in product and cart schema first, then extend with custom resolvers when business logic demands it. Keep queries lean, indexers current, and authentication tokens fresh — and your headless storefront will stay fast and reliable.

Building a headless Magento 2 storefront or need custom GraphQL endpoints? [Contact me](/contact/) for architecture reviews, [custom module development](/services/custom-modules/), and performance optimization.
