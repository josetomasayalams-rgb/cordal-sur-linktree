import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFile(path.join(root, name), "utf8");
const [html, app, preferences, tracking, styles, robots, sitemap] = await Promise.all(
  ["index.html", "app.js", "preferences.js", "tracking.js", "styles.css", "robots.txt", "sitemap.xml"].map(read)
);
const galleryFiles = await fs.readdir(path.join(root, "assets", "photos"));
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
vm.runInNewContext(app, galleryContext);

assert.match(html, /<title>Cordal Sur · Andes Chillán<\/title>/);
assert.match(html, /<link rel="canonical" href="https:\/\/josetomasayalams-rgb\.github\.io\/cordal-sur-linktree\/">/);
assert.match(html, /id="hero-layer-a"/);
assert.match(html, /Ver las 47 fotos/);
assert.match(html, /47 fotografías agrupadas por ambiente/);
assert.match(html, /assets\/photos\/10-exterior-01\.webp/);

assert.match(robots, /^User-agent: \*\nAllow: \//);
assert.match(robots, /Sitemap: https:\/\/josetomasayalams-rgb\.github\.io\/cordal-sur-linktree\/sitemap\.xml/);
assert.match(sitemap, /<loc>https:\/\/josetomasayalams-rgb\.github\.io\/cordal-sur-linktree\/<\/loc>/);
assert.match(sitemap, /<lastmod>2026-07-15<\/lastmod>/);

for (const destination of ["whatsapp", "airbnb", "booking", "share"]) {
  assert.ok(tracking.includes('return "' + destination + '"'), "Falta clasificación " + destination);
}
assert.ok(tracking.includes('"click_" + destination'), "Falta contrato click_*");
assert.match(tracking, /utm_source \|\|= "direct"/);
assert.match(tracking, /utm_medium \|\|= "none"/);
assert.match(tracking, /if \(destination === "share"\) return/);
assert.equal((tracking.match(/addEventListener\("click"/g) || []).length, 1, "Debe existir un único listener de clic");
assert.doesNotMatch(tracking, /measurement_id|gtag\("config"|telefono|phone_number|guest_name|message_text/i);
assert.match(app, /const HERO_SEQUENCE[\s\S]*?\["11-entrada-guardabotas-01", "gallery\.entrada"\]/, "El carrusel debe incluir las 11 categorías maestras");
assert.equal(galleryFiles.filter((file) => file.endsWith(".webp")).length, 47, "La galería debe contener 47 imágenes WebP");
assert.doesNotMatch(app, /10-piscina|11-entorno/, "La galería no debe conservar recursos de las categorías antiguas");
assert.equal(galleryWindow.GALLERY_PHOTOS.length, 47, "La aplicación debe exponer las 47 fotos finales");
assert.equal(galleryWindow.HERO_PHOTOS.length, 11, "El carrusel debe tener una portada por categoría");
assert.equal(galleryWindow.HERO_PHOTOS[0].src, "assets/photos/01-sala-01.webp");
assert.equal(galleryWindow.HERO_PHOTOS.at(-1).src, "assets/photos/11-entrada-guardabotas-01.webp");
assert.ok(styles.includes(".gallery-dialog"), "Faltan estilos de galería");
assert.ok(!html.includes("G-XXXXXXXX"), "No se debe inventar un ID de GA4");

console.log("Validación estática OK");
