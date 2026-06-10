---
title: "Building a Custom Magento 2 Module from Scratch (2026 Guide)"
date: 2026-06-10
lastmod: 2026-06-10
summary: "Learn how to build a production-ready Magento 2 custom module step by step — from file structure to controllers, models, and CLI commands. Best practices included."
description: "Complete step-by-step guide to building a custom Magento 2 module from scratch in 2026. Covers module registration, etc/module.xml, controllers, models, DI, observers, and deployment best practices."
slug: "building-custom-magento-2-module"
tags:
  - magento2
  - php
  - ecommerce
  - adobe-commerce
  - module-development
  - backend-development
categories:
  - Magento 2
  - PHP Development
keywords:
  - "build custom magento 2 module"
  - "create magento 2 module from scratch"
  - "magento 2 module development tutorial"
  - "magento 2 extension development 2026"
  - "magento 2 module.xml registration.php"
  - "adobe commerce custom module"
  - "magento 2 custom controller"
  - "magento 2 dependency injection"
  - "magento 2 observer event"
  - "magento 2 setup upgrade module"
draft: false
---

<!--
=======================================================
SEO BRIEF — Faouzi Yahyaoui — Seraf Recommandations
=======================================================
🎯 Keyword Principal  : "magento 2 custom module"
Volume estimé      : 1 200–2 000 req/mois (EN)
Difficulté KD      : 52/100 (Modérée)

🔑 Longtail Keywords ciblés :
- "how to create magento 2 module from scratch"  → KD 35 | ~400/mois
- "magento 2 module development step by step"    → KD 38 | ~320/mois
- "magento 2 extension development tutorial"     → KD 45 | ~500/mois
- "adobe commerce custom module 2026"            → KD 28 | ~180/mois
- "magento 2 registration.php module.xml"        → KD 22 | ~250/mois

📌 Intent            : Informationnel + Transactionnel
📄 Longueur cible    : 2 500–3 500 mots
🔗 Liens internes suggérés :
- /magento-2-dependency-injection
- /magento-2-observer-plugin-preference
- /magento-2-rest-api-custom-endpoint
- /magento-2-setup-upgrade-guide
🔗 Liens externes (autorité) :
- developer.adobe.com/commerce/php/development/
- packagist.org (composer)
⏱  Temps de lecture cible : 12–15 min
=======================================================
-->

Magento 2 est la plateforme e-commerce open-source la plus extensible du marché — mais sa courbe d'apprentissage est redoutable. Créer un module custom de zéro est la compétence fondamentale qui débloque tout le reste : personnalisation métier, intégrations tierces, et performance optimisée sans toucher au core.

Dans ce guide complet, vous allez construire un module Magento 2 production-ready, étape par étape, ciblant **Magento 2.4.x / Adobe Commerce 2026**.

---

## Table des matières

1. [Prérequis et environnement](#prérequis)
2. [Structure de fichiers d'un module Magento 2](#structure)
3. [Étape 1 — Créer la structure de répertoires](#etape-1)
4. [Étape 2 — registration.php](#etape-2)
5. [Étape 3 — etc/module.xml](#etape-3)
6. [Étape 4 — Activer le module](#etape-4)
7. [Étape 5 — Ajouter un Controller et une Route](#etape-5)
8. [Étape 6 — Créer un Model et ResourceModel](#etape-6)
9. [Étape 7 — Dependency Injection (di.xml)](#etape-7)
10. [Étape 8 — Observer / Event](#etape-8)
11. [Étape 9 — Déploiement et bonnes pratiques](#etape-9)
12. [Erreurs fréquentes et debugging](#erreurs)
13. [FAQ](#faq)

---

## Prérequis et environnement {#prérequis}

Avant d'écrire la première ligne de code, vérifiez votre stack :

| Composant | Version recommandée (2026) |
|---|---|
| Magento / Adobe Commerce | 2.4.7 – 2.4.8 |
| PHP | 8.2 ou 8.3 |
| Composer | 2.x |
| MySQL / MariaDB | 8.0+ |
| Elasticsearch / OpenSearch | 8.x |

> **Tip SEO technique :** Si vous construisez une extension destinée à être distribuée sur le Marketplace Adobe Commerce, respectez les <a href="https://developer.adobe.com/commerce/php/coding-standards/" target="_blank" rel="noopener noreferrer">coding standards officiels</a> dès le départ.

---

## Structure de fichiers d'un module Magento 2 {#structure}

Chaque module Magento 2 suit une architecture stricte. Voici la structure minimale d'un module `MagentoMastery_ModuleName` :

```
app/code/Vendor/ModuleName/
├── registration.php          ← Point d'entrée obligatoire
├── etc/
│   ├── module.xml            ← Déclaration du module et version
│   ├── frontend/
│   │   └── routes.xml        ← Déclaration des routes frontend
│   └── di.xml                ← Dependency Injection
├── Controller/
│   └── Index/
│       └── Index.php         ← Action controller
├── Model/
│   ├── ExampleModel.php
│   └── ResourceModel/
│       ├── ExampleModel.php
│       └── ExampleModel/
│           └── Collection.php
├── Block/
│   └── ExampleBlock.php
├── view/
│   └── frontend/
│       ├── layout/
│       │   └── MagentoMastery_ModuleName_index_index.xml
│       └── templates/
│           └── example.phtml
└── Setup/
    └── InstallSchema.php     ← Création de tables DB
```

> 📌 **Lien interne suggéré :** *[Comprendre l'architecture Magento 2 : modules, plugins et préférences]*

---

## Étape 1 — Créer la structure de répertoires {#etape-1}

Remplacez `Vendor` par votre nom d'organisation (ex : `MagentoMastery`) et `ModuleName` par le nom fonctionnel (ex : `HelloWorld`).

```bash
mkdir -p app/code/MagentoMastery/HelloWorld/etc/frontend
mkdir -p app/code/MagentoMastery/HelloWorld/Controller/Index
mkdir -p app/code/MagentoMastery/HelloWorld/Model/ResourceModel/ExampleModel
mkdir -p app/code/MagentoMastery/HelloWorld/view/frontend/{layout,templates}
mkdir -p app/code/MagentoMastery/HelloWorld/Setup
```

---

## Étape 2 — registration.php {#etape-2}

Ce fichier est le point d'entrée que Magento utilise pour découvrir votre module via l'autoloader Composer.

```php
<?php
// app/code/MagentoMastery/HelloWorld/registration.php

use Magento\Framework\Component\ComponentRegistrar;

ComponentRegistrar::register(
    ComponentRegistrar::MODULE,
    'MagentoMastery_HelloWorld',
    __DIR__
);
```

**Points critiques :**
- Le nom `'MagentoMastery_HelloWorld'` doit correspondre exactement à la valeur `name` dans `module.xml`.
- `__DIR__` est la constante magique PHP qui pointe vers le répertoire courant — ne la remplacez jamais par un chemin absolu.

---

## Étape 3 — etc/module.xml {#etape-3}

Ce fichier XML déclare le module auprès du système Magento, définit sa version et ses dépendances.

```xml
<?xml version="1.0"?>
<!-- app/code/MagentoMastery/HelloWorld/etc/module.xml -->
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:Module/etc/module.xsd">
    <module name="MagentoMastery_HelloWorld" setup_version="1.0.0">
        <sequence>
            <!-- Déclarez ici les modules dont vous dépendez -->
            <module name="Magento_Catalog"/>
            <module name="Magento_Customer"/>
        </sequence>
    </module>
</config>
```

> ⚠️ La balise `<sequence>` ne crée pas une vraie dépendance technique — elle garantit uniquement l'ordre de chargement. Pour les vraies dépendances, déclarez-les dans `composer.json`.

---

## Étape 4 — Activer le module {#etape-4}

Une fois vos fichiers de base créés, activez le module avec les commandes CLI Magento :

```bash
# Activer le module
php bin/magento module:enable MagentoMastery_HelloWorld

# Exécuter les scripts d'installation (tables, config, etc.)
php bin/magento setup:upgrade

# En mode développement uniquement
php bin/magento setup:di:compile
php bin/magento cache:flush
```

Vérifiez que votre module est bien activé :

```bash
php bin/magento module:status MagentoMastery_HelloWorld
# Output attendu : Module is enabled
```

> 📌 **Lien interne suggéré :** *[Guide complet : bin/magento setup:upgrade vs setup:di:compile]*

---

## Étape 5 — Ajouter un Controller et une Route {#etape-5}

### 5.1 — Déclarer la route (routes.xml)

```xml
<?xml version="1.0"?>
<!-- app/code/MagentoMastery/HelloWorld/etc/frontend/routes.xml -->
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:App/etc/routes.xsd">
    <router id="standard">
        <route id="MagentoMastery_helloworld" frontName="helloworld">
            <module name="MagentoMastery_HelloWorld"/>
        </route>
    </router>
</config>
```

L'URL accessible sera : `https://yourstore.com/helloworld/index/index`

### 5.2 — Créer le Controller Action

```php
<?php
// app/code/MagentoMastery/HelloWorld/Controller/Index/Index.php

declare(strict_types=1);

namespace MagentoMastery\HelloWorld\Controller\Index;

use Magento\Framework\App\Action\HttpGetActionInterface;
use Magento\Framework\View\Result\PageFactory;

class Index implements HttpGetActionInterface
{
    public function __construct(
        private readonly PageFactory $pageFactory
    ) {}

    public function execute(): \Magento\Framework\View\Result\Page
    {
        return $this->pageFactory->create();
    }
}
```

> **Best practice 2026 :** Utilisez les interfaces `HttpGetActionInterface` / `HttpPostActionInterface` plutôt que d'étendre `Action`. C'est la recommandation officielle Adobe Commerce depuis 2.4.

### 5.3 — Layout XML et template

```xml
<?xml version="1.0"?>
<!-- app/code/MagentoMastery/HelloWorld/view/frontend/layout/helloworld_index_index.xml -->
<page xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:noNamespaceSchemaLocation="urn:magento:framework:View/Layout/etc/page_configuration.xsd">
    <body>
        <referenceContainer name="content">
            <block class="Magento\Framework\View\Element\Template"
                   name="MagentoMastery.helloworld.block"
                   template="MagentoMastery_HelloWorld::example.phtml"/>
        </referenceContainer>
    </body>
</page>
```

```php
<!-- app/code/MagentoMastery/HelloWorld/view/frontend/templates/example.phtml -->
<div class="MagentoMastery-helloworld">
    <h1><?= $block->escapeHtml(__('Hello from MagentoMastery_HelloWorld!')) ?></h1>
</div>
```

---

## Étape 6 — Créer un Model et ResourceModel {#etape-6}

Le pattern Model / ResourceModel / Collection est fondamental en Magento 2.

### 6.1 — Model

```php
<?php
// app/code/MagentoMastery/HelloWorld/Model/ExampleModel.php

declare(strict_types=1);

namespace MagentoMastery\HelloWorld\Model;

use Magento\Framework\Model\AbstractModel;

class ExampleModel extends AbstractModel
{
    protected function _construct(): void
    {
        $this->_init(ResourceModel\ExampleModel::class);
    }
}
```

### 6.2 — ResourceModel

```php
<?php
// app/code/MagentoMastery/HelloWorld/Model/ResourceModel/ExampleModel.php

declare(strict_types=1);

namespace MagentoMastery\HelloWorld\Model\ResourceModel;

use Magento\Framework\Model\ResourceModel\Db\AbstractDb;

class ExampleModel extends AbstractDb
{
    protected function _construct(): void
    {
        // Nom de la table DB, colonne primary key
        $this->_init('MagentoMastery_helloworld_example', 'entity_id');
    }
}
```

### 6.3 — Collection

```php
<?php
// app/code/MagentoMastery/HelloWorld/Model/ResourceModel/ExampleModel/Collection.php

declare(strict_types=1);

namespace MagentoMastery\HelloWorld\Model\ResourceModel\ExampleModel;

use Magento\Framework\Model\ResourceModel\Db\Collection\AbstractCollection;
use MagentoMastery\HelloWorld\Model\ExampleModel as ExampleModelAlias;
use MagentoMastery\HelloWorld\Model\ResourceModel\ExampleModel as ExampleResourceModel;

class Collection extends AbstractCollection
{
    protected function _construct(): void
    {
        $this->_init(ExampleModelAlias::class, ExampleResourceModel::class);
    }
}
```

### 6.4 — InstallSchema (création de table)

```php
<?php
// app/code/MagentoMastery/HelloWorld/Setup/InstallSchema.php

declare(strict_types=1);

namespace MagentoMastery\HelloWorld\Setup;

use Magento\Framework\Setup\InstallSchemaInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\SchemaSetupInterface;
use Magento\Framework\DB\Ddl\Table;

class InstallSchema implements InstallSchemaInterface
{
    public function install(SchemaSetupInterface $setup, ModuleContextInterface $context): void
    {
        $installer = $setup;
        $installer->startSetup();

        if (!$installer->tableExists('magentomastery_helloworld_example')) {
            $table = $installer->getConnection()->newTable(
                $installer->getTable('MagentoMastery_helloworld_example')
            )
            ->addColumn('entity_id', Table::TYPE_INTEGER, null, [
                'identity' => true,
                'nullable' => false,
                'primary'  => true,
                'unsigned' => true,
            ], 'Entity ID')
            ->addColumn('title', Table::TYPE_TEXT, 255, [
                'nullable' => false,
            ], 'Title')
            ->addColumn('created_at', Table::TYPE_TIMESTAMP, null, [
                'nullable' => false,
                'default'  => Table::TIMESTAMP_INIT,
            ], 'Created At')
            ->setComment('MagentoMastery HelloWorld Example Table');

            $installer->getConnection()->createTable($table);
        }

        $installer->endSetup();
    }
}
```

---

## Étape 7 — Dependency Injection (di.xml) {#etape-7}

Le système de DI de Magento 2 est l'un des concepts les plus puissants — et les plus mal compris.

```xml
<?xml version="1.0"?>
<!-- app/code/MagentoMastery/HelloWorld/etc/di.xml -->
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:ObjectManager/etc/config.xsd">

    <!-- Exemple : injecter une interface concrète (préférence) -->
    <preference for="MagentoMastery\HelloWorld\Api\ExampleInterface"
                type="MagentoMastery\HelloWorld\Model\ExampleModel"/>

    <!-- Exemple : Plugin (around/before/after) -->
    <type name="Magento\Catalog\Model\Product">
        <plugin name="MagentoMastery_helloworld_product_plugin"
                type="MagentoMastery\HelloWorld\Plugin\ProductPlugin"
                sortOrder="10"
                disabled="false"/>
    </type>

</config>
```

> 📌 **Lien interne suggéré :** *[Magento 2 : Plugins vs Observers vs Preferences — quand utiliser quoi ?]*

---

## Étape 8 — Observer / Event {#etape-8}

Les observers permettent de réagir aux événements du core sans modifier les classes natives.

### 8.1 — events.xml

```xml
<?xml version="1.0"?>
<!-- app/code/MagentoMastery/HelloWorld/etc/events.xml -->
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="urn:magento:framework:Event/etc/events.xsd">
    <event name="catalog_product_save_after">
        <observer name="MagentoMastery_helloworld_product_save"
                  instance="MagentoMastery\HelloWorld\Observer\ProductSaveAfter"/>
    </event>
</config>
```

### 8.2 — L'Observer PHP

```php
<?php
// app/code/MagentoMastery/HelloWorld/Observer/ProductSaveAfter.php

declare(strict_types=1);

namespace MagentoMastery\HelloWorld\Observer;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Psr\Log\LoggerInterface;

class ProductSaveAfter implements ObserverInterface
{
    public function __construct(
        private readonly LoggerInterface $logger
    ) {}

    public function execute(Observer $observer): void
    {
        /** @var \Magento\Catalog\Model\Product $product */
        $product = $observer->getEvent()->getProduct();

        $this->logger->info(
            sprintf('[MagentoMastery_HelloWorld] Product saved: %s (ID: %d)', 
                $product->getName(), 
                (int) $product->getId()
            )
        );
    }
}
```

---

## Étape 9 — Déploiement et bonnes pratiques {#etape-9}

### Checklist de déploiement

```bash
# 1. Activation et upgrade
php bin/magento module:enable MagentoMastery_HelloWorld
php bin/magento setup:upgrade

# 2. Compilation DI (obligatoire en production)
php bin/magento setup:di:compile

# 3. Déploiement des fichiers statiques
php bin/magento setup:static-content:deploy -f

# 4. Nettoyage du cache
php bin/magento cache:flush
php bin/magento cache:clean
```

### Bonnes pratiques de développement

- **Utilisez `declare(strict_types=1)`** en tête de chaque fichier PHP.
- **Préférez l'injection via le constructeur** (`readonly` properties en PHP 8.2+).
- **Évitez l'ObjectManager direct** — c'est un anti-pattern sauf dans les factories/proxies.
- **Versionez vos migrations** via `UpgradeSchema.php` ou les DB patches (`DataPatchInterface`).
- **Écrivez des tests unitaires** dès le début — Magento supporte PHPUnit nativement.
- **Respectez le PSR-12** pour le formatage du code.

> ⚠️ En production, ne jamais développer en mode `developer`. Utilisez `php bin/magento deploy:mode:set production` avant tout déploiement.

---

## Erreurs fréquentes et debugging {#erreurs}

| Erreur | Cause probable | Solution |
|---|---|---|
| `Module not found` | Nom incorrect dans `registration.php` | Vérifiez la casse exacte `MagentoMastery_ModuleName` |
| `Area code not set` | Controller mal implémenté | Implémentez `HttpGetActionInterface` |
| Blank page | Erreur PHP silencieuse | Vérifiez `var/log/exception.log` |
| `Cannot instantiate interface` | DI mal configuré | Ajoutez `<preference>` dans `di.xml` |
| Cache obsolète | Modification de layout/config | `php bin/magento cache:flush` |
| `Table already exists` | `setup:upgrade` rejoué | Vérifiez `if (!$installer->tableExists(...))` |

### Activer le mode debug

```bash
php bin/magento deploy:mode:set developer
tail -f var/log/system.log
tail -f var/log/exception.log
```

---

## FAQ {#faq}

**Q : Quelle est la différence entre un module dans `app/code/` et dans `vendor/` ?**  
`app/code/` est réservé aux modules projet-spécifiques (non-réutilisables). `vendor/` est géré par Composer — à utiliser pour les extensions distribuables sur le Marketplace.

**Q : Dois-je utiliser `InstallSchema.php` ou les DB Patches en 2026 ?**  
Les DB Patches (`DataPatchInterface` / `SchemaPatchInterface`) sont la méthode recommandée depuis Magento 2.3+. `InstallSchema.php` reste fonctionnel mais est considéré legacy.

**Q : Mon module est activé mais la page renvoie une 404. Que faire ?**  
Vérifiez : (1) le `frontName` dans `routes.xml`, (2) le nom du fichier controller (sensible à la casse), (3) videz le cache et recompilez le DI.

**Q : Comment tester mon module sans affecter la production ?**  
Utilisez un environnement staging isolé avec `php bin/magento deploy:mode:set developer`. Ajoutez des tests PHPUnit dans le répertoire `Test/Unit/` de votre module.

**Q : Adobe Commerce vs Magento Open Source — les modules sont-ils compatibles ?**  
La plupart des modules Open Source sont compatibles avec Adobe Commerce (anciennement Magento Enterprise). L'inverse n'est pas toujours vrai car Adobe Commerce inclut des modules payants supplémentaires.

---

## Conclusion

Vous disposez maintenant d'un module Magento 2 complet, avec controllers, models, DI, et observers — prêt pour la production. La clé est de toujours respecter la structure imposée par le framework et d'exploiter le système de DI plutôt que de modifier le core.

**Prochaines étapes :**
- Implémentez des **Service Contracts** (interfaces + repositories) pour les données exposées en API
- Explorez les **GraphQL resolvers** pour les storefronts headless
- Ajoutez des **tests d'intégration** avec le framework de test natif Magento

> 📌 **Articles connexes :**
> - *Magento 2 REST API : créer un endpoint personnalisé*
> - *Magento 2 Plugins : before, around, after — guide complet*
> - *Adobe Commerce Performance : optimiser les requêtes EAV*