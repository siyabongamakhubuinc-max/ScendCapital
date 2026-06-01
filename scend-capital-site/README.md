# Scend Capital — Website Repository

**Structured Micro-Capital · Gauteng, South Africa**

A fully self-contained static website for Scend Capital, built with vanilla HTML, CSS, and JavaScript. No build tools, no frameworks, no dependencies — open `index.html` in any browser and it works.

---

## Repository Structure

```
scend-capital-site/
│
├── index.html                        # Main website (single page)
│
├── assets/
│   ├── images/
│   │   ├── scend-logo.png            # Primary logo (PNG, transparent-friendly)
│   │   └── scend-logo.webp           # WebP version (smaller, modern browsers)
│   ├── css/
│   │   └── (styles are inline in index.html for portability)
│   ├── js/
│   │   └── forms.js                  # Google Sheets form integration
│   └── fonts/
│       └── (Google Fonts loaded via CDN — see offline note below)
│
├── scripts/
│   └── google-apps-script.js         # Paste into Google Apps Script editor
│
├── docs/
│   ├── google-sheets-setup.md        # Step-by-step Google Sheets guide
│   └── deployment-guide.md           # Hosting & deployment options
│
├── .env.example                      # Environment variable template
├── .gitignore                        # Git ignore rules
└── README.md                         # This file
```

---

## Quick Start

### Option 1 — Open directly (no server needed)

```bash
# Clone or download the repository
git clone https://github.com/scendcapital/website.git
cd scend-capital-site

# Open in browser
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

### Option 2 — Local development server

A local server is required to test form submissions (fetch() is blocked on `file://` protocol by some browsers).

**Using Python (built-in, no install required):**
```bash
cd scend-capital-site
python3 -m http.server 3000
# Open: http://localhost:3000
```

**Using Node.js (`npx serve`):**
```bash
cd scend-capital-site
npx serve .
# Open: http://localhost:3000
```

**Using VS Code Live Server extension:**
- Install the Live Server extension in VS Code
- Right-click `index.html` → **Open with Live Server**

---

## Logo Usage

The Scend Capital logo is stored in `assets/images/` and referenced in two places in `index.html`:

```html
<!-- Navigation bar (dark hero background) -->
<img class="nav-logo-img" src="assets/images/scend-logo.png" alt="Scend Capital" height="38">

<!-- Footer (dark background) -->
<img class="fb-logo-img" src="assets/images/scend-logo.png" alt="Scend Capital" height="28">
```

### Logo rendering on different backgrounds

The PNG logo has a black background. CSS blend modes handle rendering:

| Context | CSS applied | Effect |
|---|---|---|
| Dark hero / footer | `mix-blend-mode: screen` | Black bg disappears, gold + text show |
| White nav (scrolled) | `mix-blend-mode: multiply` | White bg disappears, logo renders naturally |

These classes are already applied in `index.html`. If you update the logo file, keep the same filename (`scend-logo.png`) or update both `src` attributes in `index.html`.

### Using the WebP version for performance

Modern browsers can use the smaller `.webp` format. To enable it, replace the `<img>` tags with `<picture>` elements:

```html
<picture>
  <source srcset="assets/images/scend-logo.webp" type="image/webp">
  <img class="nav-logo-img" src="assets/images/scend-logo.png" alt="Scend Capital" height="38">
</picture>
```

---

## Google Sheets Integration

All four contact form types (Investor, Entrepreneur, Deal Scout, General) submit to Google Sheets via a Google Apps Script Web App.

**Quick setup:**
1. Create a Google Sheet named `Scend Capital — Website Enquiries`
2. Open Extensions → Apps Script and paste `scripts/google-apps-script.js`
3. Run `setupSheets()` once to create all tabs
4. Deploy as a Web App (Execute as: Me · Access: Anyone)
5. Copy the Web App URL into `assets/js/forms.js`

Full step-by-step instructions: **[docs/google-sheets-setup.md](docs/google-sheets-setup.md)**

---

## Environment Variables

The Google Apps Script Web App URL should be treated as a secret and not committed to a public repository.

### For local development

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env`:
```
SHEETS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

Then update `assets/js/forms.js` to read from the environment (if using a build tool like Vite or Parcel). For a purely static site with no build step, add the URL directly to `forms.js` and ensure `forms.js` is listed in `.gitignore`.

### For production hosting

| Platform | How to set env vars |
|---|---|
| Netlify | Site Settings → Environment Variables |
| Vercel | Project Settings → Environment Variables |
| GitHub Pages | Use GitHub Secrets + a build action |
| cPanel / shared hosting | Not needed — edit `forms.js` directly before uploading |

---

## Customisation

### Colours

All brand colours are CSS custom properties defined at the top of `index.html` inside `:root {}`:

```css
:root {
  --gold:      #9C833A;   /* Primary accent — all CTAs, rules, highlights */
  --gold-2:    #b09640;   /* Hover state */
  --gold-3:    #c8ac58;   /* Lighter accent, stat values */
  --gold-dim:  rgba(156,131,58,.09);  /* Tinted backgrounds */
  --gold-rule: rgba(156,131,58,.24);  /* Subtle borders */
  --gold-pale: #f9f5e8;   /* Very light gold wash */
  --ink:       #111111;   /* Primary text */
  --ink-3:     #4a4a4a;   /* Secondary text */
  /* ... */
}
```

Change `--gold` to update the accent colour site-wide.

### Typography

The site uses two Google Fonts loaded via CDN:

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@...&family=Outfit:wght@...&display=swap" rel="stylesheet">
```

- **Cormorant** — display headings (serif, editorial)
- **Outfit** — body text and UI (clean sans-serif)

To use different fonts, replace the Google Fonts link and update the CSS font-family declarations.

### Content

All text content is directly in `index.html`. Search for section comments to find each area:

```
<!-- ════════ HERO ════════ -->
<!-- ════════ METRICS BAND ════════ -->
<!-- ════════ ABOUT ════════ -->
<!-- ════════ HOW IT WORKS ════════ -->
<!-- ════════ STRUCTURE ════════ -->
<!-- ════════ SECTORS ════════ -->
<!-- ════════ TESTIMONIALS ════════ -->
<!-- ════════ CONTACT ════════ -->
<!-- ════════ FOOTER ════════ -->
```

### Contact details

Search for `15 Chris Kruger` to find all instances of the address, and `info@scendcapital.co.za` for email references.

### Non-FSP Legal Disclosure

The regulatory disclosure appears **once**, at the bottom of the footer:

```html
<!-- NON-FSP DISCLOSURE — FOOTER ONLY -->
<div class="fsp-block" role="note">
  <strong>Legal &amp; Regulatory Disclosure:</strong> ...
</div>
```

Do not move this — it must remain visible on every page load.

---

## Offline / No-CDN Mode

If the site will be used without internet access (e.g., on a local server at events), replace the Google Fonts CDN link with self-hosted font files.

1. Download the fonts from [fonts.google.com](https://fonts.google.com):
   - [Cormorant](https://fonts.google.com/specimen/Cormorant)
   - [Outfit](https://fonts.google.com/specimen/Outfit)
2. Place the `.woff2` files in `assets/fonts/`
3. Replace the `<link>` tag with `@font-face` declarations in the `<style>` block

---

## Deployment Options

### GitHub Pages (free, recommended for static sites)

```bash
# 1. Create a GitHub repository
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOURUSERNAME/scend-capital.git
git push -u origin main

# 2. In GitHub: Settings → Pages → Source: Deploy from branch → main → / (root)
# Site will be live at: https://YOURUSERNAME.github.io/scend-capital/
```

> **Note:** GitHub Pages requires the scripts URL in `forms.js` to be set directly — environment variables are not available without a CI/CD build step.

### Netlify (free tier, custom domain, instant deploy)

```bash
# Drag-and-drop the scend-capital-site/ folder to netlify.com/drop
# Or connect your GitHub repo for automatic deploys on push
```

Set the Google Sheets URL as a Netlify environment variable for security.

### Traditional / cPanel Web Hosting

1. Open `assets/js/forms.js` and paste your Google Apps Script URL directly.
2. Upload all files via FTP / File Manager maintaining the same folder structure:
   ```
   public_html/
   ├── index.html
   ├── assets/
   │   ├── images/scend-logo.png
   │   ├── images/scend-logo.webp
   │   └── js/forms.js
   ```
3. Point your domain's DNS A record to the hosting server IP.

Full deployment instructions: **[docs/deployment-guide.md](docs/deployment-guide.md)**

---

## Browser Support

| Browser | Version | Status |
|---|---|---|
| Chrome | 88+ | ✅ Full support |
| Firefox | 85+ | ✅ Full support |
| Safari | 14+ | ✅ Full support |
| Edge | 88+ | ✅ Full support |
| Chrome Android | 88+ | ✅ Full support |
| Samsung Internet | 14+ | ✅ Full support |
| IE 11 | — | ❌ Not supported |

CSS custom properties, `IntersectionObserver`, `fetch()`, and `mix-blend-mode` are all required. IE 11 does not support these.

---

## Legal & Compliance Notes

- The **Non-FSP FAIS Disclosure** is in the footer and must remain visible.
- The **POPIA consent checkbox** on the contact form is required and cannot be submitted without ticking.
- All form submissions include a `timestamp`, `pageUrl`, and `referrer` for audit purposes.
- The Google Sheet functions as a basic **POPIA processing record** — ensure your Google account / Workspace privacy settings are appropriately configured.
- If you add analytics (e.g., Google Analytics), update the Privacy Policy accordingly.

---

## File Checklist Before Going Live

- [ ] Logo files in `assets/images/` (both `.png` and `.webp`)
- [ ] Google Apps Script deployed and URL added to `forms.js`
- [ ] Test form submission → Google Sheet row appears
- [ ] Test notification email received
- [ ] `NOTIFY_EMAIL` set to correct address in `google-apps-script.js`
- [ ] WhatsApp number added (`[WhatsApp Number]` placeholder in `index.html`)
- [ ] Website domain set and DNS propagated
- [ ] HTTPS enabled on hosting (required for `fetch()` to work in production)
- [ ] Non-FSP disclosure visible in footer
- [ ] Logo renders correctly on both dark hero and light nav

---

## Support

**Scend Capital**
15 Chris Kruger Street, Norkem Park, 1618, Gauteng
info@scendcapital.co.za

---

*Repository maintained by Scend Capital. All rights reserved.*
