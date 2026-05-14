import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const html = await readFile(new URL("../admin.html", import.meta.url), "utf8");

test("admin.html exists and has a noindex robots meta", () => {
  assert.match(html, /<meta\s+name=["']robots["']\s+content=["']noindex/);
});

test("admin.html has a table with an admin-listings tbody mount", () => {
  assert.match(html, /<table[\s\S]*id=["']admin-table["']/);
  assert.match(html, /<tbody\s+id=["']admin-listings["']/);
});

test("admin.html fetches listings.json", () => {
  assert.match(html, /fetch\(["']listings\.json["']\)/);
});

test("admin.html is not linked from the public nav", async () => {
  const publicHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.doesNotMatch(publicHtml, /admin\.html/);
});
