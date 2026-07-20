import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const source = await fs.readFile(new URL("../tracking.js", import.meta.url), "utf8");

class FakeElement {
  constructor(id = "") { this.id = id; }
  closest() { return this; }
}

class FakeAnchor extends FakeElement {
  constructor(href, id = "") { super(id); this.href = href; }
}

function boot(search = "") {
  const listeners = new Map();
  const session = new Map();
  const whatsapp = new FakeAnchor("https://wa.me/56990137732?text=Hola%20Cordal%20Sur.%20C%C3%B3digo%3A%20CS-DIRECT-LANDING.", "whatsapp-link");
  const airbnb = new FakeAnchor("https://www.airbnb.cl/rooms/1729206776074121490?utm_term=private_term");
  const booking = new FakeAnchor("https://www.booking.com/hotel/cl/departamento-en-condominio-andes-chillan.html");
  const share = new FakeElement("share");
  const window = {
    location: { href: "https://example.test/" + search, search },
    sessionStorage: {
      getItem: (key) => session.get(key) || null,
      setItem: (key, value) => session.set(key, value)
    },
    dataLayer: [],
    dispatchEvent: () => true
  };
  const document = {
    querySelector: (selector) => selector === "#whatsapp-link" ? whatsapp : selector.includes("canonical") ? { href: "https://example.test/" } : null,
    querySelectorAll: (selector) => selector.includes("airbnb") ? [airbnb] : selector.includes("booking") ? [booking] : [],
    addEventListener: (type, handler) => {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(handler);
    }
  };
  class FakeCustomEvent { constructor(type, init) { this.type = type; this.detail = init.detail; } }
  vm.runInNewContext(source, {
    window, document, URL, URLSearchParams, Object, JSON, String,
    Element: FakeElement, HTMLAnchorElement: FakeAnchor, CustomEvent: FakeCustomEvent
  });
  listeners.get("DOMContentLoaded")[0]();
  return { window, listeners, whatsapp, airbnb, booking, share };
}

const direct = boot();
assert.equal(direct.window.CordalTracking.attributionCode(), "CS-DIRECT-LANDING");
assert.match(new URL(direct.whatsapp.href).searchParams.get("text"), /CS-DIRECT-LANDING/);
direct.listeners.get("click")[0]({ target: direct.airbnb });
assert.equal(direct.window.dataLayer.length, 1);
assert.equal(direct.window.dataLayer[0].event, "click_airbnb");
direct.listeners.get("click")[0]({ target: direct.share });
assert.equal(direct.window.dataLayer.length, 1, "Un clic en compartir no debe contar como éxito");
direct.window.CordalTracking.trackShare("copy");
assert.equal(direct.window.dataLayer.length, 2);
assert.equal(direct.window.dataLayer[1].event, "share");

const attributed = boot("?utm_source=instagram&utm_medium=organic_social&utm_campaign=always_on&utm_content=bio&utm_term=private_term");
assert.match(new URL(attributed.whatsapp.href).searchParams.get("text"), /CS-INSTAGRAM-BIO/);
const airbnbUrl = new URL(attributed.airbnb.href);
assert.equal(airbnbUrl.searchParams.get("utm_source"), "cordal_sur_landing");
assert.equal(airbnbUrl.searchParams.get("utm_medium"), "referral");
assert.equal(airbnbUrl.searchParams.get("utm_term"), null, "No se debe propagar utm_term a una OTA");
const allowedKeys = new Set(["event", "channel", "utm_source", "utm_medium", "utm_campaign", "utm_content"]);
for (const payload of [...direct.window.dataLayer, ...attributed.window.dataLayer]) {
  assert.ok(Object.keys(payload).every((key) => allowedKeys.has(key)), "El evento contiene un campo no permitido");
}

console.log("Validación runtime de tracking OK");
