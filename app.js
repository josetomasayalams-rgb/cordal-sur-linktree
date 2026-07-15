"use strict";

const LINKS = Object.freeze([
  Object.freeze({
    id: "whatsapp",
    group: "primary",
    label: "Contactar por WhatsApp",
    url: "https://wa.me/56990137732?text=Hola%20Cordal%20Sur%2C%20quiero%20consultar%20disponibilidad.%20Mis%20fechas%20son%20del%20___%20al%20___%20y%20somos%20___%20hu%C3%A9spedes."
  }),
  Object.freeze({
    id: "airbnb",
    group: "platform",
    label: "Airbnb",
    detail: "Ver alojamiento y reservar",
    icon: "house",
    url: "https://www.airbnb.cl/rooms/1729206776074121490"
  }),
  Object.freeze({
    id: "booking",
    group: "platform",
    label: "Booking.com",
    detail: "Consultar fechas disponibles",
    icon: "calendar",
    url: "https://www.booking.com/hotel/cl/departamento-en-condominio-andes-chillan.html"
  }),
  Object.freeze({
    id: "instagram",
    group: "platform",
    label: "Instagram",
    detail: "Síguenos en @cordal_sur",
    icon: "camera",
    url: "https://www.instagram.com/cordal_sur/"
  }),
  Object.freeze({
    id: "forecast",
    group: "travel",
    label: "Pronóstico de nieve",
    detail: "Snow-Forecast · Nevados de Chillán",
    icon: "snow",
    url: "https://www.snow-forecast.com/resorts/Chillan/6day/mid"
  }),
  Object.freeze({
    id: "mountain",
    group: "travel",
    label: "Reporte oficial de montaña",
    detail: "Información oficial de Nevados",
    icon: "mountain",
    url: "https://www.nevadosdechillan.com/reporte-montana"
  }),
  Object.freeze({
    id: "maps",
    group: "travel",
    label: "Cómo llegar",
    detail: "Condominio Andes Chillán en Maps",
    icon: "pin",
    url: "https://www.google.com/maps/search/?api=1&query=Condominio+Andes+Chill%C3%A1n%2C+Las+Trancas%2C+Chile"
  })
]);

const PHOTO_GROUPS = Object.freeze([
  Object.freeze({ id: "principal", title: "Dormitorio principal", slug: "01-dormitorio-principal", captions: ["Vista general", "Cama principal", "Detalles del dormitorio"] }),
  Object.freeze({ id: "futon", title: "Dormitorio con futón", slug: "02-dormitorio-futon", captions: ["Futón como sofá", "Vista del dormitorio", "Iluminación natural", "Espacio de guardado", "Detalles del ambiente", "Acceso al dormitorio", "Zona de descanso", "Rincón del dormitorio", "Vista general", "Futón preparado como cama"] }),
  Object.freeze({ id: "literas", title: "Dormitorio con literas", slug: "03-dormitorio-literas", captions: ["Vista del dormitorio", "Literas", "Escalera y protecciones", "Iluminación natural", "Espacio para descansar", "Detalles del ambiente", "Vista lateral", "Acceso al dormitorio", "Rincón de las literas", "Vista general"] }),
  Object.freeze({ id: "banos", title: "Baños", slug: "04-banos", captions: ["Baño principal", "Lavamanos y espejo", "Ducha", "Vista general", "Segundo baño"] }),
  Object.freeze({ id: "cocina", title: "Cocina", slug: "05-cocina", captions: ["Cocina equipada", "Cubierta y almacenamiento"] }),
  Object.freeze({ id: "sala", title: "Sala", slug: "06-sala", captions: ["Sala de estar", "Espacio para compartir"] }),
  Object.freeze({ id: "comedor", title: "Comedor", slug: "07-comedor", captions: ["Comedor", "Vista hacia la cocina"] }),
  Object.freeze({ id: "balcon", title: "Balcón", slug: "08-balcon", captions: ["Balcón y vista"] }),
  Object.freeze({ id: "exterior", title: "Exterior", slug: "09-exterior", captions: ["Exterior del condominio"] }),
  Object.freeze({ id: "piscina", title: "Piscina", slug: "10-piscina", captions: ["Piscina del condominio"] }),
  Object.freeze({ id: "entorno", title: "Entorno", slug: "11-entorno", captions: ["Camino nevado", "Atardecer en la cordillera"] })
]);

const GALLERY_PHOTOS = Object.freeze(PHOTO_GROUPS.flatMap((group) =>
  group.captions.map((caption, index) => Object.freeze({
    category: group.title,
    groupId: group.id,
    src: `assets/photos/${group.slug}-${String(index + 1).padStart(2, "0")}.webp`,
    alt: `${group.title} de Cordal Sur: ${caption.toLocaleLowerCase("es-CL")}`,
    caption
  }))
));

const HERO_SEQUENCE = Object.freeze([
  ["01-dormitorio-principal-03", "Dormitorio principal"],
  ["06-sala-01", "Sala de estar"],
  ["07-comedor-01", "Comedor"],
  ["05-cocina-01", "Cocina equipada"],
  ["02-dormitorio-futon-01", "Futón como sofá"],
  ["02-dormitorio-futon-10", "Futón preparado como cama"],
  ["03-dormitorio-literas-10", "Dormitorio con literas"],
  ["04-banos-04", "Baño"],
  ["08-balcon-01", "Balcón"],
  ["09-exterior-01", "Exterior del condominio"],
  ["10-piscina-01", "Piscina"],
  ["11-entorno-01", "Camino nevado"],
  ["11-entorno-02", "Atardecer en la cordillera"]
]);

const HERO_PHOTOS = Object.freeze(HERO_SEQUENCE.map(([basename, caption]) => {
  const photo = GALLERY_PHOTOS.find(({ src }) => src.endsWith(`/${basename}.webp`));
  return Object.freeze({ ...photo, caption });
}));

Object.assign(window, { LINKS, HERO_PHOTOS, GALLERY_PHOTOS });

const ICONS = Object.freeze({
  house: '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M7 23.5 24 9l17 14.5"/><path d="M11 21v19h26V21M20 40V28h8v12"/></svg>',
  calendar: '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><rect x="7" y="10" width="34" height="31" rx="5"/><path d="M15 6v8M33 6v8M7 19h34M16 30l5 5 11-11"/></svg>',
  camera: '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><rect x="7" y="7" width="34" height="34" rx="10"/><circle cx="24" cy="24" r="8"/><circle cx="34.5" cy="13.5" r="1.5" class="icon-fill"/></svg>',
  snow: '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M24 5v38M7.5 14.5l33 19M7.5 33.5l33-19M18 9l6 6 6-6M18 39l6-6 6 6M8 22l8 2-2 8M40 26l-8-2 2-8"/></svg>',
  mountain: '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="m4 39 13-23 6 10 6-17 15 30H4Z"/><path d="m13 23 4 4 4-4M25 19l4 5 4-5"/></svg>',
  pin: '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M38 20c0 11-14 23-14 23S10 31 10 20a14 14 0 1 1 28 0Z"/><circle cx="24" cy="20" r="5"/></svg>'
});

const ALLOWED_HOSTS = new Set([
  "wa.me", "www.airbnb.cl", "www.booking.com", "www.instagram.com",
  "www.snow-forecast.com", "www.nevadosdechillan.com", "www.google.com"
]);

function safeHref(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname) ? url.href : null;
  } catch {
    return null;
  }
}

function renderLinks(container, links, type) {
  if (!container) return;
  const fragment = document.createDocumentFragment();
  links.forEach((link) => {
    const href = safeHref(link.url);
    if (!href) return;
    const anchor = document.createElement("a");
    anchor.className = `${type}-card`;
    anchor.href = href;
    anchor.setAttribute("aria-label", `${link.label}. ${link.detail}`);

    const icon = document.createElement("span");
    icon.className = `${type}-icon`;
    icon.innerHTML = ICONS[link.icon];
    anchor.append(icon);

    if (type === "platform") {
      const label = document.createElement("strong");
      label.className = "platform-label";
      label.textContent = link.label;
      const detail = document.createElement("span");
      detail.className = "platform-detail";
      detail.textContent = link.detail;
      anchor.append(label, detail);
    } else {
      const copy = document.createElement("span");
      copy.className = "travel-copy";
      const label = document.createElement("strong");
      label.textContent = link.label;
      const detail = document.createElement("small");
      detail.textContent = link.detail;
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
  if (whatsappAnchor) {
    whatsappAnchor.href = safeHref(whatsapp.url) || "#";
    whatsappAnchor.setAttribute("aria-label", whatsapp.label);
    whatsappAnchor.removeAttribute("target");
    whatsappAnchor.removeAttribute("rel");
  }
  renderLinks(document.querySelector("#platform-links"), LINKS.filter(({ group }) => group === "platform"), "platform");
  renderLinks(document.querySelector("#travel-links"), LINKS.filter(({ group }) => group === "travel"), "travel");
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
    if (layer.dataset.photo !== photo.src) {
      layer.dataset.photo = photo.src;
      layer.alt = photo.alt;
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
    caption.textContent = photo.caption;
    counter.textContent = `${currentIndex + 1}/${HERO_PHOTOS.length}`;
  };
  const updateToggle = () => {
    if (!toggle) return;
    toggle.disabled = reduceMotion.matches;
    if (reduceMotion.matches) {
      toggle.setAttribute("aria-pressed", "true");
      toggle.setAttribute("aria-label", "Carrusel pausado por preferencia de movimiento reducido");
      const mark = toggle.querySelector(".pause-mark");
      if (mark) mark.textContent = "Ⅱ";
      return;
    }
    const paused = manuallyPaused || reduceMotion.matches;
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.setAttribute("aria-label", paused ? "Reanudar carrusel" : "Pausar carrusel");
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
    viewerImage.alt = photo.alt;
    viewerCaption.textContent = `${photo.category} · ${photo.caption} · ${viewerIndex + 1}/${GALLERY_PHOTOS.length}`;
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
      title.textContent = `${group.title} · ${group.captions.length}`;
      const photos = document.createElement("div");
      photos.className = "gallery-group-grid";
      GALLERY_PHOTOS.filter(({ groupId }) => groupId === group.id).forEach((photo) => {
        const figure = document.createElement("figure");
        figure.className = "gallery-item";
        const imageButton = document.createElement("button");
        imageButton.className = "gallery-image-button";
        imageButton.type = "button";
        imageButton.dataset.galleryIndex = String(GALLERY_PHOTOS.indexOf(photo));
        imageButton.setAttribute("aria-label", `Ampliar ${photo.alt}`);
        const image = document.createElement("img");
        image.src = photo.src;
        image.alt = photo.alt;
        image.loading = "lazy";
        image.decoding = "async";
        image.width = 960;
        image.height = 720;
        image.addEventListener("error", () => figure.classList.add("is-unavailable"), { once: true });
        const figcaption = document.createElement("figcaption");
        figcaption.textContent = photo.caption;
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
}

function initializeShare() {
  const button = document.querySelector("#share");
  if (!button) return;
  const originalMarkup = button.innerHTML;
  const shareUrl = document.querySelector('link[rel="canonical"]')?.href || window.location.href.split(/[?#]/)[0], shareTitle = document.title, shareText = document.querySelector('meta[name="description"]')?.content || "Conoce Cordal Sur.";
  let restoreTimer = 0;
  const showStatus = (message) => {
    window.clearTimeout(restoreTimer);
    button.textContent = message;
    button.setAttribute("aria-live", "polite");
    restoreTimer = window.setTimeout(() => { button.innerHTML = originalMarkup; }, 2200);
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
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        showStatus("¡Gracias por compartir!");
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }
    try {
      showStatus(await copy(shareUrl) ? "Enlace copiado" : "No fue posible copiar el enlace");
    } catch {
      showStatus("No fue posible copiar el enlace");
    }
  });
}

initializeLinks();
initializeCarousel();
initializeGallery();
initializeShare();
