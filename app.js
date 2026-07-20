"use strict";

const PREFERENCES = window.CS_LINKTREE_PREFERENCES;
if (!PREFERENCES) throw new Error("Cordal Sur preferences failed to initialize.");
const t = (key, values) => values ? PREFERENCES.format(key, values) : PREFERENCES.t(key);
const WHATSAPP_PHONE = "56990137732";

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

const PHOTO_GROUPS = Object.freeze([
  Object.freeze({ id: "sala", titleKey: "gallery.sala", captionKey: "gallery.sala.caption", slug: "01-sala", count: 2 }),
  Object.freeze({ id: "cocina", titleKey: "gallery.cocina", captionKey: "gallery.cocina.caption", slug: "02-cocina-completa", count: 4 }),
  Object.freeze({ id: "comedor", titleKey: "gallery.comedor", captionKey: "gallery.comedor.caption", slug: "03-comedor", count: 2 }),
  Object.freeze({ id: "habitacion1", titleKey: "gallery.habitacion1", captionKey: "gallery.habitacion1.caption", slug: "04-habitacion-1", count: 7 }),
  Object.freeze({ id: "habitacion2", titleKey: "gallery.habitacion2", captionKey: "gallery.habitacion2.caption", slug: "05-habitacion-2", count: 15 }),
  Object.freeze({ id: "habitacion3", titleKey: "gallery.habitacion3", captionKey: "gallery.habitacion3.caption", slug: "06-habitacion-3", count: 5 }),
  Object.freeze({ id: "bano1", titleKey: "gallery.bano1", captionKey: "gallery.bano1.caption", slug: "07-bano-completo-1", count: 2 }),
  Object.freeze({ id: "bano2", titleKey: "gallery.bano2", captionKey: "gallery.bano2.caption", slug: "08-bano-completo-2", count: 2 }),
  Object.freeze({ id: "balcon", titleKey: "gallery.balcon", captionKey: "gallery.balcon.caption", slug: "09-balcon", count: 1 }),
  Object.freeze({ id: "exterior", titleKey: "gallery.exterior", captionKey: "gallery.exterior.caption", slug: "10-exterior", count: 6 }),
  Object.freeze({ id: "entrada", titleKey: "gallery.entrada", captionKey: "gallery.entrada.caption", slug: "11-entrada-guardabotas", count: 1 })
]);

const GALLERY_PHOTOS = Object.freeze(PHOTO_GROUPS.flatMap((group) =>
  Array.from({ length: group.count }, (_, index) => Object.freeze({
    categoryKey: group.titleKey,
    captionKey: group.captionKey ?? `photo.${group.id}.${index}`,
    groupId: group.id,
    src: `assets/photos/${group.slug}-${String(group.files?.[index] ?? index + 1).padStart(2, "0")}.webp`
  }))
));

const HERO_SEQUENCE = Object.freeze([
  ["01-sala-01", "gallery.sala"],
  ["02-cocina-completa-01", "gallery.cocina"],
  ["03-comedor-01", "gallery.comedor"],
  ["04-habitacion-1-01", "gallery.habitacion1"],
  ["05-habitacion-2-01", "gallery.habitacion2"],
  ["06-habitacion-3-01", "gallery.habitacion3"],
  ["07-bano-completo-1-01", "gallery.bano1"],
  ["08-bano-completo-2-01", "gallery.bano2"],
  ["09-balcon-01", "gallery.balcon"],
  ["10-exterior-01", "gallery.exterior"],
  ["11-entrada-guardabotas-01", "gallery.entrada"]
]);

const HERO_PHOTOS = Object.freeze(HERO_SEQUENCE.map(([basename, captionKey]) => {
  const photo = GALLERY_PHOTOS.find(({ src }) => src.endsWith(`/${basename}.webp`));
  return Object.freeze({ ...photo, captionKey });
}));

Object.assign(window, { LINKS, BRAND_ASSETS, HERO_PHOTOS, GALLERY_PHOTOS });

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

function initializeCarousel() {
  const layerA = document.querySelector("#hero-layer-a");
  const layerB = document.querySelector("#hero-layer-b");
  const caption = document.querySelector("#hero-caption");
  const counter = document.querySelector("#hero-counter");
  const previous = document.querySelector("#carousel-prev");
  const toggle = document.querySelector("#carousel-toggle");
  const next = document.querySelector("#carousel-next");
  if (!layerA || !layerB || !caption || !counter) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const failed = new Set();
  let currentIndex = 0;
  let activeLayer = layerA;
  let standbyLayer = layerB;
  let autoplayTimer = 0;
  let preloadTimer = 0;
  let transitioning = false;
  let manuallyPaused = false;

  const wrap = (index) => (index + HERO_PHOTOS.length) % HERO_PHOTOS.length;
  const isPaused = () => manuallyPaused || reduceMotion.matches || document.hidden;
  const findAvailable = (start, direction) => {
    for (let offset = 0; offset < HERO_PHOTOS.length; offset += 1) {
      const index = wrap(start + offset * direction);
      if (!failed.has(HERO_PHOTOS[index].src)) return index;
    }
    return currentIndex;
  };
  const assignPhoto = (layer, photo) => {
    layer.alt = photoAlt(photo);
    if (layer.dataset.photo !== photo.src) {
      layer.dataset.photo = photo.src;
      layer.src = photo.src;
    }
  };
  const ensurePhoto = async (layer, photo) => {
    assignPhoto(layer, photo);
    if (!layer.complete) {
      await new Promise((resolve) => {
        layer.addEventListener("load", resolve, { once: true });
        layer.addEventListener("error", resolve, { once: true });
      });
    }
    if (layer.naturalWidth > 0) return true;
    failed.add(photo.src);
    return false;
  };
  const updateMeta = () => {
    const photo = HERO_PHOTOS[currentIndex];
    caption.textContent = t(photo.captionKey);
    counter.textContent = `${currentIndex + 1}/${HERO_PHOTOS.length}`;
  };
  const updateToggle = () => {
    if (!toggle) return;
    toggle.disabled = reduceMotion.matches;
    if (reduceMotion.matches) {
      toggle.setAttribute("aria-pressed", "true");
      toggle.setAttribute("aria-label", t("carousel.reduced"));
      const mark = toggle.querySelector(".pause-mark");
      if (mark) mark.textContent = "Ⅱ";
      return;
    }
    const paused = manuallyPaused || reduceMotion.matches;
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.setAttribute("aria-label", t(paused ? "carousel.resume" : "carousel.pause"));
    const mark = toggle.querySelector(".pause-mark");
    if (mark) mark.textContent = paused ? "▶" : "Ⅱ";
  };
  const clearAutoplay = () => window.clearTimeout(autoplayTimer);
  const preloadNext = () => {
    const index = findAvailable(currentIndex + 1, 1);
    if (index !== currentIndex) assignPhoto(standbyLayer, HERO_PHOTOS[index]);
  };
  const scheduleAutoplay = () => {
    clearAutoplay();
    if (!isPaused() && !transitioning) {
      autoplayTimer = window.setTimeout(() => navigate(1), 6000);
    }
  };
  const showIndex = async (requestedIndex, direction) => {
    if (transitioning) return;
    clearAutoplay();
    window.clearTimeout(preloadTimer);
    let targetIndex = findAvailable(requestedIndex, direction);
    if (targetIndex === currentIndex) {
      scheduleAutoplay();
      return;
    }
    transitioning = true;
    let loaded = false;
    for (let attempts = 0; attempts < HERO_PHOTOS.length; attempts += 1) {
      loaded = await ensurePhoto(standbyLayer, HERO_PHOTOS[targetIndex]);
      if (loaded) break;
      targetIndex = findAvailable(targetIndex + direction, direction);
    }
    if (!loaded) {
      transitioning = false;
      scheduleAutoplay();
      return;
    }
    standbyLayer.classList.add("is-active");
    activeLayer.classList.remove("is-active");
    currentIndex = targetIndex;
    updateMeta();
    [activeLayer, standbyLayer] = [standbyLayer, activeLayer];
    preloadTimer = window.setTimeout(() => {
      transitioning = false;
      preloadNext();
      scheduleAutoplay();
    }, 650);
  };
  function navigate(direction) {
    return showIndex(currentIndex + direction, direction);
  }

  previous?.addEventListener("click", () => navigate(-1));
  next?.addEventListener("click", () => navigate(1));
  toggle?.addEventListener("click", () => {
    if (reduceMotion.matches) return;
    manuallyPaused = !manuallyPaused;
    updateToggle();
    scheduleAutoplay();
  });
  document.addEventListener("visibilitychange", () => document.hidden ? clearAutoplay() : scheduleAutoplay());
  reduceMotion.addEventListener("change", () => {
    updateToggle();
    scheduleAutoplay();
  });
  PREFERENCES.subscribe(({ changed }) => {
    if (changed !== "language") return;
    assignPhoto(activeLayer, HERO_PHOTOS[currentIndex]);
    const standbyPhoto = HERO_PHOTOS.find(({ src }) => src === standbyLayer.dataset.photo);
    if (standbyPhoto) assignPhoto(standbyLayer, standbyPhoto);
    updateMeta();
    updateToggle();
  });

  const swipeSurface = layerA.closest(".hero-media") || layerA.parentElement;
  let swipeStart = null;
  swipeSurface?.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button, a")) return;
    swipeSurface.setPointerCapture?.(event.pointerId);
    swipeStart = { x: event.clientX, y: event.clientY };
  });
  swipeSurface?.addEventListener("pointerup", (event) => {
    if (!swipeStart) return;
    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(deltaX) >= 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) navigate(deltaX < 0 ? 1 : -1);
  });
  swipeSurface?.addEventListener("pointercancel", () => { swipeStart = null; });
  swipeSurface?.addEventListener("dragstart", (event) => event.preventDefault());

  (async () => {
    while (!(await ensurePhoto(activeLayer, HERO_PHOTOS[currentIndex]))) {
      const nextIndex = findAvailable(currentIndex + 1, 1);
      if (nextIndex === currentIndex) return;
      currentIndex = nextIndex;
    }
    activeLayer.classList.add("is-active");
    updateMeta();
    updateToggle();
    preloadNext();
    scheduleAutoplay();
  })();
}

function initializeGallery() {
  const dialog = document.querySelector("#gallery-dialog");
  const openButton = document.querySelector("#open-gallery");
  const closeButton = document.querySelector("#gallery-close");
  const grid = document.querySelector("#gallery-grid");
  const viewer = document.querySelector("#photo-viewer"), viewerImage = document.querySelector("#photo-viewer-image"), viewerCaption = document.querySelector("#photo-viewer-caption");
  const viewerClose = document.querySelector("#photo-viewer-close"), viewerPrevious = document.querySelector("#photo-viewer-prev"), viewerNext = document.querySelector("#photo-viewer-next");
  if (!dialog || !openButton || !closeButton || !grid || !viewer || !viewerImage || !viewerCaption || !viewerClose || !viewerPrevious || !viewerNext) return;
  let populated = false;
  let returnFocus = openButton;
  let viewerIndex = 0;
  let viewerReturn = null;

  const showViewerPhoto = (index) => {
    viewerIndex = (index + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length;
    const photo = GALLERY_PHOTOS[viewerIndex];
    viewerImage.src = photo.src;
    viewerImage.alt = photoAlt(photo);
    viewerCaption.textContent = `${t(photo.categoryKey)} · ${t(photo.captionKey)} · ${viewerIndex + 1}/${GALLERY_PHOTOS.length}`;
  };
  const closeViewer = () => viewer.open ? viewer.close() : viewer.removeAttribute("open");
  const openViewer = (index, trigger) => {
    viewerReturn = trigger;
    showViewerPhoto(index);
    if (typeof viewer.showModal === "function") viewer.showModal();
    else viewer.setAttribute("open", "");
    viewerClose.focus();
  };

  const populate = () => {
    if (populated) return;
    const fragment = document.createDocumentFragment();
    PHOTO_GROUPS.forEach((group) => {
      const section = document.createElement("section");
      section.className = "gallery-group";
      section.setAttribute("aria-labelledby", `gallery-group-${group.id}`);
      const title = document.createElement("h3");
      title.className = "gallery-group-title";
      title.id = `gallery-group-${group.id}`;
      title.dataset.galleryGroupId = group.id;
      title.textContent = `${t(group.titleKey)} · ${group.count}`;
      const photos = document.createElement("div");
      photos.className = "gallery-group-grid";
      GALLERY_PHOTOS.filter(({ groupId }) => groupId === group.id).forEach((photo) => {
        const figure = document.createElement("figure");
        figure.className = "gallery-item";
        const imageButton = document.createElement("button");
        imageButton.className = "gallery-image-button";
        imageButton.type = "button";
        imageButton.dataset.galleryIndex = String(GALLERY_PHOTOS.indexOf(photo));
        imageButton.setAttribute("aria-label", t("gallery.expand", { description: photoAlt(photo) }));
        const image = document.createElement("img");
        image.src = photo.src;
        image.alt = photoAlt(photo);
        image.loading = "lazy";
        image.decoding = "async";
        image.width = 960;
        image.height = 720;
        image.addEventListener("error", () => figure.classList.add("is-unavailable"), { once: true });
        const figcaption = document.createElement("figcaption");
        figcaption.textContent = t(photo.captionKey);
        imageButton.append(image);
        figure.append(imageButton, figcaption);
        photos.append(figure);
      });
      section.append(title, photos);
      fragment.append(section);
    });
    grid.append(fragment);
    populated = true;
  };
  const translatePopulated = () => {
    if (!populated) return;
    grid.querySelectorAll("[data-gallery-group-id]").forEach((title) => {
      const group = PHOTO_GROUPS.find(({ id }) => id === title.dataset.galleryGroupId);
      if (group) title.textContent = `${t(group.titleKey)} · ${group.count}`;
    });
    grid.querySelectorAll(".gallery-image-button").forEach((button) => {
      const photo = GALLERY_PHOTOS[Number(button.dataset.galleryIndex)];
      if (!photo) return;
      const image = button.querySelector("img");
      const caption = button.closest("figure")?.querySelector("figcaption");
      const alt = photoAlt(photo);
      button.setAttribute("aria-label", t("gallery.expand", { description: alt }));
      if (image) image.alt = alt;
      if (caption) caption.textContent = t(photo.captionKey);
    });
    if (viewer.open) showViewerPhoto(viewerIndex);
  };
  const close = () => dialog.open ? dialog.close() : dialog.removeAttribute("open");

  openButton.addEventListener("click", () => {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : openButton;
    populate();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    closeButton.focus();
  });
  closeButton.addEventListener("click", close);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    close();
  });
  dialog.addEventListener("close", () => returnFocus?.focus());
  grid.addEventListener("click", (event) => {
    const trigger = event.target.closest(".gallery-image-button");
    if (trigger) openViewer(Number(trigger.dataset.galleryIndex), trigger);
  });
  viewerClose.addEventListener("click", closeViewer);
  viewerPrevious.addEventListener("click", () => showViewerPhoto(viewerIndex - 1));
  viewerNext.addEventListener("click", () => showViewerPhoto(viewerIndex + 1));
  viewer.addEventListener("click", (event) => { if (event.target === viewer) closeViewer(); });
  viewer.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); closeViewer(); }
    if (event.key === "ArrowLeft") showViewerPhoto(viewerIndex - 1);
    if (event.key === "ArrowRight") showViewerPhoto(viewerIndex + 1);
  });
  viewer.addEventListener("close", () => viewerReturn?.focus());
  PREFERENCES.subscribe(({ changed }) => { if (changed === "language") translatePopulated(); });
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
initializeCarousel();
initializeGallery();
initializeShare();
