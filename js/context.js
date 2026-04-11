// ═══════════════════════════════════════════════
//  TouchGrass — context.js
// ═══════════════════════════════════════════════

window.CTX = {
  lat:          null,
  lon:          null,
  cityName:     null,
  tempC:        null,
  weatherCode:  null,
  weatherDesc:  null,
  weatherEmoji: null,
  autoType:     null,   // 'indoor' | 'outdoor'
  energyLevel:  null,   // 'low' | 'medium' | 'high'
  pollType:     null,   // 'indoor' | 'outdoor' | 'random'
  challenge:    null,   // objeto del reto activo — lo gestiona challenges.js
  checkpoint:   null,   // { name, lat, lon }
};

window.MoveUp = {
  getContext: () => ({ ...window.CTX }),
  onUpdate:   null,
};

function _notifyPersona2() {
  if (typeof window.MoveUp.onUpdate === 'function') {
    window.MoveUp.onUpdate({ ...window.CTX });
  }
}

/* ─────────────────────────────────────────────
   TABLA WMO → info de clima
───────────────────────────────────────────── */
const _WMO = {
  0:  { emoji: '☀️',  desc: 'Despejado',               outdoor: true  },
  1:  { emoji: '🌤️', desc: 'Principalmente despejado',  outdoor: true  },
  2:  { emoji: '⛅',  desc: 'Parcialmente nublado',     outdoor: true  },
  3:  { emoji: '☁️',  desc: 'Nublado',                  outdoor: true  },
  45: { emoji: '🌫️', desc: 'Niebla',                   outdoor: false },
  48: { emoji: '🌫️', desc: 'Niebla helada',             outdoor: false },
  51: { emoji: '🌦️', desc: 'Llovizna ligera',           outdoor: false },
  53: { emoji: '🌦️', desc: 'Llovizna moderada',         outdoor: false },
  55: { emoji: '🌧️', desc: 'Llovizna densa',            outdoor: false },
  61: { emoji: '🌧️', desc: 'Lluvia ligera',              outdoor: false },
  63: { emoji: '🌧️', desc: 'Lluvia moderada',            outdoor: false },
  65: { emoji: '⛈️',  desc: 'Lluvia intensa',            outdoor: false },
  71: { emoji: '🌨️', desc: 'Nevada ligera',              outdoor: false },
  80: { emoji: '🌦️', desc: 'Chubascos ligeros',         outdoor: false },
  95: { emoji: '⛈️',  desc: 'Tormenta',                  outdoor: false },
};

function _wmoInfo(code) {
  return _WMO[code] || { emoji: '🌡️', desc: 'Variable', outdoor: true };
}

/* ─────────────────────────────────────────────
   pickChallenge — puente a challenges.js
   Solo se usa como fallback desde context.js.
   El flujo principal usa pickChallengeForUser.
───────────────────────────────────────────── */
function pickChallenge(type, energy) {
  if (typeof getChallengePool === 'function') {
    const pool = getChallengePool(type, energy || 'medium');
    if (pool && pool.length) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }
  if (Array.isArray(window.CHALLENGES_DB) && window.CHALLENGES_DB.length) {
    return window.CHALLENGES_DB[0];
  }
  return null;
}

/* ─────────────────────────────────────────────
   GEOLOCALIZACIÓN
───────────────────────────────────────────── */
function CTX_requestLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Geolocation no soportada')); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => reject(err),
      { timeout: 10000, maximumAge: 300000 }
    );
  });
}

/* ─────────────────────────────────────────────
   CLIMA: Open-Meteo (sin API key)
───────────────────────────────────────────── */
async function CTX_fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
    `&current=temperature_2m,weather_code` +
    `&timezone=auto`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error('Open-Meteo error');
  const data    = await res.json();
  const current = data.current || {};
  return {
    temp: Math.round(current.temperature_2m ?? 15),
    code: current.weather_code ?? current.weathercode ?? 0,
  };
}

/* ─────────────────────────────────────────────
   CIUDAD: Nominatim (sin API key)
───────────────────────────────────────────── */
async function CTX_fetchCity(lat, lon) {
  try {
    const url  = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=es`;
    const res  = await fetch(url, { headers: { 'User-Agent': 'MoveUp-Hackathon/1.0' } });
    const data = await res.json();
    return data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Tu ciudad';
  } catch {
    return 'Tu ciudad';
  }
}

/* ─────────────────────────────────────────────
   DETECCIÓN DE CONTEXTO
───────────────────────────────────────────── */
async function CTX_detect() {
  try {
    const { lat, lon } = await CTX_requestLocation();
    window.CTX.lat = lat;
    window.CTX.lon = lon;

    const [weather, city] = await Promise.all([
      CTX_fetchWeather(lat, lon),
      CTX_fetchCity(lat, lon),
    ]);

    const info = _wmoInfo(weather.code);
    window.CTX.tempC        = weather.temp;
    window.CTX.weatherCode  = weather.code;
    window.CTX.weatherDesc  = info.desc;
    window.CTX.weatherEmoji = info.emoji;
    window.CTX.cityName     = city;
    window.CTX.autoType     = info.outdoor ? 'outdoor' : 'indoor';

    return { success: true };
  } catch (err) {
    console.warn('CTX_detect sin ubicación:', err.message);
    return { success: false };
  }
}

/* ─────────────────────────────────────────────
   CTX_renderChallenge
   Solo actualiza campos de texto de la card.
   NO se usa en el flujo principal (ese usa
   renderChallengeCard de challenges.js).
   Se mantiene para compatibilidad con maps.js.
───────────────────────────────────────────── */
function CTX_renderChallenge(challenge) {
  if (!challenge) return;
  window.CTX.challenge = challenge;
  _notifyPersona2();
}

/* ─────────────────────────────────────────────
   MODAL DE DETALLE
───────────────────────────────────────────── */
function CTX_syncDetailModal() {
  const ch = window.CTX.challenge;
  if (!ch) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const badge = document.getElementById('detail-type-badge');
  if (badge) { badge.textContent = ch.badgeText; badge.className = `challenge-detail-type ${ch.badgeClass}`; }
  set('detail-title',      ch.title);
  set('detail-desc',       ch.detailDesc || ch.desc);
  set('detail-duration',   ch.duration);
  set('detail-xp',        `+${ch.xp}`);
  set('detail-type',       ch.type);
  set('detail-difficulty', ch.difficulty);
}

/* ─────────────────────────────────────────────
   BANNER DE CLIMA
───────────────────────────────────────────── */
function CTX_showWeatherBanner() {
  const existing = document.getElementById('ctx-weather-banner');
  if (existing) existing.remove();
  if (!window.CTX.tempC && !window.CTX.weatherEmoji) return;

  const emoji = window.CTX.weatherEmoji || '🌡️';
  const desc  = window.CTX.weatherDesc  || 'Variable';
  const temp  = window.CTX.tempC !== null ? `${window.CTX.tempC}°C` : '';
  const city  = window.CTX.cityName || '';
  const type  = window.CTX.autoType || 'outdoor';
  const msg   = type === 'outdoor'
    ? 'Buen tiempo → reto exterior activado automáticamente'
    : 'Lluvia/frío → reto interior activado automáticamente';

  const banner = document.createElement('div');
  banner.id        = 'ctx-weather-banner';
  banner.className = 'ctx-weather-banner';
  banner.innerHTML = `
    <span class="ctx-banner-icon">${emoji}</span>
    <div class="ctx-banner-body">
      <strong>${city ? city + ' · ' : ''}${desc}${temp ? ' · ' + temp : ''}</strong>
      <span>${msg}</span>
    </div>
    <button class="ctx-banner-close" onclick="this.parentElement.remove()">✕</button>
  `;

  const pageContainer = document.querySelector('.page-container');
  if (pageContainer) pageContainer.parentNode.insertBefore(banner, pageContainer);

  setTimeout(() => {
    banner.classList.add('ctx-banner-hide');
    setTimeout(() => banner.remove(), 400);
  }, 7000);
}

/* ─────────────────────────────────────────────
   ETIQUETA DE ENCUESTA
───────────────────────────────────────────── */
function CTX_updatePollLabel() {
  const labelEl = document.querySelector('.poll-label');
  if (!labelEl) return;
  if (window.CTX.autoType && window.CTX.weatherEmoji) {
    const type = window.CTX.autoType === 'outdoor' ? 'exterior' : 'interior';
    labelEl.textContent = `${window.CTX.weatherEmoji} ${window.CTX.weatherDesc} · ${window.CTX.tempC}°C → reto ${type}`;
  } else if (window.CTX.pollType) {
    const labels = { indoor: '🏠 Reto interior', outdoor: '🌳 Reto exterior', random: '🎲 Reto aleatorio' };
    labelEl.textContent = labels[window.CTX.pollType] || '☀️ Reto de hoy';
  }
}

/* ─────────────────────────────────────────────
   INICIALIZACIÓN
   FIX: CTX_init ya NO renderiza ningún reto.
   Solo detecta clima y marca el tipo automático.
   El reto lo gestiona initChallenges() en challenges.js
   y el listener de energía en app.js.
───────────────────────────────────────────── */
async function CTX_init() {
  // Guardia: esperar a que challenges.js esté cargado
  if (typeof getChallengePool !== 'function' || !Array.isArray(window.CHALLENGES_DB)) {
    console.warn('CTX_init: esperando challenges.js...');
    await new Promise(r => setTimeout(r, 150));
  }

  // 1. Detectar contexto (geolocalización + clima)
  const result = await CTX_detect();

  // 2. Si hay clima: marcar tipo automático visualmente
  if (result.success && window.CTX.autoType) {
    // Solo marcar automáticamente si el usuario NO ha elegido ya hoy
    const today        = typeof todayString === 'function' ? todayString() : new Date().toISOString().split('T')[0];
    const alreadyChose = window.challengeState?.pollChosen && window.challengeState?.todayDate === today;

    if (!alreadyChose) {
      window.CTX.pollType = window.CTX.autoType;

      document.querySelectorAll('.poll-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.vote === window.CTX.autoType);
        if (btn.dataset.vote === window.CTX.autoType) btn.classList.add('auto-selected');
      });

      // Mostrar sección de energía automáticamente
      const energySection = document.getElementById('poll-energy-section');
      if (energySection) energySection.style.display = '';
    }

    CTX_updatePollLabel();
    CTX_showWeatherBanner();
  }
}

/* ─────────────────────────────────────────────
   EXPOSICIÓN GLOBAL
───────────────────────────────────────────── */
window.pickChallenge       = pickChallenge;
window.CTX_init            = CTX_init;
window.CTX_renderChallenge = CTX_renderChallenge;
window.CTX_syncDetailModal = CTX_syncDetailModal;