# TipTop Realty — `design/modern-landlord-hybrid`

The fourth demo direction for John: **modern broker polish with Glendale local trust,
re-angled around landlord services.**

This branch starts from `design/modern-broker`, keeps the clean professional
structure, warms down the bright white palette, and pulls in the strongest Glendale
signal: real Myrtle Avenue office trust. The strategy is no longer "lead with
listings." The homepage now leads with practical support for NYC landlords and
building owners navigating DHCR, rent stabilization, attorney handoff, and
property-management admin.

## Run Locally

```bash
npm install
npm run dev
```

Then open <http://127.0.0.1:5173>. If port `5173` is busy, stop the old
server and rerun `npm run dev`.

## Files

- `index.html` — single-page semantic markup, anchor nav, landlord-services copy
- `styles.css` — modern-broker visual system with Myrtle Avenue storefront hero
- `favicon.svg` — TT in brand red on white
- `listings.json` — listings data shared with admin page
- `admin.html` — internal listings dashboard mockup
- `tests/` — node --test smoke tests

No build step, no JS framework. Static deploys anywhere.

## Position Alongside The Other Directions

| Branch | Aesthetic | Strategy fit |
|---|---|---|
| `design/modern-landlord-hybrid` (this) | Clean modern professional site with real office/local trust. | Best fit for the new landlord-services concept. |
| `design/modern-broker` | Clean modern brokerage closest to the active tiptopny.com. | Safest old base, but too sales/listings-led now. |
| `design/glendale-storefront` | Warm family-business storefront. | Best emotional/local trust, but softer for compliance/admin work. |
| `design/newsprint` | NYC editorial newspaper/classifieds style. | Memorable wildcard, but less safe for legal-adjacent owner services. |

## Polish State

- [x] Favicon (SVG, brand red, modern)
- [x] Open Graph + Twitter card meta
- [x] Real address, phone, hours, services
- [x] Mobile-first responsive
- [x] Semantic HTML5 landmarks
- [x] Real TipTop photography
- [x] Landlord-services hero and primary CTA
- [x] Glendale/Myrtle Avenue trust cues in a modern layout
- [x] Warmer, less bright visual tone
- [x] Legal-adjacent boundary language
- [x] Listings driven by `listings.json` but kept secondary
- [x] Zillow buttons distinguish the East Rockaway listing from neighborhood results
- [x] Internal admin dashboard at `admin.html` (unlinked from public nav)
- [ ] John-approved service wording, disclaimers, attorney-boundary language
- [ ] Remaining real Zillow URLs from John if listings stay on the site
- [ ] Lighthouse 90+ verified post-deploy

## Internal Admin Page

`admin.html` is still the inherited static listings dashboard mockup. For this
direction, the stronger future internal tool is probably not listings sync; it is a
landlord case intake packet or owner/admin checklist workflow. Keep the dashboard as
scaffolding until John confirms the real recurring workflow.
