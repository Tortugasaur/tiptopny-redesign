import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const data = JSON.parse(
  await readFile(new URL("../listings.json", import.meta.url), "utf8")
);

test("listings.json has 6 listings", () => {
  assert.equal(data.listings.length, 6);
});

test("each listing has required fields", () => {
  const required = ["id", "neighborhood", "type", "price", "headline", "photo", "zillow_url", "status"];
  for (const listing of data.listings) {
    for (const field of required) {
      assert.ok(field in listing, `listing ${listing.id ?? "?"} missing field "${field}"`);
    }
  }
});

test("every status value is current | needs_sync | unknown", () => {
  const valid = new Set(["current", "needs_sync", "unknown"]);
  for (const listing of data.listings) {
    assert.ok(valid.has(listing.status), `invalid status "${listing.status}" on ${listing.id}`);
  }
});

test("every listing photo file exists on disk", async () => {
  for (const listing of data.listings) {
    const url = new URL(`../${listing.photo}`, import.meta.url);
    const stats = await stat(url);
    assert.ok(stats.isFile(), `${listing.photo} should be a regular file`);
  }
});

test("every zillow_url is an https URL pointing to zillow.com", () => {
  for (const listing of data.listings) {
    assert.match(listing.zillow_url, /^https:\/\/(www\.)?zillow\.com\//, `bad zillow_url on ${listing.id}`);
  }
});

test("listing copy keeps practical deal facts from the active materials", () => {
  const descriptions = data.listings.map((listing) => listing.description).join(" ");

  for (const fact of ["reported income", "J-51", "rent roll", "vacant", "flood insurance"]) {
    assert.match(descriptions, new RegExp(fact, "i"), `missing listing fact: ${fact}`);
  }
});

test("exactly one listing is featured", () => {
  const featured = data.listings.filter((l) => l.featured === true);
  assert.equal(featured.length, 1, "expected exactly one featured listing");
  assert.equal(featured[0].id, "ridgewood-16-unit");
});
