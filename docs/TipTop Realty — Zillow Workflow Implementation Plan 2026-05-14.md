# Zillow Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the public "View on Zillow" buttons on the TipTop website plus a static internal admin dashboard mockup, both reading from a single `listings.json` file. The full spec lives in Obsidian at `10_Projects/RASAWA Inc/clients/tiptop-realty/TipTop Realty — Zillow Workflow Plan 2026-05-14.md`.

**Architecture:** Single `listings.json` at repo root is the source of truth. Public `index.html` fetches it at page load and renders listing cards (replacing the currently-hardcoded markup). New `admin.html` reads the same file and renders a table with status pills + a no-op "Mark Synced" button. Static HTML/CSS + vanilla JS — no framework, no build step.

**Tech Stack:** Static HTML, CSS, vanilla JS (`fetch` + template literals + `innerHTML`). `node --test` (built-in Node test runner) for smoke tests, matching Luigi's existing pattern on `docs/planning-notes`. Dev server is `python3 -m http.server 5173` (already in `package.json`).

**Host branch:** `design/glendale-storefront` (locked decision from spec).
**Worktree to execute in:** `/Users/Robin/Documents/RASAWA Inc./.tiptop-previews/storefront/`
**Repo origin:** `github.com/Tortugasaur/tiptopny-redesign`

**Listings to ship (from current `index.html` on this branch):**

| Order | ID | Neighborhood | Type | Price | Headline |
|---|---|---|---|---|---|
| 1 (featured) | `ridgewood-16-unit` | Ridgewood | Multifamily | $4,999,900 | 16-unit building, one block from the L & M |
| 2 | `bushwick-12-family` | Bushwick | Legal 12-family | $3,998,000 | A walk to the L with real, reported income |
| 3 | `bushwick-6-family` | Bushwick | Six-family | $1,495,000 | Six units in the heart of the neighborhood |
| 4 | `brick-3-family` | Three-family | Brick | $1,299,000 | Well-kept brick house, two units expected vacant |
| 5 | `east-rockaway-ranch` | East Rockaway | Waverly Park ranch | $1,059,000 | Expanded ranch — five beds, three baths |
| 6 | `flushing-sanford-4h` | Flushing | Apartment | $359,000 | 144-30 Sanford Ave, Apt 4H |

---

## Task 1: Import the named photo assets from Luigi's branch

**Files:**
- Create: `assets/tiptop/ridgewood-16-unit-multifamily-building.jpg` (+ 7 siblings; checked out from `docs/planning-notes`)

- [ ] **Step 1: Confirm worktree state**

Run:
```bash
cd "/Users/Robin/Documents/RASAWA Inc./.tiptop-previews/storefront"
git status
git branch --show-current
```
Expected: `On branch design/glendale-storefront`, `nothing to commit, working tree clean`.

- [ ] **Step 2: Cherry-pick the named photo assets from `docs/planning-notes`**

Run:
```bash
git checkout docs/planning-notes -- assets/tiptop/
```
This pulls every file currently under `assets/tiptop/` on the docs branch into the working tree.

- [ ] **Step 3: Trim to the 8 files this plan uses**

We only need 8 photos for the demo. Remove the rest.

Run:
```bash
cd assets/tiptop
ls -1
```
Expected output includes:
```
brick-three-family-exterior.jpg
bushwick-legal-12-family-building.jpg
bushwick-rental-apartment-kitchen.jpg
bushwick-six-family-249-stockholm-street.jpg
east-rockaway-waverly-park-ranch.jpg
flushing-sanford-avenue-apartment-building.jpg
hudson-river-view.jpg
ridgewood-16-unit-multifamily-building.jpg
tiptop-realty-myrtle-avenue-storefront-no-pole.png
tiptop-realty-myrtle-avenue-storefront.png
tiptop-realty-original-logo.jpg
tiptop-realty-profile-photo.jpg
```

Keep all of them — they may be useful later. No deletion needed in MVP. Return to repo root:
```bash
cd ../..
```

- [ ] **Step 4: Commit**

Run:
```bash
git add assets/tiptop
git commit -m "feat(storefront): import named TipTop photo assets from docs/planning-notes"
```

---

## Task 2: Add the `node --test` infrastructure to the storefront branch

**Files:**
- Modify: `package.json` (add `"test"` script)
- Create: `tests/site-smoke.test.mjs` (one passing test to confirm setup works)

- [ ] **Step 1: Read current package.json**

Run:
```bash
cat package.json
```
Expected:
```json
{
  "scripts": {
    "dev": "python3 -m http.server 5173"
  }
}
```

- [ ] **Step 2: Update package.json with a test script**

Replace the contents of `package.json` with:
```json
{
  "scripts": {
    "dev": "python3 -m http.server 5173",
    "test": "node --test"
  }
}
```

- [ ] **Step 3: Create the test file with one failing scaffold**

Create `tests/site-smoke.test.mjs`:
```js
import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("scaffold: storefront index.html exists and is non-empty", () => {
  assert.ok(html.length > 0, "index.html should not be empty");
  assert.match(html, /<title>/);
});
```

- [ ] **Step 4: Run the test and confirm it passes**

Run:
```bash
npm test
```
Expected: `# pass 1` (one test, passing).

- [ ] **Step 5: Commit**

Run:
```bash
git add package.json tests/site-smoke.test.mjs
git commit -m "test: add node --test infrastructure with scaffold smoke test"
```

---

## Task 3: Create `listings.json`

**Files:**
- Create: `listings.json` (repo root)
- Test: `tests/listings-json.test.mjs`

- [ ] **Step 1: Write the failing test first**

Create `tests/listings-json.test.mjs`:
```js
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

test("exactly one listing is featured", () => {
  const featured = data.listings.filter((l) => l.featured === true);
  assert.equal(featured.length, 1, "expected exactly one featured listing");
  assert.equal(featured[0].id, "ridgewood-16-unit");
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:
```bash
npm test
```
Expected: tests in `listings-json.test.mjs` fail because `listings.json` does not exist.

- [ ] **Step 3: Create `listings.json` at repo root**

```json
{
  "listings": [
    {
      "id": "ridgewood-16-unit",
      "neighborhood": "Ridgewood",
      "type": "Multifamily",
      "price": "$4,999,900",
      "headline": "16-unit building, one block from the L & M.",
      "description": "Rare full-building opportunity in central Ridgewood. Strong reported income, room to bring rents toward market, and ownership that is genuinely listening to offers. Full set-up by phone.",
      "photo": "assets/tiptop/ridgewood-16-unit-multifamily-building.jpg",
      "photo_alt": "Brick multifamily building on a Ridgewood block",
      "zillow_url": "https://www.zillow.com/homes/Ridgewood-Queens-NY_rb/",
      "status": "unknown",
      "last_synced": null,
      "featured": true
    },
    {
      "id": "bushwick-12-family",
      "neighborhood": "Bushwick",
      "type": "Legal 12-family",
      "price": "$3,998,000",
      "headline": "A walk to the L with real, reported income.",
      "description": "Legal 12-family with strong actual income and J-51 tax benefit details available on request.",
      "photo": "assets/tiptop/bushwick-legal-12-family-building.jpg",
      "photo_alt": "Brick townhouse on a sunny Bushwick block",
      "zillow_url": "https://www.zillow.com/homes/Bushwick-Brooklyn-NY_rb/",
      "status": "unknown",
      "last_synced": null,
      "featured": false
    },
    {
      "id": "bushwick-6-family",
      "neighborhood": "Bushwick",
      "type": "Six-family",
      "price": "$1,495,000",
      "headline": "Six units in the heart of the neighborhood.",
      "description": "A six-family in central Bushwick. Text for the full set-up, current rents, and showing options.",
      "photo": "assets/tiptop/bushwick-six-family-249-stockholm-street.jpg",
      "photo_alt": "Bushwick six-family house exterior",
      "zillow_url": "https://www.zillow.com/homes/Bushwick-Brooklyn-NY_rb/",
      "status": "unknown",
      "last_synced": null,
      "featured": false
    },
    {
      "id": "brick-3-family",
      "neighborhood": "Three-family",
      "type": "Brick",
      "price": "$1,299,000",
      "headline": "A well-kept brick house, two units expected vacant.",
      "description": "Well-manicured exterior, deck, yard, and spacious apartments. Set-up and rent roll on request.",
      "photo": "assets/tiptop/brick-three-family-exterior.jpg",
      "photo_alt": "Brick three-family home with a small front yard",
      "zillow_url": "https://www.zillow.com/homes/Queens-NY_rb/",
      "status": "unknown",
      "last_synced": null,
      "featured": false
    },
    {
      "id": "east-rockaway-ranch",
      "neighborhood": "East Rockaway",
      "type": "Waverly Park ranch",
      "price": "$1,059,000",
      "headline": "Expanded ranch — five beds, three baths.",
      "description": "Updated finishes, sun room, hardwood floors, and unusually low flood insurance for the area.",
      "photo": "assets/tiptop/east-rockaway-waverly-park-ranch.jpg",
      "photo_alt": "Expanded ranch home with landscaped entry in East Rockaway",
      "zillow_url": "https://www.zillow.com/homes/East-Rockaway-NY_rb/",
      "status": "unknown",
      "last_synced": null,
      "featured": false
    },
    {
      "id": "flushing-sanford-4h",
      "neighborhood": "Flushing",
      "type": "Apartment",
      "price": "$359,000",
      "headline": "144-30 Sanford Ave, Apt 4H.",
      "description": "A clean, well-priced apartment in a convenient location. Full details and showing times by text.",
      "photo": "assets/tiptop/flushing-sanford-avenue-apartment-building.jpg",
      "photo_alt": "Bright Queens apartment with hardwood floors",
      "zillow_url": "https://www.zillow.com/homes/Flushing-Queens-NY_rb/",
      "status": "unknown",
      "last_synced": null,
      "featured": false
    }
  ]
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run:
```bash
npm test
```
Expected: all tests in `listings-json.test.mjs` pass. Total tests: `# pass 7` (1 scaffold + 6 listings tests).

- [ ] **Step 5: Commit**

Run:
```bash
git add listings.json tests/listings-json.test.mjs
git commit -m "feat(zillow): add listings.json source-of-truth with 6 listings and validation tests"
```

---

## Task 4: Rewire `index.html` to render listings from `listings.json`

**Files:**
- Modify: `index.html` (replace the 6 hardcoded `<article>` cards with a single mount point + inline render script)
- Test: extend `tests/site-smoke.test.mjs`

- [ ] **Step 1: Read current index.html listings markup**

Run:
```bash
grep -n 'class="frame' index.html | head -20
```
Expected: shows the `class="frame frame-featured"` block and the 5 `class="frame"` blocks inside `class="frames-grid"`.

- [ ] **Step 2: Replace hardcoded cards with mount points**

In `index.html`, find the `<section class="display-case" id="listings" aria-labelledby="display-title">` block. Replace everything from the `<article class="frame frame-featured">` opening tag through the closing `</div>` of `<div class="frames-grid">` (i.e., the entire featured card plus the grid of 5 cards) with:

```html
        <article class="frame frame-featured" id="featured-mount" hidden></article>
        <div class="frames-grid" id="listings-mount"></div>
        <noscript>
          <p style="margin-top: 24px; font-style: italic; color: var(--muted);">
            Listings load with JavaScript enabled. Call (718) 417-0100 or text (718) 541-1077 for current set-ups.
          </p>
        </noscript>
```

Keep the surrounding `<header class="case-head">` and section header untouched.

- [ ] **Step 3: Add the render script before `</body>`**

In `index.html`, find the closing `</body>` tag (last few lines). Add this `<script>` block immediately above `</body>`:

```html
    <script>
      (async () => {
        const res = await fetch("listings.json");
        const { listings } = await res.json();
        const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

        const cardInner = (l) => `
          <div class="frame-pic">
            <img src="${escape(l.photo)}" alt="${escape(l.photo_alt)}" loading="lazy" />
            <span class="frame-pin"></span>
            ${l.featured ? '<span class="frame-stamp">Featured</span>' : ""}
          </div>
          <div class="frame-card">
            <p class="frame-tag">${escape(l.neighborhood)} &mdash; ${escape(l.type)}</p>
            <h3>${escape(l.headline)}</h3>
            <p class="frame-price">${escape(l.price)}</p>
            <p class="frame-copy">${escape(l.description)}</p>
            <p class="frame-meta">
              <a class="zillow-link" href="${escape(l.zillow_url)}" target="_blank" rel="noopener noreferrer">View on Zillow &rarr;</a>
              <span>/</span>
              <a href="sms:+17185411077">Text for details</a>
            </p>
          </div>
        `;

        const featured = listings.find((l) => l.featured);
        const others = listings.filter((l) => !l.featured);
        const featuredMount = document.getElementById("featured-mount");
        const listingsMount = document.getElementById("listings-mount");

        if (featured && featuredMount) {
          featuredMount.innerHTML = cardInner(featured);
          featuredMount.hidden = false;
        }
        listingsMount.innerHTML = others
          .map((l) => `<article class="frame">${cardInner(l)}</article>`)
          .join("");
      })();
    </script>
```

- [ ] **Step 4: Add tests for the new structure**

Append to `tests/site-smoke.test.mjs`:

```js
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
```

Note: the test file already has `const html = await readFile(...)` at module top. We re-read it implicitly because Node runs the top-level await once per test file run. Re-reading is fine.

- [ ] **Step 5: Run the tests and confirm they pass**

Run:
```bash
npm test
```
Expected: all tests pass. The 4 new tests in `site-smoke.test.mjs` + the 6 in `listings-json.test.mjs` + the original scaffold + the no-longer-hardcoded check = 11+ passing tests.

- [ ] **Step 6: Visual verification in browser**

Run:
```bash
npm run dev
```
Then in another terminal:
```bash
open http://localhost:5173/
```
Verify:
- The page loads
- 1 featured listing + 5 grid listings render with photos, prices, headlines, descriptions
- Each card has a "View on Zillow →" link
- Each link opens a Zillow search page in a new tab when clicked
- No console errors (open DevTools)

Stop the server when done (Ctrl+C).

- [ ] **Step 7: Commit**

Run:
```bash
git add index.html tests/site-smoke.test.mjs
git commit -m "feat(zillow): render listings from JSON with View on Zillow buttons"
```

---

## Task 5: Style the "View on Zillow" button

**Files:**
- Modify: `styles.css` (add `.zillow-link` rules)
- Test: extend `tests/site-smoke.test.mjs`

- [ ] **Step 1: Write the failing test**

Append to `tests/site-smoke.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:
```bash
npm test
```
Expected: the two new tests fail (no `.zillow-link` rule yet).

- [ ] **Step 3: Add CSS for `.zillow-link`**

Open `styles.css` and find the `.frame-meta a` rule (in the listings/display-case section). Immediately after that rule's closing brace, add:

```css
.zillow-link {
  font-weight: 700;
  color: var(--brick);
  border-bottom-color: var(--brick);
}
.zillow-link::after {
  content: "";
}
.zillow-link:hover {
  color: var(--brick-deep);
  border-bottom-color: var(--brick-deep);
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run:
```bash
npm test
```
Expected: all tests pass.

- [ ] **Step 5: Visual verification**

Run:
```bash
npm run dev
```
Open `http://localhost:5173/` and confirm:
- "View on Zillow →" links appear in brick red on each card
- Hover changes them to darker brick

- [ ] **Step 6: Commit**

Run:
```bash
git add styles.css tests/site-smoke.test.mjs
git commit -m "style(zillow): give View on Zillow buttons a brick treatment"
```

---

## Task 6: Create the admin dashboard page (`admin.html`)

**Files:**
- Create: `admin.html` (separate page, not linked from public nav)
- Test: `tests/admin-html.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `tests/admin-html.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run:
```bash
npm test
```
Expected: 4 new tests fail because `admin.html` doesn't exist yet.

- [ ] **Step 3: Create `admin.html`**

Create `admin.html` at repo root:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="theme-color" content="#a23a2c" />
    <title>TipTop Realty — Internal Listings Dashboard</title>
    <link rel="icon" type="image/svg+xml" href="favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body class="admin-body">
    <header class="admin-header">
      <h1>TipTop Listings — Internal Dashboard</h1>
      <p class="admin-sub">Not for public links. <a href="index.html">View the public site &rarr;</a></p>
    </header>

    <main class="admin-main">
      <table id="admin-table" class="admin-table">
        <thead>
          <tr>
            <th scope="col">Photo</th>
            <th scope="col">Neighborhood</th>
            <th scope="col">Type</th>
            <th scope="col">Price</th>
            <th scope="col">Zillow</th>
            <th scope="col">Last synced</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody id="admin-listings"></tbody>
      </table>
    </main>

    <script>
      (async () => {
        const res = await fetch("listings.json");
        const { listings } = await res.json();
        const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

        const statusLabel = { current: "Current", needs_sync: "Needs sync", unknown: "Unknown" };

        const rows = listings.map((l) => `
          <tr data-id="${escape(l.id)}">
            <td><img src="${escape(l.photo)}" alt="" class="admin-thumb" /></td>
            <td>${escape(l.neighborhood)}</td>
            <td>${escape(l.type)}</td>
            <td>${escape(l.price)}</td>
            <td><a href="${escape(l.zillow_url)}" target="_blank" rel="noopener noreferrer">View &#8599;</a></td>
            <td>${l.last_synced ? escape(l.last_synced) : "&mdash;"}</td>
            <td><span class="status-pill status-${escape(l.status)}">${statusLabel[l.status] ?? l.status}</span></td>
            <td><button class="btn-mark-synced" data-id="${escape(l.id)}" type="button">Mark synced</button></td>
          </tr>
        `).join("");

        document.getElementById("admin-listings").innerHTML = rows;

        // No-op handler in MVP — for show only
        document.querySelectorAll(".btn-mark-synced").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            const id = e.currentTarget.dataset.id;
            console.log(`[mvp-stub] Mark synced clicked for ${id} (no-op in MVP)`);
            e.currentTarget.textContent = "Marked (stub)";
            e.currentTarget.disabled = true;
          });
        });
      })();
    </script>
  </body>
</html>
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run:
```bash
npm test
```
Expected: all tests pass (including the 4 new admin tests).

- [ ] **Step 5: Visual verification**

Run:
```bash
npm run dev
```
Open `http://localhost:5173/admin.html` and confirm:
- Page loads with a heading and a "View the public site →" back link
- Table renders 6 rows, one per listing
- Photo thumbnails render
- Each row's "View ↗" link opens a Zillow search page in a new tab
- Each "Mark synced" button, when clicked, changes to "Marked (stub)" and disables
- No console errors

- [ ] **Step 6: Commit**

Run:
```bash
git add admin.html tests/admin-html.test.mjs
git commit -m "feat(zillow): add internal admin dashboard mockup at admin.html"
```

---

## Task 7: Style the admin dashboard

**Files:**
- Modify: `styles.css` (append admin-specific rules)
- Test: extend `tests/admin-html.test.mjs`

- [ ] **Step 1: Write the failing test**

Append to `tests/admin-html.test.mjs` (note: `readFile` is already imported at the top of this file from Task 6):

```js
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
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run:
```bash
npm test
```
Expected: the new tests fail.

- [ ] **Step 3: Append admin styles to `styles.css`**

At the end of `styles.css`, append:

```css
/* =========================================================
   Admin dashboard (admin.html)
   ========================================================= */

.admin-body {
  background: var(--cream-light);
  font-family: var(--sans);
  padding: clamp(24px, 4vw, 40px);
}

.admin-header {
  max-width: 1200px;
  margin: 0 auto 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--hairline);
}
.admin-header h1 {
  margin: 0 0 8px;
  font-family: var(--serif);
  font-size: clamp(24px, 2.6vw, 32px);
  color: var(--ink);
  letter-spacing: -0.015em;
}
.admin-sub {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}
.admin-sub a {
  color: var(--brick);
  text-decoration: none;
  border-bottom: 1px solid var(--brick);
}

.admin-main {
  max-width: 1200px;
  margin: 0 auto;
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--cream-light);
  font-size: 14px;
}
.admin-table thead {
  background: var(--ink);
  color: var(--cream-light);
}
.admin-table th {
  text-align: left;
  padding: 12px 14px;
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.admin-table td {
  padding: 14px;
  border-bottom: 1px solid var(--hairline);
  vertical-align: middle;
}

.admin-thumb {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 2px;
  display: block;
}

.admin-table a {
  color: var(--brick);
  text-decoration: none;
  border-bottom: 1px solid var(--brick);
  font-weight: 600;
}
.admin-table a:hover {
  color: var(--brick-deep);
  border-bottom-color: var(--brick-deep);
}

.status-pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}
.status-current {
  background: #d4e7c5;
  color: #2f4a1a;
}
.status-needs_sync {
  background: #f4d8a0;
  color: #6b4910;
}
.status-unknown {
  background: var(--hairline);
  color: var(--ink-soft);
}

.btn-mark-synced {
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--ink);
  border-radius: 3px;
  padding: 6px 12px;
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.btn-mark-synced:hover:not(:disabled) {
  background: var(--ink);
  color: var(--cream-light);
}
.btn-mark-synced:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run:
```bash
npm test
```
Expected: all tests pass.

- [ ] **Step 5: Visual verification**

Run:
```bash
npm run dev
```
Open `http://localhost:5173/admin.html` and confirm:
- Dark header bar at top of table
- 6 rows, photo thumbnails sized to 80×60
- All status pills are gray (`unknown`) initially, with the readable label "Unknown"
- "Mark synced" buttons are styled and respond to click

Test the other status pills by temporarily editing `listings.json` and setting one listing's status to `current` and another to `needs_sync`. Verify green and amber pills render. Revert before committing.

- [ ] **Step 6: Commit**

Run:
```bash
git add styles.css tests/admin-html.test.mjs
git commit -m "style(zillow): style admin dashboard table and status pills"
```

---

## Task 8: Update branch README for the Zillow + admin work

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Read current README**

Run:
```bash
cat README.md
```

- [ ] **Step 2: Update the "Polish state" section**

In `README.md`, find the "Polish state" checklist. Update it to mark `Real TipTop listing photos` as done (since Task 1 brought them in) and add new lines for the Zillow work and admin page:

Replace:
```
- [ ] Real TipTop listing photos (currently Unsplash stock)
```

with:
```
- [x] Real TipTop listing photos (imported from `docs/planning-notes`)
- [x] Listings driven by `listings.json` (single source of truth)
- [x] "View on Zillow" buttons on every listing card
- [x] Internal admin dashboard at `admin.html` (unlinked from public nav)
- [ ] Real Zillow URLs from John (placeholders use Zillow search pages)
```

- [ ] **Step 3: Add a "Internal admin page" section**

At the end of `README.md`, append:

```markdown
## Internal admin page

`admin.html` is a static mockup of an internal listings dashboard. It
reads the same `listings.json` as the public site and renders a table
with status pills (`current` / `needs_sync` / `unknown`) and a no-op
"Mark synced" button. Not linked from the public navigation; opt-in
via direct URL `/admin.html`. No auth — defer until John signals he
wants the dashboard for real.
```

- [ ] **Step 4: Commit**

Run:
```bash
git add README.md
git commit -m "docs: README — note Zillow buttons, listings.json, and admin page"
```

---

## Task 9: Final verification and push

**Files:** none modified; final QA.

- [ ] **Step 1: Run the full test suite**

Run:
```bash
npm test
```
Expected: every test passes. No skipped tests. No regressions.

- [ ] **Step 2: Manual smoke test — public site**

Run:
```bash
npm run dev
```
Open `http://localhost:5173/` and verify:
- 1 featured listing + 5 grid listings render with real TipTop photos
- Each card has a brick-red "View on Zillow →" link
- Clicking each opens a Zillow search page in a new tab
- All `tel:` and `sms:` links unchanged from previous polish
- All anchor nav links scroll correctly (#listings, #about, #services, #contact)
- No console errors
- Mobile viewport (Chrome DevTools, 375px width): cards stack, links still work

- [ ] **Step 3: Manual smoke test — admin page**

Open `http://localhost:5173/admin.html` and verify:
- Header reads "TipTop Listings — Internal Dashboard"
- Back-link to `index.html` works
- 6 rows, 6 thumbnails
- All status pills are gray (`Unknown`) initially
- "View ↗" on each row opens correct Zillow search URL in new tab
- "Mark synced" toggles to "Marked (stub)" and disables on click
- Console logs `[mvp-stub] Mark synced clicked for <id>` on each click
- No other console errors

Stop the dev server (Ctrl+C).

- [ ] **Step 4: Push the branch to origin**

Run:
```bash
git log --oneline origin/design/glendale-storefront..HEAD
```
Expected: lists ~8 new commits (one per task that committed code).

Then:
```bash
git push origin design/glendale-storefront
```
Expected: clean push, no force needed.

- [ ] **Step 5: Open the deploy plan in the Obsidian build session note**

The website plan's Phase 4 (Vercel deploy) is still paused. The Zillow work doesn't change that. Note in the build session note (or in conversation with Robin) that the storefront branch is now Zillow-ready and the deploy decision can resume.

No commit — this is a hand-off step, not a code change.

---

## Verification summary

After all 9 tasks:

| Check | How |
|---|---|
| Tests pass | `npm test` from repo root |
| Public site renders 6 listings from JSON | Open `http://localhost:5173/` |
| Zillow buttons work | Click each on the public site |
| Admin page renders 6 rows | Open `http://localhost:5173/admin.html` |
| Status pills + Mark-synced no-op work | Visual + DevTools console |
| Branch pushed | `git log origin/design/glendale-storefront..HEAD` is empty after push |
| No console errors | Chrome DevTools on both pages |
| Mobile responsive | DevTools mobile viewport |

## Out of scope (do NOT add)

- Real Zillow scraping or MLS pulls
- Auth on admin page
- Drift detection / scheduled sync jobs
- AI-assisted listing copy
- CMS for John to self-edit listings
- Vercel deploy (separate decision — still paused)
- Mirroring the work onto `design/newsprint` (decide later)
- Animating the listing cards (out of register for storefront aesthetic)

## Related plans and specs

- **Source spec:** Obsidian vault — `10_Projects/RASAWA Inc/clients/tiptop-realty/TipTop Realty — Zillow Workflow Plan 2026-05-14.md`. Not currently mirrored to this repo on the storefront branch; the spec lives only in the vault for now.
- **Parent website plan** (mirrored to `docs/planning-notes` branch): `docs/TipTop Realty — Website Build Plan 2026-05-13.md`
- **3D follow-on plan** (Obsidian, also mirrored to `docs/planning-notes`): `docs/TipTop Realty — 3D Hero Illustration Plan 2026-05-14.md`
- **Reference test pattern:** `tests/site-smoke.test.mjs` on `docs/planning-notes` branch (Luigi's smoke tests — use `git show docs/planning-notes:tests/site-smoke.test.mjs` to view)
