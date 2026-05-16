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

test("East Rockaway ranch is tracked as the current Zillow-available listing", () => {
  const listing = data.listings.find((item) => item.id === "east-rockaway-ranch");

  assert.ok(listing, "missing east-rockaway-ranch listing");
  assert.equal(
    listing.zillow_url,
    "https://www.zillow.com/homedetails/6-Cail-Dr-East-Rockaway-NY-11518/31271000_zpid/"
  );
  assert.equal(listing.status, "current");
  assert.equal(listing.last_synced, "2026-05-16");

  const currentListings = data.listings.filter((item) => item.status === "current");
  assert.deepEqual(currentListings.map((item) => item.id), ["east-rockaway-ranch"]);
});

test("draft Zillow links stay on neighborhood results instead of unowned address pages", () => {
  const draftListings = data.listings.filter((item) => item.status !== "current");

  assert.equal(draftListings.length, 5);
  for (const listing of draftListings) {
    assert.doesNotMatch(
      listing.zillow_url,
      /\/homedetails\//,
      `${listing.id} should use a neighborhood Zillow URL until the property URL is confirmed`
    );
  }
});
