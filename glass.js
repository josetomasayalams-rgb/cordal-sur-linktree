"use strict";

(() => {
  const SURFACE_SELECTOR = [
    ".glass-surface",
    ".glass-interactive",
    ".glass-toolbar",
    ".glass-clear",
    ".glass-regular",
    ".glass-tinted",
    ".whatsapp-card",
    ".platform-card",
    ".travel-card",
    ".share-button",
    ".gallery-trigger",
    ".gallery-close",
    ".gallery-nav"
  ].join(",");

  const INTERACTIVE_SELECTOR = [
    ".glass-interactive",
    ".whatsapp-card",
    ".platform-card",
    ".travel-card",
    ".share-button",
    ".gallery-trigger",
    ".gallery-close",
    ".gallery-nav"
  ].join(",");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let activeSurface = null;
  let activeRect = null;
  let pressedSurface = null;
  let pressedPointerId = null;
  let pressedByKeyboard = false;
  let pendingPoint = null;
  let animationFrame = 0;

  const asElement = (target) => target instanceof Element ? target : null;
  const closestSurface = (target) => asElement(target)?.closest(SURFACE_SELECTOR) || null;
  const closestInteractive = (target) => asElement(target)?.closest(INTERACTIVE_SELECTOR) || null;
  const clamp = (value) => Math.min(100, Math.max(0, value));

  function writePoint(surface, clientX, clientY, rect = surface.getBoundingClientRect()) {
    if (!rect.width || !rect.height) return;
    const x = clamp(((clientX - rect.left) / rect.width) * 100);
    const y = clamp(((clientY - rect.top) / rect.height) * 100);
    surface.style.setProperty("--glass-x", `${x.toFixed(1)}%`);
    surface.style.setProperty("--glass-y", `${y.toFixed(1)}%`);
  }

  function cancelFrame() {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    pendingPoint = null;
  }

  function queuePoint(surface, clientX, clientY) {
    pendingPoint = { surface, clientX, clientY };
    if (animationFrame) return;
    animationFrame = window.requestAnimationFrame(() => {
      animationFrame = 0;
      const point = pendingPoint;
      pendingPoint = null;
      if (!point || reducedMotion.matches || point.surface !== activeSurface) return;
      writePoint(point.surface, point.clientX, point.clientY, activeRect || undefined);
    });
  }

  function deactivateSurface(surface = activeSurface) {
    if (!surface) return;
    surface.classList.remove("is-glass-active");
    surface.style.removeProperty("--glass-x");
    surface.style.removeProperty("--glass-y");
    if (surface === activeSurface) {
      activeSurface = null;
      activeRect = null;
      cancelFrame();
    }
  }

  function activateSurface(surface, clientX, clientY, immediate = false) {
    if (!surface || reducedMotion.matches) return;
    if (activeSurface !== surface) {
      deactivateSurface();
      activeSurface = surface;
      activeRect = surface.getBoundingClientRect();
      surface.classList.add("is-glass-active");
    }
    if (Number.isFinite(clientX) && Number.isFinite(clientY)) {
      if (immediate) writePoint(surface, clientX, clientY, activeRect || undefined);
      else queuePoint(surface, clientX, clientY);
    }
  }

  function clearPressed(surface = pressedSurface) {
    surface?.classList.remove("is-pressed");
    if (!surface || surface === pressedSurface) {
      pressedSurface = null;
      pressedPointerId = null;
      pressedByKeyboard = false;
    }
  }

  function pressSurface(surface, source, pointerId = null) {
    if (!surface) return;
    if (pressedSurface !== surface) clearPressed();
    pressedSurface = surface;
    pressedPointerId = pointerId;
    pressedByKeyboard = source === "keyboard";
    surface.classList.add("is-pressed");
  }

  function resetAll() {
    clearPressed();
    deactivateSurface();
    cancelFrame();
  }

  document.addEventListener("pointerover", (event) => {
    if (event.pointerType !== "mouse" || !finePointer.matches || reducedMotion.matches) return;
    const surface = closestSurface(event.target);
    if (surface) activateSurface(surface, event.clientX, event.clientY);
  }, { passive: true });

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || !finePointer.matches || reducedMotion.matches) return;
    const surface = closestSurface(event.target);
    if (!surface) {
      deactivateSurface();
      return;
    }
    activateSurface(surface, event.clientX, event.clientY);
  }, { passive: true });

  document.addEventListener("pointerdown", (event) => {
    const surface = closestInteractive(event.target);
    if (!surface) return;
    pressSurface(surface, "pointer", event.pointerId);
    if (reducedMotion.matches) return;
    if (event.pointerType === "touch" || event.pointerType === "pen") {
      activateSurface(surface, event.clientX, event.clientY, true);
    } else if (event.pointerType === "mouse" && finePointer.matches) {
      activateSurface(surface, event.clientX, event.clientY);
    }
  }, { passive: true });

  document.addEventListener("pointerup", (event) => {
    if (pressedPointerId !== null && event.pointerId !== pressedPointerId) return;
    const wasTouchLike = event.pointerType === "touch" || event.pointerType === "pen";
    clearPressed();
    if (wasTouchLike) deactivateSurface();
  }, { passive: true });

  document.addEventListener("pointercancel", (event) => {
    if (pressedPointerId !== null && event.pointerId !== pressedPointerId) return;
    resetAll();
  }, { passive: true });

  document.addEventListener("pointerout", (event) => {
    const surface = closestSurface(event.target);
    if (!surface) return;
    const nextSurface = closestSurface(event.relatedTarget);
    if (nextSurface === surface) return;
    if (surface === pressedSurface) clearPressed(surface);
    if (surface === activeSurface) deactivateSurface(surface);
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    const surface = closestInteractive(event.target);
    if (!surface) return;
    pressSurface(surface, "keyboard");
    if (!reducedMotion.matches) {
      surface.style.setProperty("--glass-x", "50%");
      surface.style.setProperty("--glass-y", "18%");
      if (activeSurface !== surface) {
        deactivateSurface();
        activeSurface = surface;
        activeRect = surface.getBoundingClientRect();
        surface.classList.add("is-glass-active");
      }
    }
  });

  document.addEventListener("keyup", (event) => {
    if (!pressedByKeyboard || (event.key !== "Enter" && event.key !== " ")) return;
    const surface = pressedSurface;
    clearPressed(surface);
    deactivateSurface(surface);
  });

  document.addEventListener("focusout", (event) => {
    const surface = closestInteractive(event.target);
    if (!surface) return;
    if (surface === pressedSurface) clearPressed(surface);
    if (surface === activeSurface) deactivateSurface(surface);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) resetAll();
  });
  window.addEventListener("blur", resetAll);
  window.addEventListener("pagehide", resetAll);

  const handlePreferenceChange = () => {
    if (reducedMotion.matches || !finePointer.matches) resetAll();
  };
  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", handlePreferenceChange);
    finePointer.addEventListener("change", handlePreferenceChange);
  } else {
    reducedMotion.addListener(handlePreferenceChange);
    finePointer.addListener(handlePreferenceChange);
  }
})();
