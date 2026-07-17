import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const app = fs.readFileSync(new URL("app.js", root), "utf8");
const html = fs.readFileSync(new URL("index.html", root), "utf8");
const styles = fs.readFileSync(new URL("styles.css", root), "utf8");
const glass = fs.readFileSync(new URL("glass.css", root), "utf8");
const manifest = JSON.parse(fs.readFileSync(new URL("assets/brands/manifest.json", root), "utf8"));

const expectedBrands = Object.freeze({
  whatsapp: "whatsapp-glyph.svg",
  mercadopago: "mercado-pago-handshake.svg",
  airbnb: "airbnb-belo.svg",
  booking: "booking-wordmark.svg",
  instagram: "instagram-glyph.png",
  snowForecast: "snow-forecast-wordmark.png",
  nevados: "nevados-de-chillan-wordmark.svg",
  googleMaps: "google-maps-icon.png",
});

test("maps every external destination to a local official brand asset", () => {
  assert.deepEqual(Object.keys(manifest.brands).sort(), Object.keys(expectedBrands).sort());
  for (const [brandKey, file] of Object.entries(expectedBrands)) {
    assert.equal(manifest.brands[brandKey].file, file);
    assert.match(manifest.brands[brandKey].sourcePage, /^https:\/\//);
    assert.match(manifest.brands[brandKey].assetSource, /^https:\/\//);
    assert.ok(app.includes(`${brandKey}: Object.freeze({`), `Missing BRAND_ASSETS entry for ${brandKey}`);
    assert.ok(app.includes(`src: "assets/brands/${file}"`), `Missing local source for ${brandKey}`);
    assert.ok(app.includes(`brandKey: "${brandKey}"`), `Missing link mapping for ${brandKey}`);
  }
});

test("keeps brand files local, intact and free of executable SVG content", () => {
  for (const entry of Object.values(manifest.brands)) {
    const assetUrl = new URL(`assets/brands/${entry.file}`, root);
    assert.ok(fs.existsSync(assetUrl), `Missing ${entry.file}`);
    const contents = fs.readFileSync(assetUrl);
    const digest = crypto.createHash("sha256").update(contents).digest("hex");
    assert.equal(digest, entry.sha256, `Checksum mismatch for ${entry.file}`);

    if (entry.file.endsWith(".svg")) {
      const svg = contents.toString("utf8");
      assert.match(svg, /<svg\b/i, `${entry.file} is not SVG`);
      assert.match(svg, /viewBox=/i, `${entry.file} has no viewBox`);
      assert.doesNotMatch(svg, /<script\b|javascript:|on(?:load|error)\s*=|<foreignObject\b/i, `${entry.file} contains executable content`);
      assert.doesNotMatch(svg, /(?:href|xlink:href)=["']https?:/i, `${entry.file} hotlinks an external resource`);
    }
  }
});

test("removes generic destination pictograms and renders decorative brand marks", () => {
  assert.doesNotMatch(app, /const ICONS\b|icon: "(?:house|calendar|card|camera|snow|mountain|pin)"/);
  assert.match(app, /function populateBrandStage\(/);
  assert.match(app, /stage\.setAttribute\("aria-hidden", "true"\)/);
  assert.match(app, /image\.alt = ""/);
  assert.match(html, /id="whatsapp-brand" aria-hidden="true"/);
  assert.doesNotMatch(`${app}\n${html}\n${styles}\n${glass}`, /(?:src|url\()["']?https?:\/\/(?:static|content|www|http2|news)/i);
});

test("documents Cordal treatments while preserving official brand geometry", () => {
  assert.equal(manifest.brands.mercadopago.treatment, "Cordal Sur deep-blue background; official geometry retained");
  assert.equal(manifest.brands.googleMaps.treatment, "Native brand colors");
  for (const brandKey of ["whatsapp", "airbnb", "booking", "instagram", "snowForecast", "nevados"]) {
    assert.equal(manifest.brands[brandKey].treatment, "Cordal Sur monochrome mask");
  }
  assert.match(app, /brand-stage--\$\{asset\.treatment\}/);
  assert.match(app, /treatment: "adapted"/);
  assert.match(styles, /brand-stage--mask/);
  assert.match(styles, /brand-stage--adapted/);
  assert.match(glass, /brand-stage--native/);
});

test("recolors only the Mercado Pago background to Cordal Sur deep blue", () => {
  const mercadoPago = fs.readFileSync(new URL("assets/brands/mercado-pago-handshake.svg", root), "utf8");
  assert.match(mercadoPago, /fill="#12344d"/);
  assert.doesNotMatch(mercadoPago, /#00bcff/i);
  assert.match(mercadoPago, /class="st1"/);
  assert.match(mercadoPago, /fill="#0a0080"/);
});

test("preserves every existing external destination", () => {
  for (const destination of [
    "https://link.mercadopago.cl/carhartt",
    "https://www.airbnb.cl/rooms/1729206776074121490",
    "https://www.booking.com/hotel/cl/departamento-en-condominio-andes-chillan.html",
    "https://www.instagram.com/cordal_sur/",
    "https://www.snow-forecast.com/resorts/Chillan/6day/mid",
    "https://www.nevadosdechillan.com/reporte-montana",
    "https://www.google.com/maps/search/?api=1&query=Condominio+Andes+Chill%C3%A1n%2C+Las+Trancas%2C+Chile",
  ]) assert.ok(app.includes(destination), `Changed or missing destination: ${destination}`);
});
