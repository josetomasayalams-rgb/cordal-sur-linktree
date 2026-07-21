import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const preferencesSource = fs.readFileSync(new URL("../preferences.js", import.meta.url), "utf8");
const appSource = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const propertySource = fs.readFileSync(new URL("../property-data.js", import.meta.url), "utf8");
const availabilitySource = fs.readFileSync(new URL("../availability.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const glass = fs.readFileSync(new URL("../glass.css", import.meta.url), "utf8");

function loadPreferences(initialStorage = {}) {
  const values = new Map(Object.entries(initialStorage));
  const documentElement = {
    classList: { add() {} },
    dataset: {},
    lang: "es-CL",
  };
  const document = {
    documentElement,
    readyState: "complete",
    title: "",
    querySelector() { return null; },
    querySelectorAll() { return []; },
  };
  const localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
  const window = {};
  vm.runInNewContext(preferencesSource, { document, localStorage, window, Object, Set }, { filename: "preferences.js" });
  return { api: window.CS_LINKTREE_PREFERENCES, document, values };
}

test("keeps ES, PT-BR and EN translation keys in parity", () => {
  const { api } = loadPreferences();
  assert.deepEqual([...api.supportedLanguages], ["es", "pt", "en"]);
  const expected = Object.keys(api.translations.es).sort();
  assert.deepEqual(Object.keys(api.translations.pt).sort(), expected);
  assert.deepEqual(Object.keys(api.translations.en).sort(), expected);
  for (const language of api.supportedLanguages) {
    for (const [key, value] of Object.entries(api.translations[language])) {
      assert.equal(typeof value, "string", `${language}.${key} must be text`);
      assert.ok(value.trim(), `${language}.${key} must not be empty`);
      assert.notEqual(value, key, `${language}.${key} must be translated`);
      assert.doesNotMatch(value, /TODO|\[.+\]/i, `${language}.${key} contains a placeholder`);
    }
  }
});

test("uses Linktree-only storage with Spanish and dark fallbacks", () => {
  const { api, document, values } = loadPreferences({ "gh-lang": "en", "gh-theme-v3": "dark" });
  assert.equal(api.LANGUAGE_STORAGE_KEY, "cs-linktree-lang-v1");
  assert.equal(api.THEME_STORAGE_KEY, "cs-linktree-theme-v1");
  assert.equal(api.getLanguage(), "es");
  assert.equal(api.getTheme(), "dark");
  api.setLanguage("invalid");
  api.setTheme("invalid");
  assert.equal(values.get("cs-linktree-lang-v1"), "es");
  assert.equal(values.get("cs-linktree-theme-v1"), "dark");
  assert.equal(values.get("gh-lang"), "en");
  assert.equal(values.get("gh-theme-v3"), "dark");
  assert.equal(document.documentElement.lang, "es-CL");
  assert.equal(document.documentElement.dataset.theme, "dark");
});

test("maps languages to the correct HTML locale and persists theme", () => {
  const { api, document } = loadPreferences();
  for (const [language, htmlLanguage] of [["es", "es-CL"], ["pt", "pt-BR"], ["en", "en"]]) {
    api.setLanguage(language);
    assert.equal(document.documentElement.lang, htmlLanguage);
    assert.equal(document.documentElement.dataset.language, language);
  }
  api.setTheme("dark");
  assert.equal(api.getTheme(), "dark");
  assert.equal(document.documentElement.dataset.theme, "dark");
});

test("keeps an explicitly saved light theme while defaulting new visits to dark", () => {
  const fresh = loadPreferences();
  assert.equal(fresh.api.getTheme(), "dark");
  assert.equal(fresh.document.documentElement.dataset.theme, "dark");

  const savedLight = loadPreferences({ "cs-linktree-theme-v1": "light" });
  assert.equal(savedLight.api.getTheme(), "light");
  assert.equal(savedLight.document.documentElement.dataset.theme, "light");
});

test("connects every static and programmatic translation key", () => {
  const { api } = loadPreferences();
  const keys = new Set(Object.keys(api.translations.es));
  const htmlKeys = [...html.matchAll(/data-i18n(?:-aria|-alt)?="([^"]+)"/g)].map((match) => match[1]);
  const appKeys = [
    ...appSource.matchAll(/\bt\("([^"]+)"/g),
    ...appSource.matchAll(/(?:labelKey|detailKey|messageKey|titleKey|captionKey): "([^"]+)"/g),
    ...propertySource.matchAll(/(?:locationKey|storyKey|guestsKey|accommodationKey|titleKey|captionKey): "([^"]+)"/g),
    ...availabilitySource.matchAll(/\bt\("([^"]+)"/g),
  ].map((match) => match[1]);
  for (const key of [...htmlKeys, ...appKeys]) assert.ok(keys.has(key), `Missing translation key: ${key}`);
  assert.match(html, /data-language-option="es" aria-pressed="true"/);
  assert.match(html, /data-language-option="pt" aria-pressed="false"/);
  assert.match(html, /data-language-option="en" aria-pressed="false"/);
  assert.match(html, /data-theme-option="light"[^>]+aria-pressed="false"/);
  assert.match(html, /data-theme-option="dark"[^>]+aria-pressed="true"/);
});

test("applies the saved Linktree theme before styles load", () => {
  const bootstrap = html.indexOf('localStorage.getItem("cs-linktree-theme-v1")');
  const firstStylesheet = html.indexOf('<link rel="stylesheet"');
  const preferencesScript = html.indexOf('<script src="preferences.js?v=gallery-photo-counter-20260721b" defer>');
  const appScript = html.indexOf('<script src="app.js?v=gallery-photo-counter-20260721b" defer>');
  assert.ok(bootstrap > 0 && bootstrap < firstStylesheet);
  assert.ok(preferencesScript > firstStylesheet && preferencesScript < appScript);
  assert.match(html, /data-theme="dark"/);
  assert.match(html, /getItem\("cs-linktree-theme-v1"\) === "light" \? "light" : "dark"/);
  assert.match(html, /catch \{\s*document\.documentElement\.dataset\.theme = "dark";/);
});

test("keeps the Linktree compatible with direct file opening", () => {
  assert.doesNotMatch(`${preferencesSource}\n${propertySource}\n${availabilitySource}\n${appSource}`, /\bimport\s*\(/);
  assert.doesNotMatch(html, /<script[^>]+type="module"/);
  assert.match(availabilitySource, /fetch\(endpoint, \{ signal: controller\.signal, cache: "no-store"/);
  for (const resource of ["preferences.js", "property-data.js", "availability.js", "app.js", "glass.js", "styles.css", "glass.css"]) {
    assert.ok(fs.existsSync(new URL(`../${resource}`, import.meta.url)), `Missing local resource: ${resource}`);
  }
});

test("defines dark, reduced-motion, contrast and forced-color states", () => {
  assert.match(styles, /html\[data-theme="dark"\]/);
  assert.match(glass, /html\[data-theme="dark"\]/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
  assert.match(glass, /prefers-reduced-transparency: reduce/);
  assert.match(glass, /prefers-contrast: more/);
  assert.match(glass, /forced-colors: active/);
});

test("keeps core light and dark text combinations above WCAG AA", () => {
  const luminance = (hex) => {
    const channels = hex.match(/[a-f\d]{2}/gi).map((value) => Number.parseInt(value, 16) / 255)
      .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const contrast = (foreground, background) => {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  };
  for (const [foreground, background] of [
    ["153b33", "f5f7f2"],
    ["46665e", "f5f7f2"],
    ["f5f7f2", "0b211c"],
    ["b8c9c3", "0b211c"],
    ["f5f7f2", "245044"],
  ]) assert.ok(contrast(foreground, background) >= 4.5, `${foreground} on ${background} is below AA`);
});
