/* ═══════════════════════════════════════════════════
   AUTOGEST — app.js
   Autor: Gabriel (AutoGest v1.0)
   Lógica: Garagem, Abastecimento, Manutenção, Dashboard
   Persistência: localStorage
   ═══════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════
   STORAGE LAYER — COM CACHE EM MEMÓRIA
═══════════════════════════════ */
const DB = {
  KEYS: { cars: 'ag_cars', fuels: 'ag_fuels', maints: 'ag_maints', selected: 'ag_selected' },

  // Cache em memória para evitar JSON.parse repetido
  _cache: { cars: null, fuels: null, maints: null, selected: null },
  _loaded: { cars: false, fuels: false, maints: false, selected: false },

  _load(key) {
    if (this._loaded[key]) return this._cache[key];
    try {
      const val = JSON.parse(localStorage.getItem(this.KEYS[key])) || (key === 'selected' ? null : []);
      this._cache[key] = val;
      this._loaded[key] = true;
      return val;
    } catch {
      this._cache[key] = key === 'selected' ? null : [];
      this._loaded[key] = true;
      return this._cache[key];
    }
  },

  _save(key, val) {
    try {
      localStorage.setItem(this.KEYS[key], JSON.stringify(val));
      this._cache[key] = val;
    } catch { showToast('Erro ao salvar dados.', 'error'); }
  },

  invalidate(key) { this._loaded[key] = false; },

  getCars()    { return this._load('cars'); },
  saveCars(d)  { this._save('cars', d); },
  getFuels()   { return this._load('fuels'); },
  saveFuels(d) { this._save('fuels', d); },
  getMaints()  { return this._load('maints'); },
  saveMaints(d){ this._save('maints', d); },

  getSelectedCar()  { return this._load('selected'); },
  setSelectedCar(id){ this._save('selected', id); },

  getFuelsForCar(cid)  { return this.getFuels().filter(f => f.carId === cid); },
  getMaintsForCar(cid) { return this.getMaints().filter(m => m.carId === cid); },
};

/* ═══════════════════════════════
   UTILITIES
═══════════════════════════════ */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function fmt(n, dec = 2) {
  return typeof n === 'number' && !isNaN(n) ? n.toFixed(dec) : '—';
}
function fmtDate(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}
function today() {
  return new Date().toISOString().split('T')[0];
}
function carEmoji(fuel) {
  const map = { flex: '🚗', gasolina: '🏎️', etanol: '🌿', diesel: '🚛', elétrico: '⚡' };
  return map[fuel] || '🚙';
}

/* ═══════════════════════════════
   TOAST NOTIFICATIONS
═══════════════════════════════ */
function showToast(msg, type = 'success', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'slideOut .25s ease forwards';
    t.addEventListener('animationend', () => t.remove());
  }, duration);
}

/* ═══════════════════════════════
   CONFIRM MODAL
═══════════════════════════════ */
let _confirmCb = null;
function showConfirm(title, message, cb) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMessage').textContent = message;
  document.getElementById('modalOverlay').style.display = 'flex';
  _confirmCb = cb;
}
document.getElementById('modalConfirm').addEventListener('click', () => {
  document.getElementById('modalOverlay').style.display = 'none';
  if (_confirmCb) _confirmCb();
  _confirmCb = null;
});
document.getElementById('modalCancel').addEventListener('click', () => {
  document.getElementById('modalOverlay').style.display = 'none';
  _confirmCb = null;
});

/* ═══════════════════════════════
   NAVIGATION — SCREEN SWITCHING
═══════════════════════════════ */
const SCREEN_TITLES = {
  dashboard:   'Dashboard',
  garage:      'Garagem',
  fuel:        'Abastecimento',
  maintenance: 'Manutenções',
};
let currentScreen = 'dashboard';
let lastScreenEl = null; // cache reference to last active screen

function navigateTo(screenId) {
  if (currentScreen === screenId) return;
  currentScreen = screenId;

  // Screens - use cached reference for instant toggle
  if (lastScreenEl) lastScreenEl.classList.remove('active');
  const target = document.getElementById(`screen-${screenId}`);
  if (target) {
    target.classList.add('active');
    lastScreenEl = target;
  }

  // Nav items (sidebar + bottom) - cached selectors
  if (!navigateTo.navItems) {
    navigateTo.navItems = document.querySelectorAll('.nav-item, .bnav-item');
  }
  navigateTo.navItems.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === screenId);
  });

  // Topbar title
  document.getElementById('topbarTitle').textContent = SCREEN_TITLES[screenId] || screenId;

  // Render relevant screen
  if (screenId === 'dashboard')   renderDashboard();
  if (screenId === 'fuel')        renderFuelScreen();
  if (screenId === 'maintenance') renderMaintScreen();
  if (screenId === 'garage')      renderGarageScreen();

  // Close sidebar on mobile - Desativado para PWA (sem menu sanduíche)
  // closeSidebar();
}

// Wire nav buttons (delegated)
document.body.addEventListener('click', e => {
  const btn = e.target.closest('[data-screen]');
  if (btn) navigateTo(btn.dataset.screen);
});

/* ═══════════════════════════════
   SIDEBAR TOGGLE (mobile) — DESATIVADO PARA PWA
   Menu hambúrguer removido, apenas bottom nav
═══════════════════════════════ */
const sidebar = document.getElementById('sidebar');
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
const carSel = document.getElementById('carSelector');

function rebuildCarSelector() {
  const cars = DB.getCars();
  const selectedId = DB.getSelectedCar();
  carSel.innerHTML = '';

  if (cars.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Nenhum veículo';
    carSel.appendChild(opt);
    return;
  }

  cars.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.emoji} ${c.name}`;
    if (c.id === selectedId) opt.selected = true;
    carSel.appendChild(opt);
  });

  // Auto-select first if none saved
  if (!selectedId || !cars.find(c => c.id === selectedId)) {
    DB.setSelectedCar(cars[0].id);
    carSel.value = cars[0].id;
  }
}

carSel.addEventListener('change', () => {
  DB.setSelectedCar(carSel.value);
  renderCurrentScreen();
});

function getSelectedCar() {
  const id = DB.getSelectedCar() || carSel.value;
  return DB.getCars().find(c => c.id === id) || null;
}

function renderCurrentScreen() {
  if (currentScreen === 'dashboard')   renderDashboard();
  if (currentScreen === 'fuel')        renderFuelScreen();
  if (currentScreen === 'maintenance') renderMaintScreen();
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

function renderChart(fuels) {
  const canvas  = document.getElementById('consumoChart');
  const empty   = document.getElementById('chartEmpty');
  const sorted  = [...fuels].sort((a, b) => a.odometer - b.odometer);

  if (sorted.length < 2) {
    canvas.style.display = 'none';
    empty.style.display  = 'flex';
    if (consumoChart) { consumoChart.destroy(); consumoChart = null; }
    return;
  }

  canvas.style.display = 'block';
  empty.style.display  = 'none';

  // Build data: KML per fill-up
  const labels = [];
  const data   = [];
  for (let i = 1; i < sorted.length; i++) {
    const kml = calcKml(sorted[i - 1], sorted[i]);
    if (kml !== null) {
      labels.push(`${sorted[i].odometer.toLocaleString('pt-BR')} km`);
      data.push(parseFloat(kml.toFixed(2)));
    }
  }

  if (consumoChart) consumoChart.destroy();

  consumoChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'km/l',
        data,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59,130,246,.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#3B82F6',
        tension: .35,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1D2F42',
          borderColor: '#243650',
          borderWidth: 1,
          titleColor: '#94A3B8',
          bodyColor: '#E2E8F0',
          callbacks: {
            label: ctx => ` ${ctx.parsed.y} km/l`,
          }
        },
      },
      scales: {
        x: {
          ticks: { color: '#4B6280', font: { size: 10 }, maxTicksLimit: 6 },
          grid: { color: 'rgba(255,255,255,.04)' },
        },
        y: {
          ticks: { color: '#4B6280', font: { size: 10 }, callback: v => `${v}` },
          grid: { color: 'rgba(255,255,255,.04)' },
        },
      }
    }
  });
}

/* ═══════════════════════════════
   DASHBOARD RENDER
═══════════════════════════════ */
function renderDashboard() {
  const cars = DB.getCars();
  const emptyState  = document.getElementById('dashEmptyState');
  const dashContent = document.getElementById('dashContent');

  if (cars.length === 0) {
    emptyState.style.display  = 'flex';
    dashContent.style.display = 'none';
    return;
  }
  emptyState.style.display  = 'none';
  dashContent.style.display = 'block';

  const car = getSelectedCar();
  if (!car) return;

  const fuels  = DB.getFuelsForCar(car.id)
    .sort((a, b) => a.odometer - b.odometer);
  const maints = DB.getMaintsForCar(car.id);

  // KPIs
  const avg = calcAvgKml(fuels);
  document.getElementById('kpiAvgKml').innerHTML =
    avg !== null ? `${fmt(avg)} <span class="kpi-unit">km/l</span>` : `— <span class="kpi-unit">km/l</span>`;
  document.getElementById('kpiRefills').textContent =
    `${fuels.length} abastecimento${fuels.length !== 1 ? 's' : ''} registrado${fuels.length !== 1 ? 's' : ''}`;

  const lastFuel = fuels[fuels.length - 1];
  document.getElementById('kpiLastOdo').textContent =
    lastFuel ? lastFuel.odometer.toLocaleString('pt-BR') : car.odometer.toLocaleString('pt-BR');
  document.getElementById('kpiLastFuel').textContent =
    lastFuel ? `${fmt(lastFuel.liters, 1)}L` : '—';
  document.getElementById('kpiLastDate').textContent =
    lastFuel ? fmtDate(lastFuel.date) : '—';

  // Chart
  renderChart(fuels);

  // Maintenance cards
  renderDashboardMaint(maints, car);
}

function renderDashboardMaint(maints, car) {
  const grid  = document.getElementById('maintenanceGrid');
  const empty = document.getElementById('maintEmpty');

  // Filter only upcoming or near (not resolved) — sort by ISO date string (no new Date needed)
  const pending = maints.filter(m => !m.resolved)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  if (pending.length === 0) {
    empty.style.display = 'block';
    grid.innerHTML = ''; // single DOM operation
    return;
  }
  empty.style.display = 'none';

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0]; // 'YYYY-MM-DD' string compare

  const frag = document.createDocumentFragment();
  pending.forEach(m => {
    let cls = 'maint-card--ok';
    let status = 'Em dia';
    // Compare ISO date strings directly (no new Date in loop)
    if (m.date < todayStr) {
      // Vencida
      const d = new Date(m.date + 'T00:00:00'); // only compute diff when needed
      const diff = Math.ceil((d - now) / 864e5);
      cls = 'maint-card--urgent';
      status = diff < 0 ? 'Vencida' : `Vence em ${diff}d`;
    } else if (m.date <= addDays(todayStr, 7)) {
      cls = 'maint-card--urgent';
      status = `Vence em ${daysUntil(m.date)}d`;
    } else if (m.date <= addDays(todayStr, 30)) {
      cls = 'maint-card--upcoming';
      status = `Em ${daysUntil(m.date)} dias`;
    }

    const card = document.createElement('div');
    card.className = `maint-card ${cls}`;
    card.innerHTML = `
      <div class="maint-card__stripe"></div>
      <div class="maint-card__type">${m.type}</div>
      <div class="maint-card__date">📅 ${fmtDate(m.date)}</div>
      ${m.km ? `<div class="maint-card__km">🔢 ${parseInt(m.km).toLocaleString('pt-BR')} km</div>` : ''}
      <div class="maint-card__status">${status}</div>
    `;
    frag.appendChild(card);
  });
  grid.innerHTML = '';
  grid.appendChild(frag);
}

// Helpers for date string math (no new Date in hot path)
function addDays(isoStr, days) {
  const d = new Date(isoStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
function daysUntil(isoStr) {
  const d = new Date(isoStr + 'T00:00:00');
  const now = new Date();
  return Math.ceil((d - now) / 864e5);
}

/* ═══════════════════════════════
   GARAGEM
═══════════════════════════════ */
let editingCarId = null;

function renderGarageScreen() {
  const cars     = DB.getCars();
  const list     = document.getElementById('carList');
  const emptyEl  = document.getElementById('carEmptyState');
  const selectedId = DB.getSelectedCar();

  if (cars.length === 0) {
    list.innerHTML = ''; // single DOM operation
    emptyEl.style.display = 'flex';
    return;
  }
  emptyEl.style.display = 'none';

  const frag = document.createDocumentFragment();
  cars.forEach(car => {
    const fuels = DB.getFuelsForCar(car.id);
    const avg   = calcAvgKml(fuels);
    const card  = document.createElement('div');
    card.className = `car-card${car.id === selectedId ? ' car-card--selected' : ''}`;
    card.dataset.id = car.id;
    card.innerHTML = `
      <div class="car-card__avatar">${car.emoji}</div>
      <div class="car-card__info">
        <div class="car-card__name">${car.name}</div>
        <div class="car-card__sub">
          ${car.model} · ${car.year} · <span class="car-pill">${car.fuel}</span>
          ${avg !== null ? `· <strong style="color:var(--accent-green)">${fmt(avg)} km/l</strong>` : ''}
        </div>
      </div>
      <div class="car-card__actions">
        <button class="btn btn--ghost btn--sm" data-action="select" data-id="${car.id}">Selecionar</button>
        <button class="icon-btn" data-action="edit" data-id="${car.id}" title="Editar">✏️</button>
        <button class="icon-btn" data-action="delete" data-id="${car.id}" title="Excluir">🗑️</button>
      </div>
    `;
    frag.appendChild(card);
  });
  list.innerHTML = '';
  list.appendChild(frag);
}

// Show/hide car form
document.getElementById('btnShowCarForm').addEventListener('click', () => {
  editingCarId = null;
  resetCarForm();
  document.getElementById('carFormTitle').textContent = 'Novo veículo';
  document.getElementById('carFormCard').style.display = 'block';
  document.getElementById('carFormCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
document.getElementById('btnCloseCarForm').addEventListener('click', hideCarForm);
document.getElementById('btnCancelCar').addEventListener('click', hideCarForm);

function hideCarForm() {
  document.getElementById('carFormCard').style.display = 'none';
  editingCarId = null;
  resetCarForm();
}
function resetCarForm() {
  ['carName','carModel','carYear','carPlate','carOdo'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('carFuel').value = 'flex';
}

document.getElementById('btnSaveCar').addEventListener('click', () => {
  const name  = document.getElementById('carName').value.trim();
  const model = document.getElementById('carModel').value.trim();
  const year  = parseInt(document.getElementById('carYear').value);
  const plate = document.getElementById('carPlate').value.trim().toUpperCase();
  const fuel  = document.getElementById('carFuel').value;
  const odo   = parseInt(document.getElementById('carOdo').value) || 0;

  if (!name || !model || !year) {
    showToast('Preencha nome, modelo e ano.', 'error');
    return;
  }

  const cars = DB.getCars();

  if (editingCarId) {
    const idx = cars.findIndex(c => c.id === editingCarId);
    if (idx !== -1) {
      cars[idx] = { ...cars[idx], name, model, year, plate, fuel, odometer: odo,
        emoji: carEmoji(fuel), updatedAt: Date.now() };
      DB.saveCars(cars);
      showToast('Veículo atualizado!');
    }
  } else {
    const car = { id: uid(), name, model, year, plate, fuel,
      odometer: odo, emoji: carEmoji(fuel), createdAt: Date.now() };
    cars.push(car);
    DB.saveCars(cars);
    DB.setSelectedCar(car.id);
    showToast('Veículo cadastrado!');
  }

  rebuildCarSelector();
  renderGarageScreen();
  hideCarForm();
});

// Car list actions (delegated)
document.getElementById('carList').addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;

  if (action === 'select') {
    DB.setSelectedCar(id);
    carSel.value = id;
    renderGarageScreen();
    showToast('Veículo selecionado!', 'info');
  }

  if (action === 'edit') {
    const car = DB.getCars().find(c => c.id === id);
    if (!car) return;
    editingCarId = id;
    document.getElementById('carName').value  = car.name;
    document.getElementById('carModel').value = car.model;
    document.getElementById('carYear').value  = car.year;
    document.getElementById('carPlate').value = car.plate || '';
    document.getElementById('carFuel').value  = car.fuel;
    document.getElementById('carOdo').value   = car.odometer || '';
    document.getElementById('carFormTitle').textContent = 'Editar veículo';
    document.getElementById('carFormCard').style.display = 'block';
    document.getElementById('carFormCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  if (action === 'delete') {
    showConfirm('Excluir veículo', 'Todos os dados de abastecimento e manutenção deste veículo também serão excluídos. Continuar?', () => {
      let cars  = DB.getCars().filter(c => c.id !== id);
      let fuels = DB.getFuels().filter(f => f.carId !== id);
      let maints= DB.getMaints().filter(m => m.carId !== id);
      DB.saveCars(cars);
      DB.saveFuels(fuels);
      DB.saveMaints(maints);

      // Reset selection
      if (DB.getSelectedCar() === id) {
        DB.setSelectedCar(cars[0]?.id || null);
      }
      rebuildCarSelector();
      renderGarageScreen();
      showToast('Veículo excluído.', 'info');
    });
  }
});

/* ═══════════════════════════════
   ABASTECIMENTO
═══════════════════════════════ */
function renderFuelScreen() {
  const car      = getSelectedCar();
  const noCar    = document.getElementById('fuelNoCar');
  const formWrap = document.getElementById('fuelFormWrap');

  if (!car) {
    noCar.style.display    = 'flex';
    formWrap.style.display = 'none';
    return;
  }
  noCar.style.display    = 'none';
  formWrap.style.display = 'block';

  // Context header
  document.getElementById('fuelCarContext').innerHTML =
    `${car.emoji} Abastecendo: <strong>${car.name}</strong> &mdash; ${car.model} ${car.year}`;

  // Set today's date
  document.getElementById('fuelDate').value = document.getElementById('fuelDate').value || today();

  // Pre-fill odometer with last known
  const fuels = DB.getFuelsForCar(car.id).sort((a,b) => a.odometer - b.odometer);
  if (!document.getElementById('fuelOdo').value && fuels.length > 0) {
    // Leave blank for user to enter current
  }

  renderFuelHistory(car.id, fuels);
}

function renderFuelHistory(carId, fuels) {
  const list      = document.getElementById('fuelHistoryList');
  const emptyEl   = document.getElementById('fuelHistEmpty');
  const sorted    = [...fuels].sort((a,b) => b.odometer - a.odometer); // newest first

  if (sorted.length === 0) {
    list.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }
  emptyEl.style.display = 'none';

  const allSorted = [...fuels].sort((a,b) => a.odometer - b.odometer);

  const frag = document.createDocumentFragment();
  sorted.forEach(f => {
    const ascIdx = allSorted.findIndex(x => x.id === f.id);
    const prev   = ascIdx > 0 ? allSorted[ascIdx - 1] : null;
    const kml    = calcKml(prev, f);

    const item = document.createElement('div');
    item.className = 'fuel-history-item';
    item.innerHTML = `
      <div class="fuel-history-item__icon">⛽</div>
      <div class="fuel-history-item__info">
        <div class="fuel-history-item__main">
          ${f.liters.toFixed(1)}L — ${fmtDate(f.date)}
          ${f.station ? `<small style="color:var(--text-muted)"> · ${f.station}</small>` : ''}
        </div>
        <div class="fuel-history-item__sub">
          ${f.odometer.toLocaleString('pt-BR')} km
          ${f.price ? ` · R$ ${fmt(f.price)}/L · Total: R$ ${fmt(f.liters * f.price)}` : ''}
        </div>
      </div>
      <div class="fuel-history-item__kml">
        ${kml !== null ? `${fmt(kml)} <span>km/l</span>` : '<span>—</span>'}
      </div>
      <button class="icon-btn" data-action="deletefuel" data-id="${f.id}" title="Excluir">🗑️</button>
    `;
    frag.appendChild(item);
  });
  list.innerHTML = '';
  list.appendChild(frag);
}

// Live calculation preview
function updateCalcPreview() {
  const car = getSelectedCar();
  if (!car) return;

  const odo    = parseFloat(document.getElementById('fuelOdo').value);
  const liters = parseFloat(document.getElementById('fuelLiters').value);
  const price  = parseFloat(document.getElementById('fuelPrice').value);
  const preview = document.getElementById('calcPreview');

  if (!odo || !liters) {
    preview.style.display = 'none';
    return;
  }
  preview.style.display = 'flex';

  // Find previous fill
  const fuels  = DB.getFuelsForCar(car.id).sort((a,b) => a.odometer - b.odometer);
  const prev   = fuels.filter(f => f.odometer < odo).pop();
  const kmDriv = prev ? (odo - prev.odometer) : null;
  const kml    = prev ? ((odo - prev.odometer) / liters) : null;

  document.getElementById('calcKmDriven').textContent =
    kmDriv !== null ? `${kmDriv.toLocaleString('pt-BR')} km` : '—';
  document.getElementById('calcKml').textContent =
    kml !== null ? `${fmt(kml)} km/l` : '—';
  document.getElementById('calcTotal').textContent =
    price && liters ? `R$ ${fmt(liters * price)}` : '—';
}

['fuelOdo','fuelLiters','fuelPrice'].forEach(id => {
  document.getElementById(id).addEventListener('input', updateCalcPreview);
});

document.getElementById('btnSaveFuel').addEventListener('click', () => {
  const car = getSelectedCar();
  if (!car) { showToast('Selecione um veículo.', 'error'); return; }

  const date   = document.getElementById('fuelDate').value;
  const odo    = parseInt(document.getElementById('fuelOdo').value);
  const liters = parseFloat(document.getElementById('fuelLiters').value);
  const price  = parseFloat(document.getElementById('fuelPrice').value) || null;
  const station= document.getElementById('fuelStation').value.trim();

  if (!date || !odo || !liters) {
    showToast('Preencha data, KM e litros.', 'error');
    return;
  }
  if (liters <= 0) { showToast('Litros deve ser maior que 0.', 'error'); return; }

  // Validate odometer vs last
  const existingFuels = DB.getFuelsForCar(car.id);
  const lastOdo = Math.max(...existingFuels.map(f => f.odometer), 0);
  if (odo <= lastOdo && existingFuels.length > 0) {
    showToast(`KM deve ser maior que o último (${lastOdo.toLocaleString('pt-BR')} km).`, 'error');
    return;
  }

  const fuels = DB.getFuels();
  fuels.push({ id: uid(), carId: car.id, date, odometer: odo, liters, price, station, createdAt: Date.now() });
  DB.saveFuels(fuels);

  // Update car odometer
  const cars = DB.getCars();
  const cidx = cars.findIndex(c => c.id === car.id);
  if (cidx !== -1 && odo > cars[cidx].odometer) {
    cars[cidx].odometer = odo;
    DB.saveCars(cars);
  }

  showToast('Abastecimento registrado!');
  document.getElementById('btnClearFuel').click();
  renderFuelScreen();
});

document.getElementById('btnClearFuel').addEventListener('click', () => {
  ['fuelDate','fuelOdo','fuelLiters','fuelPrice','fuelStation'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('fuelDate').value = today();
  document.getElementById('calcPreview').style.display = 'none';
});

// Delete fuel (delegated)
document.getElementById('fuelHistoryList').addEventListener('click', e => {
  const btn = e.target.closest('[data-action="deletefuel"]');
  if (!btn) return;
  showConfirm('Excluir abastecimento', 'Isso irá remover este registro permanentemente.', () => {
    const fuels = DB.getFuels().filter(f => f.id !== btn.dataset.id);
    DB.saveFuels(fuels);
    renderFuelScreen();
    showToast('Registro excluído.', 'info');
  });
});

/* ═══════════════════════════════
   MANUTENÇÃO
═══════════════════════════════ */
function renderMaintScreen() {
  const car    = getSelectedCar();
  const noCar  = document.getElementById('maintNoCar');
  const list   = document.getElementById('maintList');
  const emptyEl= document.getElementById('maintListEmpty');

  if (!car) {
    noCar.style.display = 'flex';
    list.style.display  = 'none';
    return;
  }
  noCar.style.display = 'none';
  list.style.display  = 'block';

  const maints = DB.getMaintsForCar(car.id)
    .sort((a,b) => a.date.localeCompare(b.date)); // ISO string compare

  if (maints.length === 0) {
    list.innerHTML = '';
    emptyEl.style.display = 'flex';
    return;
  }
  emptyEl.style.display = 'none';

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const in7 = addDays(todayStr, 7);
  const in30 = addDays(todayStr, 30);

  const frag = document.createDocumentFragment();
  maints.forEach(m => {
    let stripeColor = 'var(--accent-green)';
    let statusLabel = 'Agendado';

    if (m.resolved) {
      stripeColor = 'var(--text-muted)';
      statusLabel = '✔ Concluído';
    } else if (m.date < todayStr) {
      stripeColor = 'var(--accent-red)';
      statusLabel = '⚠ Vencida';
    } else if (m.date <= in7) {
      stripeColor = 'var(--accent-red)';
      statusLabel = `Faltam ${daysUntil(m.date)}d`;
    } else if (m.date <= in30) {
      stripeColor = 'var(--accent-amber)';
      statusLabel = `Em ${daysUntil(m.date)} dias`;
    }

    const item = document.createElement('div');
    item.className = 'maint-list-item';
    item.innerHTML = `
      <div class="maint-list-item__stripe" style="background:${stripeColor}"></div>
      <div class="maint-list-item__info">
        <div class="maint-list-item__type">${m.type}</div>
        <div class="maint-list-item__meta">
          📅 ${fmtDate(m.date)}
          ${m.km ? ` · 🔢 ${parseInt(m.km).toLocaleString('pt-BR')} km` : ''}
          · <span style="color:${stripeColor}">${statusLabel}</span>
          ${m.notes ? `<br><small style="color:var(--text-muted)">${m.notes}</small>` : ''}
        </div>
      </div>
      <div class="maint-list-item__actions">
        ${!m.resolved ? `<button class="btn btn--ghost btn--sm" data-action="resolve" data-id="${m.id}">✔</button>` : ''}
        <button class="icon-btn" data-action="deletemaint" data-id="${m.id}" title="Excluir">🗑️</button>
      </div>
    `;
    frag.appendChild(item);
  });
  list.innerHTML = '';
  list.appendChild(frag);
}

// Show maint form
document.getElementById('btnShowMaintForm').addEventListener('click', () => {
  const car = getSelectedCar();
  if (!car) { showToast('Selecione um veículo primeiro.', 'error'); return; }
  document.getElementById('maintFormCard').style.display = 'block';
  document.getElementById('maintDate').value = document.getElementById('maintDate').value || today();
  document.getElementById('maintFormCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
document.getElementById('btnCloseMaintForm').addEventListener('click', hideMaintForm);
document.getElementById('btnCancelMaint').addEventListener('click', hideMaintForm);
function hideMaintForm() {
  document.getElementById('maintFormCard').style.display = 'none';
  ['maintDate','maintKm','maintNotes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('maintType').value = 'Troca de óleo';
  document.getElementById('maintCustomWrap').style.display = 'none';
}

// Custom type field
document.getElementById('maintType').addEventListener('change', () => {
  document.getElementById('maintCustomWrap').style.display =
    document.getElementById('maintType').value === 'Outro' ? 'block' : 'none';
});

document.getElementById('btnSaveMaint').addEventListener('click', () => {
  const car  = getSelectedCar();
  if (!car) { showToast('Selecione um veículo.', 'error'); return; }

  let type   = document.getElementById('maintType').value;
  const date = document.getElementById('maintDate').value;
  const km   = document.getElementById('maintKm').value;
  const notes= document.getElementById('maintNotes').value.trim();

  if (type === 'Outro') {
    type = document.getElementById('maintCustom').value.trim();
    if (!type) { showToast('Informe a descrição.', 'error'); return; }
  }
  if (!date) { showToast('Informe a data prevista.', 'error'); return; }

  const maints = DB.getMaints();
  maints.push({
    id: uid(), carId: car.id, type, date, km: km || null, notes, resolved: false, createdAt: Date.now()
  });
  DB.saveMaints(maints);

  showToast('Manutenção agendada!');
  hideMaintForm();
  renderMaintScreen();
});

// Maint list actions (delegated)
document.getElementById('maintList').addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;

  if (action === 'resolve') {
    const maints = DB.getMaints();
    const idx = maints.findIndex(m => m.id === id);
    if (idx !== -1) maints[idx].resolved = true;
    DB.saveMaints(maints);
    renderMaintScreen();
    showToast('Manutenção marcada como concluída!');
  }

  if (action === 'deletemaint') {
    showConfirm('Excluir manutenção', 'Remover este agendamento permanentemente?', () => {
      const maints = DB.getMaints().filter(m => m.id !== id);
      DB.saveMaints(maints);
      renderMaintScreen();
      showToast('Manutenção removida.', 'info');
    });
  }
});

/* ═══════════════════════════════
   INIT
═══════════════════════════════ */
function init() {
  rebuildCarSelector();
  renderDashboard();

  // Seed demo data if first run
  if (DB.getCars().length === 0 && !localStorage.getItem('ag_seeded')) {
    seedDemoData();
    localStorage.setItem('ag_seeded', '1');
  }
}

function seedDemoData() {
  const carId = uid();
  const cars = [{
    id: carId, name: 'Celta do dia a dia', model: 'Chevrolet Celta 1.0',
    year: 2018, plate: 'ABC-1234', fuel: 'flex',
    odometer: 72500, emoji: '🚗', createdAt: Date.now()
  }];
  DB.saveCars(cars);
  DB.setSelectedCar(carId);

  const fuels = [
    { id: uid(), carId, date: '2025-01-15', odometer: 68000, liters: 42, price: 5.69, station: 'Posto Shell', createdAt: Date.now() },
    { id: uid(), carId, date: '2025-02-10', odometer: 68520, liters: 40, price: 5.79, station: 'Posto BR',   createdAt: Date.now() },
    { id: uid(), carId, date: '2025-03-05', odometer: 69100, liters: 41, price: 5.89, station: 'Posto Ipiranga', createdAt: Date.now() },
    { id: uid(), carId, date: '2025-04-18', odometer: 69650, liters: 39, price: 5.95, station: 'Posto Shell', createdAt: Date.now() },
    { id: uid(), carId, date: '2025-05-22', odometer: 70220, liters: 40, price: 6.09, station: '',           createdAt: Date.now() },
    { id: uid(), carId, date: '2025-06-30', odometer: 70800, liters: 41, price: 6.19, station: 'Posto Ale', createdAt: Date.now() },
    { id: uid(), carId, date: '2025-07-25', odometer: 71400, liters: 40, price: 6.15, station: '',           createdAt: Date.now() },
    { id: uid(), carId, date: '2025-08-10', odometer: 72000, liters: 42, price: 6.09, station: 'Posto BR',  createdAt: Date.now() },
  ];
  DB.saveFuels(fuels);

  const now = new Date();
  const inFiveDays   = new Date(now); inFiveDays.setDate(now.getDate() + 5);
  const inTwentyDays = new Date(now); inTwentyDays.setDate(now.getDate() + 20);
  const overdue      = new Date(now); overdue.setDate(now.getDate() - 3);

  const maints = [
    { id: uid(), carId, type: 'Troca de óleo', date: inFiveDays.toISOString().split('T')[0],   km: '73000', notes: 'Usar óleo 5W30 semissintético', resolved: false, createdAt: Date.now() },
    { id: uid(), carId, type: 'Alinhamento/Balanceamento', date: inTwentyDays.toISOString().split('T')[0], km: '75000', notes: '', resolved: false, createdAt: Date.now() },
    { id: uid(), carId, type: 'Revisão geral', date: overdue.toISOString().split('T')[0],        km: '72000', notes: 'Verificar freios traseiros', resolved: false, createdAt: Date.now() },
  ];
  DB.saveMaints(maints);

  rebuildCarSelector();
  renderDashboard();
}

// Service Worker Registration (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('[PWA] Service Worker registrado:', reg.scope);
        // Verifica updates periodicamente
        setInterval(() => reg.update(), 1000 * 60 * 60); // a cada 1h

        // Notificar usuário quando houver update
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showToast('Nova versão disponível. Recarregue para atualizar.', 'info', 10000);
            }
          });
        });
      })
      .catch(err => console.warn('[PWA] Falha ao registrar SW:', err));
  });
}

// Start!
init();
