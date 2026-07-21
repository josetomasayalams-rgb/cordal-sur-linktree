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
  assert.equal(arrau.groups.reduce((total, group) => total + group.count, 0), 47);
  assert.equal(arrau.photos.length, 47);
  assert.equal(new Set(arrau.photos.map(({ id }) => id)).size, 47);
  assert.deepEqual(Array.from(arrau.featured, ({ id }) => id), [
    "01-sala-02",
    "02-cocina-completa-04",
    "04-habitacion-1-01",
    "05-habitacion-2-01",
    "10-exterior-03",
  ]);

  for (const photo of arrau.photos) {
    assert.ok(fs.existsSync(new URL(`../${photo.src}`, import.meta.url)), `Missing original ${photo.src}`);
    assert.ok(fs.existsSync(new URL(`../${photo.thumbnail}`, import.meta.url)), `Missing thumbnail ${photo.thumbnail}`);
    assert.match(photo.src, /^assets\/photos\/(?!thumbs\/).+\.webp$/);
    assert.match(photo.thumbnail, /^assets\/photos\/thumbs\/.+\.webp$/);
  }
});

test("uses a single immersive gallery without autoplay or a nested viewer", () => {
  assert.equal((html.match(/<dialog\b/g) || []).length, 2, "Only gallery and payment dialogs should remain");
  assert.match(html, /id="gallery-filters"/);
  assert.match(html, /id="gallery-main-image"/);
  assert.match(html, /id="gallery-thumbnails"/);
  assert.match(html, /aria-controls="gallery-dialog"/);
  assert.doesNotMatch(html, /photo-viewer|carousel-toggle|carousel-controls|hero-layer/);
  assert.doesNotMatch(appSource, /initializeCarousel|scheduleAutoplay|autoplayTimer|6000/);
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
  assert.match(styles, /\.gallery-ambient[^}]+filter: blur/s);
  assert.match(styles, /touch-action: pan-y pinch-zoom/);
  assert.match(styles, /\.preview-filmstrip[^}]+overflow-x: auto/s);
  assert.match(styles, /@media \(min-width: 640px\)[\s\S]+\.editorial-preview[^}]+grid-template-columns/s);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
