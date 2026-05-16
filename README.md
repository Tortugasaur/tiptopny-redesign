# TipTop Realty — `design/newsprint`

Editorial newspaper redesign for TipTop Realty Management Corp.

NYC Sunday real estate section meets Village Voice classifieds. Cream paper,
deep ink, single red-ink accent. Fraunces (display serif) + Source Serif 4
(body) + IBM Plex Mono (numerics). Numbered listings, drop cap on the lede,
column rules, hairlines between sections.

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
- `assets/tiptop/` — local TipTop listing, storefront, and profile photography
- `favicon.svg` — typographic "TT" with red-ink dot

No build step. No JS framework. Static deploys anywhere (Vercel, Netlify,
GitHub Pages, S3).

## Swapping the listing photos

Each listing uses local TipTop photography from `assets/tiptop/`. To swap in
final TipTop photos: replace the `src` on each `<article class="listing">`
`<img>`. Keep aspect ratios close to 4:3 for standard cards and 5:4 for the
featured card. Update each `alt` to describe the actual building.

## Polish state

- [x] Favicon (SVG)
- [x] Open Graph + Twitter card meta
- [x] Real address, phone, hours, services
- [x] `tel:` and `sms:` action links
- [x] Mobile-first responsive
- [x] Semantic HTML5 landmarks
- [x] Imported listing photos from the TipTop property set
- [x] Client-facing listing confirmation copy
- [x] Zillow buttons distinguish the East Rockaway listing from neighborhood results
- [ ] Remaining real Zillow URLs from John (draft listings use Zillow neighborhood pages)
- [ ] Real wordmark (currently typographic via Fraunces masthead)
- [ ] Lighthouse 90+ verified post-deploy

## Sibling direction

The other surviving direction is on `design/glendale-storefront` — Queens
family-business storefront aesthetic. Same content, different visual world.
