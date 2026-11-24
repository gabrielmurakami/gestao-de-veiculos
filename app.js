/* ═══════════════════════════════════════════════════
   AUTOGEST — app.js
   Autor: Gabriel (AutoGest v1.0)
   Lógica: Garagem, Abastecimento, Manutenção, Dashboard
   Persistência: localStorage
   ═══════════════════════════════════════════════════ */

"use strict";

/* ═══════════════════════════════
   STORAGE LAYER — COM CACHE EM MEMÓRIA
═══════════════════════════════ */
const DB = {
  KEYS: {
    cars: "ag_cars",
    fuels: "ag_fuels",
    maints: "ag_maints",
    selected: "ag_selected",
  },

  // Cache em memória para evitar JSON.parse repetido
  _cache: { cars: null, fuels: null, maints: null, selected: null },
  _loaded: { cars: false, fuels: false, maints: false, selected: false },

  _load(key) {
    if (this._loaded[key]) return this._cache[key];
    try {
      const val =
        JSON.parse(localStorage.getItem(this.KEYS[key])) ||
        (key === "selected" ? null : []);
      this._cache[key] = val;
      this._loaded[key] = true;
      return val;
    } catch {
      this._cache[key] = key === "selected" ? null : [];
      this._loaded[key] = true;
      return this._cache[key];
    }
  },

  _save(key, val) {
    try {
      localStorage.setItem(this.KEYS[key], JSON.stringify(val));
      this._cache[key] = val;
    } catch {
      showToast("Erro ao salvar dados.", "error");
    }
  },

  invalidate(key) {
    this._loaded[key] = false;
  },

  getCars() {
    return this._load("cars");
  },
  saveCars(d) {
    this._save("cars", d);
  },
  getFuels() {
    return this._load("fuels");
  },
  saveFuels(d) {
    this._save("fuels", d);
  },
  getMaints() {
    return this._load("maints");
  },
  saveMaints(d) {
    this._save("maints", d);
  },

  getSelectedCar() {
    return this._load("selected");
  },
  setSelectedCar(id) {
    this._save("selected", id);
  },

  getFuelsForCar(cid) {
    return this.getFuels().filter((f) => f.carId === cid);
  },
  getMaintsForCar(cid) {
    return this.getMaints().filter((m) => m.carId === cid);
  },
};

/* ═══════════════════════════════
   UTILITIES
═══════════════════════════════ */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function fmt(n, dec = 2) {
  return typeof n === "number" && !isNaN(n) ? n.toFixed(dec) : "—";
}
function fmtDate(str) {
  if (!str) return "—";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
}
// Data no fuso LOCAL (toISOString usa UTC: no Brasil, depois das 21h viraria "amanhã")
function localISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function today() {
  return localISO(new Date());
}

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
function fmtMoney(n) {
  return typeof n === "number" && Number.isFinite(n) ? BRL.format(n) : "—";
}

// Ícone do sprite SVG definido no index.html (#i-<name>)
function icon(name) {
  return `<svg class="i" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}

// Escapa texto do usuário antes de interpolar em innerHTML (evita XSS)
const ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ESC_MAP[ch]);
}
function carEmoji(fuel) {
  const map = {
    flex: "🚗",
    gasolina: "🏎️",
    etanol: "🌿",
    diesel: "🚛",
    elétrico: "⚡",
  };
  return map[fuel] || "🚙";
}

/* ═══════════════════════════════
   TOAST NOTIFICATIONS
═══════════════════════════════ */
/**
 * @param {object} [action] botão opcional no toast, ex.: { label: "Desfazer", onClick }
 */
function showToast(msg, type = "success", duration = 3000, action = null) {
  const container = document.getElementById("toastContainer");
  const t = document.createElement("div");
  t.className = `toast toast--${type}`;
  const text = document.createElement("span");
  text.textContent = msg;
  t.appendChild(text);

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    t.style.animation = "slideOut .25s ease forwards";
    t.addEventListener("animationend", () => t.remove());
    setTimeout(() => t.remove(), 400); // garante remoção mesmo sem animação
  };

  if (action) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "toast__action";
    btn.textContent = action.label;
    btn.addEventListener("click", () => {
      close();
      action.onClick();
    });
    t.appendChild(btn);
  }

  container.appendChild(t);
  setTimeout(close, duration);
}

// Exclusão com "Desfazer": `restore` recoloca os dados como estavam
function showUndoToast(msg, restore) {
  showToast(msg, "info", 6000, {
    label: "Desfazer",
    onClick: () => {
      restore();
      // Tudo pode ter mudado: marca todas as telas e redesenha a visível
      Object.keys(renderState).forEach(markDirty);
      renderCurrentScreen();
      showToast("Exclusão desfeita.");
    },
  });
}

/* ═══════════════════════════════
   CONFIRM MODAL
═══════════════════════════════ */
let _confirmCb = null;
function showConfirm(title, message, cb) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalMessage").textContent = message;
  document.getElementById("modalOverlay").style.display = "flex";
  _confirmCb = cb;
}
document.getElementById("modalConfirm").addEventListener("click", () => {
  document.getElementById("modalOverlay").style.display = "none";
  if (_confirmCb) _confirmCb();
  _confirmCb = null;
});
document.getElementById("modalCancel").addEventListener("click", () => {
  document.getElementById("modalOverlay").style.display = "none";
  _confirmCb = null;
});

/* ═══════════════════════════════
   NAVIGATION — SCREEN SWITCHING (LAZY RENDER + DIRTY FLAGS)
═══════════════════════════════ */
const SCREEN_TITLES = {
  dashboard: "Dashboard",
  garage: "Garagem",
  fuel: "Abastecimento",
  maintenance: "Manutenções",
};

// Estado de renderização por tela (evita re-render desnecessário)
const renderState = {
  dashboard: { dirty: true, rendered: false },
  garage: { dirty: true, rendered: false },
  fuel: { dirty: true, rendered: false },
  maintenance: { dirty: true, rendered: false },
};

// null até o primeiro navigateTo() — garante que a tela inicial seja renderizada
let currentScreen = null;
let lastScreenEl = document.querySelector(".screen.active");

function markDirty(screenId) {
  if (renderState[screenId]) renderState[screenId].dirty = true;
}

// Invalida todas as telas que dependem de um carro
function invalidateCarScreens() {
  ["dashboard", "fuel", "maintenance"].forEach((s) => markDirty(s));
}

// Invalida telas que dependem de abastecimentos (dashboard + fuel)
function invalidateFuelScreens() {
  ["dashboard", "fuel"].forEach((s) => markDirty(s));
}

// Invalida telas que dependem de manutenções (dashboard + maintenance)
function invalidateMaintScreens() {
  ["dashboard", "maintenance"].forEach((s) => markDirty(s));
}

function navigateTo(screenId) {
  if (currentScreen === screenId) return;
  currentScreen = screenId;

  // Instant visual toggle (no layout thrash)
  if (lastScreenEl) lastScreenEl.classList.remove("active");
  const target = document.getElementById(`screen-${screenId}`);
  if (target) {
    target.classList.add("active");
    lastScreenEl = target;
  }

  // Nav items - cached selectors
  if (!navigateTo.navItems) {
    navigateTo.navItems = document.querySelectorAll(".nav-item, .bnav-item");
  }
  navigateTo.navItems.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.screen === screenId);
  });

  document.getElementById("topbarTitle").textContent =
    SCREEN_TITLES[screenId] || screenId;

  renderCurrentScreen();
}

// LAZY RENDER: só renderiza a tela atual se estiver suja ou nunca renderizada
function renderCurrentScreen() {
  const screenId = currentScreen;
  const state = renderState[screenId];
  if (state && (state.dirty || !state.rendered)) {
    if (screenId === "dashboard") renderDashboard();
    if (screenId === "fuel") renderFuelScreen();
    if (screenId === "maintenance") renderMaintScreen();
    if (screenId === "garage") renderGarageScreen();
    state.dirty = false;
    state.rendered = true;
  }
}

// Wire nav buttons (delegated)
document.body.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-screen]");
  if (btn) navigateTo(btn.dataset.screen);
});

/* ═══════════════════════════════
   SIDEBAR TOGGLE (mobile) — DESATIVADO PARA PWA
   Menu hambúrguer removido, apenas bottom nav
═══════════════════════════════ */
const sidebar = document.getElementById("sidebar");
// let overlay = null; // Não usado sem hambúrguer

// function openSidebar() { ... } // Desativado
// function closeSidebar() { ... } // Desativado

// Menu toggle desativado para PWA (sem hambúrguer)
/*
document.getElementById('menuToggle').addEventListener('click', () => {
  sidebar.classList.contains('sidebar--open') ? closeSidebar() : openSidebar();
});
*/

/* ═══════════════════════════════
   CAR SELECTOR (global)
═══════════════════════════════ */
const carSel = document.getElementById("carSelector");

function rebuildCarSelector() {
  const cars = DB.getCars();
  const selectedId = DB.getSelectedCar();
  carSel.innerHTML = "";

  if (cars.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Nenhum veículo";
    carSel.appendChild(opt);
    return;
  }

  cars.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.emoji} ${c.name}`;
    if (c.id === selectedId) opt.selected = true;
    carSel.appendChild(opt);
  });

  // Auto-select first if none saved
  if (!selectedId || !cars.find((c) => c.id === selectedId)) {
    DB.setSelectedCar(cars[0].id);
    carSel.value = cars[0].id;
  }
}

carSel.addEventListener("change", () => {
  DB.setSelectedCar(carSel.value);
  invalidateCarScreens(); // dashboard, fuel, maintenance mudam com o carro selecionado
  markDirty("garage"); // destaque do carro selecionado na Garagem
  renderCurrentScreen();
});

function getSelectedCar() {
  const id = DB.getSelectedCar() || carSel.value;
  return DB.getCars().find((c) => c.id === id) || null;
}

/* ═══════════════════════════════
   CALC ENGINE
═══════════════════════════════ */
/**
 * Calcula KM/L entre dois abastecimentos consecutivos.
 * @param {object} prev  - abastecimento anterior
 * @param {object} curr  - abastecimento atual
 * @returns {number|null}
 */
function calcKml(prev, curr) {
  if (!prev) return null;
  const km = curr.odometer - prev.odometer;
  if (km <= 0 || curr.liters <= 0) return null;
  return km / curr.liters;
}

/**
 * Calcula média geral de KM/L de uma lista de abastecimentos.
 */
function calcAvgKml(fuels) {
  if (fuels.length < 2) return null;
  const sorted = [...fuels].sort((a, b) => a.odometer - b.odometer);
  const totalKm = sorted[sorted.length - 1].odometer - sorted[0].odometer;
  const totalLiters = sorted.slice(1).reduce((s, f) => s + f.liters, 0);
  if (totalLiters <= 0) return null;
  return totalKm / totalLiters;
}

/* ═══════════════════════════════
   CHART
═══════════════════════════════ */
let consumoChart = null;
let chartRenderId = 0; // descarta renders antigos se o carro mudar durante o download

/* Chart.js (~200 KB) só é baixado quando há gráfico para desenhar */
let chartLibPromise = null;
function loadChartLib() {
  if (window.Chart) return Promise.resolve(window.Chart);
  if (!chartLibPromise) {
    chartLibPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "/chart.umd.min.js";
      s.async = true;
      s.onload = () => resolve(window.Chart);
      s.onerror = () => {
        chartLibPromise = null; // permite tentar de novo
        s.remove();
        reject(new Error("Falha ao carregar Chart.js"));
      };
      document.head.appendChild(s);
    });
  }
  return chartLibPromise;
}

let spendChart = null;

// Cores dos gráficos vêm dos tokens CSS → acompanham o tema claro/escuro
function chartTheme() {
  const css = getComputedStyle(document.documentElement);
  const v = (name) => css.getPropertyValue(name).trim();
  return {
    accent: v("--accent-blue"),
    accentSoft: v("--chart-fill"),
    grid: v("--chart-grid"),
    tick: v("--text-muted"),
    tooltipBg: v("--bg-raised"),
    tooltipBorder: v("--border-light"),
    tooltipTitle: v("--text-secondary"),
    tooltipBody: v("--text-primary"),
  };
}

function baseChartOptions(t, formatValue) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: prefersReducedMotion() ? false : undefined,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: t.tooltipBg,
        borderColor: t.tooltipBorder,
        borderWidth: 1,
        titleColor: t.tooltipTitle,
        bodyColor: t.tooltipBody,
        callbacks: { label: (ctx) => ` ${formatValue(ctx.parsed.y)}` },
      },
    },
    scales: {
      x: {
        ticks: { color: t.tick, font: { size: 10 }, maxTicksLimit: 6 },
        grid: { color: t.grid },
      },
      y: {
        beginAtZero: false,
        ticks: { color: t.tick, font: { size: 10 } },
        grid: { color: t.grid },
      },
    },
  };
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// km/l entre cada par de abastecimentos consecutivos
function consumoSeries(sorted) {
  const labels = [];
  const data = [];
  for (let i = 1; i < sorted.length; i++) {
    const kml = calcKml(sorted[i - 1], sorted[i]);
    if (kml !== null) {
      labels.push(`${sorted[i].odometer.toLocaleString("pt-BR")} km`);
      data.push(parseFloat(kml.toFixed(2)));
    }
  }
  return { labels, data };
}

/**
 * Gasto por mês: `months` meses terminando no mês atual — ou no mês do último
 * abastecimento com preço, se ele for mais antigo (evita um gráfico só de zeros
 * para quem ficou um tempo sem registrar).
 */
const MONTH_FMT = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" });
const fmtMonth = (d) => MONTH_FMT.format(d).replace(". de ", "/").replace(".", "");
function monthlySpendSeries(fuels, months = 6) {
  const priced = fuels.filter((f) => f.price > 0);
  if (priced.length === 0) return { labels: [], data: [], hasPrice: false, isCurrent: true };

  const lastKey = priced.map((f) => f.date.slice(0, 7)).sort().at(-1); // "YYYY-MM"
  const currentKey = today().slice(0, 7);
  const isCurrent = lastKey >= currentKey;
  const [endY, endM] = (isCurrent ? currentKey : lastKey).split("-").map(Number);

  const keys = [];
  const labels = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(endY, endM - 1 - i, 1);
    keys.push(localISO(d).slice(0, 7));
    labels.push(fmtMonth(d));
  }
  const totals = Object.fromEntries(keys.map((k) => [k, 0]));
  priced.forEach((f) => {
    const key = f.date.slice(0, 7);
    if (key in totals) totals[key] += f.liters * f.price;
  });
  return {
    labels,
    data: keys.map((k) => +totals[k].toFixed(2)),
    hasPrice: true,
    isCurrent,
    endLabel: labels.at(-1),
  };
}

function destroyChart(which) {
  if (which === "consumo" && consumoChart) {
    consumoChart.destroy();
    consumoChart = null;
  }
  if (which === "spend" && spendChart) {
    spendChart.destroy();
    spendChart = null;
  }
}

function renderCharts(fuels) {
  const renderId = ++chartRenderId;
  const sorted = [...fuels].sort((a, b) => a.odometer - b.odometer);

  const consumoCanvas = document.getElementById("consumoChart");
  const consumoEmpty = document.getElementById("chartEmpty");
  const spendCanvas = document.getElementById("spendChart");
  const spendEmpty = document.getElementById("spendChartEmpty");

  const consumo = consumoSeries(sorted);
  const spend = monthlySpendSeries(sorted);
  const showConsumo = consumo.data.length > 0;
  const showSpend = spend.hasPrice;

  const toggle = (canvas, empty, show, name) => {
    canvas.style.display = show ? "block" : "none";
    empty.style.display = show ? "none" : "flex";
    if (!show) destroyChart(name);
  };
  toggle(consumoCanvas, consumoEmpty, showConsumo, "consumo");
  toggle(spendCanvas, spendEmpty, showSpend, "spend");
  document.getElementById("spendBadge").textContent =
    showSpend && !spend.isCurrent ? `6 meses até ${spend.endLabel}` : "últimos 6 meses";
  if (!showConsumo && !showSpend) return;

  loadChartLib()
    .then((Chart) => {
      if (renderId !== chartRenderId) return; // um render mais novo assumiu
      const t = chartTheme();
      if (showConsumo) drawConsumoChart(Chart, consumoCanvas, consumo, t);
      if (showSpend) drawSpendChart(Chart, spendCanvas, spend, t);
    })
    .catch(() => {
      if (renderId !== chartRenderId) return;
      toggle(consumoCanvas, consumoEmpty, false, "consumo");
      toggle(spendCanvas, spendEmpty, false, "spend");
    });
}

function drawConsumoChart(Chart, canvas, { labels, data }, t) {
  destroyChart("consumo");
  consumoChart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "km/l",
          data,
          borderColor: t.accent,
          backgroundColor: t.accentSoft,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: t.accent,
          tension: 0.35,
          fill: true,
        },
      ],
    },
    options: baseChartOptions(t, (v) => `${v} km/l`),
  });
}

function drawSpendChart(Chart, canvas, { labels, data }, t) {
  destroyChart("spend");
  const options = baseChartOptions(t, fmtMoney);
  options.scales.y.beginAtZero = true;
  options.scales.y.ticks.callback = (v) => `R$ ${v}`;
  spendChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Gasto",
          data,
          backgroundColor: t.accent,
          borderRadius: 4,
          maxBarThickness: 36,
        },
      ],
    },
    options,
  });
}

/* ═══════════════════════════════
   INDICADORES DE CUSTO
═══════════════════════════════ */
/**
 * Calcula custos a partir dos abastecimentos (ordenados por km).
 * - Preço médio: ponderado por litros, só abastecimentos com preço.
 * - Custo/km: combustível gasto entre o 1º e o último abastecimento
 *   (o 1º encheu o tanque antes do período, então não entra) ÷ km rodados.
 *   Abastecimentos sem preço usam o preço médio.
 */
function calcFuelCosts(sorted) {
  const priced = sorted.filter((f) => f.price > 0);
  const pricedLiters = priced.reduce((s, f) => s + f.liters, 0);
  const avgPrice =
    pricedLiters > 0
      ? priced.reduce((s, f) => s + f.liters * f.price, 0) / pricedLiters
      : null;

  let costPerKm = null;
  if (avgPrice !== null && sorted.length >= 2) {
    const km = sorted[sorted.length - 1].odometer - sorted[0].odometer;
    const cost = sorted
      .slice(1)
      .reduce((s, f) => s + f.liters * (f.price > 0 ? f.price : avgPrice), 0);
    if (km > 0) costPerKm = cost / km;
  }

  const month = today().slice(0, 7);
  const thisMonth = sorted.filter((f) => f.date.startsWith(month));
  const monthSpend = thisMonth.reduce((s, f) => s + (f.price > 0 ? f.liters * f.price : 0), 0);
  const lastPriced = [...priced].sort((a, b) => b.date.localeCompare(a.date))[0];

  return {
    avgPrice,
    costPerKm,
    monthSpend,
    monthRefills: thisMonth.length,
    lastPrice: lastPriced ? lastPriced.price : null,
  };
}

/* ═══════════════════════════════
   DASHBOARD RENDER
═══════════════════════════════ */
function renderDashboard() {
  const cars = DB.getCars();
  const emptyState = document.getElementById("dashEmptyState");
  const dashContent = document.getElementById("dashContent");

  if (cars.length === 0) {
    emptyState.style.display = "flex";
    dashContent.style.display = "none";
    return;
  }
  emptyState.style.display = "none";
  dashContent.style.display = ""; // volta ao layout do CSS (grid no desktop)

  const car = getSelectedCar();
  if (!car) return;

  const fuels = DB.getFuelsForCar(car.id).sort(
    (a, b) => a.odometer - b.odometer,
  );
  const maints = DB.getMaintsForCar(car.id);
  const setText = (id, text) => (document.getElementById(id).textContent = text);

  // KPIs
  const avg = calcAvgKml(fuels);
  document.getElementById("kpiAvgKml").innerHTML =
    avg !== null
      ? `${fmt(avg)} <span class="kpi-unit">km/l</span>`
      : `— <span class="kpi-unit">km/l</span>`;
  setText(
    "kpiRefills",
    `${fuels.length} abastecimento${fuels.length !== 1 ? "s" : ""} registrado${fuels.length !== 1 ? "s" : ""}`,
  );

  const lastFuel = fuels[fuels.length - 1];
  setText(
    "kpiLastOdo",
    (lastFuel ? lastFuel.odometer : car.odometer).toLocaleString("pt-BR"),
  );
  setText("kpiLastFuel", lastFuel ? `${fmt(lastFuel.liters, 1)}L` : "—");
  setText("kpiLastDate", lastFuel ? fmtDate(lastFuel.date) : "—");

  const costs = calcFuelCosts(fuels);
  setText("kpiCostKm", costs.costPerKm !== null ? fmtMoney(costs.costPerKm) : "—");
  setText(
    "kpiCostKmSub",
    costs.costPerKm !== null ? "só combustível" : "precisa de 2 abastecimentos com preço",
  );
  setText("kpiMonthSpend", fmtMoney(costs.monthSpend));
  setText(
    "kpiMonthSub",
    `${costs.monthRefills} abastecimento${costs.monthRefills !== 1 ? "s" : ""} este mês`,
  );
  setText("kpiAvgPrice", costs.avgPrice !== null ? fmtMoney(costs.avgPrice) : "—");
  setText(
    "kpiAvgPriceSub",
    costs.lastPrice !== null ? `último: ${fmtMoney(costs.lastPrice)}` : "informe o preço ao abastecer",
  );

  // Charts
  renderCharts(fuels);

  // Maintenance cards
  renderDashboardMaint(maints, car, fuels);
}

/* ── Previsão por quilometragem ───────────────── */
/**
 * KM atual do carro e ritmo de uso (km/dia) estimado pelos abastecimentos.
 * O ritmo só é calculado com pelo menos 7 dias de histórico.
 */
function carUsage(car, fuels) {
  const byOdo = [...fuels].sort((a, b) => a.odometer - b.odometer);
  const last = byOdo[byOdo.length - 1];
  const currentKm = Math.max(car.odometer || 0, last ? last.odometer : 0);

  let kmPerDay = null;
  if (byOdo.length >= 2) {
    const first = byOdo[0];
    const days = (Date.parse(last.date) - Date.parse(first.date)) / 864e5;
    const km = last.odometer - first.odometer;
    if (days >= 7 && km > 0) kmPerDay = km / days;
  }
  return { currentKm, kmPerDay };
}

/** Situação de uma manutenção pela KM: null se ela não tem KM definida. */
function maintKmStatus(m, usage) {
  const target = parseInt(m.km);
  if (!target) return null;
  const remaining = target - usage.currentKm;
  if (remaining <= 0) {
    return { overdue: true, soon: true, text: "KM atingida" };
  }
  let text = `faltam ${remaining.toLocaleString("pt-BR")} km`;
  if (usage.kmPerDay) {
    const days = Math.round(remaining / usage.kmPerDay);
    text += days <= 1 ? " (≈ 1 dia)" : ` (≈ ${days} dias)`;
  }
  return { overdue: false, soon: remaining <= 1000, text };
}

function renderDashboardMaint(maints, car, fuels = DB.getFuelsForCar(car.id)) {
  const grid = document.getElementById("maintenanceGrid");
  const empty = document.getElementById("maintEmpty");

  // Filter only upcoming or near (not resolved) — sort by ISO date string (no new Date needed)
  const pending = maints
    .filter((m) => !m.resolved)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  if (pending.length === 0) {
    empty.style.display = "block";
    grid.replaceChildren(empty); // preserva o empty state
    return;
  }
  empty.style.display = "none";

  const todayStr = today(); // "YYYY-MM-DD" local, comparável como string
  const in7 = addDays(todayStr, 7);
  const in30 = addDays(todayStr, 30);
  const usage = carUsage(car, fuels);

  const frag = document.createDocumentFragment();
  pending.forEach((m) => {
    let cls = "maint-card--ok";
    let status = "Em dia";
    if (m.date < todayStr) {
      cls = "maint-card--urgent";
      status = "Vencida";
    } else if (m.date <= in7) {
      cls = "maint-card--urgent";
      status = `Vence em ${daysUntil(m.date)}d`;
    } else if (m.date <= in30) {
      cls = "maint-card--upcoming";
      status = `Em ${daysUntil(m.date)} dias`;
    }

    // A KM pode antecipar a urgência (ex.: troca de óleo por quilometragem)
    const kmStatus = maintKmStatus(m, usage);
    if (kmStatus?.overdue && cls !== "maint-card--urgent") {
      cls = "maint-card--urgent";
      status = "KM atingida";
    } else if (kmStatus?.soon && cls === "maint-card--ok") {
      cls = "maint-card--upcoming";
      status = "KM próxima";
    }

    const card = document.createElement("div");
    card.className = `maint-card ${cls}`;
    card.innerHTML = `
      <div class="maint-card__stripe"></div>
      <div class="maint-card__type">${esc(m.type)}</div>
      <div class="maint-card__date">${icon("calendar")} ${fmtDate(m.date)}</div>
      ${
        kmStatus
          ? `<div class="maint-card__km">${icon("gauge")} ${parseInt(m.km).toLocaleString("pt-BR")} km · ${kmStatus.text}</div>`
          : ""
      }
      <div class="maint-card__status">${status}</div>
    `;
    frag.appendChild(card);
  });
  grid.replaceChildren(empty, frag);
}

// Helpers for date string math (no new Date in hot path)
function addDays(isoStr, days) {
  const d = new Date(isoStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return localISO(d);
}
function daysUntil(isoStr) {
  const d = new Date(isoStr + "T00:00:00");
  const now = new Date();
  return Math.ceil((d - now) / 864e5);
}

/* ═══════════════════════════════
   GARAGEM
═══════════════════════════════ */
let editingCarId = null;

function renderGarageScreen() {
  const cars = DB.getCars();
  const list = document.getElementById("carList");
  const emptyEl = document.getElementById("carEmptyState");
  const selectedId = DB.getSelectedCar();

  if (cars.length === 0) {
    list.replaceChildren(emptyEl); // preserva o empty state
    emptyEl.style.display = "flex";
    return;
  }
  emptyEl.style.display = "none";

  const frag = document.createDocumentFragment();
  cars.forEach((car) => {
    const fuels = DB.getFuelsForCar(car.id);
    const avg = calcAvgKml(fuels);
    const card = document.createElement("div");
    card.className = `car-card${car.id === selectedId ? " car-card--selected" : ""}`;
    card.dataset.id = car.id;
    const carId = esc(car.id);
    card.innerHTML = `
      <div class="car-card__avatar">${esc(car.emoji)}</div>
      <div class="car-card__info">
        <div class="car-card__name">${esc(car.name)}</div>
        <div class="car-card__sub">
          ${esc(car.model)} · ${esc(car.year)} · <span class="car-pill">${esc(car.fuel)}</span>
          ${avg !== null ? `· <strong style="color:var(--accent-green)">${fmt(avg)} km/l</strong>` : ""}
        </div>
      </div>
      <div class="car-card__actions">
        <button class="btn btn--ghost btn--sm" data-action="select" data-id="${carId}">Selecionar</button>
        <button class="icon-btn" data-action="edit" data-id="${carId}" title="Editar" aria-label="Editar">${icon("edit")}</button>
        <button class="icon-btn icon-btn--danger" data-action="delete" data-id="${carId}" title="Excluir" aria-label="Excluir">${icon("trash")}</button>
      </div>
    `;
    frag.appendChild(card);
  });
  list.replaceChildren(emptyEl, frag);
}

// Show/hide car form
document.getElementById("btnShowCarForm").addEventListener("click", () => {
  editingCarId = null;
  resetCarForm();
  document.getElementById("carFormTitle").textContent = "Novo veículo";
  document.getElementById("carFormCard").style.display = "block";
  document
    .getElementById("carFormCard")
    .scrollIntoView({ behavior: "smooth", block: "nearest" });
});
document
  .getElementById("btnCloseCarForm")
  .addEventListener("click", hideCarForm);
document.getElementById("btnCancelCar").addEventListener("click", hideCarForm);

function hideCarForm() {
  document.getElementById("carFormCard").style.display = "none";
  editingCarId = null;
  resetCarForm();
}
function resetCarForm() {
  ["carName", "carModel", "carYear", "carPlate", "carOdo"].forEach((id) => {
    document.getElementById(id).value = "";
  });
  document.getElementById("carFuel").value = "flex";
}

document.getElementById("btnSaveCar").addEventListener("click", () => {
  const name = document.getElementById("carName").value.trim();
  const model = document.getElementById("carModel").value.trim();
  const year = parseInt(document.getElementById("carYear").value);
  const plate = document.getElementById("carPlate").value.trim().toUpperCase();
  const fuel = document.getElementById("carFuel").value;
  const odo = parseInt(document.getElementById("carOdo").value) || 0;

  if (!name || !model || !year) {
    showToast("Preencha nome, modelo e ano.", "error");
    return;
  }

  const cars = DB.getCars();

  if (editingCarId) {
    const idx = cars.findIndex((c) => c.id === editingCarId);
    if (idx !== -1) {
      cars[idx] = {
        ...cars[idx],
        name,
        model,
        year,
        plate,
        fuel,
        odometer: odo,
        emoji: carEmoji(fuel),
        updatedAt: Date.now(),
      };
      DB.saveCars(cars);
      showToast("Veículo atualizado!");
    }
  } else {
    const car = {
      id: uid(),
      name,
      model,
      year,
      plate,
      fuel,
      odometer: odo,
      emoji: carEmoji(fuel),
      createdAt: Date.now(),
    };
    cars.push(car);
    DB.saveCars(cars);
    DB.setSelectedCar(car.id);
    showToast("Veículo cadastrado!");
  }

  rebuildCarSelector();
  invalidateCarScreens(); // marca telas dependentes como sujas
  renderGarageScreen();
  hideCarForm();
});

// Car list actions (delegated)
document.getElementById("carList").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;

  if (action === "select") {
    DB.setSelectedCar(id);
    carSel.value = id;
    invalidateCarScreens(); // dashboard, fuel, maintenance precisam atualizar com novo carro
    renderGarageScreen();
    showToast("Veículo selecionado!", "info");
  }

  if (action === "edit") {
    const car = DB.getCars().find((c) => c.id === id);
    if (!car) return;
    editingCarId = id;
    document.getElementById("carName").value = car.name;
    document.getElementById("carModel").value = car.model;
    document.getElementById("carYear").value = car.year;
    document.getElementById("carPlate").value = car.plate || "";
    document.getElementById("carFuel").value = car.fuel;
    document.getElementById("carOdo").value = car.odometer || "";
    document.getElementById("carFormTitle").textContent = "Editar veículo";
    document.getElementById("carFormCard").style.display = "block";
    document
      .getElementById("carFormCard")
      .scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  if (action === "delete") {
    showConfirm(
      "Excluir veículo",
      "Todos os dados de abastecimento e manutenção deste veículo também serão excluídos. Continuar?",
      () => {
        const before = {
          cars: DB.getCars(),
          fuels: DB.getFuels(),
          maints: DB.getMaints(),
          selected: DB.getSelectedCar(),
        };
        const cars = before.cars.filter((c) => c.id !== id);
        DB.saveCars(cars);
        DB.saveFuels(before.fuels.filter((f) => f.carId !== id));
        DB.saveMaints(before.maints.filter((m) => m.carId !== id));

        // Reset selection
        if (before.selected === id) {
          DB.setSelectedCar(cars[0]?.id || null);
        }
        rebuildCarSelector();
        invalidateCarScreens(); // marca telas dependentes como sujas
        renderGarageScreen();
        showUndoToast("Veículo excluído.", () => {
          DB.saveCars(before.cars);
          DB.saveFuels(before.fuels);
          DB.saveMaints(before.maints);
          DB.setSelectedCar(before.selected);
          rebuildCarSelector();
        });
      },
    );
  }
});

/* ═══════════════════════════════
   ABASTECIMENTO
═══════════════════════════════ */
function renderFuelScreen() {
  const car = getSelectedCar();
  const noCar = document.getElementById("fuelNoCar");
  const formWrap = document.getElementById("fuelFormWrap");

  if (!car) {
    noCar.style.display = "flex";
    formWrap.style.display = "none";
    return;
  }
  noCar.style.display = "none";
  formWrap.style.display = "block";

  // Context header
  document.getElementById("fuelCarContext").innerHTML =
    `${esc(car.emoji)} Abastecendo: <strong>${esc(car.name)}</strong> &mdash; ${esc(car.model)} ${esc(car.year)}`;

  // Set today's date
  document.getElementById("fuelDate").value =
    document.getElementById("fuelDate").value || today();

  // Pre-fill odometer with last known
  const fuels = DB.getFuelsForCar(car.id).sort(
    (a, b) => a.odometer - b.odometer,
  );
  if (!document.getElementById("fuelOdo").value && fuels.length > 0) {
    // Leave blank for user to enter current
  }

  renderFuelHistory(car.id, fuels);
}

function renderFuelHistory(carId, fuels) {
  const list = document.getElementById("fuelHistoryList");
  const emptyEl = document.getElementById("fuelHistEmpty");
  const sorted = [...fuels].sort((a, b) => b.odometer - a.odometer); // newest first

  if (sorted.length === 0) {
    list.replaceChildren(emptyEl);
    emptyEl.style.display = "block";
    return;
  }
  emptyEl.style.display = "none";

  const allSorted = [...fuels].sort((a, b) => a.odometer - b.odometer);

  const frag = document.createDocumentFragment();
  sorted.forEach((f) => {
    const ascIdx = allSorted.findIndex((x) => x.id === f.id);
    const prev = ascIdx > 0 ? allSorted[ascIdx - 1] : null;
    const kml = calcKml(prev, f);

    const item = document.createElement("div");
    item.className = "fuel-history-item";
    item.innerHTML = `
      <div class="fuel-history-item__icon">${icon("fuel")}</div>
      <div class="fuel-history-item__info">
        <div class="fuel-history-item__main">
          ${f.liters.toFixed(1)}L — ${fmtDate(f.date)}
          ${f.station ? `<small style="color:var(--text-muted)"> · ${esc(f.station)}</small>` : ""}
        </div>
        <div class="fuel-history-item__sub">
          ${f.odometer.toLocaleString("pt-BR")} km
          ${f.price ? ` · R$ ${fmt(f.price)}/L · Total: R$ ${fmt(f.liters * f.price)}` : ""}
        </div>
      </div>
      <div class="fuel-history-item__kml">
        ${kml !== null ? `${fmt(kml)} <span>km/l</span>` : "<span>—</span>"}
      </div>
      <button class="icon-btn icon-btn--danger" data-action="deletefuel" data-id="${esc(f.id)}" title="Excluir" aria-label="Excluir">${icon("trash")}</button>
    `;
    frag.appendChild(item);
  });
  list.replaceChildren(emptyEl, frag);
}

// Live calculation preview
function updateCalcPreview() {
  const car = getSelectedCar();
  if (!car) return;

  const odo = parseFloat(document.getElementById("fuelOdo").value);
  const liters = parseFloat(document.getElementById("fuelLiters").value);
  const price = parseFloat(document.getElementById("fuelPrice").value);
  const preview = document.getElementById("calcPreview");

  if (!odo || !liters) {
    preview.style.display = "none";
    return;
  }
  preview.style.display = "flex";

  // Find previous fill
  const fuels = DB.getFuelsForCar(car.id).sort(
    (a, b) => a.odometer - b.odometer,
  );
  const prev = fuels.filter((f) => f.odometer < odo).pop();
  const kmDriv = prev ? odo - prev.odometer : null;
  const kml = prev ? (odo - prev.odometer) / liters : null;

  document.getElementById("calcKmDriven").textContent =
    kmDriv !== null ? `${kmDriv.toLocaleString("pt-BR")} km` : "—";
  document.getElementById("calcKml").textContent =
    kml !== null ? `${fmt(kml)} km/l` : "—";
  document.getElementById("calcTotal").textContent =
    price && liters ? `R$ ${fmt(liters * price)}` : "—";
}

["fuelOdo", "fuelLiters", "fuelPrice"].forEach((id) => {
  document.getElementById(id).addEventListener("input", updateCalcPreview);
});

document.getElementById("btnSaveFuel").addEventListener("click", () => {
  const car = getSelectedCar();
  if (!car) {
    showToast("Selecione um veículo.", "error");
    return;
  }

  const date = document.getElementById("fuelDate").value;
  const odo = parseInt(document.getElementById("fuelOdo").value);
  const liters = parseFloat(document.getElementById("fuelLiters").value);
  const price = parseFloat(document.getElementById("fuelPrice").value) || null;
  const station = document.getElementById("fuelStation").value.trim();

  if (!date || !odo || !liters) {
    showToast("Preencha data, KM e litros.", "error");
    return;
  }
  if (liters <= 0) {
    showToast("Litros deve ser maior que 0.", "error");
    return;
  }

  // Validate odometer vs last
  const existingFuels = DB.getFuelsForCar(car.id);
  const lastOdo = Math.max(...existingFuels.map((f) => f.odometer), 0);
  if (odo <= lastOdo && existingFuels.length > 0) {
    showToast(
      `KM deve ser maior que o último (${lastOdo.toLocaleString("pt-BR")} km).`,
      "error",
    );
    return;
  }

  const fuels = DB.getFuels();
  fuels.push({
    id: uid(),
    carId: car.id,
    date,
    odometer: odo,
    liters,
    price,
    station,
    createdAt: Date.now(),
  });
  DB.saveFuels(fuels);

  // Update car odometer
  const cars = DB.getCars();
  const cidx = cars.findIndex((c) => c.id === car.id);
  if (cidx !== -1 && odo > cars[cidx].odometer) {
    cars[cidx].odometer = odo;
    DB.saveCars(cars);
  }

  showToast("Abastecimento registrado!");
  document.getElementById("btnClearFuel").click();
  invalidateFuelScreens(); // dashboard + fuel precisam atualizar
  renderFuelScreen();
});

document.getElementById("btnClearFuel").addEventListener("click", () => {
  ["fuelDate", "fuelOdo", "fuelLiters", "fuelPrice", "fuelStation"].forEach(
    (id) => {
      document.getElementById(id).value = "";
    },
  );
  document.getElementById("fuelDate").value = today();
  document.getElementById("calcPreview").style.display = "none";
});

// Delete fuel (delegated)
document.getElementById("fuelHistoryList").addEventListener("click", (e) => {
  const btn = e.target.closest('[data-action="deletefuel"]');
  if (!btn) return;
  const before = DB.getFuels();
  DB.saveFuels(before.filter((f) => f.id !== btn.dataset.id));
  invalidateFuelScreens(); // dashboard + fuel precisam atualizar
  renderFuelScreen();
  showUndoToast("Abastecimento excluído.", () => {
    DB.saveFuels(before);
  });
});

/* ═══════════════════════════════
   MANUTENÇÃO
═══════════════════════════════ */
function renderMaintScreen() {
  const car = getSelectedCar();
  const noCar = document.getElementById("maintNoCar");
  const list = document.getElementById("maintList");
  const emptyEl = document.getElementById("maintListEmpty");

  if (!car) {
    noCar.style.display = "flex";
    list.style.display = "none";
    return;
  }
  noCar.style.display = "none";
  list.style.display = "block";

  const maints = DB.getMaintsForCar(car.id).sort((a, b) =>
    a.date.localeCompare(b.date),
  ); // ISO string compare

  if (maints.length === 0) {
    list.replaceChildren(emptyEl);
    emptyEl.style.display = "flex";
    return;
  }
  emptyEl.style.display = "none";

  const todayStr = today();
  const in7 = addDays(todayStr, 7);
  const in30 = addDays(todayStr, 30);
  const usage = carUsage(car, DB.getFuelsForCar(car.id));

  const frag = document.createDocumentFragment();
  maints.forEach((m) => {
    let stripeColor = "var(--accent-green)";
    let statusLabel = "Agendado";

    if (m.resolved) {
      stripeColor = "var(--text-muted)";
      statusLabel = "Concluída";
    } else if (m.date < todayStr) {
      stripeColor = "var(--accent-red)";
      statusLabel = "Vencida";
    } else if (m.date <= in7) {
      stripeColor = "var(--accent-red)";
      statusLabel = `Faltam ${daysUntil(m.date)}d`;
    } else if (m.date <= in30) {
      stripeColor = "var(--accent-amber)";
      statusLabel = `Em ${daysUntil(m.date)} dias`;
    }
    const kmStatus = m.resolved ? null : maintKmStatus(m, usage);
    if (kmStatus?.overdue && stripeColor !== "var(--accent-red)") {
      stripeColor = "var(--accent-red)";
      statusLabel = "KM atingida";
    }

    const item = document.createElement("div");
    item.className = "maint-list-item";
    item.innerHTML = `
      <div class="maint-list-item__stripe" style="background:${stripeColor}"></div>
      <div class="maint-list-item__info">
        <div class="maint-list-item__type">${esc(m.type)}</div>
        <div class="maint-list-item__meta">
          ${icon("calendar")} ${fmtDate(m.date)}
          ${m.km ? ` · ${icon("gauge")} ${parseInt(m.km).toLocaleString("pt-BR")} km${kmStatus && !kmStatus.overdue ? ` (${kmStatus.text})` : ""}` : ""}
          · <span style="color:${stripeColor}">${statusLabel}</span>
          ${m.notes ? `<br><small style="color:var(--text-muted)">${esc(m.notes)}</small>` : ""}
        </div>
      </div>
      <div class="maint-list-item__actions">
        ${!m.resolved ? `<button class="btn btn--ghost btn--sm" data-action="resolve" data-id="${esc(m.id)}" title="Marcar como feita" aria-label="Marcar como feita">${icon("check")}</button>` : ""}
        <button class="icon-btn icon-btn--danger" data-action="deletemaint" data-id="${esc(m.id)}" title="Excluir" aria-label="Excluir">${icon("trash")}</button>
      </div>
    `;
    frag.appendChild(item);
  });
  list.replaceChildren(emptyEl, frag);
}

// Show maint form
document.getElementById("btnShowMaintForm").addEventListener("click", () => {
  const car = getSelectedCar();
  if (!car) {
    showToast("Selecione um veículo primeiro.", "error");
    return;
  }
  document.getElementById("maintFormCard").style.display = "block";
  document.getElementById("maintDate").value =
    document.getElementById("maintDate").value || today();
  document
    .getElementById("maintFormCard")
    .scrollIntoView({ behavior: "smooth", block: "nearest" });
});
document
  .getElementById("btnCloseMaintForm")
  .addEventListener("click", hideMaintForm);
document
  .getElementById("btnCancelMaint")
  .addEventListener("click", hideMaintForm);
function hideMaintForm() {
  document.getElementById("maintFormCard").style.display = "none";
  ["maintDate", "maintKm", "maintNotes"].forEach(
    (id) => (document.getElementById(id).value = ""),
  );
  document.getElementById("maintType").value = "Troca de óleo";
  document.getElementById("maintCustomWrap").style.display = "none";
}

// Custom type field
document.getElementById("maintType").addEventListener("change", () => {
  document.getElementById("maintCustomWrap").style.display =
    document.getElementById("maintType").value === "Outro" ? "block" : "none";
});

document.getElementById("btnSaveMaint").addEventListener("click", () => {
  const car = getSelectedCar();
  if (!car) {
    showToast("Selecione um veículo.", "error");
    return;
  }

  let type = document.getElementById("maintType").value;
  const date = document.getElementById("maintDate").value;
  const km = document.getElementById("maintKm").value;
  const notes = document.getElementById("maintNotes").value.trim();

  if (type === "Outro") {
    type = document.getElementById("maintCustom").value.trim();
    if (!type) {
      showToast("Informe a descrição.", "error");
      return;
    }
  }
  if (!date) {
    showToast("Informe a data prevista.", "error");
    return;
  }

  const maints = DB.getMaints();
  maints.push({
    id: uid(),
    carId: car.id,
    type,
    date,
    km: km || null,
    notes,
    resolved: false,
    createdAt: Date.now(),
  });
  DB.saveMaints(maints);

  showToast("Manutenção agendada!");
  hideMaintForm();
  invalidateMaintScreens(); // dashboard + maintenance precisam atualizar
  renderMaintScreen();
});

// Maint list actions (delegated)
document.getElementById("maintList").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;

  if (action === "resolve") {
    const maints = DB.getMaints();
    const idx = maints.findIndex((m) => m.id === id);
    if (idx !== -1) maints[idx].resolved = true;
    DB.saveMaints(maints);
    invalidateMaintScreens(); // dashboard + maintenance precisam atualizar
    renderMaintScreen();
    showToast("Manutenção marcada como concluída!");
  }

  if (action === "deletemaint") {
    const before = DB.getMaints();
    DB.saveMaints(before.filter((m) => m.id !== id));
    invalidateMaintScreens(); // dashboard + maintenance precisam atualizar
    renderMaintScreen();
    showUndoToast("Manutenção excluída.", () => {
      DB.saveMaints(before);
    });
  }
});

/* ═══════════════════════════════════════════════════
   PULL TO REFRESH (mobile) — v2 robusta
   ─────────────────────────────────────────────────
   Princípios:
   1. overscroll-behavior-y:contain (CSS) bloqueia o PTR nativo.
   2. touchstart com {passive:true} — nunca bloqueia scroll normal.
   3. No touchmove, só chama preventDefault() depois de confirmar
      que estamos genuinamente puxando para baixo E o scroll está
      no topo, evitando conflitos com scroll vertical normal.
   4. Resistência logarítmica: o indicador desce ~0.45× mais
      devagar que o dedo e tem um teto de MAX_PULL px.
   5. O indicador usa transform:translateY em vez de `top` para
      evitar reflow; a transição de retorno é ativada via classe.
   6. Um único gatilho por gesto — flag `refreshing` bloqueia tudo.
═══════════════════════════════════════════════════ */

const PTR = (() => {
  /* ── Constantes de física ── */
  const THRESHOLD = 72; // px de puxada para disparar o refresh
  const MAX_PULL = 80; // teto de deslocamento do conteúdo (px)
  const RESISTANCE = 0.45; // fator de atrito (0 = imóvel, 1 = sem atrito)
  const REFRESH_MS = 1500; // duração simulada do fetch

  /* ── Elementos DOM ── */
  const wrapper = document.getElementById("ptrWrapper");
  const indicator = document.getElementById("ptrIndicator");
  const content = document.getElementById("ptrContent");

  // Debug: verifica se elementos existem
  if (!wrapper || !indicator || !content) {
    console.warn(
      "[PTR] Elementos não encontrados - pull-to-refresh desabilitado",
    );
    return { init: () => {} };
  }

  /* ── Estado interno ── */
  let startY = 0;
  let currentPull = 0; // px de deslocamento atual (com resistência)
  let pulling = false;
  let refreshing = false;
  let intentDown = false; // intenção de pull-down confirmada no move

  /* ────────────────────────────────────────────────
     Helpers de UI
  ──────────────────────────────────────────────── */

  /**
   * Move o indicador e o conteúdo sem causar reflow.
   * O indicador segue o conteúdo mas começa oculto acima do topbar.
   * Quando pull >= 16px torna-se visível; quando >= THRESHOLD inverte seta.
   */
  function _applyPull(px) {
    // Conteúdo desliza com resistência
    content.style.transform = `translateY(${px}px)`;

    // Indicador: começa em -80px acima do topbar, sobe junto ao conteúdo
    // Satura em translateY(0) = posição visível logo abaixo do topbar
    const indicatorY = Math.min(px - MAX_PULL, 0); // -80 → 0
    indicator.style.transform = `translateX(-50%) translateY(${indicatorY}px)`;

    // Estados visuais
    if (px >= 16) {
      indicator.style.opacity = Math.min((px - 8) / 32, 1); // fade-in suave
    } else {
      indicator.style.opacity = 0;
    }

    const isReady = px >= THRESHOLD;
    indicator.classList.toggle("ptr-indicator--ready", isReady);
  }

  /** Restaura tudo com transição suave ("snap back"). */
  function _snapBack(targetPx = 0) {
    // Ativa transition apenas no snap; durante o arrasto não há transition
    content.classList.add("ptr-content--snap");
    content.style.transform = `translateY(${targetPx}px)`;

    indicator.style.transition =
      "transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.25s ease";
    indicator.style.transform = `translateX(-50%) translateY(-80px)`;
    indicator.style.opacity = 0;

    // Remove classes e transition após animação
    content.addEventListener("transitionend", _cleanupSnap, { once: true });
  }

  function _cleanupSnap() {
    content.classList.remove("ptr-content--snap");
    content.style.transform = "";
    indicator.style.transition = "";
    indicator.style.transform = "";
    indicator.style.opacity = "";
    indicator.classList.remove(
      "ptr-indicator--ready",
      "ptr-indicator--refreshing",
    );
  }

  /* ────────────────────────────────────────────────
     Handlers de toque
  ──────────────────────────────────────────────── */

  function _onTouchStart(e) {
    // Bloqueia novo gesto enquanto recarrega
    if (refreshing) return;

    // Verifica scroll do container rolável (ptrWrapper)
    if (wrapper.scrollTop > 0) return;

    startY = e.touches[0].clientY;
    currentPull = 0;
    pulling = false; // confirmado apenas no move
    intentDown = false;
  }

  function _onTouchMove(e) {
    if (refreshing) return;

    const touchY = e.touches[0].clientY;
    const rawDelta = touchY - startY;

    // Ignora movimento para cima ou neutro
    if (rawDelta <= 0) {
      // Se já estávamos puxando, cancela
      if (pulling) _cancelPull();
      return;
    }

    // Primeira confirmação de intenção para baixo
    if (!intentDown) {
      // Só ativa se movimento for predominantemente vertical para baixo
      // e o scroll realmente estiver no topo
      if (wrapper.scrollTop > 0) return;
      intentDown = true;
      pulling = true;
    }

    if (!pulling) return;

    /*
     * Chama preventDefault() APENAS aqui, quando temos certeza
     * da intenção de PTR. Isso evita quebrar scroll normal de
     * elementos internos que já fizeram scrollTop > 0 antes.
     */
    e.preventDefault();

    // Física de resistência: sqrt dá uma curva logarítmica suave
    const resistance = RESISTANCE * Math.sqrt(rawDelta / MAX_PULL);
    currentPull = Math.min(rawDelta * resistance, MAX_PULL);

    _applyPull(currentPull);
  }

  function _onTouchEnd(e) {
    // IMPORTANTE: Se refreshing estiver true, NÃO processa o fim do toque
    // Isso evita que um touchend tardio re-dispare o refresh
    if (!pulling || refreshing) {
      // Garante limpeza se estiver pulling mas refreshing iniciou
      if (pulling && refreshing) _cancelPull();
      return;
    }

    pulling = false;
    intentDown = false;

    if (currentPull >= THRESHOLD) {
      _triggerRefresh();
    } else {
      _cancelPull();
    }
  }

  function _onTouchCancel() {
    pulling = false;
    intentDown = false;
    if (!refreshing) _cancelPull();
  }

  function _cancelPull() {
    currentPull = 0;
    _snapBack(0);
  }

  /* ────────────────────────────────────────────────
     Lógica de refresh
  ──────────────────────────────────────────────── */

  function _triggerRefresh() {
    refreshing = true;

    // Trava o conteúdo na posição do indicador visível (snap para cá)
    const holdPx = MAX_PULL * 0.75; // ~60px — indicador fica visível
    content.classList.add("ptr-content--snap");
    content.style.transform = `translateY(${holdPx}px)`;

    indicator.style.transition = "transform 0.25s ease, opacity 0.2s ease";
    indicator.style.transform = `translateX(-50%) translateY(0px)`;
    indicator.style.opacity = "1";
    indicator.classList.remove("ptr-indicator--ready");
    indicator.classList.add("ptr-indicator--refreshing");

    // Remove snap-class após o snap inicial (não deve interferir no spinner)
    content.addEventListener(
      "transitionend",
      () => {
        content.classList.remove("ptr-content--snap");
      },
      { once: true },
    );

    showToast("Atualizando...", "info", 1200);

    // Fetch simulado — substitua por chamada real futura
    // Envolve em try/finally para garantir que _finishRefresh sempre execute
    const timeoutId = setTimeout(() => {
      try {
        ["cars", "fuels", "maints", "selected"].forEach((k) =>
          DB.invalidate(k),
        );
        rebuildCarSelector();
        // Dados relidos do storage: todas as telas ficam desatualizadas
        Object.keys(renderState).forEach(markDirty);
        renderCurrentScreen();
      } catch (err) {
        console.error("[PTR] Erro durante refresh:", err);
      } finally {
        _finishRefresh();
        showToast("Dados atualizados!", "success", 2000);
      }
    }, REFRESH_MS);

    // Safety net: força reset se o refresh demorar demais (ex: página em background)
    setTimeout(() => {
      if (refreshing) {
        console.warn(
          "[PTR] Timeout de segurança ativado - forçando fim do refresh",
        );
        _finishRefresh();
      }
    }, REFRESH_MS + 2000);
  }

  function _finishRefresh() {
    // Evita chamadas duplicadas
    if (!refreshing) return;
    refreshing = false;
    currentPull = 0;

    indicator.classList.remove("ptr-indicator--refreshing");
    _snapBack(0);
  }

  /* ────────────────────────────────────────────────
     Inicialização e gestão de ciclo de vida
  ──────────────────────────────────────────────── */

  let _bound = false;

  function _bind() {
    if (_bound) return;
    /*
     * touchstart: passive:true — nunca bloqueia o scroll nativo.
     * touchmove:  passive:false — necessário para chamar preventDefault()
     *             condicionalmente quando a intenção de PTR é confirmada.
     */
    wrapper.addEventListener("touchstart", _onTouchStart, { passive: true });
    wrapper.addEventListener("touchmove", _onTouchMove, { passive: false });
    wrapper.addEventListener("touchend", _onTouchEnd, { passive: true });
    wrapper.addEventListener("touchcancel", _onTouchCancel, { passive: true });
    _bound = true;
  }

  function _unbind() {
    wrapper.removeEventListener("touchstart", _onTouchStart);
    wrapper.removeEventListener("touchmove", _onTouchMove);
    wrapper.removeEventListener("touchend", _onTouchEnd);
    wrapper.removeEventListener("touchcancel", _onTouchCancel);
    _bound = false;
    _cancelPull();
  }

  function init() {
    if (window.innerWidth <= 768) _bind();

    // Adapta se o utilizador redimensionar (ex: DevTools responsive mode)
    let _resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(_resizeTimer);
      _resizeTimer = setTimeout(() => {
        if (window.innerWidth <= 768) _bind();
        else _unbind();
      }, 150);
    });
  }

  return { init };
})();

/* ═══════════════════════════════
   BACKUP — EXPORTAR / IMPORTAR
   O arquivo importado é tratado como não confiável: cada registro é
   reconstruído campo a campo (só campos conhecidos, tipos e tamanhos
   checados) e registros órfãos são descartados.
═══════════════════════════════ */
const Backup = (() => {
  const FORMAT = "autogest-backup";
  const VERSION = 1;
  const MAX_FILE_BYTES = 5 * 1024 * 1024;
  const MAX_RECORDS = 20000;
  const FUEL_TYPES = ["flex", "gasolina", "etanol", "diesel", "elétrico"];
  const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  // ── Validadores de campo ──
  const str = (v, max, required = false) => {
    if (v === undefined || v === null || v === "") {
      if (required) throw new Error("campo obrigatório ausente");
      return "";
    }
    if (typeof v !== "string") throw new Error("texto inválido");
    const s = v.trim();
    if (s.length > max) throw new Error("texto longo demais");
    if (required && !s) throw new Error("campo obrigatório vazio");
    return s;
  };
  const num = (v, { min = 0, max = 1e9, int = false, optional = false } = {}) => {
    if (optional && (v === undefined || v === null || v === "")) return null;
    const n = typeof v === "string" ? Number(v) : v;
    if (typeof n !== "number" || !Number.isFinite(n)) throw new Error("número inválido");
    if (n < min || n > max) throw new Error("número fora do intervalo");
    return int ? Math.round(n) : n;
  };
  const id = (v) => {
    if (typeof v !== "string" || !ID_RE.test(v)) throw new Error("id inválido");
    return v;
  };
  const date = (v) => {
    if (typeof v !== "string" || !DATE_RE.test(v) || isNaN(Date.parse(v)))
      throw new Error("data inválida");
    return v;
  };
  const ts = (v) => num(v, { min: 0, max: 8.64e15, int: true, optional: true });

  // ── Reconstrução de cada registro (descarta campos desconhecidos) ──
  function cleanCar(c) {
    const fuel = FUEL_TYPES.includes(c.fuel) ? c.fuel : "flex";
    const car = {
      id: id(c.id),
      name: str(c.name, 40, true),
      model: str(c.model, 50, true),
      year: num(c.year, { min: 1900, max: 2100, int: true }),
      plate: str(c.plate, 8).toUpperCase(),
      fuel,
      odometer: num(c.odometer ?? 0, { max: 1e7, int: true }),
      emoji: carEmoji(fuel), // nunca confia no emoji do arquivo
    };
    const createdAt = ts(c.createdAt);
    const updatedAt = ts(c.updatedAt);
    if (createdAt !== null) car.createdAt = createdAt;
    if (updatedAt !== null) car.updatedAt = updatedAt;
    return car;
  }
  function cleanFuel(f) {
    const fuel = {
      id: id(f.id),
      carId: id(f.carId),
      date: date(f.date),
      odometer: num(f.odometer, { min: 1, max: 1e7, int: true }),
      liters: num(f.liters, { min: 0.01, max: 10000 }),
      price: num(f.price, { max: 1000, optional: true }),
      station: str(f.station, 60),
    };
    const createdAt = ts(f.createdAt);
    if (createdAt !== null) fuel.createdAt = createdAt;
    return fuel;
  }
  function cleanMaint(m) {
    const maint = {
      id: id(m.id),
      carId: id(m.carId),
      type: str(m.type, 60, true),
      date: date(m.date),
      km: num(m.km, { max: 1e7, int: true, optional: true }),
      notes: str(m.notes, 500),
      resolved: m.resolved === true,
    };
    const createdAt = ts(m.createdAt);
    if (createdAt !== null) maint.createdAt = createdAt;
    return maint;
  }

  // Valida a lista inteira; um registro inválido invalida o arquivo
  function cleanList(list, cleaner, label) {
    if (!Array.isArray(list)) throw new Error(`"${label}" não é uma lista`);
    if (list.length > MAX_RECORDS) throw new Error(`"${label}" tem registros demais`);
    const seen = new Set();
    return list.map((raw, i) => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw))
        throw new Error(`${label} #${i + 1}: registro inválido`);
      let rec;
      try {
        rec = cleaner(raw);
      } catch (err) {
        throw new Error(`${label} #${i + 1}: ${err.message}`);
      }
      if (seen.has(rec.id)) throw new Error(`${label} #${i + 1}: id repetido`);
      seen.add(rec.id);
      return rec;
    });
  }

  function parseBackup(text) {
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error("o arquivo não é um JSON válido");
    }
    if (!json || json.format !== FORMAT || typeof json.data !== "object" || !json.data)
      throw new Error("o arquivo não é um backup do AutoGest");
    if (json.version !== VERSION)
      throw new Error(`versão de backup não suportada (${String(json.version).slice(0, 10)})`);

    const d = json.data;
    const cars = cleanList(d.cars ?? [], cleanCar, "Veículo");
    const carIds = new Set(cars.map((c) => c.id));
    // Descarta abastecimentos/manutenções de veículos que não existem
    const fuels = cleanList(d.fuels ?? [], cleanFuel, "Abastecimento").filter((f) =>
      carIds.has(f.carId),
    );
    const maints = cleanList(d.maints ?? [], cleanMaint, "Manutenção").filter((m) =>
      carIds.has(m.carId),
    );
    const selected =
      typeof d.selected === "string" && carIds.has(d.selected)
        ? d.selected
        : cars[0]?.id ?? null;

    return { cars, fuels, maints, selected };
  }

  // Grava tudo ou nada: se o localStorage falhar no meio, restaura o anterior
  function writeAll(data) {
    const keys = ["cars", "fuels", "maints", "selected"];
    const previous = keys.map((k) => localStorage.getItem(DB.KEYS[k]));
    try {
      keys.forEach((k) => localStorage.setItem(DB.KEYS[k], JSON.stringify(data[k])));
      localStorage.setItem("ag_seeded", "1"); // não recriar dados de exemplo
    } catch (err) {
      keys.forEach((k, i) => {
        if (previous[i] === null) localStorage.removeItem(DB.KEYS[k]);
        else localStorage.setItem(DB.KEYS[k], previous[i]);
      });
      throw new Error("sem espaço para salvar os dados neste navegador");
    } finally {
      keys.forEach((k) => DB.invalidate(k));
    }
  }

  function refreshAllScreens() {
    rebuildCarSelector();
    Object.keys(renderState).forEach(markDirty);
    renderCurrentScreen();
  }

  function exportData() {
    const payload = {
      format: FORMAT,
      version: VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        cars: DB.getCars(),
        fuels: DB.getFuels(),
        maints: DB.getMaints(),
        selected: DB.getSelectedCar(),
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `autogest-backup-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Backup exportado!");
  }

  async function importFile(file) {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      showToast("Arquivo grande demais (máx. 5 MB).", "error", 4000);
      return;
    }
    let data;
    try {
      data = parseBackup(await file.text());
    } catch (err) {
      showToast(`Backup inválido: ${err.message}.`, "error", 5000);
      return;
    }

    const resumo = `${data.cars.length} veículo(s), ${data.fuels.length} abastecimento(s) e ${data.maints.length} manutenção(ões)`;
    showConfirm(
      "Importar backup?",
      `O backup tem ${resumo}. Os dados atuais deste aparelho serão substituídos.`,
      () => {
        try {
          writeAll(data);
        } catch (err) {
          showToast(`Não foi possível importar: ${err.message}.`, "error", 5000);
          return;
        }
        refreshAllScreens();
        showToast("Backup importado!");
      },
    );
  }

  function init() {
    const input = document.getElementById("importFile");
    document.getElementById("btnExportData").addEventListener("click", exportData);
    document
      .getElementById("btnImportData")
      .addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      const file = input.files[0];
      input.value = ""; // permite escolher o mesmo arquivo de novo
      importFile(file);
    });
  }

  return { init, parseBackup };
})();

/* ═══════════════════════════════
   INIT
═══════════════════════════════ */
function init() {
  // Seed demo data if first run (antes de renderizar qualquer tela)
  if (DB.getCars().length === 0 && !localStorage.getItem("ag_seeded")) {
    seedDemoData();
    localStorage.setItem("ag_seeded", "1");
  }

  rebuildCarSelector();

  // Handle deep linking from PWA manifest shortcuts (e.g., ?screen=fuel)
  const urlParams = new URLSearchParams(window.location.search);
  const initialScreen = urlParams.get("screen");
  const validScreens = ["dashboard", "garage", "fuel", "maintenance"];
  const startScreen = validScreens.includes(initialScreen)
    ? initialScreen
    : "dashboard";

  // Navigate to initial screen (handles rendering)
  navigateTo(startScreen);

  // Initialize pull-to-refresh (gerencia internamente mobile vs desktop)
  PTR.init();

  Backup.init();

  // Tema claro/escuro do sistema mudou: gráficos precisam pegar as novas cores
  window
    .matchMedia("(prefers-color-scheme: light)")
    .addEventListener("change", () => {
      markDirty("dashboard");
      renderCurrentScreen();
    });

  // Pede ao navegador para não apagar o localStorage quando faltar espaço
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persisted().then((ok) => {
      if (!ok) navigator.storage.persist().catch(() => {});
    });
  }
}

function seedDemoData() {
  const carId = uid();
  const cars = [
    {
      id: carId,
      name: "Celta do dia a dia",
      model: "Chevrolet Celta 1.0",
      year: 2018,
      plate: "ABC-1234",
      fuel: "flex",
      odometer: 72500,
      emoji: "🚗",
      createdAt: Date.now(),
    },
  ];
  DB.saveCars(cars);
  DB.setSelectedCar(carId);

  const fuels = [
    {
      id: uid(),
      carId,
      date: "2025-01-15",
      odometer: 68000,
      liters: 42,
      price: 5.69,
      station: "Posto Shell",
      createdAt: Date.now(),
    },
    {
      id: uid(),
      carId,
      date: "2025-02-10",
      odometer: 68520,
      liters: 40,
      price: 5.79,
      station: "Posto BR",
      createdAt: Date.now(),
    },
    {
      id: uid(),
      carId,
      date: "2025-03-05",
      odometer: 69100,
      liters: 41,
      price: 5.89,
      station: "Posto Ipiranga",
      createdAt: Date.now(),
    },
    {
      id: uid(),
      carId,
      date: "2025-04-18",
      odometer: 69650,
      liters: 39,
      price: 5.95,
      station: "Posto Shell",
      createdAt: Date.now(),
    },
    {
      id: uid(),
      carId,
      date: "2025-05-22",
      odometer: 70220,
      liters: 40,
      price: 6.09,
      station: "",
      createdAt: Date.now(),
    },
    {
      id: uid(),
      carId,
      date: "2025-06-30",
      odometer: 70800,
      liters: 41,
      price: 6.19,
      station: "Posto Ale",
      createdAt: Date.now(),
    },
    {
      id: uid(),
      carId,
      date: "2025-07-25",
      odometer: 71400,
      liters: 40,
      price: 6.15,
      station: "",
      createdAt: Date.now(),
    },
    {
      id: uid(),
      carId,
      date: "2025-08-10",
      odometer: 72000,
      liters: 42,
      price: 6.09,
      station: "Posto BR",
      createdAt: Date.now(),
    },
  ];
  DB.saveFuels(fuels);

  const now = new Date();
  const inFiveDays = new Date(now);
  inFiveDays.setDate(now.getDate() + 5);
  const inTwentyDays = new Date(now);
  inTwentyDays.setDate(now.getDate() + 20);
  const overdue = new Date(now);
  overdue.setDate(now.getDate() - 3);

  const maints = [
    {
      id: uid(),
      carId,
      type: "Troca de óleo",
      date: localISO(inFiveDays),
      km: "73000",
      notes: "Usar óleo 5W30 semissintético",
      resolved: false,
      createdAt: Date.now(),
    },
    {
      id: uid(),
      carId,
      type: "Alinhamento/Balanceamento",
      date: localISO(inTwentyDays),
      km: "75000",
      notes: "",
      resolved: false,
      createdAt: Date.now(),
    },
    {
      id: uid(),
      carId,
      type: "Revisão geral",
      date: localISO(overdue),
      km: "72000",
      notes: "Verificar freios traseiros",
      resolved: false,
      createdAt: Date.now(),
    },
  ];
  DB.saveMaints(maints);
}

// Service Worker Registration (PWA)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[PWA] Service Worker registrado:", reg.scope);
        // Verifica updates periodicamente
        setInterval(() => reg.update(), 1000 * 60 * 60); // a cada 1h

        // Notificar usuário quando houver update
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              showToast(
                "Nova versão disponível. Recarregue para atualizar.",
                "info",
                10000,
              );
            }
          });
        });
      })
      .catch((err) => console.warn("[PWA] Falha ao registrar SW:", err));
  });
}

// Start!
init();
