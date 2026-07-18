import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../availability.js", import.meta.url), "utf8");
const preferencesSource = fs.readFileSync(new URL("../preferences.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");

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
  assert.equal(url.pathname, "/functions/v1/calendar-ical/public-availability");
  assert.equal(api.safeEndpoint(), api.CONFIG.endpoint);
  assert.doesNotMatch(source, /AIRBNB_ICAL_URL|BOOKING_ICAL_URL|SERVICE_ROLE_KEY|external_calendar_events|\.ics\b/i);
});

test("prices Sunday through Thursday at CLP 260,000 and Friday/Saturday at CLP 280,000", () => {
  const { api } = loadAvailability();
  assert.equal(api.nightlyRate("2026-07-16"), 260000); // Thursday
  assert.equal(api.nightlyRate("2026-07-17"), 280000); // Friday
  assert.equal(api.nightlyRate("2026-07-18"), 280000); // Saturday
  assert.equal(api.nightlyRate("2026-07-19"), 260000); // Sunday
  const quote = api.quoteRange("2026-07-16", "2026-07-19");
  assert.equal(quote.nights, 3);
  assert.equal(quote.totalClp, 820000);
  assert.deepEqual(Array.from(quote.lines, (line) => line.kind), ["weekday", "weekend", "weekend"]);
});

test("keeps the full September season and stops before October", () => {
  const { api } = loadAvailability();
  assert.equal(api.CONFIG.bookingEndExclusive, "2026-10-01");
  assert.equal(api.nightlyRate("2026-09-30"), 260000);
  assert.deepEqual({ ...api.clampBookableRange({
    from: "2026-07-18",
    to: "2027-07-18",
    endExclusive: true,
  }) }, {
    from: "2026-07-18",
    to: "2026-10-01",
    endExclusive: true,
  });
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

test("opens the selected-date card first and reveals prices only from its primary button", () => {
  for (const id of [
    "availability-status",
    "availability-refresh",
    "availability-previous",
    "availability-next",
    "availability-months",
    "availability-selection",
    "availability-selection-title",
    "availability-reveal-price",
    "availability-quote-label",
    "availability-consult",
    "availability-live",
  ]) assert.ok(html.includes(`id="${id}"`), `Missing #${id}`);
  assert.match(html, /id="availability-selection" hidden/);
  assert.match(html, /id="availability-reveal-price"[^>]*aria-controls="availability-quote"[^>]*aria-expanded="false"/);
  assert.match(html, /id="availability-quote"[^>]*hidden/);
  assert.match(styles, /\[hidden\] \{ display: none !important; \}/);
  assert.match(source, /elements\.selection\.hidden = !selected/);
  assert.match(source, /pricesRevealed: false/);
  assert.match(source, /elements\.quote\.hidden = !state\.pricesRevealed/);
  assert.match(source, /elements\.revealPrice\.hidden = state\.pricesRevealed/);
  assert.match(source, /elements\.consult\.hidden = !complete \|\| !state\.pricesRevealed/);
  assert.match(source, /state\.pricesRevealed = true;\s*renderSelection\(\);/);
  assert.match(source, /state\.pricesRevealed = false;/);
  assert.match(source, /if \(!state\.pricesRevealed\) \{[\s\S]*elements\.subtotal\.textContent = "—"/);
  assert.match(source, /complete \? state\.departure : shiftDays\(state\.arrival, 1\)/);
  assert.doesNotMatch(html, /availability-show-prices|Mostrar precios/);
  for (const key of ["availability.revealPrices", "availability.revealPrices.detail", "availability.pricesRevealed"]) {
    assert.ok(preferencesSource.includes(`"${key}"`), `Missing translation ${key}`);
  }
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
