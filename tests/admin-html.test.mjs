import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const readText = async (path) => readFile(new URL(path, import.meta.url), "utf8");

test("admin.html exists and has a noindex robots meta", async () => {
  const html = await readText("../admin.html");
  assert.match(html, /<meta\s+name=["']robots["']\s+content=["']noindex/);
});

test("admin.html has a table with an admin-listings tbody mount", async () => {
  const html = await readText("../admin.html");
  assert.match(html, /<table[\s\S]*id=["']admin-table["']/);
  assert.match(html, /<tbody\s+id=["']admin-listings["']/);
});

test("admin.html fetches listings.json and renders status controls", async () => {
  const html = await readText("../admin.html");
  assert.match(html, /fetch\(["']listings\.json["']\)/);
  assert.match(html, /Mark synced/);
  assert.match(html, /mvp-stub|no-op/i);
});

test("admin.html is not linked from the public nav", async () => {
  const publicHtml = await readText("../index.html");
  assert.doesNotMatch(publicHtml, /admin\.html/);
});

test("styles.css defines admin-specific rules", async () => {
  const css = await readText("../styles.css");
  assert.match(css, /\.admin-body\s*\{/);
  assert.match(css, /\.admin-table\s*\{/);
  assert.match(css, /\.status-pill\s*\{/);
});

test("status pill has three color variants", async () => {
  const css = await readText("../styles.css");
  assert.match(css, /\.status-current\b/);
  assert.match(css, /\.status-needs_sync\b/);
  assert.match(css, /\.status-unknown\b/);
});
