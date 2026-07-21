"use strict";

(() => {
  if (window.__cordalTrackingInitialized) return;
  window.__cordalTrackingInitialized = true;

  const DEFAULT_CAMPAIGN = "cordal_sur_winter_2026";
  const STORAGE_KEY = "cordal_attribution_v1";
  const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const SAFE_VALUE = /^[a-zA-Z0-9._-]{1,64}$/;

  const sanitize = (value) => {
    const normalized = String(value || "").trim();
    return SAFE_VALUE.test(normalized) ? normalized : "";
  };

  function readStoredAttribution() {
    try {
      const value = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "{}");
      return Object.fromEntries(UTM_KEYS.map((key) => [key, sanitize(value[key])]).filter(([, item]) => item));
    } catch {
      return {};
    }
  }

  function getAttribution() {
    const current = new URLSearchParams(window.location.search);
    const stored = readStoredAttribution();
    const attribution = Object.fromEntries(UTM_KEYS.map((key) => [key, sanitize(current.get(key)) || stored[key] || ""]));
    attribution.utm_source ||= "direct";
    attribution.utm_medium ||= "none";
    attribution.utm_campaign ||= DEFAULT_CAMPAIGN;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    } catch {
      /* La atribución sigue funcionando durante esta vista. */
    }
    return attribution;
  }

  const attribution = getAttribution();
  const canonical = document.querySelector('link[rel="canonical"]')?.href || window.location.href.split(/[?#]/)[0];
  const sharedUrl = new URL(canonical);
  sharedUrl.searchParams.set("utm_source", "share");
  sharedUrl.searchParams.set("utm_medium", "referral");
  sharedUrl.searchParams.set("utm_campaign", attribution.utm_campaign);
  sharedUrl.searchParams.set("utm_content", "share_button");
  window.CORDAL_SHARE_URL = sharedUrl.href;

  function attributionCode(content = "landing") {
    const source = attribution.utm_source.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12) || "DIRECT";
    const placement = String(content).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12) || "LANDING";
    return "CS-" + source + "-" + placement;
  }

  function decorateLink(anchor, destination) {
    const url = new URL(anchor.href);
    if (destination === "whatsapp") {
      const baseText = (url.searchParams.get("text") || "Hola Cordal Sur, quiero consultar disponibilidad.")
        .replace(/\s*C[oó]digo:\s*CS-[A-Z0-9-]+\./i, "");
      url.searchParams.set("text", baseText + " Código: " + attributionCode(attribution.utm_content) + ".");
    } else {
      url.searchParams.set("utm_source", "cordal_sur_landing");
      url.searchParams.set("utm_medium", "referral");
      url.searchParams.set("utm_campaign", DEFAULT_CAMPAIGN);
      url.searchParams.set("utm_content", destination + "_card");
      url.searchParams.delete("utm_term");
    }
    anchor.href = url.href;
  }

  function classify(interactive) {
    if (interactive?.id === "share") return "share";
    if (!(interactive instanceof HTMLAnchorElement)) return "";
    const url = new URL(interactive.href);
    if (interactive.id === "whatsapp-link" || url.hostname === "wa.me") return "whatsapp";
    if (url.hostname.endsWith("airbnb.cl")) return "airbnb";
    if (url.hostname.endsWith("booking.com")) return "booking";
    return "";
  }

  function emit(eventName, destination, content = "") {
    const payload = {
      event: eventName,
      channel: destination,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      utm_content: content || attribution.utm_content || destination + "_card"
    };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    window.dispatchEvent(new CustomEvent("cordal:conversion", { detail: payload }));
  }

  function initialize() {
    const whatsapp = document.querySelector("#whatsapp-link");
    if (whatsapp instanceof HTMLAnchorElement) decorateLink(whatsapp, "whatsapp");
    document.querySelectorAll('a[href*="airbnb.cl"]').forEach((anchor) => decorateLink(anchor, "airbnb"));
    document.querySelectorAll('a[href*="booking.com"]').forEach((anchor) => decorateLink(anchor, "booking"));

    document.addEventListener("click", (event) => {
      const interactive = event.target instanceof Element ? event.target.closest("a, button") : null;
      const destination = classify(interactive);
      if (!destination) return;
      if (destination === "share") return;
      emit("click_" + destination, destination);
    }, { capture: true });
  }

  const trackShare = (method) => emit("share", "share", "share_" + sanitize(method));
  window.CordalTracking = Object.freeze({ attributionCode, classify, trackShare });
  document.addEventListener("DOMContentLoaded", initialize, { once: true });
})();
