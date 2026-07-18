import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../availability.js", import.meta.url), "utf8");
const preferencesSource = fs.readFileSync(new URL("../preferences.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

function loadAvailability() {
  const values = new Map();
  const documentElement = { classList: { add() {} }, dataset: {}, lang: "es-CL" };
  const document = {
    documentElement,
    readyState: "loading",
    title: "",
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
  };
  const localStorage = {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
  const window = {};
  const context = { window, document, localStorage, Intl, Date, URL, Set, Object, Array, Number, String, RegExp, Map };
  vm.runInNewContext(preferencesSource, context, { filename: "preferences.js" });
  vm.runInNewContext(source, context, { filename: "availability.js" });
  return { api: window.CS_LINKTREE_AVAILABILITY, preferences: window.CS_LINKTREE_PREFERENCES };
}

test("uses the approved sanitized HTTPS availability endpoint", () => {
  const { api } = loadAvailability();
  const url = new URL(api.CONFIG.endpoint);
  assert.equal(url.protocol, "https:");
  assert.equal(url.hostname, "uimqusoylxpyljbfqumm.supabase.co");
  assert.equal(url.pathname, "/functions/v1/calendar-ical/availability");
  assert.equal(api.safeEndpoint(), api.CONFIG.endpoint);
  assert.doesNotMatch(source, /AIRBNB_ICAL_URL|BOOKING_ICAL_URL|SERVICE_ROLE_KEY|external_calendar_events|\.ics\b/i);
});

test("prices Sunday through Thursday at CLP 250,000 and Friday/Saturday at CLP 280,000", () => {
  const { api } = loadAvailability();
  assert.equal(api.nightlyRate("2026-07-16"), 250000); // Thursday
  assert.equal(api.nightlyRate("2026-07-17"), 280000); // Friday
  assert.equal(api.nightlyRate("2026-07-18"), 280000); // Saturday
  assert.equal(api.nightlyRate("2026-07-19"), 250000); // Sunday
  const quote = api.quoteRange("2026-07-16", "2026-07-19");
  assert.equal(quote.nights, 3);
  assert.equal(quote.totalClp, 810000);
  assert.deepEqual(Array.from(quote.lines, (line) => line.kind), ["weekday", "weekend", "weekend"]);
});

test("keeps exclusive checkout semantics and blocks only occupied nights", () => {
  const { api } = loadAvailability();
  const blocked = [{ startDate: "2026-07-20", endDate: "2026-07-24" }];
  assert.equal(api.isBlocked("2026-07-20", blocked), true);
  assert.equal(api.isBlocked("2026-07-24", blocked), false);
  assert.equal(api.rangeHasBlockedNight("2026-07-18", "2026-07-20", blocked), false, "reserved arrival can be used as checkout");
  assert.equal(api.rangeHasBlockedNight("2026-07-18", "2026-07-21", blocked), true);
});

test("accepts only the minimal versioned contract and rejects source details", () => {
  const { api } = loadAvailability();
  const payload = {
    version: 1,
    timezone: "America/Santiago",
    generatedAt: "2026-07-17T15:00:00.000Z",
    range: { from: "2026-07-17", to: "2027-07-17", endExclusive: true },
    status: "live",
    lastSuccessfulSyncAt: "2026-07-17T14:55:00.000Z",
    blockedRanges: [{ startDate: "2026-07-20", endDate: "2026-07-24" }],
  };
  assert.equal(api.validatePayload(payload), payload);
  assert.equal(api.validatePayload({ ...payload, source: "airbnb" }), null);
  assert.equal(api.validatePayload({ ...payload, blockedRanges: [{ ...payload.blockedRanges[0], uid: "private" }] }), null);
  assert.equal(api.validatePayload({ ...payload, status: "free" }), null);
});

test("keeps prices hidden by default and connects the accessible calendar controls", () => {
  for (const id of [
    "availability-status",
    "availability-refresh",
    "availability-previous",
    "availability-next",
    "availability-months",
    "availability-show-prices",
    "availability-selection",
    "availability-consult",
    "availability-live",
  ]) assert.ok(html.includes(`id="${id}"`), `Missing #${id}`);
  assert.match(html, /id="availability-show-prices" type="checkbox" role="switch">/);
  assert.doesNotMatch(html, /id="availability-show-prices"[^>]*\bchecked\b/);
  for (const key of ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"]) {
    assert.ok(source.includes(`"${key}"`), `Missing keyboard behavior for ${key}`);
  }
  assert.match(source, /tabIndex = date === state\.focusDate/);
  assert.match(source, /setAttribute\("aria-pressed"/);
  assert.match(source, /setAttribute\("aria-disabled"/);
  assert.match(source, /setAttribute\("aria-busy"/);
});

test("builds localized WhatsApp enquiries with optional estimates", () => {
  const { api, preferences } = loadAvailability();
  const expected = {
    es: /Hola Cordal Sur.+2 noches.+Somos ___ huéspedes/,
    pt: /Olá, Cordal Sur.+2 noites.+Somos ___ hóspedes/,
    en: /Hello Cordal Sur.+2 nights.+There will be ___ guests/,
  };
  for (const language of ["es", "pt", "en"]) {
    preferences.setLanguage(language);
    assert.match(api.buildWhatsappMessage("2026-07-17", "2026-07-19", false), expected[language]);
    const priced = api.buildWhatsappMessage("2026-07-17", "2026-07-19", true);
    assert.match(priced, /560[.,]000|560\.000/);
    assert.match(priced, /confirm|confirma/i);
  }
  preferences.setLanguage("es");
  assert.match(api.buildWhatsappMessage("2026-07-18", "2026-07-19", false), /\(1 noche\)/);
  assert.doesNotMatch(api.buildWhatsappMessage("2026-07-18", "2026-07-19", false), /1 noches/);
});

test("loads preferences before availability and availability before the existing app", () => {
  const preferences = html.indexOf('<script src="preferences.js" defer>');
  const availability = html.indexOf('<script src="availability.js" defer>');
  const app = html.indexOf('<script src="app.js" defer>');
  assert.ok(preferences > 0 && preferences < availability && availability < app);
});
