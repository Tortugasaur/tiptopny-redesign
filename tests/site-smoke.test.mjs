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

test("hero uses the real Myrtle Avenue storefront photo", () => {
  assert.match(css, /assets\/tiptop\/tiptop-realty-myrtle-avenue-storefront\.png/);
  assert.doesNotMatch(html + css, /images\.unsplash\.com/);
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

test("nav links cover Listings, Services, About, Contact", () => {
  for (const label of ["Listings", "Services", "About", "Contact"]) {
    assert.match(html, new RegExp(`<a href="#${label.toLowerCase()}">${label}<\\/a>`));
  }
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
