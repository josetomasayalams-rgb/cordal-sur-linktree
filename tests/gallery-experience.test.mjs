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
  assert.equal(arrau.groups.reduce((total, group) => total + group.count, 0), 38);
  assert.equal(arrau.photos.length, 38);
  assert.equal(new Set(arrau.photos.map(({ id }) => id)).size, 38);
  assert.equal(arrau.previewOrder.length, 38);
  assert.equal(new Set(arrau.previewOrder).size, 38);
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

test("uses a compact clipped Cordal Sur header over the mobile photo tour", () => {
  assert.match(html, /class="gallery-close-lockup"/);
  assert.match(html, /class="gallery-close-symbol"/);
  assert.match(html, /class="gallery-close-arrow">←<\/span>/);
  assert.match(styles, /\.gallery-close-symbol[^}]+cordal-sur-symbol-reverse\.svg/s);
  assert.match(styles, /@media \(max-width: 479px\)[\s\S]+\.gallery-header::before[^}]+clip-path:/s);
  assert.match(styles, /@media \(max-width: 479px\)[\s\S]+\.gallery-scroll[^}]+padding-top:/s);
  assert.match(styles, /prefers-reduced-transparency: reduce/);
});

test("keeps the mobile refresh control aligned and removes the pull-down skip label", () => {
  assert.match(styles, /\.editorial-preview > \.preview-refresh\.glass-surface[^}]+position: absolute/s);
  assert.match(styles, /overscroll-behavior-y: none/);
  assert.doesNotMatch(html, /skip-link|Ir al contenido principal/);
});
