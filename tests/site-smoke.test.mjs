import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
const { listings } = JSON.parse(await readFile(new URL("../listings.json", import.meta.url), "utf8"));

test("scaffold: modern-broker index.html exists and is non-empty", () => {
  assert.ok(html.length > 0, "index.html should not be empty");
  assert.match(html, /<title>/);
});

test("identifies as the modern-broker direction", () => {
  const markers = [
    'class="modern-body"',
    'class="site-bar"',
    'class="violation-strip"',
    'class="services-grid"',
  ];
  for (const marker of markers) {
    assert.match(html, new RegExp(marker));
  }
});

test("uses brand red echoing tiptopny.com", () => {
  assert.match(css, /--red:\s*#c5302a/);
});

test("hero uses a property photo while about pairs the storefront with John's better headshot", () => {
  assert.match(css, /assets\/tiptop\/flushing-sanford-avenue-apartment-building\.jpg/);
  assert.match(html, /assets\/tiptop\/tiptop-realty-myrtle-avenue-storefront-no-pole\.png/);
  assert.match(html, /assets\/tiptop\/better-headshot\.png/);
  assert.doesNotMatch(html + css, /images\.unsplash\.com/);
});

test("John's about portrait lives in the text flow instead of a separate grid column", () => {
  const aboutCopyStart = html.indexOf('<div class="about-copy">');
  const aboutCopyEnd = html.indexOf("</div>", aboutCopyStart);
  const aboutPersonStart = html.indexOf('<figure class="about-person">');

  assert.ok(aboutCopyStart >= 0, "missing about copy block");
  assert.ok(aboutPersonStart > aboutCopyStart, "John portrait should appear after about copy starts");
  assert.ok(
    aboutPersonStart < aboutCopyEnd,
    "John portrait should live inside .about-copy so text wraps around it"
  );
  assert.doesNotMatch(html, /class="about-story"/);
  assert.doesNotMatch(css, /\.about-story\b/);
});

test("John's better headshot is cropped inside a controlled portrait frame", () => {
  assert.match(html, /class="about-person-frame"/);
  assert.match(css, /\.about-person-frame\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*4/s);
  assert.match(css, /\.about-person-frame\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(css, /\.about-person img\s*\{[^}]*transform:\s*scale\(1\.35\)/s);
  assert.match(css, /\.about-person img\s*\{[^}]*transform-origin:\s*42%\s*32%/s);
});

test("primary CTAs are call the office and view listings", () => {
  assert.match(html, /href="tel:\+17184170100"[^>]*>Call the office/i);
  assert.match(html, /href="#listings"[^>]*>View current listings/i);
});

test("violation-removal banner is present (echoing the active site)", () => {
  assert.match(html, /Violation removal/i);
  assert.match(html, /DHCR specialist/i);
});

test("contact map button uses the company Google Maps place link", () => {
  assert.match(html, /href="https:\/\/maps\.app\.goo\.gl\/M4WhyBm2s22YqgWi7"/);
});

test("contact section includes Glendale communication affordances in modern form", () => {
  assert.match(html, /href="sms:\+17185411077"[^>]*>Text \(718\) 541&#8209;1077<\/a>/);
  assert.match(html, /href="https:\/\/www\.facebook\.com\/112125607136240"/);
  assert.match(html, /class="inquiry-form"/);
  assert.match(html, /mailto:info@tiptopny\.com/);
});

test("contact section organizes office details, inquiry form, and map", () => {
  assert.match(css, /\.contact-grid\s*\{[^}]*align-items:\s*start/s);
  assert.match(css, /\.contact-card\s*\{[^}]*grid-column:\s*1/s);
  assert.match(css, /\.inquiry-form\s*\{[^}]*grid-column:\s*2/s);
  assert.match(css, /\.inquiry-form\s*\{[^}]*grid-row:\s*1\s*\/\s*span\s*2/s);
});

test("contact map uses an interactive Google Maps embed with fallback link", () => {
  const expectedEmbed =
    "https://www.google.com/maps/embed?origin=mfe&amp;pb=!1m2!2m1!1s61-06+Myrtle+Avenue,+Glendale,+NY+11385";

  assert.match(html, /class="contact-map"/);
  assert.match(html, /<iframe[^>]+title="Interactive Google map to TipTop Realty Management Corp\."/);
  assert.match(html, new RegExp(`src="${expectedEmbed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  assert.match(html, /loading="eager"/);
  assert.match(html, /class="map-link"[\s\S]*href="https:\/\/maps\.app\.goo\.gl\/M4WhyBm2s22YqgWi7"/);
  assert.doesNotMatch(html, /google\.com\/maps\?q=|output=embed|maps\/api\/js|key=/i);
});

test("listing cards offer a text action without removing the phone action", () => {
  assert.match(html, /href="sms:\+17185411077"[^>]*>Text for details<\/a>/);
  assert.match(html, /href="tel:\+17184170100"[^>]*>Call the office<\/a>/);
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
  assert.doesNotMatch(html, /Compare nearby on Zillow/);
  assert.doesNotMatch(html, /View on Zillow/);
});

test("public copy does not present Zillow links as verified property-specific links", () => {
  assert.doesNotMatch(
    html,
    /verified\s+(?:property|listing|Zillow)|property-specific|confirmed\s+Zillow|live\s+Zillow/i
  );
});

test("header phone block exposes live office status while keeping the phone link", () => {
  assert.match(html, /class="cta-call-label"[^>]*data-office-status=/);
  assert.match(html, /Open now/);
  assert.match(html, /Closed now/);
  assert.match(html, /function isOfficeOpen|const isOfficeOpen/);
  assert.match(html, /href="tel:\+17184170100"/);
});

test("nav links cover Listings, Services, About, Contact", () => {
  for (const label of ["Listings", "Services", "About", "Contact"]) {
    assert.match(html, new RegExp(`<a href="#${label.toLowerCase()}">${label}<\\/a>`));
  }
});

test("sticky nav anchors offset section targets below the header", () => {
  assert.match(css, /--anchor-offset:/);
  assert.doesNotMatch(css, /scroll-padding-top:\s*var\(--anchor-offset\)/);
  assert.match(
    css,
    /#listings,\s*#services,\s*#about,\s*#contact\s*{[^}]*scroll-margin-top:\s*var\(--anchor-offset\)/s
  );
});

test("index.html keeps the JSON listings mount flow", () => {
  assert.match(html, /id="featured-mount"/);
  assert.match(html, /id="listings-mount"/);
  assert.match(html, /fetch\(["']listings\.json["']\)/);
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

test("zillow link uses the brand red", () => {
  const block = css.match(/\.zillow-link\s*\{[^}]*\}/);
  assert.ok(block, ".zillow-link rule should exist");
  assert.match(block[0], /var\(--red\)|#c5302a|red/i);
});

test("assets/tiptop has the named TipTop photo set", async () => {
  const assets = await readdir(new URL("../assets/tiptop/", import.meta.url));
  assert.ok(assets.length >= 8, "expected at least eight TipTop image assets");
  for (const required of [
    "ridgewood-16-unit-multifamily-building.jpg",
    "bushwick-legal-12-family-building.jpg",
    "bushwick-six-family-249-stockholm-street.jpg",
    "brick-three-family-exterior.jpg",
    "east-rockaway-waverly-park-ranch.jpg",
    "flushing-sanford-avenue-apartment-building.jpg",
    "better-headshot.png",
  ]) {
    assert.ok(assets.includes(required), `missing required asset ${required}`);
  }
});

test("does NOT inherit storefront-specific markup", () => {
  // This direction explicitly diverges from the storefront aesthetic
  assert.doesNotMatch(html, /class="storefront"/);
  assert.doesNotMatch(html, /class="shop-nav"/);
  assert.doesNotMatch(html, /class="window-frame"/);
  assert.doesNotMatch(html, /A Glendale brokerage on Myrtle Avenue/);
});
