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

const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");

test("styles.css defines admin-specific rules", () => {
  assert.match(css, /\.admin-body\s*\{/);
  assert.match(css, /\.admin-table\s*\{/);
  assert.match(css, /\.status-pill\s*\{/);
});

test("status pill has three color variants", () => {
  assert.match(css, /\.status-current\b/);
  assert.match(css, /\.status-needs_sync\b/);
  assert.match(css, /\.status-unknown\b/);
});
