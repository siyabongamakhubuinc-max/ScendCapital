# Deployment Guide
**Scend Capital Website · docs/deployment-guide.md**

---

## Overview

The Scend Capital website is a **fully static site** — no server-side code, no database, no build step. Every hosting platform that can serve HTML files will work. This guide covers the three most common options in order of recommended simplicity.

---

## Option 1 — Netlify (Recommended)

Netlify offers a free tier, automatic HTTPS, custom domains, and instant deploys from GitHub. This is the easiest path for a team without a dedicated server.

### Method A — Drag and Drop (fastest, no account linking)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the entire `scend-capital-site/` folder onto the page
3. Netlify assigns a random URL (e.g., `charming-einstein-abc123.netlify.app`)
4. Click **Site configuration → Change site name** to something like `scendcapital`
5. Your site is live at `https://scendcapital.netlify.app`

### Method B — GitHub + Netlify (recommended for ongoing updates)

```bash
# Step 1: Push repository to GitHub
git init
git add .
git commit -m "Scend Capital website initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/scend-capital.git
git push -u origin main

# Step 2: Connect to Netlify
# - Go to app.netlify.com
# - Click "Add new site" → "Import an existing project"
# - Choose GitHub → select your repository
# - Build command: (leave blank)
# - Publish directory: . (dot — the root)
# - Click Deploy site
```

### Setting the custom domain on Netlify

1. In Netlify: **Domain management → Add a domain**
2. Enter your domain (e.g., `scendcapital.co.za`)
3. Netlify will show you DNS records to add — add them via your domain registrar
4. Wait for DNS propagation (15 min – 48 hours)
5. Netlify provisions HTTPS automatically (Let's Encrypt)

### Environment variables on Netlify

Store the Google Sheets URL securely:

1. Netlify dashboard → **Site configuration → Environment variables**
2. Add variable: `SHEETS_URL` = `https://script.google.com/macros/s/YOUR_ID/exec`

> **Note:** For a static HTML site with no build step, environment variables are not automatically injected. Either set the URL directly in `forms.js` (and keep `forms.js` out of public GitHub), or use a Netlify Function as a proxy.

---

## Option 2 — GitHub Pages (Free, Good for Open Repositories)

```bash
# Step 1: Push to GitHub
git init && git add . && git commit -m "Initial"
git remote add origin https://github.com/YOUR_ORG/scend-capital.git
git push -u origin main

# Step 2: Enable GitHub Pages
# GitHub repo → Settings → Pages
# Source: "Deploy from a branch"
# Branch: main  |  Folder: / (root)
# Click Save

# Site will be at: https://YOUR_ORG.github.io/scend-capital/
```

### Custom domain with GitHub Pages

1. In GitHub: **Settings → Pages → Custom domain** → enter `scendcapital.co.za`
2. Add these DNS records at your registrar:

   | Type | Name | Value |
   |---|---|---|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | YOUR_ORG.github.io |

3. Tick **Enforce HTTPS** once DNS propagates

> ⚠️ GitHub Pages repositories are **public by default** on free accounts. Do not commit your Google Apps Script URL to a public repo. Either use GitHub Secrets with a build action, or paste the URL directly after download and do not push `forms.js`.

---

## Option 3 — Traditional cPanel Hosting (e.g., Afrihost, Hetzner SA, Web Africa)

This is the most common setup for South African businesses with existing shared hosting plans.

### Upload via cPanel File Manager

1. Log into your cPanel (typically `yourdomain.co.za/cpanel`)
2. Open **File Manager**
3. Navigate to `public_html/` (or `www/`)
4. Click **Upload** and upload all files, maintaining the folder structure:

   ```
   public_html/
   ├── index.html
   ├── assets/
   │   ├── images/
   │   │   ├── scend-logo.png
   │   │   └── scend-logo.webp
   │   └── js/
   │       └── forms.js
   ```

### Upload via FTP

```bash
# Using lftp (Linux/macOS)
lftp -u YOUR_FTP_USER,YOUR_FTP_PASS ftp.yourdomain.co.za
mirror -R ./scend-capital-site/ /public_html/

# Using FileZilla (Windows/Mac GUI)
# Host: ftp.yourdomain.co.za
# Username / Password: from cPanel
# Port: 21
# Drag scend-capital-site/ contents into public_html/
```

### Enable HTTPS on cPanel

1. cPanel → **SSL/TLS** → **Let's Encrypt SSL**
2. Select your domain and click **Issue**
3. Tick **Force HTTPS Redirect**

> HTTPS is **required** for the Google Sheets form submission (`fetch()` will be blocked on HTTP in modern browsers).

---

## Option 4 — Vercel

```bash
npm install -g vercel
cd scend-capital-site
vercel

# Follow prompts:
# Set up and deploy? Yes
# Which scope? (your account)
# Link to existing project? No
# Project name: scend-capital
# Directory: ./
# Override settings? No
```

Custom domain: Vercel dashboard → **Domains → Add**

---

## DNS Reference for South African Registrars

Common SA domain registrars and where to manage DNS:

| Registrar | DNS Panel Location |
|---|---|
| Afrihost | Client Zone → Domains → Manage DNS |
| Web Africa | Control Panel → DNS Manager |
| Hetzner SA | My Hetzner → Domains → Manage |
| ZACR / co.za | Via your accredited registrar |
| Domains.co.za | Domain Manager → DNS Settings |

### Typical DNS records for Netlify + .co.za domain

```
Type   Name    Value                        TTL
A      @       75.2.60.5                    3600
CNAME  www     scendcapital.netlify.app.    3600
```

---

## HTTPS Verification

Once deployed, confirm HTTPS is working correctly:

```bash
curl -I https://scendcapital.co.za
# Should return: HTTP/2 200
# Should NOT return: HTTP/1.1 301 or any "insecure" warnings
```

Or visit [SSL Labs](https://www.ssllabs.com/ssltest/) and enter your domain for a full certificate report.

---

## Post-Deployment Checklist

- [ ] Site loads at `https://scendcapital.co.za`
- [ ] Logo displays correctly in nav and footer
- [ ] Nav becomes white/opaque on scroll (test by scrolling past hero)
- [ ] All section links in nav scroll smoothly to the correct section
- [ ] Mobile hamburger menu opens and closes
- [ ] Contact form submits and shows success state
- [ ] Google Sheet receives the test submission
- [ ] Email notification received at `info@scendcapital.co.za`
- [ ] Waterfall bars animate on scroll to the Structure section
- [ ] Testimonial cards scroll horizontally on mobile
- [ ] Non-FSP disclosure visible in footer
- [ ] No browser console errors (open DevTools → Console)
- [ ] Page loads in under 3 seconds (test at pagespeed.web.dev)

---

## Making Updates After Deployment

### Content changes (text, colours, links)

1. Edit `index.html` locally
2. If using Netlify/GitHub: `git add . && git commit -m "Update content" && git push` — deploys automatically
3. If using cPanel: re-upload only the changed file(s) via File Manager or FTP

### Logo update

1. Replace `assets/images/scend-logo.png` with the new file (keep the same filename)
2. Re-upload the file to your hosting
3. Clear browser cache to see the change (`Ctrl+Shift+R`)

### Updating the Google Apps Script

See [google-sheets-setup.md — Step 7](google-sheets-setup.md#step-7--re-deploying-after-changes).

---

*Scend Capital · 15 Chris Kruger Street, Norkem Park, 1618 · info@scendcapital.co.za*
