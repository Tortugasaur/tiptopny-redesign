import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const readText = async (path) => readFile(new URL(path, import.meta.url), "utf8");

test("package.json exposes npm test through node --test", async () => {
  const pkg = JSON.parse(await readText("../package.json"));
  assert.equal(pkg.scripts.test, "node --test");
});

test("keeps the newspaper direction without public draft language", async () => {
  const html = await readText("../index.html");
  const css = await readText("../styles.css");

  for (const marker of [
    'class="masthead"',
    'class="primary-nav"',
    'class="lede"',
    "The Glendale Real Estate Record",
    "Current listings",
    "Four desks, one office",
  ]) {
    assert.match(html, new RegExp(marker));
  }

  assert.match(css, /TipTop Realty — design\/newsprint/);
  assert.match(css, /NYC Sunday real-estate section meets Village\s+Voice classifieds/);
  assert.doesNotMatch(html + css, /shop-nav|window-frame|frame-pic|polaroid/i);
  assert.doesNotMatch(
    html,
    /Newsprint concept|partner review|listing data pending|Current listing notes for review|Presentation draft|Review draft|not a live MLS feed/i
  );
});

test("social preview metadata uses TipTop assets and no Unsplash", async () => {
  const html = await readText("../index.html");
  const previewAsset = "assets/tiptop/flushing-sanford-avenue-apartment-building.jpg";
  const stats = await stat(new URL(`../${previewAsset}`, import.meta.url));

  assert.ok(stats.isFile(), `${previewAsset} should exist`);
  assert.match(html, new RegExp(`property="og:image"\\s+content="${previewAsset}"`));
  assert.match(html, new RegExp(`name="twitter:image"\\s+content="${previewAsset}"`));
  assert.match(html, /property="og:image:width" content="1800"/);
  assert.match(html, /property="og:image:height" content="900"/);
  assert.doesNotMatch(html, /unsplash|images\.unsplash/i);
});

test("hero offers call, listings, and weekend text actions", async () => {
  const html = await readText("../index.html");
  const ledeCta = html.match(/<div class="lede-cta">([\s\S]*?)<\/div>/);

  assert.ok(ledeCta, "lede CTA block should exist");
  assert.match(ledeCta[1], /href="tel:\+17184170100"[^>]*>Call the office<\/a>/);
  assert.match(ledeCta[1], /href="#listings"[^>]*>See current listings<\/a>/);
  assert.match(ledeCta[1], /href="sms:\+17185411077"[^>]*>Text us: \(718\) 541&#8209;1077<\/a>/);
});

test("index.html renders listings from listings.json", async () => {
  const html = await readText("../index.html");

  assert.match(html, /id="featured-listing"/);
  assert.match(html, /id="listings-mount"/);
  assert.match(html, /fetch\(["']listings\.json["']\)/);
  assert.match(html, /class="zillow-link"/);
  assert.doesNotMatch(html, /A 16-unit building, one block from the L and the M\./);
});

test("listing cards distinguish the Zillow listing from neighborhood Zillow results", async () => {
  const html = await readText("../index.html");

  assert.match(
    html,
    /The East Rockaway card opens its Zillow listing; the remaining Zillow links open neighborhood results while details are being confirmed\./
  );
  assert.match(html, /"View this listing on Zillow"/);
  assert.match(html, /"View neighborhood on Zillow"/);
  assert.match(html, /\$\{zillowLinkLabel\(listing\)\}/);
  assert.match(html, /status === "current"/);
  assert.doesNotMatch(html, />View on Zillow</);
});

test("listing confirmation copy stays owner-friendly", async () => {
  const html = await readText("../index.html");

  assert.match(html, /Before you go/);
  assert.match(html, /Call or text for the latest price, availability, and showing times\./);
  assert.match(html, /TipTop can walk you through the setup, rent roll, and next appointment\./);
  assert.match(html, /unknown: "Call for details"/);
  assert.doesNotMatch(html, /Call for status|The office can confirm|pricing, availability/i);
});

test("featured listing grid keeps the index out of the photo row", async () => {
  const css = await readText("../styles.css");

  assert.match(css, /\.listing-featured\s+\.listing-index\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/);
  assert.match(css, /\.listing-featured\s+img\s*\{[^}]*grid-column:\s*1/);
  assert.match(css, /\.listing-featured\s+\.listing-body\s*\{[^}]*grid-column:\s*2/);
});

test("lede figure uses the real Myrtle Avenue storefront photo", async () => {
  const html = await readText("../index.html");
  const css = await readText("../styles.css");
  const storefrontAsset = "assets/tiptop/tiptop-realty-myrtle-avenue-storefront.png";
  const stats = await stat(new URL(`../${storefrontAsset}`, import.meta.url));

  assert.ok(stats.isFile(), `${storefrontAsset} should exist`);
  assert.match(html, /aria-label="TipTop Realty storefront at 61-06 Myrtle Avenue in Glendale"/);
  assert.match(html, /The TipTop storefront on Myrtle Avenue/);
  assert.match(css, new RegExp(`url\\("${storefrontAsset}"\\)`));
  assert.doesNotMatch(html + css, /Brick multifamily homes lining a Queens residential block at dusk/);
  assert.doesNotMatch(css, /url\("assets\/tiptop\/brick-three-family-exterior\.jpg"\)/);
});

test("about section includes John CEO portrait from TipTop assets", async () => {
  const html = await readText("../index.html");
  const css = await readText("../styles.css");
  const portraitAsset = "assets/tiptop/tiptop-realty-profile-photo.jpg";
  const stats = await stat(new URL(`../${portraitAsset}`, import.meta.url));

  assert.ok(stats.isFile(), `${portraitAsset} should exist`);
  assert.match(html, /class="about-portrait"/);
  assert.match(html, new RegExp(`src="${portraitAsset}"`));
  assert.match(html, /alt="John, CEO of TipTop Realty Management Corp\."/);
  assert.match(html, /John, CEO/);
  assert.match(css, /\.about-portrait\s*\{/);
  assert.match(css, /\.about-portrait img\s*\{/);
});

test("sticky nav includes live weekday office status", async () => {
  const html = await readText("../index.html");
  const css = await readText("../styles.css");

  assert.match(html, /class="nav-hours"[^>]*data-office-status="closed"/);
  assert.match(html, /Mon&#8209;Fri 9&#8209;5/);
  assert.match(html, /updateOfficeStatus/);
  assert.match(html, /America\/New_York/);
  assert.match(html, /officeStatus = open \? "open" : "closed"/);
  assert.match(css, /\.nav-hours\s*\{/);
  assert.match(css, /\.nav-hours\[data-office-status="open"\]\s+\.hours-dot\s*\{/);
  assert.match(css, /\.nav-hours\[data-office-status="closed"\]\s+\.hours-dot\s*\{/);
});

test("sticky nav reveals a compact logo after the masthead scrolls away", async () => {
  const html = await readText("../index.html");
  const css = await readText("../styles.css");

  assert.match(html, /class="nav-brand"/);
  assert.match(html, /class="nav-brand-mark"[^>]*>TT<\/span>/);
  assert.match(html, /class="nav-brand-name"[^>]*>TipTop Realty<\/span>/);
  assert.match(html, /IntersectionObserver/);
  assert.match(html, /has-compact-logo/);
  assert.match(css, /--nav-brand-space:\s*clamp\(184px,\s*20vw,\s*236px\)/);
  assert.match(css, /\.nav-brand\s*\{[^}]*opacity:\s*0/s);
  assert.match(css, /\.primary-nav\.has-compact-logo\s+\.nav-brand\s*\{[^}]*opacity:\s*1/s);
  assert.match(css, /\.primary-nav\.has-compact-logo\s+ul\s*\{[^}]*margin-left:\s*var\(--nav-brand-space\)/s);
});

test("nav phone separator has breathing room before the office label", async () => {
  const css = await readText("../styles.css");
  const navActionsBlock = css.match(/\.nav-actions\s*\{[^}]*\}/);
  const phoneLinkBlock = css.match(/\.primary-nav\s+\.phone-link\s*\{[^}]*\}/);
  const compactPhoneLinkBlock = css.match(/@media \(max-width: 900px\)\s*\{[\s\S]*?\.primary-nav\s+\.phone-link\s*\{[^}]*\}/);

  assert.ok(navActionsBlock, ".nav-actions rule should exist");
  assert.match(navActionsBlock[0], /gap:\s*clamp\(18px,\s*2\.4vw,\s*30px\)/);
  assert.ok(phoneLinkBlock, ".primary-nav .phone-link rule should exist");
  assert.match(phoneLinkBlock[0], /border-left:\s*1px\s+solid\s+var\(--rule\)/);
  assert.match(phoneLinkBlock[0], /padding-left:\s*clamp\(18px,\s*2\.4vw,\s*30px\)/);
  assert.ok(compactPhoneLinkBlock, "compact .primary-nav .phone-link override should exist");
  assert.match(compactPhoneLinkBlock[0], /padding-left:\s*0/);
});

test("mobile controls keep full-width comfortable touch targets", async () => {
  const css = await readText("../styles.css");
  const buttonBlock = css.match(/\.btn-primary,\s*\.btn-secondary\s*\{[^}]*\}/);
  const smallViewportBlock = css.match(/@media \(max-width: 560px\)\s*\{[\s\S]*\n\}/);

  assert.ok(buttonBlock, "shared button rule should exist");
  assert.match(buttonBlock[0], /min-height:\s*44px/);
  assert.ok(smallViewportBlock, "small viewport media query should exist");
  assert.match(smallViewportBlock[0], /\.lede-cta\s*>\s*a\s*\{[^}]*width:\s*100%/);
  assert.match(smallViewportBlock[0], /\.contact-actions\s*>\s*a\s*\{[^}]*width:\s*100%/);
  assert.match(smallViewportBlock[0], /\.listing-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
});

test("mobile masthead wordmark scales inside narrow screens", async () => {
  const css = await readText("../styles.css");
  const smallViewportBlock = css.match(/@media \(max-width: 560px\)\s*\{[\s\S]*\n\}/);

  assert.ok(smallViewportBlock, "small viewport media query should exist");
  assert.match(smallViewportBlock[0], /\.masthead-title\s*\{[^}]*font-size:\s*clamp\(38px,\s*13\.4vw,\s*54px\)/);
  assert.match(smallViewportBlock[0], /\.masthead-title\s*\{[^}]*max-width:\s*100%/);
  assert.match(smallViewportBlock[0], /\.masthead-title\s*\{[^}]*gap:\s*clamp\(3px,\s*0\.9vw,\s*6px\)/);
  assert.match(smallViewportBlock[0], /\.masthead\s*\{[^}]*overflow-x:\s*clip/);
});

test("contact includes mailto inquiry, Facebook, and no-key embedded map", async () => {
  const html = await readText("../index.html");
  const css = await readText("../styles.css");

  const embedUrl =
    "https://www.google.com/maps/embed?origin=mfe&amp;pb=!1m2!2m1!1s61-06+Myrtle+Avenue,+Glendale,+NY+11385";

  assert.match(html, /class="inquiry-form"/);
  assert.match(html, /new FormData\(inquiryForm\)/);
  assert.match(html, /mailto:info@tiptopny\.com\?subject=\$\{subject\}&body=\$\{body\}/);
  assert.doesNotMatch(html, /<form[^>]+action=/i);
  assert.doesNotMatch(html, /<form[^>]+method=/i);
  assert.match(html, /href="https:\/\/www\.facebook\.com\/112125607136240"/);
  assert.match(html, /aria-label="Visit Facebook"/);
  assert.match(html, /class="[^"]*\bmap-card\b[^"]*"/);
  assert.match(html, /<iframe[^>]+title="Map to TipTop Realty Management Corp\."/);
  assert.match(html, new RegExp(`src="${embedUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  assert.match(html, /loading="eager"/);
  assert.match(html, /class="map-fallback-link"/);
  assert.doesNotMatch(html, /maps\/api\/js|key=/i);
  assert.match(css, /\.inquiry-form\s*\{/);
  assert.match(css, /\.office-social-icon\s*\{/);
  assert.match(css, /\.map-card\s*\{/);
  assert.match(css, /\.map-fallback-link\s*\{/);
});
