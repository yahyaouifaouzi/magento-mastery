#!/bin/bash

SITE_DIR="content/tags"

declare -A TAGS

TAGS=(
  ["before-after-around"]="Magento 2 Before/After/Around Plugins"
  ["e-commerce"]="E-commerce Development Guides"
  ["interceptors"]="Magento 2 Interceptors Explained"
  ["magento-2"]="Magento 2 Tutorials & Guides"
  ["magento-development"]="Magento Development Best Practices"
  ["php"]="PHP Programming Guides"
  ["plugins"]="Magento Plugins & Extensions"
  ["tutorial"]="Programming Tutorials"
  ["adobe-commerce"]="Adobe Commerce Development"
  ["caching"]="Web Caching Strategies"
  ["core-web-vitals"]="Core Web Vitals Optimization"
  ["devops"]="DevOps & Deployment Guides"
  ["ecommerce"]="E-commerce Development"
  ["ecommerce-speed"]="E-commerce Speed Optimization"
  ["magento-caching"]="Magento Caching Optimization"
  ["magento2"]="Magento 2 Guides"
  ["module-development"]="Magento Module Development"
  ["performance-optimization"]="Performance Optimization Guides"
  ["redis"]="Redis Caching & Performance"
  ["seo"]="SEO Optimization Guides"
  ["varnish-cache"]="Varnish Cache Configuration"
  ["varnish"]="Varnish Performance Optimization"
)

echo "🚀 Creating Hugo tag pages..."

mkdir -p "$SITE_DIR"

for TAG in "${!TAGS[@]}"; do
  TITLE="${TAGS[$TAG]}"
  DIR="$SITE_DIR/$TAG"

  mkdir -p "$DIR"

  FILE="$DIR/_index.md"

  cat > "$FILE" <<EOF
---
title: "$TITLE"
description: "Explore articles about $TITLE on Magento Mastery."
seo_title: "$TITLE | Magento Mastery"
---
EOF

  echo "✔ Created: $FILE"
done

echo "🎉 All tags generated successfully!"