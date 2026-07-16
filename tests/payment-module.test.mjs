import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const paymentUrl = "https://link.mercadopago.cl/carhartt";
const receiptMessage = "Hola Cordal Sur, adjunto el comprobante de mi abono por Mercado Pago. Reserva a nombre de: ___";

test("uses the approved public Mercado Pago destination", () => {
  const url = new URL(paymentUrl);
  assert.equal(url.protocol, "https:");
  assert.equal(url.hostname, "link.mercadopago.cl");
  assert.match(app, /"link\.mercadopago\.cl"/);
  assert.ok(app.includes(`url: "${paymentUrl}"`));
});

test("keeps the payment dialog and initializer connected", () => {
  for (const id of [
    "open-payment",
    "payment-dialog",
    "payment-close",
    "payment-cancel",
    "payment-continue",
    "payment-receipt",
  ]) {
    assert.ok(html.includes(`id="${id}"`), `Missing payment module element #${id}`);
    assert.ok(app.includes(`"#${id}"`), `Missing JavaScript binding for #${id}`);
  }
  assert.match(app, /initializePayment\(\);/);
  assert.match(app, /event\.key !== "Escape"/);
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
});

test("prepares the agreed WhatsApp receipt message", () => {
  const encoded = app.match(/id: "payment-receipt"[\s\S]*?url: "([^"]+)"/)?.[1];
  assert.ok(encoded, "Missing receipt URL");
  const message = new URL(encoded).searchParams.get("text");
  assert.equal(message, receiptMessage);
});

test("does not embed Mercado Pago credentials", () => {
  for (const source of [app, html]) {
    assert.doesNotMatch(source, /APP_USR-|TEST-[A-Za-z0-9-]{20,}|ACCESS_TOKEN|CLIENT_SECRET|PRIVATE_KEY/i);
  }
});
