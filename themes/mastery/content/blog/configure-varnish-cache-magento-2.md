---
title: "Magento 2 Varnish Cache Configuration Guide"
date: 2026-06-10
lastmod: 2026-06-10
summary: "Learn how to configure Varnish Cache in Magento 2 for ultra-fast page load times, improved TTFB, and better Core Web Vitals scores."
slug: "configure-varnish-cache-magento-2"
tags:
  - Magento 2
  - Varnish Cache
  - Performance Optimization
  - SEO
  - DevOps
  - Caching
---

## Why Configure Varnish Cache in Magento 2?

Magento 2 ships with a built-in **Full Page Cache (FPC)** backed by either the filesystem or Redis. But for high-traffic stores, neither option scales well. **Varnish Cache** is the industry-standard HTTP accelerator that can serve cached pages in **under 5 ms** — without ever touching PHP or MySQL.

> **SEO Impact:** Faster TTFB (Time To First Byte) directly improves Core Web Vitals (LCP, FID), which Google uses as ranking signals since 2021.

---

## Prerequisites

Before you start, make sure you have:

- Magento 2.4.x installed and running
- Varnish 7.x installed on your server (or as a Docker container)
- Root or sudo access to your server
- Magento CLI access (`bin/magento`)
- A working Nginx or Apache as the backend web server

---

## Step 1 — Install Varnish on Your Server

### Ubuntu / Debian

```bash
sudo apt update
sudo apt install varnish -y
varnishd -V
```

### CentOS / RHEL

```bash
sudo yum install varnish -y
varnishd -V
```

### Verify Varnish version

Magento 2.4.x supports **Varnish 6.x and 7.x**. Always use one of these versions to ensure full compatibility.

---

## Step 2 — Generate the VCL File from Magento 2 Admin

Magento 2 can automatically generate a **VCL (Varnish Configuration Language)** file tailored for your store. This is the most reliable approach.

### Via Magento Admin Panel

1. Go to **Stores → Configuration → Advanced → System**
2. Expand **Full Page Cache**
3. Set **Caching Application** to `Varnish Cache`
4. Click **Varnish Configuration** to expand settings
5. Fill in:
    - **Access list**: `localhost` (or your Magento server IP)
    - **Backend host**: `127.0.0.1`
    - **Backend port**: `8080` (your web server port)
    - **Grace period**: `300` seconds
6. Click **Export VCL for Varnish 7** (or 6, depending on your version)

### Via Magento CLI

```bash
bin/magento varnish:vcl:generate \
  --export-version=7 \
  --output-file=/etc/varnish/default.vcl
```

---

## Step 3 — Configure Varnish to Listen on Port 80

By default, Varnish listens on port **6081**. For production, you want Varnish on port **80** and your web server on port **8080**.

Edit the Varnish service configuration:

```bash
sudo nano /etc/default/varnish
```

Update the `DAEMON_OPTS` line:

```bash
DAEMON_OPTS="-a :80 \
             -T localhost:6082 \
             -f /etc/varnish/default.vcl \
             -S /etc/varnish/secret \
             -s malloc,256m"
```

For **systemd** systems (Ubuntu 18.04+), also edit the unit file override:

```bash
sudo systemctl edit varnish
```

Add:

```ini
[Service]
ExecStart=
ExecStart=/usr/sbin/varnishd \
  -a :80 \
  -T localhost:6082 \
  -f /etc/varnish/default.vcl \
  -S /etc/varnish/secret \
  -s malloc,256m
```

---

## Step 4 — Move Your Web Server to Port 8080

### Nginx

```nginx
# /etc/nginx/sites-available/magento
server {
    listen 8080;
    server_name yourdomain.com;
    root /var/www/magento/pub;

    # ... rest of your Magento Nginx config
}
```

### Apache

```apache
# /etc/apache2/ports.conf
Listen 8080

# /etc/apache2/sites-available/magento.conf
<VirtualHost *:8080>
    ServerName yourdomain.com
    DocumentRoot /var/www/magento/pub
    # ... rest of config
</VirtualHost>
```

Restart your web server:

```bash
sudo systemctl restart nginx
# or
sudo systemctl restart apache2
```

---

## Step 5 — Apply the VCL and Start Varnish

Copy the generated VCL to the Varnish config directory:

```bash
sudo cp /path/to/generated.vcl /etc/varnish/default.vcl
```

Test the VCL syntax before restarting:

```bash
sudo varnishd -C -f /etc/varnish/default.vcl
```

If no errors, restart Varnish:

```bash
sudo systemctl restart varnish
sudo systemctl enable varnish
```

---

## Step 6 — Enable Varnish in Magento 2

### Via Magento CLI (Recommended)

```bash
bin/magento config:set system/full_page_cache/caching_application 2
bin/magento cache:flush
```

Value `2` = Varnish, value `1` = Built-in FPC.

### Verify the configuration

```bash
bin/magento config:show system/full_page_cache/caching_application
```

---

## Step 7 — Configure ESI (Edge Side Includes) for Dynamic Blocks

Varnish uses **ESI** to cache full pages while keeping dynamic blocks (cart, customer name, etc.) fresh. Magento 2 supports ESI natively.

Make sure ESI is enabled in your VCL (it should be included in the auto-generated VCL):

```vcl
sub vcl_recv {
    # Enable ESI processing
    if (req.url ~ "^/page_cache/block/esi") {
        return(pass);
    }
}
```

In Magento Admin:

1. Go to **Stores → Configuration → Advanced → Developer**
2. Enable **Use JavaScript version of ESI** if needed

---

## Step 8 — Tune TTL and Cache Headers

The generated VCL includes sensible defaults, but you can tune the TTL (Time To Live) for better hit rates.

### Custom TTL in VCL

```vcl
sub vcl_backend_response {
    # Cache Magento pages for 1 hour
    if (beresp.http.X-Magento-Tags) {
        set beresp.ttl = 3600s;
        set beresp.grace = 300s;
    }
}
```

### Recommended TTL Values

| Content Type        | Recommended TTL |
|---------------------|-----------------|
| Product pages       | 3600s (1 hour)  |
| Category pages      | 7200s (2 hours) |
| CMS pages           | 86400s (1 day)  |
| Checkout/Cart       | 0s (never cache)|
| Customer area       | 0s (never cache)|

---

## Step 9 — Verify Varnish is Working

### Check Response Headers

```bash
curl -I https://yourdomain.com
```

Look for these headers in the response:

```
X-Cache: HIT       ← Page served from Varnish cache
X-Cache: MISS      ← First request, cache being populated
Age: 3542          ← Seconds the page has been cached
Via: 1.1 varnish   ← Confirms traffic is passing through Varnish
```

### Live Varnish Statistics

```bash
varnishstat
```

Focus on:
- `MAIN.cache_hit` — cached requests served
- `MAIN.cache_miss` — requests that went to Magento
- Hit ratio = `cache_hit / (cache_hit + cache_miss)` — aim for **> 85%**

### Varnish Log (Real-time)

```bash
varnishlog -g request -q "ReqURL ~ '/'"
```

---

## Step 10 — Purge Varnish Cache from Magento

Magento 2 sends **PURGE** requests to Varnish when products, categories, or CMS pages are updated. This requires the correct ACL in your VCL.

### Verify ACL in VCL

```vcl
acl purge {
    "localhost";
    "127.0.0.1";
    "::1";
    # Add your Magento server IP if separate
}

sub vcl_recv {
    if (req.method == "PURGE") {
        if (!client.ip ~ purge) {
            return(synth(403, "Not allowed."));
        }
        return(purge);
    }
}
```

### Manual Cache Flush from Magento CLI

```bash
# Flush FPC (triggers Varnish purge)
bin/magento cache:flush full_page

# Or from Admin: System → Cache Management → Flush Magento Cache
```

---

## Common Issues and Troubleshooting

### Issue 1 — Varnish Not Caching (Always MISS)

**Cause:** Magento is sending `Cache-Control: no-cache` or `Set-Cookie` headers.

**Fix:** Check your VCL `vcl_recv` — cookies for logged-in users should bypass cache, but anonymous users should not set cookies.

```bash
# Debug headers
curl -I -v https://yourdomain.com 2>&1 | grep -i cache
```

### Issue 2 — Cart/Customer Data Showing Incorrect Data

**Cause:** ESI not configured correctly, or Varnish is caching dynamic blocks.

**Fix:** Ensure ESI pass rules are in your VCL and Magento's `Cacheable=false` blocks are excluded.

### Issue 3 — HTTPS Not Working Through Varnish

**Cause:** Varnish does not handle SSL/TLS natively.

**Fix:** Use **Nginx as a TLS terminator** in front of Varnish:

```
Browser → Nginx:443 (TLS) → Varnish:80 → Nginx/Apache:8080 (Magento)
```

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header Host $host;
    }
}
```

### Issue 4 — Varnish Not Starting After VCL Change

**Fix:** Always validate VCL before applying:

```bash
varnishd -C -f /etc/varnish/default.vcl && echo "VCL OK"
```

---

## SEO Benefits of Varnish Cache on Magento 2

Configuring Varnish correctly delivers measurable SEO improvements:

- **TTFB under 100ms** → Better Core Web Vitals (LCP, FID/INP)
- **Reduced server load** → More crawl budget for Googlebot
- **Faster page rendering** → Lower bounce rate → Better engagement signals
- **Scalable architecture** → Handles traffic spikes without 503 errors that hurt rankings

---

## Keyword Strategy for This Topic

> *Section for Faouzi Yahyaoui — SEO Intelligence Report*

| Keyword | Monthly Volume (FR+INT) | Difficulty | Intent |
|---|---|---|---|
| configure varnish cache magento 2 | ~1,200/mo | 42/100 | Informational |
| magento 2 varnish setup | ~900/mo | 38/100 | Informational |
| magento 2 varnish vcl | ~600/mo | 35/100 | Informational |
| magento 2 full page cache varnish | ~500/mo | 30/100 | Informational |
| varnish magento 2 tutorial | ~400/mo | 28/100 | Informational |
| magento 2 varnish not working | ~300/mo | 20/100 | Troubleshooting |
| magento 2 cache ttl varnish | ~150/mo | 18/100 | Long-tail |

**Recommended internal links to add:**
- `/magento-2-redis-cache-setup` — Redis as session cache complement
- `/magento-2-nginx-configuration` — Nginx backend config
- `/magento-2-performance-optimization` — Parent pillar page
- `/magento-2-full-page-cache` — FPC overview

**Recommended external links (authoritative sources):**
- [Varnish Software Official Docs](https://varnish-cache.org/docs/)
- [Magento DevDocs — Configure Varnish](https://experienceleague.adobe.com/docs/commerce-operations/configuration-guide/cache/varnish/config-varnish.html)

---

## Conclusion

Configuring Varnish Cache in Magento 2 is one of the highest-ROI performance optimizations you can make for your store. With a proper setup — Varnish on port 80, your web server on 8080, ESI enabled, and correct purge ACLs — you can achieve **85–95% cache hit ratios** and serve pages in single-digit milliseconds.

The result: faster pages, better Core Web Vitals, higher Google rankings, and a better user experience that converts.

---

