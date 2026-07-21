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

test("requires a minimum stay of two complete nights", () => {
  const { api } = loadAvailability();
  const range = { from: "2026-07-17", to: "2026-10-01", endExclusive: true };
  assert.equal(api.CONFIG.minimumNights, 2);
  assert.equal(api.meetsMinimumStay("2026-07-17", "2026-07-18"), false);
  assert.equal(api.meetsMinimumStay("2026-07-17", "2026-07-19"), true);
  assert.equal(api.meetsMinimumStay("2026-07-17", "2026-07-20"), true);
  assert.equal(api.isBookableStay("2026-07-17", "2026-07-18", range, []), false);
  assert.equal(api.isBookableStay("2026-07-17", "2026-07-19", range, []), true);
  assert.throws(() => api.buildWhatsappMessage("2026-07-17", "2026-07-18", true), /Minimum stay is two nights/);
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
  const range = { from: "2026-07-18", to: "2026-10-01", endExclusive: true };
  assert.equal(api.canStartStay("2026-09-29", range, []), true, "two September nights remain selectable");
  assert.equal(api.isBookableStay("2026-09-29", "2026-10-01", range, []), true, "the exclusive boundary is a valid checkout");
  assert.equal(api.canStartStay("2026-09-30", range, []), false, "the boundary leaves only one night");
  assert.equal(api.isBookableStay("2026-09-30", "2026-10-02", range, []), false, "a stay cannot cross the boundary");
  assert.deepEqual(Array.from(api.quoteRange("2026-09-29", "2026-10-01").lines, (line) => line.date), ["2026-09-29", "2026-09-30"]);
});

test("keeps exclusive checkout semantics and blocks only occupied nights", () => {
  const { api } = loadAvailability();
  const blocked = [{ startDate: "2026-07-20", endDate: "2026-07-24" }];
  assert.equal(api.isBlocked("2026-07-20", blocked), true);
  assert.equal(api.isBlocked("2026-07-24", blocked), false);
  assert.equal(api.rangeHasBlockedNight("2026-07-18", "2026-07-20", blocked), false, "reserved arrival can be used as checkout");
  assert.equal(api.meetsMinimumStay("2026-07-18", "2026-07-20"), true, "reserved arrival remains a valid checkout after two nights");
  assert.equal(api.isBookableStay("2026-07-18", "2026-07-20", { from: "2026-07-17", to: "2026-10-01" }, blocked), true);
  assert.equal(api.rangeHasBlockedNight("2026-07-18", "2026-07-21", blocked), true);
  assert.equal(api.canStartStay("2026-07-18", { from: "2026-07-17", to: "2026-10-01" }, blocked), true);
  assert.equal(api.canStartStay("2026-07-19", { from: "2026-07-17", to: "2026-10-01" }, blocked), false);
});

test("invalidates selected dates when refreshed availability changes", () => {
  const { api } = loadAvailability();
  const range = { from: "2026-07-21", to: "2026-10-01", endExclusive: true };
  assert.equal(api.isSelectionValid("2026-07-26", "2026-07-28", range, []), true);
  assert.equal(api.isSelectionValid("2026-07-26", "2026-07-28", range, [{ startDate: "2026-07-27", endDate: "2026-07-29" }]), false);
  assert.equal(api.isSelectionValid("2026-07-26", "2026-07-28", { ...range, from: "2026-07-29" }, []), false);
  assert.equal(api.isSelectionValid("2026-07-26", null, range, [{ startDate: "2026-07-27", endDate: "2026-07-29" }]), false);
  assert.equal(api.isSelectionValid(null, null, range, []), true);
  assert.match(source, /const invalidatedSelection = Boolean\(state\.arrival && !selectionIsValid\(\)\)/);
  assert.match(source, /invalidatedSelection\) clearSelectionState\(\)/);
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

test("reveals prices only after a valid two-night range", () => {
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
  assert.match(html, /class="availability-minimum-stay"[^>]*data-i18n="availability\.minimumStay"/);
  assert.match(html, /id="availability-reveal-price"[^>]*aria-controls="availability-quote"[^>]*aria-expanded="false"/);
  assert.match(html, /id="availability-quote"[^>]*hidden/);
  assert.match(html, /id="availability-quote"[^>]*tabindex="-1"/);
  assert.match(styles, /\[hidden\] \{ display: none !important; \}/);
  assert.match(source, /elements\.selection\.hidden = !selected/);
  assert.match(source, /pricesRevealed: false/);
  assert.match(source, /elements\.quote\.hidden = !complete \|\| !state\.pricesRevealed/);
  assert.match(source, /elements\.revealPrice\.hidden = !complete \|\| state\.pricesRevealed/);
  assert.match(source, /elements\.consult\.hidden = !complete \|\| !state\.pricesRevealed/);
  assert.match(source, /state\.pricesRevealed = true;\s*renderSelection\(\);/);
  assert.match(source, /state\.pricesRevealed = false;/);
  assert.match(source, /if \(!complete \|\| !state\.pricesRevealed\) \{[\s\S]*elements\.subtotal\.textContent = "—"/);
  assert.match(source, /const quote = complete \? quoteRange\(state\.arrival, state\.departure\) : null/);
  assert.doesNotMatch(source, /shiftDays\(state\.arrival, 1\)/);
  assert.match(source, /minimumNights: 2/);
  assert.match(source, /button\.dataset\.minimumStay = "arrival"/);
  assert.match(source, /button\.dataset\.minimumStay = "checkout"/);
  assert.match(source, /if \(!meetsMinimumStay\(state\.arrival, date\)\)/);
  assert.match(source, /!state\.departure \|\| !meetsMinimumStay\(state\.arrival, state\.departure\)/);
  assert.match(source, /announce\("availability\.minimumStay\.error"\)/);
  assert.match(source, /button === document\.activeElement/);
  assert.match(source, /restoreCalendarFocus\(date\)/);
  assert.match(source, /const focusDate = state\.arrival;[\s\S]*ensureVisibleAndFocus\(focusDate\)/);
  assert.match(source, /elements\.quote\.focus\(\{ preventScroll: true \}\)/);
  assert.match(source, /event\.key === "Enter" \|\| event\.key === " "/);
  assert.match(source, /if \(!selected\) \{[\s\S]*elements\.quote\.hidden = true;[\s\S]*elements\.consult\.hidden = true;/);
  assert.match(styles, /\.availability-day\.is-minimum-stay[^}]+cursor: not-allowed/s);
  assert.doesNotMatch(html, /availability-show-prices|Mostrar precios/);
  for (const key of [
    "availability.minimumStay",
    "availability.minimumStay.short",
    "availability.minimumStay.checkout",
    "availability.minimumStay.error",
    "availability.minimumStay.arrival",
    "availability.minimumStay.arrivalUnavailable",
    "availability.checkoutOnly",
    "availability.outsideRange",
    "availability.selectionInvalidated",
    "availability.revealPrices",
    "availability.revealPrices.detail",
    "availability.pricesRevealed",
  ]) {
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
  assert.throws(() => api.buildWhatsappMessage("2026-07-18", "2026-07-19", false), /Minimum stay is two nights/);
});

test("loads preferences and property data before the application", () => {
  const preferences = html.indexOf('<script src="preferences.js?v=minimum-two-night-stay-20260721" defer>');
  const propertyData = html.indexOf('<script src="property-data.js?v=minimum-two-night-stay-20260721" defer>');
  const availability = html.indexOf('<script src="availability.js?v=minimum-two-night-stay-20260721" defer>');
  const app = html.indexOf('<script src="app.js?v=minimum-two-night-stay-20260721" defer>');
  assert.ok(preferences > 0 && preferences < propertyData && propertyData < availability && availability < app);
});
