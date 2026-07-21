import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const propertySource = fs.readFileSync(new URL("../property-data.js", import.meta.url), "utf8");
const appSource = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");

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
  assert.equal(arrau.groups.reduce((total, group) => total + group.count, 0), 46);
  assert.equal(arrau.photos.length, 46);
  assert.equal(new Set(arrau.photos.map(({ id }) => id)).size, 46);
  assert.equal(arrau.previewOrder.length, 46);
  assert.equal(new Set(arrau.previewOrder).size, 46);
  assert.ok(!arrau.photos.some(({ id }) => id === "06-habitacion-3-03"));
  assert.deepEqual(Array.from(arrau.previewOrder.slice(0, 5)), [
    "01-sala-01",
    "02-cocina-completa-01",
    "03-comedor-01",
    "04-habitacion-1-01",
    "05-habitacion-2-01",
  ]);
  assert.deepEqual(new Set(arrau.previewOrder), new Set(arrau.photos.map(({ id }) => id)));

  for (const photo of arrau.photos) {
    assert.ok(fs.existsSync(new URL(`../${photo.src}`, import.meta.url)), `Missing original ${photo.src}`);
    assert.ok(fs.existsSync(new URL(`../${photo.thumbnail}`, import.meta.url)), `Missing thumbnail ${photo.thumbnail}`);
    assert.match(photo.src, /^assets\/photos\/(?!thumbs\/).+\.webp$/);
    assert.match(photo.thumbnail, /^assets\/photos\/thumbs\/.+\.webp$/);
  }
});

test("uses a single immersive gallery with a rotating cover and no nested viewer", () => {
  assert.equal((html.match(/<dialog\b/g) || []).length, 2, "Only gallery and payment dialogs should remain");
  assert.match(html, /id="gallery-filters"/);
  assert.match(html, /id="gallery-main-image"/);
  assert.match(html, /id="gallery-thumbnails"/);
  assert.match(html, /aria-controls="gallery-dialog"/);
  assert.doesNotMatch(html, /photo-viewer|carousel-toggle|carousel-controls|hero-layer/);
  assert.doesNotMatch(appSource, /initializeCarousel|scheduleAutoplay|autoplayTimer/);
  assert.match(appSource, /PREVIEW_ROTATION_MS = 6500/);
  assert.match(appSource, /visiblePhotos/);
  assert.match(appSource, /data-preview-refresh/);
  assert.match(appSource, /index === 0 \? photo\.src : photo\.thumbnail/);
  assert.match(appSource, /event\.key === "ArrowLeft"/);
  assert.match(appSource, /event\.key === "ArrowRight"/);
  assert.match(appSource, /event\.key === "Home"/);
  assert.match(appSource, /event\.key === "End"/);
  assert.match(appSource, /pointerdown/);
  assert.match(appSource, /pointerup/);
  assert.match(appSource, /loader\.addEventListener\("error"/);
  assert.match(appSource, /request !== imageRequest/);
  assert.match(appSource, /preloadAdjacent/);
});

test("keeps portrait photos complete and the preview responsive", () => {
  assert.match(styles, /\.gallery-main-image[^}]+object-fit: contain/s);
  assert.match(styles, /\.gallery-main-image[^}]+min-height: 0/s);
  assert.match(styles, /\.gallery-image-viewport[^}]+touch-action: none/s);
  assert.match(styles, /\.gallery-ambient[^}]+filter: blur/s);
  assert.match(styles, /\.preview-filmstrip[^}]+overflow-x: auto/s);
  assert.match(styles, /@media \(min-width: 640px\)[\s\S]+\.editorial-preview[^}]+grid-template-columns/s);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});

test("supports mobile zoom, pan and filtered counters", () => {
  for (const id of ["gallery-image-viewport", "gallery-zoom-out", "gallery-zoom-reset", "gallery-zoom-in"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(appSource, /applyZoom/);
  assert.match(appSource, /pointerDistance/);
  assert.match(appSource, /pointerGesture\?\.type === "pinch"/);
  assert.match(appSource, /indexes\.indexOf\(currentIndex\) \+ 1/);
  assert.match(styles, /@media \(max-width: 479px\)[\s\S]+grid-template-rows: auto auto minmax\(240px, 1fr\) auto auto/s);
});

test("keeps the mobile refresh control aligned and removes the pull-down skip label", () => {
  assert.match(styles, /\.editorial-preview > \.preview-refresh\.glass-surface[^}]+position: absolute/s);
  assert.match(styles, /overscroll-behavior-y: none/);
  assert.doesNotMatch(html, /skip-link|Ir al contenido principal/);
});
