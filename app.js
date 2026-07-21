"use strict";

const PREFERENCES = window.CS_LINKTREE_PREFERENCES;
if (!PREFERENCES) throw new Error("Cordal Sur preferences failed to initialize.");
const t = (key, values) => values ? PREFERENCES.format(key, values) : PREFERENCES.t(key);
const WHATSAPP_PHONE = "56990137732";
const PROPERTIES = window.CS_LINKTREE_PROPERTIES;
if (!Array.isArray(PROPERTIES) || !PROPERTIES.length) throw new Error("Cordal Sur property data failed to initialize.");

const requestedPropertyId = (() => {
  try { return new URL(window.location.href).searchParams.get("property"); } catch { return null; }
})();
const ACTIVE_PROPERTY = PROPERTIES.find(({ id }) => id === requestedPropertyId) || PROPERTIES[0];
const PHOTO_GROUPS = ACTIVE_PROPERTY.groups;
const GALLERY_PHOTOS = ACTIVE_PROPERTY.photos;
const FEATURED_PHOTOS = Object.freeze(ACTIVE_PROPERTY.featured.map((featured) => Object.freeze({
  ...GALLERY_PHOTOS.find(({ id }) => id === featured.id),
  position: featured.position
})));

const BRAND_ASSETS = Object.freeze({
  whatsapp: Object.freeze({
    src: "assets/brands/whatsapp-glyph.svg",
    type: "glyph",
    treatment: "mask"
  }),
  mercadopago: Object.freeze({
    src: "assets/brands/mercado-pago-handshake.svg",
    lightSrc: "assets/brands/mercado-pago-handshake-light.svg",
    darkSrc: "assets/brands/mercado-pago-handshake.svg",
    type: "glyph",
    treatment: "adapted"
  }),
  airbnb: Object.freeze({
    src: "assets/brands/airbnb-belo.svg",
    type: "glyph",
    treatment: "mask"
  }),
  booking: Object.freeze({
    src: "assets/brands/booking-wordmark.svg",
    type: "wordmark",
    treatment: "mask"
  }),
  instagram: Object.freeze({
    src: "assets/brands/instagram-glyph.png",
    type: "glyph",
    treatment: "mask"
  }),
  snowForecast: Object.freeze({
    src: "assets/brands/snow-forecast-wordmark.png",
    type: "wordmark",
    treatment: "mask"
  }),
  nevados: Object.freeze({
    src: "assets/brands/nevados-de-chillan-wordmark.svg",
    type: "wordmark",
    treatment: "mask"
  }),
  googleMaps: Object.freeze({
    src: "assets/brands/google-maps-icon.png",
    type: "glyph",
    treatment: "native"
  })
});

const LINKS = Object.freeze([
  Object.freeze({
    id: "whatsapp",
    group: "primary",
    labelKey: "contact.aria",
    messageKey: "contact.message",
    brandKey: "whatsapp"
  }),
  Object.freeze({
    id: "mercadopago",
    group: "payment",
    labelKey: "payment.title",
    detailKey: "payment.detail",
    brandKey: "mercadopago",
    url: "https://link.mercadopago.cl/carhartt"
  }),
  Object.freeze({
    id: "payment-receipt",
    group: "payment-receipt",
    labelKey: "payment.receipt",
    messageKey: "payment.receipt.message"
  }),
  Object.freeze({
    id: "airbnb",
    group: "platform",
    labelKey: "link.airbnb.label",
    detailKey: "link.airbnb.detail",
    brandKey: "airbnb",
    url: "https://www.airbnb.cl/rooms/1729206776074121490"
  }),
  Object.freeze({
    id: "booking",
    group: "platform",
    labelKey: "link.booking.label",
    detailKey: "link.booking.detail",
    brandKey: "booking",
    url: "https://www.booking.com/hotel/cl/departamento-en-condominio-andes-chillan.html"
  }),
  Object.freeze({
    id: "instagram",
    group: "platform",
    labelKey: "link.instagram.label",
    detailKey: "link.instagram.detail",
    brandKey: "instagram",
    url: "https://www.instagram.com/cordal_sur/"
  }),
  Object.freeze({
    id: "forecast",
    group: "travel",
    labelKey: "link.forecast.label",
    detailKey: "link.forecast.detail",
    brandKey: "snowForecast",
    url: "https://www.snow-forecast.com/resorts/Chillan/6day/mid"
  }),
  Object.freeze({
    id: "mountain",
    group: "travel",
    labelKey: "link.mountain.label",
    detailKey: "link.mountain.detail",
    brandKey: "nevados",
    url: "https://www.nevadosdechillan.com/reporte-montana"
  }),
  Object.freeze({
    id: "maps",
    group: "travel",
    labelKey: "link.maps.label",
    detailKey: "link.maps.detail",
    brandKey: "googleMaps",
    url: "https://www.google.com/maps/search/?api=1&query=Condominio+Andes+Chill%C3%A1n%2C+Las+Trancas%2C+Chile"
  })
]);

Object.assign(window, { LINKS, BRAND_ASSETS, PROPERTIES, ACTIVE_PROPERTY, FEATURED_PHOTOS, GALLERY_PHOTOS });

const ALLOWED_HOSTS = new Set([
  "wa.me", "www.airbnb.cl", "www.booking.com", "www.instagram.com",
  "www.snow-forecast.com", "www.nevadosdechillan.com", "www.google.com",
  "link.mercadopago.cl"
]);

function safeHref(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname) ? url.href : null;
  } catch {
    return null;
  }
}

function whatsappHref(messageKey) {
  const url = new URL(`https://wa.me/${WHATSAPP_PHONE}`);
  url.searchParams.set("text", t(messageKey));
  return safeHref(url.href);
}

function linkHref(link) {
  return link.messageKey ? whatsappHref(link.messageKey) : safeHref(link.url);
}

function photoAlt(photo) {
  return t("gallery.photo.alt", { category: t(photo.categoryKey), caption: t(photo.captionKey) });
}

function populateBrandStage(stage, brandKey) {
  const asset = BRAND_ASSETS[brandKey];
  if (!stage || !asset) return false;

  stage.classList.add(
    "brand-stage",
    `brand-stage--${asset.type}`,
    `brand-stage--${asset.treatment}`,
    `brand-stage--${brandKey}`
  );
  stage.dataset.brand = brandKey;
  stage.setAttribute("aria-hidden", "true");

  if (asset.lightSrc && asset.darkSrc) {
    stage.classList.add("brand-stage--themed");
    const lightImage = document.createElement("img");
    lightImage.className = "brand-mark brand-mark--light";
    lightImage.src = asset.lightSrc;
    lightImage.alt = "";
    lightImage.decoding = "async";
    const darkImage = document.createElement("img");
    darkImage.className = "brand-mark brand-mark--dark";
    darkImage.src = asset.darkSrc;
    darkImage.alt = "";
    darkImage.decoding = "async";
    stage.replaceChildren(lightImage, darkImage);
    return true;
  }

  if (asset.treatment !== "mask") {
    const image = document.createElement("img");
    image.className = "brand-mark";
    image.src = asset.src;
    image.alt = "";
    image.decoding = "async";
    stage.replaceChildren(image);
    return true;
  }

  const mark = document.createElement("span");
  mark.className = "brand-mark";
  mark.style.setProperty("--brand-mask-image", `url("${asset.src}")`);
  stage.replaceChildren(mark);
  return true;
}

function createBrandStage(brandKey, type) {
  const stage = document.createElement("span");
  stage.className = `${type}-icon`;
  return populateBrandStage(stage, brandKey) ? stage : null;
}

function renderLinks(container, links, type) {
  if (!container) return;
  const fragment = document.createDocumentFragment();
  links.forEach((link) => {
    const href = linkHref(link);
    if (!href) return;
    const labelText = t(link.labelKey);
    const detailText = t(link.detailKey);
    const anchor = document.createElement("a");
    anchor.className = `${type}-card`;
    anchor.href = href;
    anchor.setAttribute("aria-label", `${labelText}. ${detailText}`);

    const brandStage = createBrandStage(link.brandKey, type);
    if (brandStage) anchor.append(brandStage);

    if (type !== "platform") {
      const copy = document.createElement("span");
      copy.className = "travel-copy";
      const label = document.createElement("strong");
      label.textContent = labelText;
      const detail = document.createElement("small");
      detail.textContent = detailText;
      copy.append(label, detail);
      const arrow = document.createElement("span");
      arrow.className = "travel-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "↗";
      anchor.append(copy, arrow);
    }
    fragment.append(anchor);
  });
  container.replaceChildren(fragment);
}

function initializeLinks() {
  const whatsapp = LINKS.find(({ id }) => id === "whatsapp");
  const whatsappAnchor = document.querySelector("#whatsapp-link");
  const whatsappBrand = document.querySelector("#whatsapp-brand");
  if (whatsappBrand) populateBrandStage(whatsappBrand, whatsapp.brandKey);
  const render = () => {
    if (whatsappAnchor) {
      whatsappAnchor.href = linkHref(whatsapp) || "#";
      whatsappAnchor.setAttribute("aria-label", t(whatsapp.labelKey));
      whatsappAnchor.removeAttribute("target");
      whatsappAnchor.removeAttribute("rel");
    }
    renderLinks(document.querySelector("#platform-links"), LINKS.filter(({ group }) => group === "platform"), "platform");
    renderLinks(document.querySelector("#travel-links"), LINKS.filter(({ group }) => group === "travel"), "travel");
  };
  render();
  PREFERENCES.subscribe(({ changed }) => { if (changed === "language") render(); });
}

function initializePayment() {
  const payment = LINKS.find(({ id }) => id === "mercadopago");
  const receipt = LINKS.find(({ id }) => id === "payment-receipt");
  const dialog = document.querySelector("#payment-dialog");
  const openButton = document.querySelector("#open-payment");
  const closeButton = document.querySelector("#payment-close");
  const cancelButton = document.querySelector("#payment-cancel");
  const continueLink = document.querySelector("#payment-continue");
  const receiptLink = document.querySelector("#payment-receipt");
  const icon = document.querySelector("#payment-icon");
  if (!payment || !receipt || !dialog || !openButton || !closeButton || !cancelButton || !continueLink || !receiptLink || !icon) return;

  const paymentHref = linkHref(payment);
  if (!paymentHref || !linkHref(receipt)) {
    openButton.disabled = true;
    openButton.setAttribute("aria-disabled", "true");
    return;
  }

  populateBrandStage(icon, payment.brandKey);
  continueLink.href = paymentHref;
  const syncLanguage = () => {
    receiptLink.href = linkHref(receipt) || "#";
    continueLink.setAttribute("aria-label", t("payment.continue.aria"));
    receiptLink.setAttribute("aria-label", t("payment.receipt.aria"));
  };
  syncLanguage();
  PREFERENCES.subscribe(({ changed }) => { if (changed === "language") syncLanguage(); });

  let returnFocus = openButton;
  const close = () => {
    if (dialog.open && typeof dialog.close === "function") {
      dialog.close();
      return;
    }
    dialog.removeAttribute("open");
    returnFocus?.focus();
  };

  openButton.addEventListener("click", () => {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : openButton;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    continueLink.focus();
  });
  closeButton.addEventListener("click", close);
  cancelButton.addEventListener("click", close);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    close();
  });
  dialog.addEventListener("close", () => returnFocus?.focus());
}

function initializePropertySelector() {
  const selector = document.querySelector("#property-selector");
  if (!selector || PROPERTIES.length < 2) return;
  selector.hidden = false;
  const render = () => {
    selector.setAttribute("aria-label", t("property.selector.aria"));
    const fragment = document.createDocumentFragment();
    PROPERTIES.forEach((property) => {
      const anchor = document.createElement("a");
      const url = new URL(window.location.href);
      url.searchParams.set("property", property.id);
      anchor.href = url.href;
      anchor.textContent = property.name;
      if (property.id === ACTIVE_PROPERTY.id) anchor.setAttribute("aria-current", "page");
      fragment.append(anchor);
    });
    selector.replaceChildren(fragment);
  };
  render();
  PREFERENCES.subscribe(({ changed }) => { if (changed === "language") render(); });
}

function initializePreview() {
  const preview = document.querySelector("#property-preview");
  const openButton = document.querySelector("#open-gallery");
  const label = document.querySelector("#gallery-trigger-label");
  if (!preview || !openButton || !label) return;

  const updateButton = () => {
    const text = t("gallery.open", { count: GALLERY_PHOTOS.length });
    label.textContent = text;
    openButton.setAttribute("aria-label", text);
  };
  const render = () => {
    const featuredStage = document.createElement("div");
    featuredStage.className = "preview-featured";
    const filmstrip = document.createElement("div");
    filmstrip.className = "preview-filmstrip";
    FEATURED_PHOTOS.forEach((photo, index) => {
      const button = document.createElement("button");
      button.className = `preview-item preview-item-${index + 1}`;
      button.type = "button";
      button.dataset.galleryIndex = String(GALLERY_PHOTOS.findIndex(({ id }) => id === photo.id));
      button.setAttribute("aria-label", t("gallery.preview.open", { description: photoAlt(photo) }));

      const image = document.createElement("img");
      image.src = photo.src;
      image.alt = photoAlt(photo);
      image.decoding = "async";
      image.loading = index === 0 ? "eager" : "lazy";
      if (index === 0) image.fetchPriority = "high";
      image.style.objectPosition = photo.position;

      const caption = document.createElement("span");
      caption.textContent = t(photo.categoryKey);
      button.append(image, caption);
      (index === 0 ? featuredStage : filmstrip).append(button);
    });
    preview.replaceChildren(featuredStage, filmstrip);
  };

  preview.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-gallery-index]");
    if (!trigger) return;
    openButton.dataset.startIndex = trigger.dataset.galleryIndex;
    openButton.click();
  });
  render();
  updateButton();
  PREFERENCES.subscribe(({ changed }) => {
    if (changed !== "language") return;
    render();
    updateButton();
  });
}

function initializeGallery() {
  const dialog = document.querySelector("#gallery-dialog");
  const openButton = document.querySelector("#open-gallery");
  const closeButton = document.querySelector("#gallery-close");
  const filters = document.querySelector("#gallery-filters");
  const stage = document.querySelector("#gallery-stage");
  const ambient = document.querySelector("#gallery-ambient");
  const mainImage = document.querySelector("#gallery-main-image");
  const previous = document.querySelector("#gallery-previous");
  const next = document.querySelector("#gallery-next");
  const counter = document.querySelector("#gallery-counter");
  const category = document.querySelector("#gallery-photo-category");
  const caption = document.querySelector("#gallery-photo-caption");
  const thumbnails = document.querySelector("#gallery-thumbnails");
  const live = document.querySelector("#gallery-live");
  if (!dialog || !openButton || !closeButton || !filters || !stage || !ambient || !mainImage || !previous || !next || !counter || !category || !caption || !thumbnails || !live) return;

  let returnFocus = openButton;
  let currentIndex = 0;
  let activeGroup = "all";
  let imageRequest = 0;
  const failed = new Set();

  const availableIndexes = () => GALLERY_PHOTOS
    .map((photo, index) => ({ photo, index }))
    .filter(({ photo }) => (activeGroup === "all" || photo.groupId === activeGroup) && !failed.has(photo.id))
    .map(({ index }) => index);
  const preloadAdjacent = () => {
    if (typeof Image !== "function") return;
    const indexes = availableIndexes();
    const position = indexes.indexOf(currentIndex);
    if (position < 0) return;
    [-1, 1].forEach((offset) => {
      const image = new Image();
      image.src = GALLERY_PHOTOS[indexes[(position + offset + indexes.length) % indexes.length]].src;
    });
  };
  const syncActiveThumbnail = () => {
    thumbnails.querySelectorAll("button").forEach((button) => {
      const active = Number(button.dataset.galleryIndex) === currentIndex;
      button.toggleAttribute("aria-current", active);
      if (active) {
        thumbnails.scrollLeft = Math.max(0, button.offsetLeft - (thumbnails.clientWidth - button.clientWidth) / 2);
      }
    });
  };
  const showPhoto = (requestedIndex, announce = false) => {
    const indexes = availableIndexes();
    if (!indexes.length) return;
    currentIndex = indexes.includes(requestedIndex) ? requestedIndex : indexes[0];
    const photo = GALLERY_PHOTOS[currentIndex];
    const request = ++imageRequest;
    const applyImage = () => {
      if (request !== imageRequest) return;
      mainImage.dataset.photoId = photo.id;
      mainImage.src = photo.src;
      mainImage.alt = photoAlt(photo);
      mainImage.classList.remove("is-loading");
    };
    const handleImageError = () => {
      if (request !== imageRequest) return;
      failed.add(photo.id);
      live.textContent = t("gallery.photo.unavailable");
      renderThumbnails();
      navigate(1);
    };
    mainImage.classList.add("is-loading");
    if (typeof Image === "function") {
      const loader = new Image();
      loader.addEventListener("load", applyImage, { once: true });
      loader.addEventListener("error", handleImageError, { once: true });
      loader.src = photo.src;
    } else {
      applyImage();
    }
    ambient.style.backgroundImage = `url("${photo.src}")`;
    category.textContent = t(photo.categoryKey);
    caption.textContent = t(photo.captionKey);
    counter.textContent = t("gallery.counter", { current: currentIndex + 1, total: GALLERY_PHOTOS.length });
    syncActiveThumbnail();
    preloadAdjacent();
    if (announce) live.textContent = `${category.textContent}. ${caption.textContent}. ${counter.textContent}`;
  };
  const navigate = (direction) => {
    const indexes = availableIndexes();
    if (!indexes.length) return;
    const position = Math.max(0, indexes.indexOf(currentIndex));
    showPhoto(indexes[(position + direction + indexes.length) % indexes.length], true);
  };
  const renderFilters = () => {
    const fragment = document.createDocumentFragment();
    [{ id: "all", titleKey: "gallery.all", count: GALLERY_PHOTOS.length }, ...PHOTO_GROUPS].forEach((group) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.galleryGroup = group.id;
      button.setAttribute("aria-pressed", String(group.id === activeGroup));
      button.textContent = `${t(group.titleKey)} · ${group.count}`;
      fragment.append(button);
    });
    filters.replaceChildren(fragment);
  };
  const renderThumbnails = () => {
    const fragment = document.createDocumentFragment();
    availableIndexes().forEach((index) => {
      const photo = GALLERY_PHOTOS[index];
      const item = document.createElement("span");
      item.setAttribute("role", "listitem");
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.galleryIndex = String(index);
      button.setAttribute("aria-label", t("gallery.thumbnail.aria", { current: index + 1, total: GALLERY_PHOTOS.length, description: photoAlt(photo) }));
      if (index === currentIndex) button.setAttribute("aria-current", "true");
      const image = document.createElement("img");
      image.src = photo.thumbnail;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      button.append(image);
      item.append(button);
      fragment.append(item);
    });
    thumbnails.replaceChildren(fragment);
  };
  const close = () => {
    document.body.classList.remove("gallery-open");
    if (dialog.open) dialog.close();
    else dialog.removeAttribute("open");
  };

  openButton.addEventListener("click", () => {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : openButton;
    activeGroup = "all";
    currentIndex = Number(openButton.dataset.startIndex || 0);
    delete openButton.dataset.startIndex;
    renderFilters();
    renderThumbnails();
    showPhoto(currentIndex);
    document.body.classList.add("gallery-open");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    closeButton.focus();
  });
  closeButton.addEventListener("click", close);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  dialog.addEventListener("cancel", (event) => { event.preventDefault(); close(); });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("gallery-open");
    returnFocus?.focus();
  });
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-gallery-group]");
    if (!button) return;
    activeGroup = button.dataset.galleryGroup;
    renderFilters();
    const indexes = availableIndexes();
    if (indexes.length) currentIndex = indexes[0];
    renderThumbnails();
    showPhoto(currentIndex, true);
  });
  thumbnails.addEventListener("click", (event) => {
    const button = event.target.closest("[data-gallery-index]");
    if (button) showPhoto(Number(button.dataset.galleryIndex), true);
  });
  stage.addEventListener("click", (event) => {
    const navigationButton = event.target.closest(".gallery-nav");
    if (!navigationButton) return;
    navigate(navigationButton === next ? 1 : -1);
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); close(); return; }
    if (event.key === "ArrowLeft") { event.preventDefault(); navigate(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); navigate(1); }
    if (event.key === "Home") { event.preventDefault(); showPhoto(availableIndexes()[0], true); }
    if (event.key === "End") { event.preventDefault(); showPhoto(availableIndexes().at(-1), true); }
  });
  let swipeStart = null;
  stage.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    stage.setPointerCapture?.(event.pointerId);
    swipeStart = { x: event.clientX, y: event.clientY };
  });
  stage.addEventListener("pointerup", (event) => {
    if (!swipeStart) return;
    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(deltaX) >= 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) navigate(deltaX < 0 ? 1 : -1);
  });
  stage.addEventListener("pointercancel", () => { swipeStart = null; });
  stage.addEventListener("dragstart", (event) => event.preventDefault());
  PREFERENCES.subscribe(({ changed }) => {
    if (changed !== "language") return;
    renderFilters();
    renderThumbnails();
    showPhoto(currentIndex);
  });
}

function initializeShare() {
  const button = document.querySelector("#share");
  if (!button) return;
  const shareUrl = document.querySelector('link[rel="canonical"]')?.href || window.location.href.split(/[?#]/)[0];
  let restoreTimer = 0;
  const renderDefault = () => {
    const icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "↗";
    const label = document.createElement("span");
    label.dataset.shareLabel = "";
    label.textContent = t("share.default");
    button.replaceChildren(icon, label);
    button.removeAttribute("aria-live");
  };
  const showStatus = (key) => {
    window.clearTimeout(restoreTimer);
    button.textContent = t(key);
    button.setAttribute("aria-live", "polite");
    restoreTimer = window.setTimeout(renderDefault, 2200);
  };
  const copy = async (text) => {
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(text); return true; } catch { /* Use the in-page fallback below. */ }
    }
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.append(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    return copied;
  };
  button.addEventListener("click", async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, text: t("share.text"), url: shareUrl });
        showStatus("share.thanks");
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }
    try {
      showStatus(await copy(shareUrl) ? "share.copied" : "share.error");
    } catch {
      showStatus("share.error");
    }
  });
  PREFERENCES.subscribe(({ changed }) => {
    if (changed !== "language") return;
    window.clearTimeout(restoreTimer);
    renderDefault();
  });
}

initializeLinks();
initializePayment();
initializePropertySelector();
initializePreview();
initializeGallery();
initializeShare();
