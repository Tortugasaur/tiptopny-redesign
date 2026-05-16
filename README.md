# TipTop Realty — `design/modern-broker`

The third demo direction for John. **"What tiptopny.com would look like if a
2026 broker designer cleaned it up."** Closest in spirit to the active
tiptopny.com site (red brand, photo-led hero, services + listings + contact
sections), but with the dated WordPress feel stripped out.

White base, brand red `#c5302a` (echoing the active site), Instrument Serif
italic accents on top of a confident Inter sans, JetBrains Mono numerics for
prices. Sticky header with phone CTA, full-bleed photo hero with overlaid
card, red "specialist services" banner, clean editorial listings grid, dark
services band, photo-anchored about section, contact card.

## Run locally

```bash
npm install
npm run dev
```

Then open <http://127.0.0.1:5173>. If port `5173` is busy, stop the old
server and rerun `npm run dev`.

## Files

- `index.html` — single-page semantic markup, anchor nav
- `styles.css` — all styles, no framework
- `favicon.svg` — TT in brand red on white
- `listings.json` — listings data shared with admin page
- `admin.html` — internal dashboard mockup (same as on the storefront branch)
- `tests/` — node --test smoke tests (27 passing)

No build step, no JS framework. Static deploys anywhere.

## Position alongside the other directions

| Branch | Aesthetic |
|---|---|
| `design/glendale-storefront` | Warm family-business storefront (awning, painted window, hand script). Luigi is actively polishing this one. |
| `design/newsprint` | NYC editorial newspaper (Fraunces + Source Serif, classifieds-grid, drop cap). |
| `design/modern-broker` (this) | Clean modern brokerage closest in spirit to the active tiptopny.com — brand red, photo-led, professional. |

## Polish state

- [x] Favicon (SVG, brand red, modern)
- [x] Open Graph + Twitter card meta
- [x] Real address, phone, hours, services
- [x] Mobile-first responsive
- [x] Semantic HTML5 landmarks
- [x] Real TipTop listing photos
- [x] Listings driven by `listings.json` (single source of truth)
- [x] Zillow buttons distinguish the East Rockaway listing from neighborhood results
- [x] Internal admin dashboard at `admin.html` (unlinked from public nav)
- [ ] Remaining real Zillow URLs from John (draft listings use Zillow neighborhood pages)
- [ ] Lighthouse 90+ verified post-deploy

## Internal admin page

`admin.html` is a static mockup of an internal listings dashboard. It
reads the same `listings.json` as the public site and renders a table
with status pills (`current` / `needs_sync` / `unknown`) and a no-op
"Mark synced" button. Not linked from the public navigation; opt-in
via direct URL `/admin.html`. No auth — defer until John signals he
wants the dashboard for real.
