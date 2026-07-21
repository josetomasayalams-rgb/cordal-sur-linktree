"use strict";

(() => {
  const PREFERENCES = window.CS_LINKTREE_PREFERENCES;
  if (!PREFERENCES) throw new Error("Cordal Sur preferences failed to initialize.");

  const CONFIG = Object.freeze({
    endpoint: "https://uimqusoylxpyljbfqumm.supabase.co/functions/v1/calendar-ical/public-availability",
    allowedHost: "uimqusoylxpyljbfqumm.supabase.co",
    whatsappPhone: "56990137732",
    timezone: "America/Santiago",
    weekdayRateClp: 260000,
    weekendRateClp: 280000,
    minimumNights: 2,
    bookingEndExclusive: "2026-10-01",
    monthsAhead: 12,
    timeoutMs: 8000,
  });
  const LOCALES = Object.freeze({ es: "es-CL", pt: "pt-BR", en: "en" });
  const STATUS_VALUES = new Set(["live", "stale", "unavailable"]);
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

  const t = (key, values) => values ? PREFERENCES.format(key, values) : PREFERENCES.t(key);
  const locale = () => LOCALES[PREFERENCES.getLanguage()] || LOCALES.es;

  function parseIsoDate(value) {
    if (!ISO_DATE.test(value || "")) return null;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return date;
  }

  function formatIsoDate(date) {
    return date.toISOString().slice(0, 10);
  }

  function shiftDays(value, days) {
    const date = parseIsoDate(value);
    if (!date) return value;
    date.setUTCDate(date.getUTCDate() + days);
    return formatIsoDate(date);
  }

  function shiftMonths(value, months) {
    const date = parseIsoDate(value);
    if (!date) return value;
    const day = date.getUTCDate();
    const first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
    const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    first.setUTCDate(Math.min(day, lastDay));
    return formatIsoDate(first);
  }

  function monthStart(value) {
    const date = parseIsoDate(value);
    return date ? `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01` : value;
  }

  function clampBookableRange(range) {
    return Object.freeze({
      ...range,
      to: range.to < CONFIG.bookingEndExclusive ? range.to : CONFIG.bookingEndExclusive,
    });
  }

  function todayInSantiago(now = new Date()) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
      timeZone: CONFIG.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now).filter(({ type }) => type !== "literal").map(({ type, value }) => [type, value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  function eachNight(arrival, departure) {
    const nights = [];
    for (let date = arrival; parseIsoDate(date) && date < departure; date = shiftDays(date, 1)) nights.push(date);
    return nights;
  }

  function isBlocked(date, blockedRanges) {
    return blockedRanges.some((range) => range.startDate <= date && date < range.endDate);
  }

  function rangeHasBlockedNight(arrival, departure, blockedRanges) {
    return eachNight(arrival, departure).some((date) => isBlocked(date, blockedRanges));
  }

  function meetsMinimumStay(arrival, departure) {
    return eachNight(arrival, departure).length >= CONFIG.minimumNights;
  }

  function isBookableStay(arrival, departure, range, blockedRanges) {
    return Boolean(
      parseIsoDate(arrival)
      && parseIsoDate(departure)
      && range
      && arrival >= range.from
      && arrival < range.to
      && departure <= range.to
      && meetsMinimumStay(arrival, departure)
      && !rangeHasBlockedNight(arrival, departure, blockedRanges)
    );
  }

  function canStartStay(date, range, blockedRanges) {
    const departure = shiftDays(date, CONFIG.minimumNights);
    return isBookableStay(date, departure, range, blockedRanges);
  }

  function isSelectionValid(arrival, departure, range, blockedRanges) {
    if (!arrival) return true;
    return departure
      ? isBookableStay(arrival, departure, range, blockedRanges)
      : canStartStay(arrival, range, blockedRanges);
  }

  function nightlyRate(date) {
    const day = parseIsoDate(date)?.getUTCDay();
    return day === 5 || day === 6 ? CONFIG.weekendRateClp : CONFIG.weekdayRateClp;
  }

  function quoteRange(arrival, departure) {
    const lines = eachNight(arrival, departure).map((date) => Object.freeze({
      date,
      kind: nightlyRate(date) === CONFIG.weekendRateClp ? "weekend" : "weekday",
      amountClp: nightlyRate(date),
    }));
    return Object.freeze({ lines, nights: lines.length, totalClp: lines.reduce((sum, line) => sum + line.amountClp, 0) });
  }

  function hasExactKeys(value, allowed) {
    return value && typeof value === "object" && Object.keys(value).every((key) => allowed.has(key));
  }

  function validatePayload(value) {
    const topKeys = new Set(["version", "timezone", "generatedAt", "range", "status", "lastSuccessfulSyncAt", "blockedRanges"]);
    if (!hasExactKeys(value, topKeys) || value.version !== 1 || value.timezone !== CONFIG.timezone || !STATUS_VALUES.has(value.status)) return null;
    if (Number.isNaN(Date.parse(value.generatedAt))) return null;
    if (value.lastSuccessfulSyncAt !== null && Number.isNaN(Date.parse(value.lastSuccessfulSyncAt))) return null;
    if (!hasExactKeys(value.range, new Set(["from", "to", "endExclusive"]))) return null;
    if (!parseIsoDate(value.range.from) || !parseIsoDate(value.range.to) || value.range.to <= value.range.from || value.range.endExclusive !== true) return null;
    if (!Array.isArray(value.blockedRanges)) return null;
    let previousEnd = "";
    for (const range of value.blockedRanges) {
      if (!hasExactKeys(range, new Set(["startDate", "endDate"]))) return null;
      if (!parseIsoDate(range.startDate) || !parseIsoDate(range.endDate) || range.endDate <= range.startDate) return null;
      if (range.startDate < value.range.from || range.endDate > value.range.to || (previousEnd && range.startDate <= previousEnd)) return null;
      previousEnd = range.endDate;
    }
    return value;
  }

  function safeEndpoint() {
    const url = new URL(CONFIG.endpoint);
    return url.protocol === "https:" && url.hostname === CONFIG.allowedHost ? url.href : null;
  }

  function formatDate(value, options = { dateStyle: "medium" }) {
    const date = parseIsoDate(value);
    return date ? new Intl.DateTimeFormat(locale(), { ...options, timeZone: "UTC" }).format(date) : value;
  }

  function formatMoney(value) {
    return new Intl.NumberFormat(locale(), { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value);
  }

  function nightCountLabel(count) {
    return t(count === 1 ? "availability.night" : "availability.nights", { count });
  }

  function buildWhatsappMessage(arrival, departure, includePrice) {
    if (!meetsMinimumStay(arrival, departure)) throw new RangeError("Minimum stay is two nights");
    const quote = quoteRange(arrival, departure);
    const price = includePrice ? t("availability.whatsapp.price", { total: formatMoney(quote.totalClp) }) : "";
    return t("availability.whatsapp", {
      arrival: formatDate(arrival),
      departure: formatDate(departure),
      nightLabel: nightCountLabel(quote.nights),
      price,
    });
  }

  function whatsappHref(arrival, departure, includePrice) {
    const url = new URL(`https://wa.me/${CONFIG.whatsappPhone}`);
    url.searchParams.set("text", buildWhatsappMessage(arrival, departure, includePrice));
    return url.href;
  }

  async function requestAvailability() {
    const endpoint = safeEndpoint();
    if (!endpoint) throw new Error("Invalid availability endpoint");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), CONFIG.timeoutMs);
    try {
      const response = await fetch(endpoint, { signal: controller.signal, cache: "no-store", headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Availability request failed");
      const payload = validatePayload(await response.json());
      if (!payload) throw new Error("Invalid availability contract");
      return payload;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function initialize() {
    const root = document.querySelector(".availability-section");
    if (!root || root.dataset.initialized === "true") return;
    root.dataset.initialized = "true";

    const elements = {
      status: root.querySelector("#availability-status"),
      refresh: root.querySelector("#availability-refresh"),
      previous: root.querySelector("#availability-previous"),
      next: root.querySelector("#availability-next"),
      viewLabel: root.querySelector("#availability-view-label"),
      months: root.querySelector("#availability-months"),
      selection: root.querySelector("#availability-selection"),
      selectionTitle: root.querySelector("#availability-selection-title"),
      arrival: root.querySelector("#availability-arrival"),
      departure: root.querySelector("#availability-departure"),
      nightCount: root.querySelector("#availability-night-count"),
      clear: root.querySelector("#availability-clear"),
      revealPrice: root.querySelector("#availability-reveal-price"),
      quote: root.querySelector("#availability-quote"),
      breakdown: root.querySelector("#availability-price-breakdown"),
      quoteLabel: root.querySelector("#availability-quote-label"),
      subtotal: root.querySelector("#availability-subtotal"),
      consult: root.querySelector("#availability-consult"),
      live: root.querySelector("#availability-live"),
    };

    const today = todayInSantiago();
    const fallbackRange = clampBookableRange({ from: today, to: shiftMonths(today, CONFIG.monthsAhead), endExclusive: true });
    const state = {
      payload: null,
      mode: "loading",
      viewMonth: monthStart(today),
      arrival: null,
      departure: null,
      pricesRevealed: false,
      focusDate: today,
      loading: false,
    };

    const visibleMonthCount = () => window.matchMedia("(min-width: 640px)").matches ? 2 : 1;
    const activeRange = () => state.payload ? clampBookableRange(state.payload.range) : fallbackRange;
    const blockedRanges = () => state.payload?.blockedRanges || [];
    const availableForSelection = () => state.payload && state.mode !== "unavailable";
    const includesBoundaryCheckout = () => Boolean(
      state.arrival
      && (
        state.departure === activeRange().to
        || (!state.departure && isBookableStay(state.arrival, activeRange().to, activeRange(), blockedRanges()))
      )
    );
    const lastMonth = () => monthStart(includesBoundaryCheckout() ? activeRange().to : shiftDays(activeRange().to, -1));
    const maxViewMonth = () => shiftMonths(lastMonth(), -(visibleMonthCount() - 1));

    function announce(key, values) {
      elements.live.textContent = t(key, values);
    }

    function statusCopy() {
      if (state.mode === "loading") return t("availability.loading");
      if (state.mode === "unavailable") return t("availability.unavailable");
      if (state.mode === "offline") return t("availability.offline");
      const updated = state.payload?.lastSuccessfulSyncAt
        ? t("availability.updated", { date: new Intl.DateTimeFormat(locale(), { dateStyle: "medium", timeStyle: "short", timeZone: CONFIG.timezone }).format(new Date(state.payload.lastSuccessfulSyncAt)) })
        : "";
      return state.mode === "stale" ? `${t("availability.stale")} ${updated}`.trim() : updated;
    }

    function renderStatus() {
      elements.status.className = `availability-status is-${state.mode}`;
      elements.status.lastElementChild.textContent = statusCopy();
      elements.refresh.disabled = state.loading;
      elements.refresh.classList.toggle("is-loading", state.loading);
      elements.months.setAttribute("aria-busy", String(state.loading));
    }

    function weekdayLabels() {
      return Array.from({ length: 7 }, (_, offset) => {
        const date = new Date(Date.UTC(2024, 0, 1 + offset));
        return new Intl.DateTimeFormat(locale(), { weekday: "short", timeZone: "UTC" }).format(date).replace(".", "");
      });
    }

    function fullDateLabel(date) {
      return formatDate(date, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    }

    function canBeCheckout(date) {
      return Boolean(
        state.arrival
        && !state.departure
        && isBookableStay(state.arrival, date, activeRange(), blockedRanges())
      );
    }

    function canStartMinimumStay(date) {
      return canStartStay(date, activeRange(), blockedRanges());
    }

    function selectionIsValid() {
      if (!state.arrival) return true;
      if (!availableForSelection()) return false;
      return isSelectionValid(state.arrival, state.departure, activeRange(), blockedRanges());
    }

    function isSelected(date) {
      if (!state.arrival) return false;
      if (!state.departure) return date === state.arrival;
      return state.arrival <= date && date <= state.departure;
    }

    function dayAriaLabel(date, flags) {
      const labels = [fullDateLabel(date)];
      if (flags.today) labels.push(t("availability.today"));
      if (flags.past) labels.push(t("availability.past"));
      else if (flags.outside) labels.push(t("availability.outsideRange"));
      else if (flags.minimumArrival) labels.push(t("availability.minimumStay.arrivalUnavailable"));
      else if (flags.minimumStay) labels.push(t("availability.minimumStay.checkout"));
      else if (flags.blocked && flags.checkout) labels.push(t("availability.reserved.checkout"));
      else if (flags.blocked) labels.push(t("availability.reserved"));
      else if (flags.boundaryCheckout) labels.push(t("availability.checkoutOnly"));
      else if (flags.unknown) labels.push(t("availability.unavailable"));
      else labels.push(t("availability.available"));
      if (flags.selected) labels.push(t("availability.selected"));
      return labels.join(". ");
    }

    function buildMonth(value) {
      const monthDate = parseIsoDate(value);
      const year = monthDate.getUTCFullYear();
      const month = monthDate.getUTCMonth();
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      const leading = (monthDate.getUTCDay() + 6) % 7;
      const section = document.createElement("section");
      section.className = "availability-month";

      const heading = document.createElement("h3");
      heading.textContent = new Intl.DateTimeFormat(locale(), { month: "long", year: "numeric", timeZone: "UTC" }).format(monthDate);
      const grid = document.createElement("div");
      grid.className = "availability-grid";
      grid.setAttribute("role", "grid");
      grid.setAttribute("aria-label", heading.textContent);

      weekdayLabels().forEach((label) => {
        const weekday = document.createElement("span");
        weekday.className = "availability-weekday";
        weekday.setAttribute("role", "columnheader");
        weekday.textContent = label;
        grid.append(weekday);
      });
      for (let index = 0; index < leading; index += 1) {
        const spacer = document.createElement("span");
        spacer.className = "availability-day-spacer";
        spacer.setAttribute("role", "presentation");
        grid.append(spacer);
      }

      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const past = date < activeRange().from;
        const boundaryCheckout = date === activeRange().to && (canBeCheckout(date) || state.departure === date);
        const outside = date > activeRange().to || (date === activeRange().to && !boundaryCheckout);
        const blocked = isBlocked(date, blockedRanges());
        const checkout = blocked && canBeCheckout(date);
        const minimumStay = Boolean(state.arrival && !state.departure && date > state.arrival && !meetsMinimumStay(state.arrival, date));
        const unknown = !availableForSelection();
        const choosingArrival = !state.arrival || Boolean(state.departure);
        const selected = isSelected(date);
        const minimumArrival = Boolean(choosingArrival && !selected && !past && !outside && !blocked && !unknown && !canStartMinimumStay(date));
        const todayFlag = date === today;
        const disabled = past || outside || unknown;
        const ariaDisabled = disabled || minimumStay || minimumArrival || (blocked && !checkout);

        const cell = document.createElement("span");
        cell.className = "availability-day-cell";
        cell.setAttribute("role", "gridcell");
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.date = date;
        button.disabled = disabled;
        button.tabIndex = date === state.focusDate && !disabled ? 0 : -1;
        button.className = [
          "availability-day",
          past || outside ? "is-past" : "",
          blocked ? "is-reserved" : "",
          unknown ? "is-unknown" : "",
          selected ? "is-selected" : "",
          date === state.arrival ? "is-arrival" : "",
          date === state.departure ? "is-departure" : "",
          todayFlag ? "is-today" : "",
          checkout || boundaryCheckout ? "is-checkout-option" : "",
          minimumStay || minimumArrival ? "is-minimum-stay" : "",
        ].filter(Boolean).join(" ");
        button.setAttribute("aria-label", dayAriaLabel(date, { past, outside, blocked, checkout, boundaryCheckout, minimumStay, minimumArrival, unknown, selected, today: todayFlag }));
        button.setAttribute("aria-disabled", String(ariaDisabled));
        button.setAttribute("aria-pressed", String(selected));
        if (minimumArrival) button.dataset.minimumStay = "arrival";
        else if (minimumStay) button.dataset.minimumStay = "checkout";
        const number = document.createElement("time");
        number.dateTime = date;
        number.textContent = String(day);
        const status = document.createElement("small");
        status.textContent = minimumStay || minimumArrival
          ? t("availability.minimumStay.short")
          : boundaryCheckout
            ? t("availability.departure")
            : outside
              ? "—"
              : blocked
                ? t("availability.reserved")
                : unknown
                  ? "—"
                  : t("availability.available");
        button.append(number, status);
        cell.append(button);
        grid.append(cell);
      }
      section.append(heading, grid);
      return section;
    }

    function renderCalendar() {
      const count = visibleMonthCount();
      const fragment = document.createDocumentFragment();
      const labels = [];
      for (let index = 0; index < count; index += 1) {
        const month = shiftMonths(state.viewMonth, index);
        const section = buildMonth(month);
        labels.push(section.firstElementChild.textContent);
        fragment.append(section);
      }
      elements.months.replaceChildren(fragment);
      elements.viewLabel.textContent = labels.join(" · ");
      elements.previous.disabled = state.viewMonth <= monthStart(activeRange().from);
      elements.next.disabled = state.viewMonth >= maxViewMonth();
      if (!elements.months.querySelector('button[data-date][tabindex="0"]:not(:disabled)')) {
        const first = elements.months.querySelector("button[data-date]:not(:disabled)");
        if (first) {
          first.tabIndex = 0;
          state.focusDate = first.dataset.date;
        }
      }
    }

    function renderSelection() {
      const complete = Boolean(state.arrival && state.departure);
      const selected = Boolean(state.arrival);
      elements.selection.hidden = !selected;
      if (!selected) {
        elements.revealPrice.hidden = true;
        elements.revealPrice.setAttribute("aria-expanded", "false");
        elements.quote.hidden = true;
        elements.consult.hidden = true;
        elements.breakdown.replaceChildren();
        elements.subtotal.textContent = "—";
        elements.consult.removeAttribute("href");
        return;
      }
      const quote = complete ? quoteRange(state.arrival, state.departure) : null;
      elements.selectionTitle.textContent = t(complete ? "availability.confirmed" : "availability.dateSelected");
      elements.arrival.textContent = formatDate(state.arrival);
      elements.departure.textContent = complete ? formatDate(state.departure) : t("availability.chooseDeparture");
      elements.nightCount.textContent = complete ? nightCountLabel(quote.nights) : "—";
      elements.revealPrice.hidden = !complete || state.pricesRevealed;
      elements.revealPrice.setAttribute("aria-expanded", String(state.pricesRevealed));
      elements.quote.hidden = !complete || !state.pricesRevealed;
      elements.consult.hidden = !complete || !state.pricesRevealed;

      if (!complete || !state.pricesRevealed) {
        elements.breakdown.replaceChildren();
        elements.subtotal.textContent = "—";
        elements.consult.removeAttribute("href");
        return;
      }

      elements.breakdown.replaceChildren(...quote.lines.map((line) => {
        const item = document.createElement("li");
        const copy = document.createElement("span");
        copy.textContent = `${formatDate(line.date, { weekday: "short", month: "short", day: "numeric" })} · ${t(`availability.${line.kind}`)}`;
        const amount = document.createElement("strong");
        amount.textContent = formatMoney(line.amountClp);
        item.append(copy, amount);
        return item;
      }));
      elements.quoteLabel.textContent = t("availability.estimate");
      elements.subtotal.textContent = formatMoney(quote.totalClp);
      elements.consult.href = whatsappHref(state.arrival, state.departure, true);
    }

    function render() {
      renderStatus();
      renderCalendar();
      renderSelection();
    }

    function restoreCalendarFocus(date) {
      window.requestAnimationFrame(() => {
        elements.months.querySelector(`button[data-date="${date}"]:not(:disabled)`)?.focus({ preventScroll: true });
      });
    }

    function clearSelectionState() {
      state.arrival = null;
      state.departure = null;
      state.pricesRevealed = false;
    }

    function resetSelection(announceReset = true) {
      clearSelectionState();
      if (state.viewMonth > maxViewMonth()) state.viewMonth = maxViewMonth();
      if (announceReset) announce("availability.selectArrival");
      render();
    }

    function selectDate(date, restoreFocus = false) {
      if (!availableForSelection()) return;
      if (!state.arrival || state.departure || date <= state.arrival) {
        if (isBlocked(date, blockedRanges())) return;
        if (!canStartMinimumStay(date)) {
          announce("availability.minimumStay.arrival");
          return;
        }
        state.arrival = date;
        state.departure = null;
        state.pricesRevealed = false;
        state.focusDate = date;
        announce("availability.selectDeparture");
        render();
        if (restoreFocus) restoreCalendarFocus(date);
        return;
      }
      if (!meetsMinimumStay(state.arrival, date)) {
        announce("availability.minimumStay.error");
        return;
      }
      if (rangeHasBlockedNight(state.arrival, date, blockedRanges())) {
        announce("availability.invalidRange");
        return;
      }
      state.departure = date;
      state.focusDate = date;
      announce("availability.confirmed");
      render();
      if (restoreFocus) restoreCalendarFocus(date);
    }

    function ensureVisibleAndFocus(date) {
      const targetMonth = monthStart(date);
      const visibleEnd = shiftMonths(state.viewMonth, visibleMonthCount() - 1);
      if (targetMonth < state.viewMonth) state.viewMonth = targetMonth;
      else if (targetMonth > visibleEnd) state.viewMonth = shiftMonths(targetMonth, -(visibleMonthCount() - 1));
      if (state.viewMonth < monthStart(activeRange().from)) state.viewMonth = monthStart(activeRange().from);
      if (state.viewMonth > maxViewMonth()) state.viewMonth = maxViewMonth();
      state.focusDate = date;
      render();
      window.requestAnimationFrame(() => elements.months.querySelector(`button[data-date="${date}"]:not(:disabled)`)?.focus());
    }

    function keyboardTarget(date, key) {
      const parsed = parseIsoDate(date);
      if (!parsed) return null;
      if (key === "ArrowLeft") return shiftDays(date, -1);
      if (key === "ArrowRight") return shiftDays(date, 1);
      if (key === "ArrowUp") return shiftDays(date, -7);
      if (key === "ArrowDown") return shiftDays(date, 7);
      if (key === "Home") return shiftDays(date, -((parsed.getUTCDay() + 6) % 7));
      if (key === "End") return shiftDays(date, 6 - ((parsed.getUTCDay() + 6) % 7));
      if (key === "PageUp") return shiftMonths(date, -1);
      if (key === "PageDown") return shiftMonths(date, 1);
      return null;
    }

    async function load() {
      if (state.loading) return;
      if (!navigator.onLine && !state.payload) {
        state.mode = "unavailable";
        render();
        announce("availability.unavailable");
        return;
      }
      state.loading = true;
      state.mode = "loading";
      renderStatus();
      try {
        const payload = await requestAvailability();
        state.payload = payload;
        state.mode = payload.status;
        const invalidatedSelection = Boolean(state.arrival && !selectionIsValid());
        if (payload.status === "unavailable" || invalidatedSelection) clearSelectionState();
        if (state.viewMonth < monthStart(activeRange().from)) state.viewMonth = monthStart(activeRange().from);
        if (state.viewMonth > maxViewMonth()) state.viewMonth = maxViewMonth();
        announce(
          payload.status === "unavailable"
            ? "availability.unavailable"
            : invalidatedSelection
              ? "availability.selectionInvalidated"
              : payload.status === "stale"
                ? "availability.stale"
                : state.departure
                  ? "availability.confirmed"
                  : state.arrival
                    ? "availability.selectDeparture"
                    : "availability.selectArrival"
        );
      } catch {
        state.mode = state.payload ? (navigator.onLine ? "stale" : "offline") : "unavailable";
        if (!state.payload) resetSelection(false);
        announce(state.payload && !navigator.onLine ? "availability.offline" : "availability.unavailable");
      } finally {
        state.loading = false;
        render();
      }
    }

    elements.months.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-date]");
      if (!button || button.disabled) return;
      if (button.dataset.minimumStay) {
        announce(button.dataset.minimumStay === "arrival" ? "availability.minimumStay.arrival" : "availability.minimumStay.error");
        return;
      }
      if (button.getAttribute("aria-disabled") !== "true") selectDate(button.dataset.date, button === document.activeElement);
    });
    elements.months.addEventListener("keydown", (event) => {
      const button = event.target.closest("button[data-date]");
      if (!button) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (button.dataset.minimumStay) {
          announce(button.dataset.minimumStay === "arrival" ? "availability.minimumStay.arrival" : "availability.minimumStay.error");
        } else if (button.getAttribute("aria-disabled") !== "true") {
          selectDate(button.dataset.date, true);
        }
        return;
      }
      const target = keyboardTarget(button.dataset.date, event.key);
      if (!target || target < activeRange().from || target > activeRange().to || (target === activeRange().to && !canBeCheckout(target))) return;
      event.preventDefault();
      ensureVisibleAndFocus(target);
    });
    elements.previous.addEventListener("click", () => {
      state.viewMonth = shiftMonths(state.viewMonth, -1);
      renderCalendar();
    });
    elements.next.addEventListener("click", () => {
      state.viewMonth = shiftMonths(state.viewMonth, 1);
      renderCalendar();
    });
    elements.refresh.addEventListener("click", load);
    elements.clear.addEventListener("click", () => {
      const focusDate = state.arrival;
      state.focusDate = focusDate || state.focusDate;
      resetSelection();
      if (focusDate) ensureVisibleAndFocus(focusDate);
    });
    elements.revealPrice.addEventListener("click", () => {
      if (!state.arrival || !state.departure || !meetsMinimumStay(state.arrival, state.departure) || state.pricesRevealed) return;
      state.pricesRevealed = true;
      renderSelection();
      window.requestAnimationFrame(() => elements.quote.focus({ preventScroll: true }));
      announce("availability.pricesRevealed");
    });
    window.addEventListener("online", load);
    window.addEventListener("offline", () => {
      state.mode = state.payload ? "offline" : "unavailable";
      renderStatus();
      announce(state.payload ? "availability.offline" : "availability.unavailable");
    });
    window.matchMedia("(min-width: 640px)").addEventListener?.("change", renderCalendar);
    PREFERENCES.subscribe(({ changed }) => {
      if (changed !== "language") return;
      render();
    });

    render();
    void load();
  }

  window.CS_LINKTREE_AVAILABILITY = Object.freeze({
    CONFIG,
    parseIsoDate,
    shiftDays,
    shiftMonths,
    eachNight,
    isBlocked,
    rangeHasBlockedNight,
    meetsMinimumStay,
    isBookableStay,
    canStartStay,
    isSelectionValid,
    nightlyRate,
    quoteRange,
    clampBookableRange,
    validatePayload,
    safeEndpoint,
    buildWhatsappMessage,
    initialize,
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
