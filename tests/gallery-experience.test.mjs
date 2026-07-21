import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const propertySource = fs.readFileSync(new URL("../property-data.js", import.meta.url), "utf8");
const appSource = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const glassStyles = fs.readFileSync(new URL("../glass.css", import.meta.url), "utf8");

function loadProperties() {
  const window = {};
  vm.runInNewContext(propertySource, { window, Object, Array, String }, { filename: "property-data.js" });
  return window.CS_LINKTREE_PROPERTIES;
}

test("registers Arrau as a complete, future-ready property", () => {
  const properties = loadProperties();
  assert.equal(properties.length, 1);
  const [arrau] = properties;
  assert.equal(arrau.id, "arrau");
  assert.equal(arrau.name, "Arrau");
  assert.equal(arrau.brand, "Cordal Sur");
  assert.equal(arrau.groups.length, 11);
  assert.equal(arrau.groups.reduce((total, group) => total + group.count, 0), 35);
  assert.equal(arrau.photos.length, 35);
  assert.equal(new Set(arrau.photos.map(({ id }) => id)).size, 35);
  assert.equal(arrau.previewOrder.length, 35);
  assert.equal(new Set(arrau.previewOrder).size, 35);
  const groupIds = arrau.groups.map(({ id }) => id);
  assert.ok(groupIds.indexOf("entrada") < groupIds.indexOf("balcon"));
  assert.deepEqual(Array.from(arrau.photos.filter(({ groupId }) => groupId === "habitacion1").map(({ id }) => id)), [
    "04-habitacion-1-01", "04-habitacion-1-03", "04-habitacion-1-02",
    "04-habitacion-1-05", "04-habitacion-1-06", "04-habitacion-1-07",
  ]);
  assert.deepEqual(Array.from(arrau.photos.filter(({ groupId }) => groupId === "habitacion2").map(({ id }) => id)), [
    "05-habitacion-2-05", "05-habitacion-2-01", "05-habitacion-2-02", "05-habitacion-2-03",
    "05-habitacion-2-04", "05-habitacion-2-06", "05-habitacion-2-07",
  ]);
  assert.deepEqual(Array.from(arrau.photos.filter(({ groupId }) => groupId === "habitacion3").map(({ id }) => id)), [
    "06-habitacion-3-01", "06-habitacion-3-02",
  ]);
  for (const removedId of ["04-habitacion-1-04", "06-habitacion-3-03", "06-habitacion-3-04", "06-habitacion-3-05"]) {
    assert.ok(!arrau.photos.some(({ id }) => id === removedId));
  }
  assert.deepEqual(Array.from(arrau.previewOrder.slice(0, 5)), [
    "01-sala-01",
    "02-cocina-completa-01",
    "03-comedor-01",
    "04-habitacion-1-01",
    "05-habitacion-2-05",
  ]);
  assert.deepEqual(new Set(arrau.previewOrder), new Set(arrau.photos.map(({ id }) => id)));

  for (const photo of arrau.photos) {
    assert.ok(fs.existsSync(new URL(`../${photo.src}`, import.meta.url)), `Missing original ${photo.src}`);
    assert.ok(fs.existsSync(new URL(`../${photo.thumbnail}`, import.meta.url)), `Missing thumbnail ${photo.thumbnail}`);
    assert.match(photo.src, /^assets\/photos\/(?!thumbs\/).+\.webp$/);
    assert.match(photo.thumbnail, /^assets\/photos\/thumbs\/.+\.webp$/);
  }
});

test("uses a single Airbnb-inspired photo tour with a rotating cover", () => {
  assert.equal((html.match(/<dialog\b/g) || []).length, 2, "Only gallery and payment dialogs should remain");
  assert.match(html, /id="gallery-filters"/);
  assert.match(html, /id="gallery-scroll"/);
  assert.match(html, /id="gallery-tour"/);
  assert.match(html, /aria-controls="gallery-dialog"/);
  assert.doesNotMatch(html, /photo-viewer|carousel-toggle|carousel-controls|hero-layer|gallery-previous|gallery-next|gallery-zoom/);
  assert.doesNotMatch(appSource, /initializeCarousel|scheduleAutoplay|autoplayTimer/);
  assert.match(appSource, /PREVIEW_ROTATION_MS = 6500/);
  assert.match(appSource, /visiblePhotos/);
  assert.match(appSource, /data-preview-refresh/);
  assert.match(appSource, /index === 0 \? photo\.src : photo\.thumbnail/);
  assert.match(appSource, /event\.key === "Home"/);
  assert.match(appSource, /event\.key === "End"/);
  assert.match(appSource, /IntersectionObserver/);
  assert.match(appSource, /scrollArea\.scrollTo/);
  assert.match(appSource, /image\.addEventListener\("error"/);
});

test("keeps every tour photo complete and the preview responsive", () => {
  assert.match(styles, /\.gallery-photo-card img[^}]+height: auto/s);
  assert.match(styles, /\.gallery-photo-card img[^}]+object-fit: contain/s);
  assert.match(styles, /\.gallery-photo-grid[^}]+columns: 2/s);
  assert.match(styles, /\.preview-filmstrip[^}]+overflow-x: auto/s);
  assert.match(styles, /@media \(min-width: 640px\)[\s\S]+\.editorial-preview[^}]+grid-template-columns/s);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});

test("keeps navigation and zoom chrome away from the photographs", () => {
  assert.doesNotMatch(html, /gallery-nav|gallery-zoom-controls|gallery-image-viewport/);
  assert.doesNotMatch(appSource, /applyZoom|pointerDistance|zoomScale|pointerGesture/);
  assert.match(styles, /\.gallery-dialog[^}]+width: 100%/s);
  assert.match(styles, /\.gallery-scroll[^}]+overflow-y: auto/s);
  assert.match(styles, /@media \(max-width: 479px\)[\s\S]+\.gallery-photo-grid[^}]+columns: 1/s);
});

test("uses a responsive Cordal Sur Liquid Glass island over the mobile photo tour", () => {
  assert.match(html, /<button class="gallery-close"[^>]*>[\s\S]*?<span class="gallery-close-symbol" aria-hidden="true"><\/span>[\s\S]*?<\/button>/);
  assert.doesNotMatch(html, /gallery-close-lockup|gallery-close-arrow|gallery-close glass-interactive/);
  assert.match(styles, /\.gallery-close-symbol[^}]+cordal-sur-symbol-reverse\.svg/s);
  assert.match(styles, /@media \(max-width: 479px\)[\s\S]+\.gallery-header[^}]+width: min\(calc\(100% - 24px\), 366px\)/s);
  assert.match(styles, /\.gallery-header\.is-compact[^}]+width: min\(calc\(100% - 24px\), 252px\)/s);
  assert.match(styles, /\.gallery-header[^}]+border-radius: 999px/s);
  assert.match(styles, /\.gallery-header[^}]+backdrop-filter: blur\(22px\) saturate\(145%\)/s);
  assert.match(styles, /@media \(max-width: 479px\)[\s\S]+\.gallery-scroll[^}]+padding-top:/s);
  assert.match(styles, /prefers-reduced-transparency: reduce/);
  assert.match(styles, /@keyframes gallery-island-enter/);
  assert.match(appSource, /scrollArea\.scrollTop > 24 \? "compact" : "expanded"/);
  assert.match(appSource, /header\.classList\.toggle\("is-compact"/);
  assert.match(appSource, /scrollArea\.addEventListener\("scroll", scheduleHeaderSync, \{ passive: true \}\)/);
  assert.match(appSource, /visiblePhotoPosition/);
  assert.match(appSource, /renderHeaderPosition\(position\?\.groupId, position\?\.photoIndex\)/);
  assert.match(appSource, /counter\.textContent = group \? t\("gallery\.counter", \{ current, total \}\) : String\(total\)/);
  assert.match(appSource, /header\.dataset\.group = group\?\.id \|\| "property"/);
  assert.match(appSource, /header\.dataset\.photoIndex = String\(current\)/);
  assert.match(appSource, /const scrollToPosition = \(top\) =>/);
  assert.match(appSource, /Math\.min\(260, Math\.max\(150, Math\.abs\(distance\) \* \.035\)\)/);
  assert.match(appSource, /scrollArea\.addEventListener\("pointerdown", cancelScrollAnimation/);
  assert.doesNotMatch(appSource, /behavior: galleryReducedMotion\?\.matches \? "auto" : "smooth"/);
  assert.match(styles, /width 160ms cubic-bezier/);
  assert.match(styles, /\.gallery-header\.is-compact\[data-group="entrada"\][^}]+330px/);
  assert.match(styles, /\.gallery-header h2[^}]+text-overflow: ellipsis[^}]+white-space: nowrap/s);
  assert.match(styles, /\.gallery-header \.gallery-close[^}]+background: transparent[^}]+border-color: transparent[^}]+box-shadow: none/s);
  assert.match(glassStyles, /@media \(max-width: 479px\)[\s\S]+\.gallery-header \.gallery-close[\s\S]+background: transparent[^}]+border-color: transparent[^}]+box-shadow: none/s);
});

test("shows photo position only in the island, never over the photographs", () => {
  assert.doesNotMatch(html, /<figcaption/);
  assert.doesNotMatch(appSource, /createElement\("figcaption"\)/);
  assert.match(appSource, /t\("gallery\.counter", \{ current, total \}\)/);
  assert.match(appSource, /t\("gallery\.thumbnail\.aria", \{ current, total, description: name \}\)/);
});

test("cache-busts every runtime asset with the published build id", () => {
  assert.match(html, /data-build="gallery-photo-counter-20260721"/);
  for (const resource of ["styles.css", "glass.css", "preferences.js", "property-data.js", "availability.js", "app.js", "glass.js"]) {
    assert.ok(html.includes(`${resource}?v=gallery-photo-counter-20260721`), `Missing cache version for ${resource}`);
  }
});

test("matches the Cordal Sur App title gradient in both themes", () => {
  assert.match(styles, /--brand-title-gradient: linear-gradient\(110deg, #102c26, #153b33 52%, #785018\)/);
  assert.match(styles, /--brand-title-gradient: linear-gradient\(110deg, #fffaf0, #eef3ed 52%, #f0cc91\)/);
  assert.match(styles, /\.brand-name[^}]+background: var\(--brand-title-gradient\)[^}]+background-clip: text/s);
  assert.match(styles, /\.hero-title[^}]+background: var\(--brand-title-gradient\)[^}]+background-clip: text/s);
  assert.match(styles, /@media \(forced-colors: active\)[\s\S]+-webkit-text-fill-color: CanvasText/s);
});

test("keeps the mobile refresh control aligned and removes the pull-down skip label", () => {
  assert.match(styles, /\.editorial-preview > \.preview-refresh\.glass-surface[^}]+position: absolute/s);
  assert.match(styles, /overscroll-behavior-y: none/);
  assert.doesNotMatch(html, /skip-link|Ir al contenido principal/);
});
