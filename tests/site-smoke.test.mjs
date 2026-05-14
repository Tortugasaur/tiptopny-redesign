import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("scaffold: storefront index.html exists and is non-empty", () => {
  assert.ok(html.length > 0, "index.html should not be empty");
  assert.match(html, /<title>/);
});

test("index.html has a featured-mount element", () => {
  assert.match(html, /id="featured-mount"/);
});

test("index.html has a listings-mount element", () => {
  assert.match(html, /id="listings-mount"/);
});

test("index.html fetches listings.json at runtime", () => {
  assert.match(html, /fetch\(["']listings\.json["']\)/);
});

test("index.html no longer hardcodes the Ridgewood listing markup", () => {
  // Should NOT contain hardcoded listing copy now that it comes from JSON
  assert.doesNotMatch(html, /16&#8209;unit building, one block from the L &amp; M/);
});

const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");

test("styles.css defines a .zillow-link rule", () => {
  assert.match(css, /\.zillow-link\s*\{/);
});

test("zillow link gets a visible color treatment (brick)", () => {
  // styles.css already uses brick variables; the rule should reference --brick (or its derivative)
  const block = css.match(/\.zillow-link\s*\{[^}]*\}/);
  assert.ok(block, ".zillow-link rule should exist");
  assert.match(block[0], /var\(--brick\)|#a23a2c|brick/i);
});
