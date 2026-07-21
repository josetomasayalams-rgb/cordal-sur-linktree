import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFile(path.join(root, name), "utf8");
const [html, app, propertyData, preferences, tracking, styles, robots, sitemap] = await Promise.all(
  ["index.html", "app.js", "property-data.js", "preferences.js", "tracking.js", "styles.css", "robots.txt", "sitemap.xml"].map(read)
);
const galleryFiles = await fs.readdir(path.join(root, "assets", "photos"));
const thumbnailFiles = await fs.readdir(path.join(root, "assets", "photos", "thumbs"));
const galleryWindow = {};
const galleryDocument = {
  readyState: "loading",
  documentElement: {},
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};
const galleryContext = {
  window: galleryWindow,
  document: galleryDocument,
  localStorage: { getItem: () => null, setItem: () => {} },
  Object, Set, URL
};
vm.runInNewContext(preferences, galleryContext);
vm.runInNewContext(propertyData, galleryContext);
vm.runInNewContext(app, galleryContext);

assert.match(html, /<title>Arrau · Cordal Sur \| Andes Chillán<\/title>/);
assert.match(html, /<link rel="canonical" href="https:\/\/josetomasayalams-rgb\.github\.io\/cordal-sur-linktree\/">/);
assert.match(html, /Colección Cordal Sur/);
assert.match(html, /<h2 class="hero-title">Arrau<\/h2>/);
assert.match(html, /id="property-preview"/);
assert.match(html, /Explorar 35 fotos/);
assert.match(html, /id="gallery-tour"/);
assert.match(html, /id="gallery-scroll"/);
assert.match(html, /class="gallery-close-symbol"/);
assert.doesNotMatch(html, /gallery-close-arrow|gallery-close-lockup/);
assert.match(html, /data-build="gallery-photo-counter-20260721"/);
assert.match(html, /assets\/photos\/01-sala-02\.webp/);
assert.doesNotMatch(html, /hero-layer-a|carousel-toggle|photo-viewer|1\/13/);

assert.match(robots, /^User-agent: \*\nAllow: \//);
assert.match(robots, /Sitemap: https:\/\/josetomasayalams-rgb\.github\.io\/cordal-sur-linktree\/sitemap\.xml/);
assert.match(sitemap, /<loc>https:\/\/josetomasayalams-rgb\.github\.io\/cordal-sur-linktree\/<\/loc>/);
assert.match(sitemap, /<lastmod>2026-07-21<\/lastmod>/);

for (const destination of ["whatsapp", "airbnb", "booking", "share"]) {
  assert.ok(tracking.includes('return "' + destination + '"'), "Falta clasificación " + destination);
}
assert.ok(tracking.includes('"click_" + destination'), "Falta contrato click_*");
assert.match(tracking, /utm_source \|\|= "direct"/);
assert.match(tracking, /utm_medium \|\|= "none"/);
assert.match(tracking, /if \(destination === "share"\) return/);
assert.equal((tracking.match(/addEventListener\("click"/g) || []).length, 1, "Debe existir un único listener de clic");
assert.doesNotMatch(tracking, /measurement_id|gtag\("config"|telefono|phone_number|guest_name|message_text/i);
assert.equal(galleryFiles.filter((file) => file.endsWith(".webp")).length, 35, "La galería debe contener 35 imágenes WebP");
assert.equal(thumbnailFiles.filter((file) => file.endsWith(".webp")).length, 35, "La galería debe contener 35 miniaturas WebP");
assert.doesNotMatch(propertyData, /10-piscina|11-entorno/, "La galería no debe conservar recursos de las categorías antiguas");
assert.equal(galleryWindow.CS_LINKTREE_PROPERTIES.length, 1, "Arrau debe ser la primera propiedad del portafolio");
assert.equal(galleryWindow.ACTIVE_PROPERTY.id, "arrau");
assert.equal(galleryWindow.GALLERY_PHOTOS.length, 35, "La aplicación debe exponer las 35 fotos finales");
assert.equal(galleryWindow.PREVIEW_PHOTOS.length, 35, "La portada dinámica debe recorrer las 35 fotografías");
assert.equal(new Set(galleryWindow.PREVIEW_PHOTOS.map(({ id }) => id)).size, 35, "La portada no debe repetir fotos en su ciclo");
for (const removedId of ["04-habitacion-1-04", "06-habitacion-3-03", "06-habitacion-3-04", "06-habitacion-3-05"]) {
  assert.ok(!galleryWindow.GALLERY_PHOTOS.some(({ id }) => id === removedId), `${removedId} debe quedar fuera del registro`);
}
assert.equal(galleryWindow.PREVIEW_PHOTOS[0].src, "assets/photos/01-sala-01.webp");
assert.ok(styles.includes(".gallery-dialog"), "Faltan estilos de galería");
assert.match(styles, /object-fit: contain/);
assert.match(styles, /--brand-title-gradient: linear-gradient\(110deg, #102c26, #153b33 52%, #785018\)/);
assert.match(styles, /\.gallery-header\.is-compact/);
assert.match(app, /header\.dataset\.state = state/);
assert.match(app, /header\.dataset\.group = group\?\.id \|\| "property"/);
assert.match(app, /header\.dataset\.photoIndex = String\(current\)/);
assert.match(app, /PREVIEW_ROTATION_MS = 6500/);
assert.doesNotMatch(app, /setTimeout\(\(\) => navigate|scheduleAutoplay|initializeCarousel/);
assert.ok(!html.includes("G-XXXXXXXX"), "No se debe inventar un ID de GA4");

console.log("Validación estática OK");
