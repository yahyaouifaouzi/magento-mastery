---
title: "Magento 2 Checkout Customization: Step-by-Step Guide (2026)"
date: 2026-06-24
lastmod: 2026-06-24
draft: false
author: "Faouzi Yahyaoui"
description: "Complete guide to customizing the Magento 2 checkout process — from layout XML to knockout.js components, shipping, payment, and extensions."
summary: "Learn how to customize every part of the Magento 2 checkout: add/remove fields, modify the layout, override Knockout.js components, custom shipping and payment methods, and third-party module integrations."
tags: ["magento 2", "checkout", "knockout js", "magento development", "php", "e-commerce", "tutorial", "frontend"]
categories: ["Magento 2", "Développement", "Tutoriels"]
keywords: ["magento 2 checkout customization", "magento 2 checkout layout", "magento 2 knockout checkout", "magento 2 add shipping field", "magento 2 custom checkout step", "magento 2 checkout extension"]
slug: "magento-2-checkout-customization"
---

Magento 2's checkout is built on a **Knockout.js** single-page application — it's powerful but notoriously complex to customize. This guide covers every major approach: layout XML overrides, Knockout component extensions, adding/removing fields, custom steps, shipping and payment modifications, and best practices to stay upgrade-safe. You can also check out my full [Magento 2 development service](/services/magento-2-development/) if you need a complete checkout implementation.

> **In short:** The Magento 2 checkout is composed of UI components (Knockout.js), layout handles (XML), and PHP providers (data sources). You can customize it via `layout/checkout_index_index.xml`, `extend`/`override` of Knockout components, and [plugins](/blog/magento-2-plugins-before-after-around-complete-guide/) on PHP classes.

## Table of Contents

1. [Understanding the Checkout Architecture](#understanding-the-checkout-architecture)
2. [Tools: Layout XML, Knockout, and PHP Providers](#tools-layout-xml-knockout-and-php-providers)
3. [Add a Custom Field to the Shipping Address](#add-a-custom-field-to-the-shipping-address)
4. [Remove a Field from the Checkout](#remove-a-field-from-the-checkout)
5. [Override a Knockout.js Component](#override-a-knockoutjs-component)
6. [Add a Custom Checkout Step](#add-a-custom-checkout-step)
7. [Customize Shipping Methods](#customize-shipping-methods)
8. [Customize Payment Methods](#customize-payment-methods)
9. [Add Validation Rules](#add-validation-rules)
10. [Modify the Order Summary (Sidebar)](#modify-the-order-summary-sidebar)
11. [Third-Party Extensions Compatibility](#third-party-extensions-compatibility)
12. [Best Practices & Upgrade Safety](#best-practices--upgrade-safety)
13. [FAQ](#faq)

## Understanding the Checkout Architecture

Magento 2's checkout is a single-page Knockout.js application with these core steps:

| Step | Component | Purpose |
|------|-----------|---------|
| Shipping | `Magento_Checkout/js/view/shipping` | Shipping address form + method selection |
| Billing | `Magento_Checkout/js/view/billing` | Billing address form |
| Payment | `Magento_Checkout/js/view/payment` | Payment method list |
| Summary | `Magento_Checkout/js/view/summary` | Order review sidebar |

Each step is a **UI component** composed of a `.html` template, a `.js` view-model, and a PHP **provider** class that supplies backend data. If you're new to [building Magento 2 modules](/blog/building-custom-magento-2-module/), start there first — checkout customization builds on the same module structure.

## Tools: Layout XML, Knockout, and PHP Providers

### Layout XML

The file `checkout_index_index.xml` controls which components render:

```xml
<page xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="urn:magento:framework:View/Layout/etc/page_configuration.xsd">
    <body>
        <referenceBlock name="checkout.root">
            <arguments>
                <argument name="jsLayout" xsi:type="array">
                    <!-- components go here -->
                </argument>
            </arguments>
        </referenceBlock>
    </body>
</page>
```

### Knockout Component Extending

Use `extend` to add to an existing component:

```js
define(['Magento_Checkout/js/view/shipping'], function (Component) {
    'use strict';
    return Component.extend({
        // your custom logic
    });
});
```

### PHP Providers

Backend logic lives in `Magento\Checkout\Block\Checkout\LayoutProcessor` or custom `Processors` that implement `LayoutProcessorInterface`.

## Add a Custom Field to the Shipping Address

### Step 1 — Create the layout XML

```xml
<!-- Vendor/Module/view/frontend/layout/checkout_index_index.xml -->
<page xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="urn:magento:framework:View/Layout/etc/page_configuration.xsd">
    <body>
        <referenceBlock name="checkout.root">
            <arguments>
                <argument name="jsLayout" xsi:type="array">
                    <item name="components" xsi:type="array">
                        <item name="checkout" xsi:type="array">
                            <item name="children" xsi:type="array">
                                <item name="steps" xsi:type="array">
                                    <item name="children" xsi:type="array">
                                        <item name="shipping-step" xsi:type="array">
                                            <item name="children" xsi:type="array">
                                                <item name="shippingAddress" xsi:type="array">
                                                    <item name="children" xsi:type="array">
                                                        <item name="shipping-address-fieldset" xsi:type="array">
                                                            <item name="children" xsi:type="array">
                                                                <item name="custom_field" xsi:type="array">
                                                                    <item name="config" xsi:type="array">
                                                                        <item name="component" xsi:type="string">uiComponent</item>
                                                                        <item name="template" xsi:type="string">ui/form/field</item>
                                                                        <item name="elementTmpl" xsi:type="string">ui/form/elements/input</item>
                                                                        <item name="label" xsi:type="string">Custom Field</item>
                                                                        <item name="dataScope" xsi:type="string">custom_field</item>
                                                                        <item name="provider" xsi:type="string">checkoutProvider</item>
                                                                        <item name="sortOrder" xsi:type="string">150</item>
                                                                        <item name="validation" xsi:type="array">
                                                                            <item name="required-entry" xsi:type="boolean">true</item>
                                                                        </item>
                                                                    </item>
                                                                </item>
                                                            </item>
                                                        </item>
                                                    </item>
                                                </item>
                                            </item>
                                        </item>
                                    </item>
                                </item>
                            </item>
                        </item>
                    </item>
                </argument>
            </arguments>
        </referenceBlock>
    </body>
</page>
```

### Step 2 — Save the field via LayoutProcessor

```php
namespace Vendor\Module\Block\Checkout;

use Magento\Checkout\Block\Checkout\LayoutProcessorInterface;

class CustomFieldProcessor implements LayoutProcessorInterface
{
    public function process($jsLayout)
    {
        // Field was already added via XML; persist it to the quote
        return $jsLayout;
    }
}
```

### Step 3 — Plugin on `ShippingInformationManagement`

```php
namespace Vendor\Module\Plugin;

use Magento\Checkout\Model\ShippingInformationManagement;
use Magento\Checkout\Model\Session;
use Magento\Quote\Api\Data\AddressExtensionFactory;

class SaveCustomField
{
    private $checkoutSession;
    private $addressExtensionFactory;

    public function __construct(
        Session $checkoutSession,
        AddressExtensionFactory $addressExtensionFactory
    ) {
        $this->checkoutSession = $checkoutSession;
        $this->addressExtensionFactory = $addressExtensionFactory;
    }

    public function beforeSaveAddressInformation(
        ShippingInformationManagement $subject,
        $cartId,
        \Magento\Checkout\Api\Data\ShippingInformationInterface $shippingInfo
    ) {
        $extAttributes = $shippingInfo->getShippingAddress()->getExtensionAttributes();
        if ($extAttributes === null) {
            $extAttributes = $this->addressExtensionFactory->create();
        }
        $customField = $shippingInfo->getShippingAddress()->getCustomAttribute('custom_field');
        $extAttributes->setCustomField($customField ? $customField->getValue() : '');

        return [$cartId, $shippingInfo];
    }
}
```

## Remove a Field from the Checkout

Use `LayoutProcessor` to unset fields:

```php
namespace Vendor\Module\Block\Checkout;

use Magento\Checkout\Block\Checkout\LayoutProcessorInterface;

class RemoveFieldProcessor implements LayoutProcessorInterface
{
    public function process($jsLayout)
    {
        $fieldset = &$jsLayout['components']['checkout']['children']['steps']
            ['children']['shipping-step']['children']['shippingAddress']
            ['children']['shipping-address-fieldset']['children'];

        unset($fieldset['company']);        // remove company field
        unset($fieldset['telephone']);      // remove telephone field

        return $jsLayout;
    }
}
```

## Override a Knockout.js Component

To replace the shipping component with your own:

```js
// Vendor/Module/view/frontend/web/js/view/custom-shipping.js
define([
    'Magento_Checkout/js/view/shipping',
    'Magento_Checkout/js/model/quote',
    'Magento_Customer/js/model/customer'
], function (Component, quote, customer) {
    'use strict';
    return Component.extend({
        defaults: {
            template: 'Vendor_Module/custom-shipping'
        },

        // Add a custom observable
        initialize: function () {
            this._super();
            this.customMessage = ko.observable('');
            return this;
        },

        // Override the shipping method selection
        setShippingInformation: function () {
            // custom logic before calling parent
            return this._super();
        }
    });
});
```

Register it in `checkout_index_index.xml`:

```xml
<item name="shipping" xsi:type="array">
    <item name="config" xsi:type="array">
        <item name="component" xsi:type="string">Vendor_Module/js/view/custom-shipping</item>
    </item>
</item>
```

## Add a Custom Checkout Step

### Step 1 — Create the step component

```js
// Vendor/Module/view/frontend/web/js/view/custom-step.js
define([
    'uiComponent',
    'Magento_Checkout/js/model/step-navigator',
    'jquery',
    'ko'
], function (Component, stepNavigator, $, ko) {
    'use strict';
    var uniqueId = 'custom-step';

    return Component.extend({
        defaults: {
            template: 'Vendor_Module/custom-step'
        },

        isVisible: ko.observable(false),
        stepCode: uniqueId,
        stepTitle: 'Custom Step',

        initialize: function () {
            this._super();
            stepNavigator.registerStep(
                this.stepCode,
                null,
                this.stepTitle,
                this.isVisible,
                _.bind(this.navigate, this),
                25  // sort order
            );
            return this;
        },

        navigate: function () {
            this.isVisible(true);
        },

        navigateToNextStep: function () {
            this.isVisible(false);
            stepNavigator.next();
        }
    });
});
```

### Step 2 — Register in layout XML

```xml
<item name="custom-step" xsi:type="array">
    <item name="config" xsi:type="array">
        <item name="component" xsi:type="string">Vendor_Module/js/view/custom-step</item>
    </item>
</item>
```

## Customize Shipping Methods

### Hide a shipping method

```php
namespace Vendor\Module\Plugin;

use Magento\Quote\Api\Data\ShippingMethodInterface;
use Magento\Quote\Model\Cart\ShippingMethodConverter;

class HideShippingMethod
{
    public function afterModelToDataObject(
        ShippingMethodConverter $subject,
        ShippingMethodInterface $result
    ) {
        $code = $result->getCarrierCode() . '_' . $result->getMethodCode();
        if (in_array($code, ['flatrate_flatrate'])) {
            return null;
        }
        return $result;
    }
}
```

### Add a custom shipping method

Create a Carrier class extending `\Magento\Shipping\Model\Carrier\AbstractCarrier` and implement `collectRates()`, then register it via `config.xml`.

## Customize Payment Methods

### Add a custom payment method

1. Create a Model implementing `Magento\Payment\Model\MethodInterface`
2. Define `config.xml` with method configuration
3. Create frontend templates for the checkout form
4. Register a Knockout component for the payment renderer

Need a custom gateway integration? See my [custom module packages](/services/custom-modules/) service for local payment processors (Konnect, Flouci, Paymee) and full checkout flows.

```xml
<!-- config.xml -->
<default>
    <payment>
        <custom_payment>
            <model>Vendor\Module\Model\Payment\CustomPayment</model>
            <title>Custom Payment</title>
            <active>1</active>
            <sort_order>10</sort_order>
            <order_status>pending</order_status>
            <allowspecific>0</allowspecific>
        </custom_payment>
    </payment>
</default>
```

## Add Validation Rules

Add custom Knockout validation rules:

```js
define(['jquery', 'jquery/validate'], function ($) {
    'use strict';
    $.validator.addMethod('custom-rule', function (value) {
        return value && value.length >= 3;
    }, $.mage.__('Value must be at least 3 characters'));
});
```

Then reference in your layout XML:

```xml
<item name="validation" xsi:type="array">
    <item name="custom-rule" xsi:type="boolean">true</item>
</item>
```

## Modify the Order Summary (Sidebar)

Override the `summary` Knockout component:

```js
define([
    'Magento_Checkout/js/view/summary/abstract-total',
    'Magento_Checkout/js/model/quote'
], function (Component, quote) {
    'use strict';
    return Component.extend({
        getCustomBlockHtml: function () {
            return '<p class="custom-note">' +
                $t('Your custom message here') + '</p>';
        }
    });
});
```

## Third-Party Extensions Compatibility

| Issue | Solution |
|-------|----------|
| Field conflicts | Use `sortOrder` to control field position |
| Step ordering broken | Register step with correct sort weight |
| JS errors from overrides | Use `extend` instead of `replace` when possible |
| Provider data not persisting | Create plugin on `ShippingInformationManagement::saveAddressInformation` |
| CSS collisions | Scope styles with checkout-specific class selectors |

## Best Practices & Upgrade Safety

- **Prefer `extend` over full component replacement** — keeps your code working across version bumps.
- **Use `LayoutProcessorInterface`** for field modifications instead of overriding templates.
- **Store custom data in `quote_extension` tables** via extension attributes — avoids core table modification.
- **Test across browsers and devices** — checkout JS varies in behavior.
- **Avoid modifying `Magento_Checkout/js/model/**` files directly** — extend them.
- **Always flush static content** after JS changes: `php bin/magento setup:static-content:deploy -f`.
- **Run full compilation** (`php bin/magento setup:upgrade && php bin/magento setup:di:compile`) after adding new PHP classes — see the guide on [setup:upgrade vs di:compile](/blog/magento-setup-upgrade-vs-di-compile/) for details.
- For deeper performance tuning, check my [performance optimization service](/services/performance-optimization/) covering FPC audit, Varnish, and Core Web Vitals.

## FAQ

### Why use LayoutProcessor instead of XML for field changes?

`LayoutProcessor` is more flexible for conditional logic (e.g., show field only for specific shipping methods) and avoids deeply nested XML for dynamic changes.

### How do I test my checkout changes in developer mode?

```bash
php bin/magento deploy:mode:set developer
php bin/magento cache:flush
npm run watch   # if theme uses Grunt
```

### My custom field doesn't save. What should I check?

1. Verify `dataScope` matches the attribute code
2. Plugin on `ShippingInformationManagement::saveAddressInformation` is registered
3. Extension attributes are properly declared in `extension_attributes.xml`
4. Check browser console for JS errors

### Can I add a step after payment?

Yes — register your step with a sort order higher than the payment step (default: 30) and implement the navigation logic accordingly.

## Conclusion

Customizing the Magento 2 checkout requires a solid understanding of its Knockout.js component architecture, layout XML system, and PHP providers. By using `extend` over replacement, `LayoutProcessor` for field changes, and plugins for data persistence, you can build robust, upgrade-safe checkout customizations.

Next steps:
- Build a custom shipping method with dynamic rates
- Implement a one-step checkout using third-party modules
- Create a gift message or order comment step
- Add address validation via Google Maps API
