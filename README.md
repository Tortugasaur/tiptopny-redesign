# TipTop Realty — `design/glendale-storefront`

Queens family-business storefront redesign for TipTop Realty Management Corp.

Awning stripes (brick red / cream), painted shop-window photo frame,
handwritten Caveat script accent. Newsreader (warm display serif) + DM Sans
(humanist body) + Caveat (hand). Polaroid-style listing frames with brick-red
pins. Listings sit in the shop window; services are "painted on the window."

## Run locally

```bash
npm run dev   # python3 -m http.server 5173
```

Then open <http://localhost:5173>.

## Files

- `index.html` — single-page semantic markup, anchor nav
- `styles.css` — all styles, no framework
- `favicon.svg` — brick awning with serif "TT"

No build step. No JS framework. Static deploys anywhere (Vercel, Netlify,
GitHub Pages, S3).

## Swapping the listing photos

Each listing uses an Unsplash URL with `?auto=format&fit=crop&w=...&q=80`
parameters. To swap in real TipTop photos: replace the `src` on each
`<article class="frame">` `<img>`. Keep aspect ratios close to 4:3. The
polaroid frame, brick pin, and rotation effects all work with any photo
that has a clear subject. Update each `alt` to describe the actual building.

## Polish state

- [x] Favicon (SVG with awning)
- [x] Open Graph + Twitter card meta
- [x] Real address, phone, hours, services
- [x] `tel:` and `sms:` action links
- [x] Mobile-first responsive
- [x] Semantic HTML5 landmarks
- [ ] Real TipTop listing photos (currently Unsplash stock)
- [ ] Real wordmark (currently typographic via Newsreader shopname)
- [ ] Lighthouse 90+ verified post-deploy

## Sibling direction

The other surviving direction is on `design/newsprint` — NYC editorial
newspaper aesthetic. Same content, different visual world.
