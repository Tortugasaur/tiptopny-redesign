import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
const { listings } = JSON.parse(await readFile(new URL("../listings.json", import.meta.url), "utf8"));

test("scaffold: storefront index.html exists and is non-empty", () => {
  assert.ok(html.length > 0, "index.html should not be empty");
  assert.match(html, /<title>/);
});

test("keeps the Glendale storefront concept", () => {
  const storefrontMarkers = [
    'class="shop-nav"',
    'class="window"',
    "Houses for sale, rentals, and property management",
    "handled by hand",
  ];

  for (const marker of storefrontMarkers) {
    assert.match(html, new RegExp(marker));
  }
});

test("uses the official logo in the sticky nav without a separate top banner", () => {
  assert.match(html, /src="assets\/tiptop\/tiptop-realty-original-logo\.jpg"/);
  assert.match(html, /class="nav-brand"/);
  assert.match(html, /class="nav-logo-frame"/);
  assert.match(html, /class="nav-logo"/);
  assert.match(html, /class="nav-actions"/);
  assert.match(css, /\.nav-brand\s*\{/);
  assert.match(css, /\.nav-logo-frame\s*\{/);
  assert.match(css, /\.nav-logo\s*\{/);
  assert.match(css, /\.nav-actions\s*\{/);
  assert.match(html, /<a class="nav-brand"[^>]*>\s*<span class="nav-logo-frame">\s*<img[^>]+class="nav-logo"/);
  assert.doesNotMatch(html, /class="nav-brand-main"/);
  assert.doesNotMatch(html, /<header class="storefront"/);
  assert.doesNotMatch(html, /class="official-logo"/);
  assert.doesNotMatch(html, /class="awning/);
  assert.doesNotMatch(css, /\.storefront\s*\{/);
  assert.doesNotMatch(css, /\.official-logo\s*\{/);
  assert.doesNotMatch(css, /\.awning\b/);
  assert.doesNotMatch(html, /A Glendale brokerage on Myrtle Avenue/);
  assert.doesNotMatch(html, /class="open-sign"/);
  assert.doesNotMatch(css, /\.open-sign\b/);

  const navBlock = css.match(/\.shop-nav\s*\{[^}]*\}/);
  assert.ok(navBlock, ".shop-nav rule should exist");
  assert.match(navBlock[0], /height:\s*82px/);
  assert.match(navBlock[0], /padding:\s*0\s+var\(--gutter\)/);
  assert.match(navBlock[0], /background:\s*var\(--cream-light\)/);
  assert.match(navBlock[0], /box-shadow:\s*0\s+8px\s+22px/);
  assert.doesNotMatch(navBlock[0], /rgba\(250,\s*242,\s*221/);
  assert.doesNotMatch(navBlock[0], /border-top:/);
  assert.doesNotMatch(navBlock[0], /border-bottom:/);

  const navBrandBlock = css.match(/\.nav-brand\s*\{[^}]*\}/);
  assert.ok(navBrandBlock, ".nav-brand rule should exist");
  assert.match(navBrandBlock[0], /align-self:\s*stretch/);
  assert.match(navBrandBlock[0], /height:\s*100%/);
  assert.match(navBrandBlock[0], /padding:\s*0/);

  const navLogoFrameBlock = css.match(/\.nav-logo-frame\s*\{[^}]*\}/);
  assert.ok(navLogoFrameBlock, ".nav-logo-frame rule should exist");
  assert.match(navLogoFrameBlock[0], /display:\s*inline-flex/);
  assert.match(navLogoFrameBlock[0], /align-items:\s*stretch/);
  assert.match(navLogoFrameBlock[0], /flex:\s*0\s+0\s+auto/);
  assert.match(navLogoFrameBlock[0], /height:\s*82px/);
  assert.doesNotMatch(navLogoFrameBlock[0], /overflow:\s*hidden/);

  const navLogoBlock = css.match(/\.nav-logo\s*\{[^}]*\}/);
  assert.ok(navLogoBlock, ".nav-logo rule should exist");
  assert.match(navLogoBlock[0], /height:\s*100%/);
  assert.match(navLogoBlock[0], /width:\s*auto/);
  assert.match(navLogoBlock[0], /object-fit:\s*contain/);
  assert.doesNotMatch(navLogoBlock[0], /transform:/);
});

test("first screen brings the hero closer to the sticky navigation", () => {
  const windowBlock = css.match(/\.window\s*\{[^}]*\}/);
  assert.ok(windowBlock, ".window rule should exist");
  assert.match(windowBlock[0], /padding:\s*clamp\(28px,\s*4\.5vw,\s*54px\)\s+var\(--gutter\)\s+clamp\(40px,\s*6vw,\s*76px\)/);
});

test("section anchors land clear of the sticky nav", () => {
  const anchorOffsetBlock = css.match(/:where\(#top,\s*#about,\s*#listings,\s*#services,\s*#contact\)\s*\{[^}]*\}/);
  assert.ok(anchorOffsetBlock, "sticky-nav anchor offset rule should exist");
  assert.match(anchorOffsetBlock[0], /scroll-margin-top:\s*65px/);
});

test("sticky navigation has a deliberate phone layout", () => {
  const tabletMedia = css.match(/@media \(max-width: 920px\)\s*\{[\s\S]*?\n\}\n\n@media \(min-width: 721px\)/);
  assert.ok(tabletMedia, "expected max-width: 920px media block before phone block");
  assert.match(tabletMedia[0], /\.shop-nav\s*\{/);
  assert.match(tabletMedia[0], /grid-template-columns:\s*auto\s+minmax\(0,\s*1fr\)\s+auto/);
  assert.match(tabletMedia[0], /padding:\s*0\s+var\(--gutter\)/);
  assert.doesNotMatch(tabletMedia[0], /\.nav-hours\s*\{[^}]*display:\s*none/);
  assert.match(tabletMedia[0], /\.window-frame\s*\{[^}]*margin:\s*0\s+auto\s+36px/);
  assert.match(tabletMedia[0], /\.window-copy\s*\{[^}]*margin:\s*0\s+auto/);

  const compactMedia = css.match(/@media \(max-width: 720px\)\s*\{[\s\S]*?@media \(max-width: 560px\)/);
  assert.ok(compactMedia, "expected a compact breakpoint before the phone-only block");
  assert.match(compactMedia[0], /\.nav-hours\s*\{[^}]*display:\s*none/);

  const mobileMedia = css.match(/@media \(max-width: 560px\)\s*\{[\s\S]*?\n\}/);
  assert.ok(mobileMedia, "expected max-width: 560px media block");
  assert.match(mobileMedia[0], /\.shop-nav\s*\{/);
  assert.match(mobileMedia[0], /grid-template-columns:\s*1fr\s+auto/);
  assert.match(mobileMedia[0], /height:\s*auto/);
  assert.match(mobileMedia[0], /\.nav-links\s*\{/);
  assert.match(mobileMedia[0], /grid-column:\s*1\s*\/\s*-1/);
  assert.match(mobileMedia[0], /gap:\s*0\s+12px/);
  assert.match(mobileMedia[0], /font-size:\s*15px/);
  assert.match(mobileMedia[0], /flex-wrap:\s*nowrap/);
  assert.match(mobileMedia[0], /\.nav-logo-frame\s*\{[^}]*height:\s*40px/);
  assert.match(mobileMedia[0], /\.window-copy\s*\{[^}]*order:\s*-1/);
  assert.match(mobileMedia[0], /\.window h1\s*\{[^}]*font-size:\s*clamp\(34px,\s*9\.4vw,\s*38px\)/);
});

test("services and listing cards avoid leftover decoration and uneven image treatment", () => {
  assert.doesNotMatch(css, /\.menu::before/);
  assert.doesNotMatch(css, /\.menu::after/);
  assert.doesNotMatch(css, /repeating-linear-gradient/);

  const framePicBlock = css.match(/\.frame-pic\s*\{[^}]*\}/);
  assert.ok(framePicBlock, ".frame-pic rule should exist");
  assert.match(framePicBlock[0], /background:\s*linear-gradient/);
  assert.doesNotMatch(framePicBlock[0], /overflow:\s*hidden/);

  const frameImageBlock = css.match(/\.frame-pic img\s*\{[^}]*\}/);
  assert.ok(frameImageBlock, ".frame-pic img rule should exist");
  assert.match(frameImageBlock[0], /display:\s*block/);
  assert.match(frameImageBlock[0], /filter:\s*brightness\(1\.06\)\s+contrast\(1\.03\)\s+saturate\(0\.94\)/);

  const framePinBlock = css.match(/\.frame-pin\s*\{[^}]*\}/);
  assert.ok(framePinBlock, ".frame-pin rule should exist");
  assert.match(framePinBlock[0], /top:\s*-8px/);

  const frameCardBlock = css.match(/\.frame-card\s*\{[^}]*\}/);
  assert.ok(frameCardBlock, ".frame-card rule should exist");
  assert.match(frameCardBlock[0], /display:\s*flex/);
  assert.match(frameCardBlock[0], /flex-direction:\s*column/);
  assert.match(frameCardBlock[0], /min-height:\s*252px/);
});

test("listing grid balances the final two-card desktop row", () => {
  const framesGridBlock = css.match(/\.frames-grid\s*\{[^}]*\}/);
  assert.ok(framesGridBlock, ".frames-grid rule should exist");
  assert.match(framesGridBlock[0], /grid-template-columns:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\)/);

  const frameSpanBlock = css.match(/\.frames-grid\s+\.frame\s*\{[^}]*\}/);
  assert.ok(frameSpanBlock, ".frames-grid .frame rule should exist");
  assert.match(frameSpanBlock[0], /grid-column:\s*span\s+2/);

  const finalRowBlock = css.match(/\.frames-grid\s+\.frame:nth-last-child\(2\):nth-child\(3n\s*\+\s*1\)\s*\{[^}]*\}/);
  assert.ok(finalRowBlock, "final two-card row centering rule should exist");
  assert.match(finalRowBlock[0], /grid-column:\s*2\s*\/\s*span\s*2/);

  const tabletMedia = css.match(/@media \(max-width: 920px\)\s*\{[\s\S]*?\n\}\n\n@media \(min-width: 721px\)/);
  assert.ok(tabletMedia, "expected max-width: 920px media block before phone block");
  assert.match(tabletMedia[0], /\.frames-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*1fr\)/);
  assert.match(tabletMedia[0], /\.frames-grid\s+\.frame\s*\{[^}]*grid-column:\s*auto/);
  assert.match(tabletMedia[0], /\.frames-grid\s+\.frame:nth-last-child\(2\):nth-child\(3n\s*\+\s*1\)\s*\{[^}]*grid-column:\s*auto/);
});

test("lower sections transition cleanly below listings", () => {
  const displayCaseBlock = css.match(/\.display-case\s*\{[^}]*\}/);
  assert.ok(displayCaseBlock, ".display-case rule should exist");
  assert.match(displayCaseBlock[0], /padding:\s*clamp\(40px,\s*5vw,\s*64px\)\s+var\(--gutter\)\s+clamp\(56px,\s*7vw,\s*88px\)/);

  const menuBlock = css.match(/\.menu\s*\{[^}]*\}/);
  assert.ok(menuBlock, ".menu rule should exist");
  assert.match(menuBlock[0], /padding:\s*clamp\(64px,\s*7vw,\s*88px\)\s+var\(--gutter\)\s+clamp\(52px,\s*6vw,\s*72px\)/);
  assert.match(menuBlock[0], /box-shadow:\s*inset\s+0\s+18px\s+0\s+rgba\(245,\s*233,\s*204,\s*0\.04\)/);

  const menuHeadBlock = css.match(/\.menu-head\s*\{[^}]*\}/);
  assert.ok(menuHeadBlock, ".menu-head rule should exist");
  assert.match(menuHeadBlock[0], /margin:\s*0\s+auto\s+clamp\(24px,\s*3vw,\s*34px\)/);

  const menuListItemBlock = css.match(/\.menu-list li\s*\{[^}]*\}/);
  assert.ok(menuListItemBlock, ".menu-list li rule should exist");
  assert.match(menuListItemBlock[0], /padding:\s*clamp\(18px,\s*2\.4vw,\s*28px\)\s+clamp\(14px,\s*2vw,\s*24px\)/);

  const visitBlock = css.match(/\.visit\s*\{[^}]*\}/);
  assert.ok(visitBlock, ".visit rule should exist");
  assert.match(visitBlock[0], /padding:\s*clamp\(52px,\s*7vw,\s*76px\)\s+var\(--gutter\)\s+clamp\(48px,\s*6vw,\s*72px\)/);
  assert.match(visitBlock[0], /gap:\s*clamp\(22px,\s*3vw,\s*34px\)/);
});

test("uses plainer brokerage labels instead of the cute shop copy", () => {
  assert.match(html, /Available now/i);
  assert.match(html, /Services/i);
  assert.match(html, /Contact the office/i);
  assert.doesNotMatch(html, /A note from the shop/i);
  assert.doesNotMatch(html, /Painted on the window/i);
  assert.doesNotMatch(html, /In the window today/i);
});

test("weekday hours live quietly in the sticky nav", () => {
  assert.match(html, /class="nav-hours"[^>]*data-office-status="closed"/);
  assert.match(html, /Mon&#8209;Fri 9&#8209;5/);
  assert.match(html, /updateOfficeStatus/);
  assert.match(html, /America\/New_York/);
  assert.match(html, /officeStatus = open \? "open" : "closed"/);
  assert.doesNotMatch(html, /Office open <strong>Mon&#8209;Fri 9&#8209;5<\/strong>/);
  assert.doesNotMatch(html, /weekend text/i);
  assert.doesNotMatch(html, /class="open-note"/);
  assert.doesNotMatch(css, /\.open-note\b/);

  const hoursDotBlock = css.match(/\.hours-dot\s*\{[^}]*\}/);
  assert.ok(hoursDotBlock, ".hours-dot rule should exist");
  assert.match(hoursDotBlock[0], /background:\s*var\(--muted\)/);

  const openHoursBlock = css.match(/\.nav-hours\[data-office-status="open"\]\s+\.hours-dot\s*\{[^}]*\}/);
  assert.ok(openHoursBlock, "open office status should be the only green state");
  assert.match(openHoursBlock[0], /background:\s*var\(--sage\)/);

  const closedHoursBlock = css.match(/\.nav-hours\[data-office-status="closed"\]\s+\.hours-dot\s*\{[^}]*\}/);
  assert.ok(closedHoursBlock, "closed office status should have a non-green dot");
  assert.match(closedHoursBlock[0], /background:\s*var\(--brick\)/);
});

test("service copy includes active-site operational facts", () => {
  assert.match(html, /NYC Violation Removal/i);
  assert.match(html, /DHCR/i);
  assert.match(html, /NYC Compliance/i);
  assert.match(html, /Sales/i);
  assert.match(html, /Rentals/i);
  assert.match(html, /Property Management/i);
});

test("storefront uses downloaded TipTop assets instead of stock image URLs", async () => {
  const assets = await readdir(new URL("../assets/tiptop/", import.meta.url));

  assert.ok(assets.length >= 8, "expected at least eight TipTop image assets");
  assert.doesNotMatch(html + css, /images\.unsplash\.com/);
  assert.match(html + css, /assets\/tiptop\//);

  for (const oldName of [
    "249-stockholm.jpg",
    "front.jpg",
    "house1.jpg",
    "hudson-river.jpg",
    "img-1358.jpg",
    "img-2210.jpg",
    "knicker.jpg",
    "logo.png",
    "profile.jpg",
    "storefront-building.jpg",
    "tiptopbuilding.png",
    "tiptopbuilding-notrafficpole.png",
  ]) {
    assert.ok(!assets.includes(oldName), `${oldName} should be renamed to describe the asset`);
    assert.doesNotMatch(html + css, new RegExp(oldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("hero window shows the real office storefront photo", () => {
  assert.doesNotMatch(html, /Brick rowhouses and a storefront awning/i);
  assert.match(html, /class="office-photo"/);
  assert.match(html, /src="assets\/tiptop\/tiptop-realty-myrtle-avenue-storefront\.png"/);
  assert.doesNotMatch(html + css, /images\.unsplash\.com/);
});

test("primary Glendale lead actions are call and listings", () => {
  assert.match(html, /href="tel:\+17184170100"[^>]*>Call \(718\) 417(?:-|&#8209;)0100/i);
  assert.match(html, /href="#listings"[^>]*>See current listings/i);
  assert.doesNotMatch(html, /Text us:/i);
});

test("contact offers a low-pressure inquiry path without backend behavior", () => {
  assert.match(html, /class="inquiry-form"/);
  assert.match(html, /class="contact-note inquiry-card"/);
  assert.match(html, /Drop us a line\./i);
  assert.match(html, /name="name"/);
  assert.match(html, /name="email"/);
  assert.match(html, /name="message"/);
  assert.match(html, /type="submit"[^>]*>\s*Send\s*</);
  assert.match(html, /new FormData\(inquiryForm\)/);
  assert.match(html, /mailto:info@tiptopny\.com\?subject=\$\{subject\}&body=\$\{body\}/);
  assert.doesNotMatch(html, /<form[^>]+action=/i);
  assert.doesNotMatch(html, /<form[^>]+method=/i);
  assert.doesNotMatch(html, /Send an inquiry/i);
  assert.match(css, /\.inquiry-form\s*\{/);
  assert.match(css, /\.inquiry-card\s*\{/);
  assert.match(css, /\.inquiry-form\s+input/);
  assert.match(css, /\.inquiry-form\s+textarea/);
  assert.doesNotMatch(html, /fetch\([^)]*inquiry|formspree|netlify/i);
});

test("contact actions avoid a duplicate Google Maps button", () => {
  assert.doesNotMatch(html, /href="https:\/\/maps\.app\.goo\.gl\/M4WhyBm2s22YqgWi7"/);
  assert.doesNotMatch(html, />\s*Open in Google Maps\s*</);
});

test("contact includes Facebook and a no-key embedded Google map", () => {
  assert.match(html, /href="https:\/\/www\.facebook\.com\/112125607136240"/);
  assert.match(html, /Visit Facebook/i);
  assert.match(html, /class="office-social-icon"/);
  assert.match(html, /aria-label="Visit Facebook"/);
  assert.match(html, /class="bc-social-row"/);
  assert.doesNotMatch(html, /btn-ghost wide office-social/);
  assert.doesNotMatch(html, />\s*Visit Facebook\s*</);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener"/);

  assert.match(html, /class="visit-body"/);
  assert.match(html, /class="[^"]*\bmap-card\b[^"]*"/);
  assert.match(html, /<iframe[^>]+title="Map to TipTop Realty Management Corp\."/);
  assert.match(html, /src="https:\/\/www\.google\.com\/maps\?q=61-06%20Myrtle%20Avenue%2C%20Glendale%2C%20NY%2011385&amp;output=embed"/);
  assert.match(html, /loading="lazy"/);
  assert.doesNotMatch(html, /maps\/api\/js|key=/i);

  assert.match(css, /\.visit-body\s*\{/);
  assert.match(css, /\.office-social-icon\s*\{/);
  assert.match(css, /\.bc-list\s+\.office-social-icon\s*\{/);
  assert.match(css, /\.map-card\s*\{/);
  assert.match(css, /\.map-card iframe\s*\{/);
});

test("contact is split into office, inquiry, and map notes", () => {
  assert.match(html, /class="contact-note office-card"/);
  assert.match(html, /class="contact-note inquiry-card"/);
  assert.match(html, /class="contact-note map-card"/);
  assert.doesNotMatch(html, /class="business-card"/);
  assert.doesNotMatch(css, /\.business-card\b/);

  const visitBodyBlock = css.match(/\.visit-body\s*\{[^}]*\}/);
  assert.ok(visitBodyBlock, ".visit-body rule should exist");
  assert.match(visitBodyBlock[0], /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);

  const mapCardBlock = css.match(/\.map-card\s*\{[^}]*\}/);
  assert.ok(mapCardBlock, ".map-card rule should exist");
  assert.match(mapCardBlock[0], /grid-column:\s*1\s*\/\s*-1/);
  assert.match(mapCardBlock[0], /justify-self:\s*center/);

  const compactMedia = css.match(/@media \(max-width: 720px\)\s*\{[\s\S]*?@media \(max-width: 560px\)/);
  assert.ok(compactMedia, "expected contact notes to stack at compact widths");
  assert.match(compactMedia[0], /\.visit-body\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(compactMedia[0], /\.map-card\s*\{[^}]*grid-column:\s*auto/);
});

test("bottom contact note is finished as a paper note", () => {
  assert.match(html, /class="visit-note"/);
  assert.match(html, /A short note/i);

  const visitNoteBlock = css.match(/\.visit-note\s*\{[^}]*\}/);
  assert.ok(visitNoteBlock, ".visit-note rule should exist");
  assert.match(visitNoteBlock[0], /max-width:\s*min\(760px,\s*100%\)/);
  assert.match(visitNoteBlock[0], /background:\s*var\(--cream-light\)/);
  assert.match(visitNoteBlock[0], /border:\s*1px\s+solid\s+var\(--wood\)/);
  assert.match(visitNoteBlock[0], /box-shadow:/);

  assert.match(css, /\.visit-note::before\s*\{/);
});

test("index.html keeps the JSON listings mount flow", () => {
  assert.match(html, /id="featured-mount"/);
  assert.match(html, /id="listings-mount"/);
  assert.match(html, /fetch\(["']listings\.json["']\)/);
});

test("listing cards distinguish the Zillow listing from neighborhood Zillow results", () => {
  assert.equal(listings.length, 6);
  assert.match(
    html,
    /The East Rockaway card opens its Zillow listing; the remaining Zillow links open\s+neighborhood results while details are being confirmed\./
  );
  assert.match(html, /"View this listing on Zillow"/);
  assert.match(html, /"View neighborhood on Zillow"/);
  assert.match(html, /\$\{zillowLinkLabel\(l\)\} &rarr;/);
  assert.match(html, /status === "current"/);
  assert.doesNotMatch(html, /View on Zillow/);
});

test("index.html no longer hardcodes the Ridgewood listing markup", () => {
  assert.doesNotMatch(html, /16&#8209;unit building, one block from the L &amp; M/);
});

test("listing data keeps live TipTop image and Zillow groupings", () => {
  const expectedGroups = [
    ["assets/tiptop/ridgewood-16-unit-multifamily-building.jpg", "Ridgewood", "$4,999,900"],
    ["assets/tiptop/bushwick-six-family-249-stockholm-street.jpg", "Bushwick", "$1,495,000"],
    ["assets/tiptop/brick-three-family-exterior.jpg", "Three-family", "$1,299,000"],
    ["assets/tiptop/flushing-sanford-avenue-apartment-building.jpg", "Flushing", "$359,000"],
    ["assets/tiptop/east-rockaway-waverly-park-ranch.jpg", "East Rockaway", "$1,059,000"],
    ["assets/tiptop/bushwick-legal-12-family-building.jpg", "Bushwick", "$3,998,000"],
  ];

  for (const [photo, neighborhood, price] of expectedGroups) {
    const listing = listings.find((item) => item.photo === photo);
    assert.ok(listing, `missing listing photo ${photo}`);
    assert.equal(listing.neighborhood, neighborhood);
    assert.equal(listing.price, price);
    assert.match(listing.zillow_url, /^https:\/\/(www\.)?zillow\.com\//);
  }
});

test("styles.css defines a .zillow-link rule", () => {
  assert.match(css, /\.zillow-link\s*\{/);
});

test("zillow link gets a visible color treatment (brick)", () => {
  // styles.css already uses brick variables; the rule should reference --brick (or its derivative)
  const block = css.match(/\.zillow-link\s*\{[^}]*\}/);
  assert.ok(block, ".zillow-link rule should exist");
  assert.match(block[0], /var\(--brick\)|#a23a2c|brick/i);
});

test("nav phone pill keeps white text and side borders", () => {
  const block = css.match(/\.shop-nav\s+\.phone-pill\s*\{[^}]*\}/);
  assert.ok(block, ".shop-nav .phone-pill rule should exist");
  assert.match(block[0], /color:\s*var\(--cream-light\)/);
  assert.match(block[0], /border-left:\s*2px\s+solid\s+var\(--brick-deep\)/);
  assert.match(block[0], /border-right:\s*2px\s+solid\s+var\(--brick-deep\)/);
});
