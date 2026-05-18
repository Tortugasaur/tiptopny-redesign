import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
const { listings } = JSON.parse(await readFile(new URL("../listings.json", import.meta.url), "utf8"));

async function jpegSize(assetPath) {
  const buffer = await readFile(new URL(`../${assetPath}`, import.meta.url));
  assert.equal(buffer[0], 0xff, `${assetPath} should start with JPEG SOI marker`);
  assert.equal(buffer[1], 0xd8, `${assetPath} should start with JPEG SOI marker`);

  let offset = 2;
  while (offset < buffer.length) {
    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) break;

    const segmentLength = buffer.readUInt16BE(offset);
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += segmentLength;
  }

  throw new Error(`Could not read JPEG dimensions for ${assetPath}`);
}

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

test("brand and back-to-top links target the very top of the document", () => {
  assert.match(html, /<body id="page-top" class="modern-body">/);
  assert.match(html, /<a class="brandmark" href="#page-top" aria-label="TipTop Realty home">/);
  assert.match(html, /<a class="foot-top" href="#page-top">Back to top &uarr;<\/a>/);
});

test("hybrid direction leads with safer landlord services instead of brokerage listings", () => {
  assert.match(html, /Practical support for NYC landlords/i);
  assert.match(html, /DHCR/i);
  assert.match(html, /rent-regulated/i);
  assert.match(html, /attorney handoff/i);
  assert.doesNotMatch(html, /hard property issues/i);
  assert.doesNotMatch(html, /<span class="line">Houses for sale,<\/span>/);
});

test("primary CTAs are landlord-service oriented", () => {
  assert.match(html, /href="#contact"[^>]*>Discuss your building issue/i);
  assert.match(html, /href="tel:\+17184170100"[^>]*>Call the office/i);
  assert.doesNotMatch(html, /href="#listings"[^>]*>View current listings/i);
});

test("Glendale local trust cues sit inside the modern direction", () => {
  assert.match(html, /real office on Myrtle Avenue/i);
  assert.match(html, /61-06 Myrtle Avenue, Glendale/i);
  assert.match(html, /From the corner of Myrtle/i);
  assert.match(html, /assets\/tiptop\/tiptop-realty-myrtle-avenue-storefront-no-pole\.png/);
});

test("services focus on landlord admin, compliance, and handoff support", () => {
  for (const phrase of [
    "DHCR &amp; Rent Stabilization",
    "Landlord-Tenant Coordination",
    "Attorney Handoff &amp; Document Prep",
    "Property Management Admin",
  ]) {
    assert.match(html, new RegExp(phrase));
  }
});

test("public copy includes a legal-adjacent boundary without legal advice claims", () => {
  assert.match(html, /We help organize documents, coordinate next steps, and prepare attorney handoffs/i);
  assert.match(html, /TipTop does not provide legal advice/i);
  assert.doesNotMatch(html, /legal strategy|legal decision|eviction guaranteed|promise outcomes/i);
});

test("site shows concise trust proof for older building owners", () => {
  assert.match(html, /Real Myrtle Avenue office/i);
  assert.match(html, /Phone-first owner support/i);
  assert.match(html, /Human-reviewed coordination/i);
});

test("trust strip copy has breathing room after vertical dividers", () => {
  assert.match(css, /\.trust-strip li:not\(:first-child\)\s*\{[^}]*padding-left:\s*clamp\(18px,\s*2vw,\s*24px\)/s);
  assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*\.trust-strip li:nth-child\(even\)\s*\{[^}]*padding-left:\s*clamp\(18px,\s*2vw,\s*24px\)/s);
  assert.match(css, /@media \(max-width:\s*560px\)[\s\S]*\.trust-strip li:nth-child\(even\)\s*\{[^}]*padding-left:\s*0/s);
  assert.match(css, /@media \(max-width:\s*560px\)[\s\S]*\.trust-strip li:not\(:first-child\)\s*\{[^}]*padding-left:\s*0/s);
});

test("uses brand red echoing tiptopny.com", () => {
  assert.match(css, /--red:\s*#c5302a/);
});

test("visual tone uses a grounded warm base instead of pure white surfaces", () => {
  assert.match(css, /--bg:\s*#efe6d8/);
  assert.match(css, /--bg-2:\s*#ded0bd/);
  assert.doesNotMatch(css, /--bg:\s*#ffffff/);
  assert.match(css, /background:\s*rgba\(239,\s*230,\s*216,\s*0\.97\)/);
});

test("hero uses the sunset Empire State skyline as the first visual signal", () => {
  assert.match(html, /aria-label="New York City sunset skyline with the Empire State Building"/);
  assert.match(css, /--hero-photo-focal-y:\s*52%/);
  assert.match(css, /\.hero-photo\s*\{[^}]*background:\s*url\("assets\/tiptop\/empire-state-sunset-hero\.jpg"\)\s*center\s*var\(--hero-photo-focal-y\)\s*\/\s*cover/s);
  assert.match(css, /\.hero-photo::before\s*\{[^}]*background:\s*linear-gradient/s);
  assert.match(css, /\.hero-photo::before\s*\{[^}]*rgba\(14,\s*14,\s*14,\s*0\.38\)[^}]*rgba\(14,\s*14,\s*14,\s*0\.08\)[^}]*rgba\(14,\s*14,\s*14,\s*0\.34\)/s);
  assert.match(css, /\.hero-photo::before\s*\{[^}]*box-shadow:\s*inset 0 0 92px rgba\(14,\s*14,\s*14,\s*0\.26\)/s);
});

test("hero card uses an iOS-style glass effect so the skyline remains visible behind it", () => {
  assert.match(css, /\.hero-inner\s*\{[^}]*background:\s*linear-gradient\(135deg,\s*rgba\(255,\s*255,\s*255,\s*0\.58\)/s);
  assert.match(css, /\.hero-inner\s*\{[^}]*background-color:\s*rgba\(247,\s*240,\s*228,\s*0\.42\)/s);
  assert.match(css, /\.hero-inner\s*\{[^}]*backdrop-filter:\s*blur\(24px\)\s*saturate\(185%\)/s);
  assert.match(css, /\.hero-inner\s*\{[^}]*-webkit-backdrop-filter:\s*blur\(24px\)\s*saturate\(185%\)/s);
  assert.match(css, /\.hero-inner\s*\{[^}]*border:\s*1px solid rgba\(255,\s*255,\s*255,\s*0\.42\)/s);
  assert.match(css, /\.hero-inner\s*\{[^}]*inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.56\)/s);
});

test("mobile skyline crop keeps the skyline and sunset in the frame", () => {
  assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*--hero-photo-focal-y:\s*56%/);
  assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*\.hero-photo\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3/s);
});

test("desktop hero is compact enough for a laptop first viewport", () => {
  assert.match(css, /\.hero-photo\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*7\.2/s);
  assert.match(css, /\.hero-inner\s*\{[^}]*margin-top:\s*clamp\(-250px,\s*-18vw,\s*-120px\)/s);
  assert.match(css, /#hero-title\s*\{[^}]*font-size:\s*clamp\(40px,\s*5vw,\s*68px\)/s);
});

test("mobile hero is compact enough to surface the primary action quickly", () => {
  assert.match(html, /href="#contact"[^>]*>Discuss your building issue/i);
  assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*\.cta-call\s*\{[^}]*display:\s*none/s);
  assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*\.hero\s*\{[^}]*padding-top:\s*18px/s);
  assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*\.hero-inner\s*\{[^}]*max-width:\s*none/s);
  assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*#hero-title\s*\{[^}]*font-size:\s*clamp\(30px,\s*8vw,\s*35px\)/s);
  assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*#hero-title \.line\s*\{[^}]*display:\s*block/s);
  assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*\.hero-lede\s*\{[^}]*font-size:\s*15px/s);
});

test("hero uses the sunset skyline while about keeps the Myrtle Avenue storefront with John's better headshot", () => {
  assert.match(css, /assets\/tiptop\/empire-state-sunset-hero\.jpg/);
  assert.match(html, /assets\/tiptop\/tiptop-realty-myrtle-avenue-storefront-no-pole\.png/);
  assert.match(html, /assets\/tiptop\/better-headshot\.png/);
  assert.doesNotMatch(html + css, /images\.unsplash\.com/);
});

test("sunset hero asset crops out the source-image edge strip", async () => {
  assert.deepEqual(await jpegSize("assets/tiptop/empire-state-sunset-hero.jpg"), {
    width: 1284,
    height: 736,
  });
});

test("John's about portrait lives in the text flow instead of a separate grid column", () => {
  const aboutCopyStart = html.indexOf('<div class="about-copy">');
  const aboutCopyEnd = html.indexOf("</div>", aboutCopyStart);
  const aboutPersonStart = html.indexOf('<figure class="about-person">');

  assert.ok(aboutCopyStart >= 0, "missing about copy block");
  assert.ok(aboutPersonStart > aboutCopyStart, "John portrait should appear after about copy starts");
  assert.ok(
    aboutPersonStart < aboutCopyEnd,
    "John portrait should live inside .about-copy so text wraps around it"
  );
  assert.doesNotMatch(html, /class="about-story"/);
  assert.doesNotMatch(css, /\.about-story\b/);
});

test("John's better headshot is cropped inside a controlled portrait frame", () => {
  assert.match(html, /class="about-person-frame"/);
  assert.match(css, /\.about-person-frame\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*4/s);
  assert.match(css, /\.about-person-frame\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(css, /\.about-person img\s*\{[^}]*transform:\s*scale\(1\.75\)/s);
  assert.match(css, /\.about-person img\s*\{[^}]*transform-origin:\s*14%\s*31%/s);
});

test("about to listings transition avoids a doubled blank band", () => {
  assert.match(css, /\.about-section\s*\{[^}]*padding:\s*clamp\(56px,\s*7vw,\s*100px\)\s*var\(--gutter\)\s*clamp\(24px,\s*3vw,\s*40px\)/s);
  assert.match(css, /\.listings-section\s*\{[^}]*padding:\s*clamp\(32px,\s*4vw,\s*52px\)\s*var\(--gutter\)\s*clamp\(56px,\s*7vw,\s*96px\)/s);
});

test("primary CTAs are call the office and building-issue contact", () => {
  assert.match(html, /href="tel:\+17184170100"[^>]*>Call the office/i);
  assert.match(html, /href="#contact"[^>]*>Discuss your building issue/i);
});

test("owner-support banner is present without overpromising legal outcomes", () => {
  assert.match(html, /Specialist owner support/i);
  assert.match(html, /Attorney coordination/i);
  assert.doesNotMatch(html, /eviction guaranteed|remove squatters fast|get them out/i);
});

test("contact map button uses the company Google Maps place link", () => {
  assert.match(html, /href="https:\/\/maps\.app\.goo\.gl\/M4WhyBm2s22YqgWi7"/);
});

test("contact section includes Glendale communication affordances in modern form", () => {
  assert.match(html, /href="sms:\+17185411077"[^>]*>Text \(718\) 541&#8209;1077<\/a>/);
  assert.match(html, /href="https:\/\/www\.facebook\.com\/112125607136240"/);
  assert.match(html, /class="inquiry-form"/);
  assert.match(html, /mailto:info@tiptopny\.com/);
});

test("contact section organizes office details, inquiry form, and map", () => {
  assert.match(css, /\.contact-grid\s*\{[^}]*align-items:\s*start/s);
  assert.match(css, /\.contact-card\s*\{[^}]*grid-column:\s*1/s);
  assert.match(css, /\.inquiry-form\s*\{[^}]*grid-column:\s*2/s);
  assert.match(css, /\.inquiry-form\s*\{[^}]*grid-row:\s*1\s*\/\s*span\s*2/s);
});

test("contact map uses an interactive Google Maps embed with fallback link", () => {
  const expectedEmbed =
    "https://www.google.com/maps/embed?origin=mfe&amp;pb=!1m2!2m1!1s61-06+Myrtle+Avenue,+Glendale,+NY+11385";

  assert.match(html, /class="contact-map"/);
  assert.match(html, /<iframe[^>]+title="Interactive Google map to TipTop Realty Management Corp\."/);
  assert.match(html, new RegExp(`src="${expectedEmbed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  assert.match(html, /loading="eager"/);
  assert.match(html, /class="map-link"[\s\S]*href="https:\/\/maps\.app\.goo\.gl\/M4WhyBm2s22YqgWi7"/);
  assert.doesNotMatch(html, /google\.com\/maps\?q=|output=embed|maps\/api\/js|key=/i);
});

test("listing cards offer a text action without removing the phone action", () => {
  assert.match(html, /href="sms:\+17185411077"[^>]*>Text for details<\/a>/);
  assert.match(html, /href="tel:\+17184170100"[^>]*>Call the office<\/a>/);
});

test("listing cards distinguish the Zillow listing from neighborhood Zillow results", () => {
  assert.equal(listings.length, 6);
  assert.match(
    html,
    /The East Rockaway card opens its Zillow listing; the remaining Zillow links open\s+neighborhood results while details are being confirmed\./
  );
  assert.match(html, /"View this listing on Zillow"/);
  assert.match(html, /"View neighborhood on Zillow"/);
  assert.match(html, /\$\{zillowLinkLabel\(l\)\} &rarr;/);
  assert.match(html, /status === "current"/);
  assert.doesNotMatch(html, /Compare nearby on Zillow/);
  assert.doesNotMatch(html, /View on Zillow/);
});

test("listings are rendered as a compact secondary proof strip", () => {
  assert.match(html, /id="listings-mount"[^>]*data-listing-limit="5"/);
  assert.match(
    html,
    /const prioritizedListings = \[\.\.\.listings\.filter\(\(l\) => l\.featured\), \.\.\.listings\.filter\(\(l\) => !l\.featured\)\]\.slice\(0, listingLimit\);/
  );
  assert.doesNotMatch(html, /id="featured-mount"/);
});

test("listings copy reads like customer-facing inventory language", () => {
  assert.match(html, /Current listings and owner opportunities/i);
  assert.match(html, /local office that knows\s+the building details before the first call/i);
  assert.doesNotMatch(html, /kept secondary|this direction treats|main promise of the website/i);
});

test("public copy does not present Zillow links as verified property-specific links", () => {
  assert.doesNotMatch(
    html,
    /verified\s+(?:property|listing|Zillow)|property-specific|confirmed\s+Zillow|live\s+Zillow/i
  );
});

test("header phone block exposes live office status while keeping the phone link", () => {
  assert.match(html, /class="cta-call-label"[^>]*data-office-status=/);
  assert.match(html, /Open now/);
  assert.match(html, /Closed now/);
  assert.match(html, /function isOfficeOpen|const isOfficeOpen/);
  assert.match(html, /href="tel:\+17184170100"/);
});

test("nav links cover Listings, Services, About, Contact", () => {
  for (const label of ["Listings", "Services", "About", "Contact"]) {
    assert.match(html, new RegExp(`<a href="#${label.toLowerCase()}">${label}<\\/a>`));
  }
});

test("sticky nav anchors offset section targets below the header", () => {
  assert.match(css, /--anchor-offset:/);
  assert.doesNotMatch(css, /scroll-padding-top:\s*var\(--anchor-offset\)/);
  assert.match(
    css,
    /#listings,\s*#services,\s*#about,\s*#contact\s*{[^}]*scroll-margin-top:\s*var\(--anchor-offset\)/s
  );
});

test("index.html keeps the JSON listings mount flow", () => {
  assert.match(html, /id="listings-mount"/);
  assert.match(html, /data-listing-limit="5"/);
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
    "empire-state-sunset-hero.jpg",
    "ridgewood-16-unit-multifamily-building.jpg",
    "bushwick-legal-12-family-building.jpg",
    "bushwick-six-family-249-stockholm-street.jpg",
    "brick-three-family-exterior.jpg",
    "east-rockaway-waverly-park-ranch.jpg",
    "flushing-sanford-avenue-apartment-building.jpg",
    "better-headshot.png",
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
