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
    'class="storefront"',
    'class="shop-nav"',
    'class="window"',
    "A Glendale brokerage on Myrtle Avenue",
    "Houses, apartments, and buildings",
  ];

  for (const marker of storefrontMarkers) {
    assert.match(html, new RegExp(marker));
  }
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

test("contact map button uses the company Google Maps place link", () => {
  assert.match(html, /href="https:\/\/maps\.app\.goo\.gl\/M4WhyBm2s22YqgWi7"/);
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
