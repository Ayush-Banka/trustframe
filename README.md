# TrustFrame

Website for **TrustFrame**, a regulatory intelligence platform being built by TrustFrame Private Limited in Bengaluru. TrustFrame is designed to bring banking disclosures and regulatory information together in one structured, traceable view, so fintechs and enterprise teams can make better-informed banking-partner decisions.

**Live site:** https://ayush-banka.github.io/trustframe/

> TrustFrame is in development. The demos on this site use a fictional bank, fictional figures and a fictional regulator. Nothing on the site is real bank data, and no customers, partners or results are claimed.

## Pages

| Page | Address | What's on it |
| --- | --- | --- |
| Home | `/` | The idea, Exhibit 1 (an interactive disclosure summary with source trails), Fig. 1 (scattered sources becoming one record) and a three-question poll |
| How it works | `/how-it-works/` | The problem, the four-step approach and the planned capabilities |
| Use cases | `/use-cases/` | Fintech and enterprise teams, plus a review-time calculator |
| Try the concept | `/try/` | Ask TrustFrame, a three-bank comparison and a regulatory updates feed |
| About | `/about/` | Why TrustFrame, the team, principles, progress and FAQ |
| Contact | `/contact/` | Email, phone, WhatsApp, LinkedIn, Instagram and a contact form |
| Glossary | `/glossary/` | Plain-English meanings of the terms used across the site |
| Not found | any wrong address | A 404 page that suggests the closest real page |

## What's inside

- Plain HTML, CSS and JavaScript. No framework, no build step on the server and no tracking.
- Interactive concept demos where every figure links back to its source.
- Dotted terms that show a short definition on hover or tap and link to the glossary.
- Contact form and poll sent through [Formspree](https://formspree.io).
- A floating WhatsApp button.
- Link preview card, home-screen icons, sitemap and a custom 404 page.
- Works from small phones to wide screens, with keyboard and screen reader support.

## Repository layout

```
index.html                 Home page
how-it-works/index.html    How it works
use-cases/index.html       Use cases
try/index.html             Try the concept
about/index.html           About
contact/index.html         Contact
glossary/index.html        Glossary
404.html                   Shown by GitHub Pages for any missing address
styles.css                 Shared styles
site.js                    Shared scripts
og-image.png               Link preview image for WhatsApp, LinkedIn and X
favicon.svg                Browser tab icon
apple-touch-icon.png       Home-screen icons and web app manifest
icon-192.png
icon-512.png
icon-maskable-512.png
site.webmanifest
founder-*.jpg              Team photos on the About page
trustframe-one-pager.pdf   A4 summary linked from About and the footer
sitemap.xml                Page list for search engines
```

## Run it locally

From the repository folder:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080/. The 404 page uses `/trustframe/` addresses, so it only looks right on the live site.

## Publishing

GitHub Pages serves the site from the `main` branch, root folder (Settings > Pages > Deploy from a branch). Every push to `main` goes live in a minute or two.

## Forms

The contact form and the poll both send to one Formspree form. The form address is not written out in the pages; `site.js` builds it only at the moment a message is sent. Both forms also carry a hidden `_gotcha` field that Formspree uses to drop spam bots. The free Formspree plan allows 50 submissions a month across both.

## Editing notes

- The header and footer are repeated in every page, so a change to either has to be made in all eight HTML files.
- Keep demo content fictional and clearly labelled as fictional.
- After changing a page, check it at phone width as well as on a laptop.

## Team

TrustFrame is being built by its co-founders **Ayush Banka**, **Vedit Agrawal** and **Kartikeya Gupta**.

Contact: iayushbanka@gmail.com

---

© 2026 TrustFrame Private Limited. All rights reserved. Made with ♥ in Bengaluru.
