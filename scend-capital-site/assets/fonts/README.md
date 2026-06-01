# assets/fonts/

This folder is reserved for self-hosted font files if you switch
from the Google Fonts CDN to locally hosted fonts.

## Current Setup

Fonts are loaded via Google Fonts CDN in index.html:

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet">
```

- **Cormorant** — display headings (serif)
- **Outfit** — body text and UI (sans-serif)

## Switching to Self-Hosted Fonts (Offline Mode)

1. Download font files from https://fonts.google.com
   - Cormorant: https://fonts.google.com/specimen/Cormorant
   - Outfit:    https://fonts.google.com/specimen/Outfit

2. Place .woff2 files here:
   ```
   assets/fonts/
   ├── cormorant-300.woff2
   ├── cormorant-400.woff2
   ├── cormorant-500.woff2
   ├── cormorant-300-italic.woff2
   ├── cormorant-400-italic.woff2
   ├── outfit-300.woff2
   ├── outfit-400.woff2
   └── outfit-500.woff2
   ```

3. Replace the Google Fonts <link> tag in index.html with:
   ```html
   <style>
     @font-face {
       font-family: 'Cormorant';
       src: url('assets/fonts/cormorant-400.woff2') format('woff2');
       font-weight: 400;
       font-style: normal;
       font-display: swap;
     }
     @font-face {
       font-family: 'Cormorant';
       src: url('assets/fonts/cormorant-400-italic.woff2') format('woff2');
       font-weight: 400;
       font-style: italic;
       font-display: swap;
     }
     @font-face {
       font-family: 'Outfit';
       src: url('assets/fonts/outfit-300.woff2') format('woff2');
       font-weight: 300;
       font-style: normal;
       font-display: swap;
     }
     @font-face {
       font-family: 'Outfit';
       src: url('assets/fonts/outfit-400.woff2') format('woff2');
       font-weight: 400;
       font-style: normal;
       font-display: swap;
     }
     @font-face {
       font-family: 'Outfit';
       src: url('assets/fonts/outfit-500.woff2') format('woff2');
       font-weight: 500;
       font-style: normal;
       font-display: swap;
     }
   </style>
   ```

No other changes are needed — the CSS font-family references stay the same.
