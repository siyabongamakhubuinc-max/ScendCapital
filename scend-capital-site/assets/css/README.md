# assets/css/

All styles for the Scend Capital website are written inline
inside the `<style>` block in `index.html`.

This is intentional — keeping styles in one file makes the
site fully portable (a single HTML file you can open anywhere).

## If You Want to Extract Styles

If you prefer a separate stylesheet for easier editing:

1. Cut everything between `<style>` and `</style>` in index.html
2. Save it as `assets/css/main.css`
3. Replace the `<style>` block with:
   ```html
   <link rel="stylesheet" href="assets/css/main.css">
   ```

## CSS Architecture

Styles inside index.html are organised in this order:

```
1.  Design tokens        :root { --gold, --ink, --white ... }
2.  Reset                box-sizing, body, h1-h4, a, img ...
3.  Logo helpers         .logo-on-dark, .logo-on-light, mix-blend-mode
4.  Navigation           #nav, .nav-logo, .nav-links, .ham, #mdrawer
5.  Ticker               .ticker, .ticker-track, .ticker-item
6.  Hero section         #hero, .hero-inner, .hero-h1, .hero-btns ...
7.  Buttons              .btn, .btn-gold, .btn-ghost-w, .btn-dark
8.  Metrics band         #metrics, .metrics-grid, .mc
9.  Layout utilities     .wrap, .sec-tag, .sec-h, .sec-sub
10. About section        #about, .about-grid, .pillar, .deal-card
11. How it works         #how, .how-tabs, .htab, .hsteps, .hstep
12. Structure section    #structure, .struct-grid, .ptbl, .wf-*
13. Sectors section      #sectors, .sgrid, .sc
14. Testimonials         #stories, .stories-scroll, .story-card
15. Contact section      #contact, .contact-grid, .form-box, .ff
16. Footer               footer, .footer-grid, .fsp-block
17. Scroll reveal        .rv, .rvl, .rvs, .in, .d1-.d6
18. Responsive           @media max-width: 980px, 640px
19. Reduced motion       @media prefers-reduced-motion
```
