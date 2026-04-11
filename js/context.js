// ═══════════════════════════════════════════════
//  TouchGrass — context.js
// ═══════════════════════════════════════════════

/* ─────────────────────────────────────────────
   ESTADO DE CONTEXTO
   Separado de state en app.js para no interferir
───────────────────────────────────────────── */
window.CTX = {
  lat:          null,
  lon:          null,
  cityName:     null,
  tempC:        null,
  weatherCode:  null,
  weatherDesc:  null,
  weatherEmoji: null,
  autoType:     null,   // 'indoor' | 'outdoor'  ← decisión automática por clima
  energyLevel:  null,   // 'low' | 'medium' | 'high'
  pollType:     null,   // 'indoor' | 'outdoor' | 'random'  ← voto manual
  challenge:    null,   // objeto del reto activo
  checkpoint:   null,   // { name, lat, lon, placeId }
};

/* ─────────────────────────────────────────────
   BRIDGE PARA PERSONA 2
   Persona 2 puede hacer:
     window.MoveUp.onUpdate = (ctx) => { ... }
   Y recibe el contexto cada vez que cambia algo.
───────────────────────────────────────────── */
window.MoveUp = {
  getContext:    () => ({ ...window.CTX }),
  onUpdate:      null,   // Persona 2 asigna su callback aquí
};

function _notifyPersona2() {
  if (typeof window.MoveUp.onUpdate === 'function') {
    window.MoveUp.onUpdate({ ...window.CTX });
  }
}

/* ─────────────────────────────────────────────
   TABLA WMO → info de clima
   Open-Meteo devuelve códigos estándar WMO.
   Si outdoor=true, el clima es apto para exterior.
───────────────────────────────────────────── */
const _WMO = {
  0:  { emoji: '☀️',  desc: 'Despejado',              outdoor: true  },
  1:  { emoji: '🌤️', desc: 'Principalmente despejado', outdoor: true  },
  2:  { emoji: '⛅',  desc: 'Parcialmente nublado',    outdoor: true  },
  3:  { emoji: '☁️',  desc: 'Nublado',                 outdoor: true  },
  45: { emoji: '🌫️', desc: 'Niebla',                  outdoor: false },
  48: { emoji: '🌫️', desc: 'Niebla helada',            outdoor: false },
  51: { emoji: '🌦️', desc: 'Llovizna ligera',          outdoor: false },
  53: { emoji: '🌦️', desc: 'Llovizna moderada',        outdoor: false },
  55: { emoji: '🌧️', desc: 'Llovizna densa',           outdoor: false },
  61: { emoji: '🌧️', desc: 'Lluvia ligera',             outdoor: false },
  63: { emoji: '🌧️', desc: 'Lluvia moderada',           outdoor: false },
  65: { emoji: '⛈️',  desc: 'Lluvia intensa',           outdoor: false },
  71: { emoji: '🌨️', desc: 'Nevada ligera',             outdoor: false },
  80: { emoji: '🌦️', desc: 'Chubascos ligeros',        outdoor: false },
  95: { emoji: '⛈️',  desc: 'Tormenta',                 outdoor: false },
};

function _wmoInfo(code) {
  return _WMO[code] || { emoji: '🌡️', desc: 'Variable', outdoor: true };
}

/* ─────────────────────────────────────────────
   BASE DE RETOS
   Indexados por tipo (outdoor/indoor) y energía
   (low/medium/high). Puedes añadir más aquí.
───────────────────────────────────────────── */
const CHALLENGES_DB = {
  outdoor: {
    low: [
      {
        title:       'Paseo desconectado',
        desc:        '30 minutos de paseo al aire libre con el teléfono en el bolsillo sin tocarlo. Escucha el entorno, observa, respira.',
        detailDesc:  'El reto es simple pero poderoso: 30 minutos caminando sin consultar el móvil ni una sola vez. Puedes ir al parque, pasear por el barrio o explorar una calle nueva. Lleva los auriculares si quieres música, pero nada de redes sociales.',
        duration:    '~30 min',
        xp:          80,
        coins:       30,
        type:        'Mental',
        difficulty:  'Fácil',
        badgeText:   '🌳 Exterior',
        badgeClass:  'outdoor',
        icon:        '🚶',
        checkpoint:  { name: 'Alameda de Santiago', query: 'Alameda de Santiago de Compostela' },
      },
    ],
    medium: [
      {
        title:       'Carrera de 5km',
        desc:        'Completa 5 kilómetros corriendo o caminando rápido. ¡El recorrido es libre, tú decides la ruta!',
        detailDesc:  'El objetivo es simple: 5 km sin parar. Puedes correr, caminar rápido o combinar ambos. Activa el GPS de tu app de running favorita para registrar el recorrido. Al terminar, comparte la captura con el grupo.',
        duration:    '~45 min',
        xp:          150,
        coins:       50,
        type:        'Físico',
        difficulty:  'Moderado',
        badgeText:   '🌳 Exterior',
        badgeClass:  'outdoor',
        icon:        '🏃',
        checkpoint:  { name: 'Parque de Bonaval', query: 'Parque de Bonaval Santiago de Compostela' },
      },
      {
        title:       'Deporte en grupo',
        desc:        'Organiza una quedada con al menos otro miembro del grupo para hacer deporte juntos.',
        detailDesc:  'Fútbol, baloncesto, frisbee, lo que queráis. El requisito es que seáis al menos dos del grupo y que hagáis algo físico durante mínimo 45 minutos. Haced una foto juntos al terminar.',
        duration:    '~60 min',
        xp:          200,
        coins:       70,
        type:        'Social',
        difficulty:  'Moderado',
        badgeText:   '🌳 Exterior',
        badgeClass:  'outdoor',
        icon:        '⚽',
        checkpoint:  { name: 'Campo de Deporte USC', query: 'Campus Norte USC Santiago de Compostela' },
      },
    ],
    high: [
      {
        title:       'Búsqueda del tesoro',
        desc:        'Llega al punto de control marcado en el mapa. El primero en enviar la foto gana puntos extra.',
        detailDesc:  'Tu misión: llegar al punto de control que se indica en el mapa. Una vez allí, haz una foto en el lugar exacto y súbela al grupo. El primero en llegar obtiene +50 XP adicionales. Nada de trampas, el GPS lo sabe todo.',
        duration:    '~60 min',
        xp:          250,
        coins:       90,
        type:        'Exploración',
        difficulty:  'Difícil',
        badgeText:   '🌳 Exterior',
        badgeClass:  'outdoor',
        icon:        '🗺️',
        checkpoint:  { name: 'Catedral de Santiago', query: 'Catedral de Santiago de Compostela' },
      },
    ],
  },
  indoor: {
    low: [
      {
        title:       'Meditación guiada',
        desc:        'Dedica 15 minutos a meditar en silencio. Cierra los ojos, respira profundo y desconecta.',
        detailDesc:  'Busca un sitio tranquilo en casa, pon un temporizador de 15 minutos y cierra los ojos. No hace falta experiencia previa. Solo siéntate, respira y deja pasar los pensamientos. Al terminar, escribe en el chat del grupo cómo te has sentido.',
        duration:    '~15 min',
        xp:          60,
        coins:       25,
        type:        'Mental',
        difficulty:  'Fácil',
        badgeText:   '🏠 Interior',
        badgeClass:  'indoor',
        icon:        '🧘',
        checkpoint:  null,
      },
    ],
    medium: [
      {
        title:       'Reto de flexiones',
        desc:        'Completa 3 series de 10 flexiones con 1 minuto de descanso entre series.',
        detailDesc:  '3 series × 10 flexiones. Si no puedes hacer flexiones normales, hazlas con las rodillas apoyadas. Descansa exactamente 1 minuto entre series. Graba la última serie y súbela al grupo para validar.',
        duration:    '~20 min',
        xp:          100,
        coins:       40,
        type:        'Físico',
        difficulty:  'Moderado',
        badgeText:   '🏠 Interior',
        badgeClass:  'indoor',
        icon:        '💪',
        checkpoint:  null,
      },
      {
        title:       'Aprende algo nuevo',
        desc:        'Mira un vídeo educativo o lee un artículo sobre un tema que no conozcas. Luego cuéntaselo al grupo.',
        detailDesc:  'Elige cualquier tema que no conozcas bien: historia, ciencia, economía, arte... Dedica 30 minutos a aprender sobre él (YouTube, artículo, podcast). Al terminar, escribe un resumen de 3 frases en el chat del grupo.',
        duration:    '~30 min',
        xp:          90,
        coins:       35,
        type:        'Mental',
        difficulty:  'Fácil',
        badgeText:   '🏠 Interior',
        badgeClass:  'indoor',
        icon:        '📚',
        checkpoint:  null,
      },
    ],
    high: [
      {
        title:       'Cocina algo saludable',
        desc:        'Prepara una comida saludable desde cero. Sin ultraprocesados. Haz una foto y compártela.',
        detailDesc:  'Las reglas: ingredientes reales, sin comida precocinada ni ultraprocesada. Puedes hacer desde una ensalada compleja hasta un wok. El tiempo de preparación debe ser de al menos 30 minutos. Sube la foto del plato terminado.',
        duration:    '~45 min',
        xp:          130,
        coins:       50,
        type:        'Social',
        difficulty:  'Moderado',
        badgeText:   '🏠 Interior',
        badgeClass:  'indoor',
        icon:        '🥗',
        checkpoint:  null,
      },
    ],
  },
};

/* ─────────────────────────────────────────────
   SELECCIONAR RETO
   type: 'outdoor' | 'indoor' | 'random'
   energy: 'low' | 'medium' | 'high'
───────────────────────────────────────────── */
function pickChallenge(type, energy) {
  let resolvedType = type;
  if (type === 'random') {
    resolvedType = Math.random() > 0.5 ? 'outdoor' : 'indoor';
  }
  const e = energy || 'medium';
  const pool = CHALLENGES_DB[resolvedType]?.[e]
    || CHALLENGES_DB[resolvedType]?.medium
    || CHALLENGES_DB.outdoor.medium;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ─────────────────────────────────────────────
   GEOLOCALIZACIÓN (API nativa del navegador)
───────────────────────────────────────────── */
function CTX_requestLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation no soportada'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => reject(err),
      { timeout: 10000, maximumAge: 300000 }
    );
  });
}

/* ─────────────────────────────────────────────
   CLIMA: Open-Meteo (gratuita, sin API key)
   Docs: https://open-meteo.com/en/docs
───────────────────────────────────────────── */
async function CTX_fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
    `&current=temperature_2m,weathercode` +
    `&timezone=auto`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error('Open-Meteo error');
  const data = await res.json();
  return {
    temp: Math.round(data.current.temperature_2m),
    code: data.current.weathercode,
  };
}

/* ─────────────────────────────────────────────
   NOMBRE DE CIUDAD: Nominatim (OpenStreetMap)
   Gratuita, sin API key
───────────────────────────────────────────── */
async function CTX_fetchCity(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse` +
      `?lat=${lat}&lon=${lon}&format=json&accept-language=es`;
    const res  = await fetch(url, { headers: { 'User-Agent': 'MoveUp-Hackathon/1.0' } });
    const data = await res.json();
    return (
      data.address?.city    ||
      data.address?.town    ||
      data.address?.village ||
      data.address?.county  ||
      'Tu ciudad'
    );
  } catch {
    return 'Tu ciudad';
  }
}

/* ─────────────────────────────────────────────
   FLUJO PRINCIPAL DE DETECCIÓN DE CONTEXTO
───────────────────────────────────────────── */
async function CTX_detect() {
  try {
    const { lat, lon } = await CTX_requestLocation();
    window.CTX.lat = lat;
    window.CTX.lon = lon;

    // Clima y ciudad en paralelo
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
   ACTUALIZAR CHALLENGE CARD en el HTML
   Llámalo siempre que cambie el reto.
───────────────────────────────────────────── */
function CTX_renderChallenge(challenge) {
  window.CTX.challenge = challenge;

  const card = document.getElementById('challenge-card');
  if (!card) return;

  // Badge de tipo
  const badge = card.querySelector('.challenge-type-badge');
  if (badge) {
    badge.textContent = challenge.badgeText;
    badge.className   = `challenge-type-badge ${challenge.badgeClass}`;
  }

  // Icono grande (si existe el elemento, si no lo ignora)
  const iconEl = card.querySelector('.challenge-icon-big');
  if (iconEl) iconEl.textContent = challenge.icon;

  // XP
  const xpEl = card.querySelector('.challenge-xp');
  if (xpEl) xpEl.textContent = `+${challenge.xp} XP`;

  // Título y descripción
  const titleEl = card.querySelector('.challenge-title');
  if (titleEl) titleEl.textContent = challenge.title;
  const descEl = card.querySelector('.challenge-desc');
  if (descEl) descEl.textContent = challenge.desc;

  // Meta items
  const metas = card.querySelectorAll('.meta-item');
  if (metas[0]) metas[0].textContent = `⏱️ ${challenge.duration}`;
  if (metas[1]) metas[1].textContent = `💪 ${challenge.type}`;
  if (metas[2]) metas[2].textContent = `🌡️ ${challenge.difficulty}`;

  // Animación de cambio
  card.classList.remove('challenge-enter');
  void card.offsetWidth; // reflow
  card.classList.add('challenge-enter');

  // Notificar a Persona 2
  _notifyPersona2();
}

/* ─────────────────────────────────────────────
   ACTUALIZAR MODAL DE DETALLE
   Llámalo justo antes de openModal('modal-challenge-detail')
───────────────────────────────────────────── */
function CTX_syncDetailModal() {
  const ch = window.CTX.challenge;
  if (!ch) return;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  const badge = document.getElementById('detail-type-badge');
  if (badge) {
    badge.textContent = ch.badgeText;
    badge.className   = `challenge-detail-type ${ch.badgeClass}`;
  }
  set('detail-title',      ch.title);
  set('detail-desc',       ch.detailDesc || ch.desc);
  set('detail-duration',   ch.duration);
  set('detail-xp',        `+${ch.xp}`);
  set('detail-type',       ch.type);
  set('detail-difficulty', ch.difficulty);
}

/* ─────────────────────────────────────────────
   BANNER DE CLIMA (aparece solo en home)
   Muéstralo después de CTX_detect() si hay datos.
───────────────────────────────────────────── */
function CTX_showWeatherBanner() {
  const existing = document.getElementById('ctx-weather-banner');
  if (existing) existing.remove();

  if (!window.CTX.tempC && !window.CTX.weatherEmoji) return;

  const emoji = window.CTX.weatherEmoji || '🌡️';
  const desc  = window.CTX.weatherDesc  || 'Variable';
  const temp  = window.CTX.tempC !== null ? `${window.CTX.tempC}°C` : '';
  const city  = window.CTX.cityName     || '';
  const type  = window.CTX.autoType     || 'outdoor';
  const msg   = type === 'outdoor'
    ? 'Buen tiempo → reto exterior activado automáticamente'
    : 'Lluvia/frío → reto interior activado automáticamente';

  const banner = document.createElement('div');
  banner.id = 'ctx-weather-banner';
  banner.className = 'ctx-weather-banner';
  banner.innerHTML = `
    <span class="ctx-banner-icon">${emoji}</span>
    <div class="ctx-banner-body">
      <strong>${city ? city + ' · ' : ''}${desc}${temp ? ' · ' + temp : ''}</strong>
      <span>${msg}</span>
    </div>
    <button class="ctx-banner-close" onclick="this.parentElement.remove()">✕</button>
  `;

  // Insertar justo debajo del topbar, antes del page-container
  const pageContainer = document.querySelector('.page-container');
  if (pageContainer) {
    pageContainer.parentNode.insertBefore(banner, pageContainer);
  }

  // Auto-ocultar a los 7 segundos
  setTimeout(() => {
    banner.classList.add('ctx-banner-hide');
    setTimeout(() => banner.remove(), 400);
  }, 7000);
}

/* ─────────────────────────────────────────────
   ENCUESTA MANUAL DE TIPO (indoor/outdoor/random)
   Conecta los botones .poll-btn existentes
   al motor de retos. Llámalo en DOMContentLoaded.
───────────────────────────────────────────── */
function CTX_initPollButtons() {
  document.querySelectorAll('.poll-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Si ya se decidió por clima automáticamente, no bloquear pero avisar
      if (window.CTX.pollType) {
        showToast('Ya elegiste el tipo de reto hoy 💪', '');
        return;
      }

      document.querySelectorAll('.poll-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const vote = btn.dataset.vote; // 'indoor' | 'outdoor' | 'random'
      window.CTX.pollType = vote;

      // Seleccionar y renderizar reto
      const ch = pickChallenge(vote, window.CTX.energyLevel || 'medium');
      CTX_renderChallenge(ch);

      // Actualizar la etiqueta de la encuesta
      CTX_updatePollLabel();

      const msgs = {
        indoor:  '🏠 ¡Reto de interior activado!',
        outdoor: '🌳 ¡Reto de exterior listo!',
        random:  '🎲 ¡Reto aleatorio, suerte!',
      };
      if (typeof showToast === 'function') showToast(msgs[vote] || '✅ Listo', 'success');
    });
  });
}

/* ─────────────────────────────────────────────
   ACTUALIZAR ETIQUETA DE ENCUESTA
   Muestra el clima o el estado de la encuesta.
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
   INICIALIZACIÓN: se llama desde app.js
   Exportado como función global para que app.js
   pueda llamarla en el momento adecuado.

   DÓNDE LLAMARLA EN APP.JS:
   Busca la función que muestra la app principal
   (showScreen('screen-app')) y añade:
     await CTX_init();
   justo antes de navigateTo('home').
───────────────────────────────────────────── */
async function CTX_init() {
  // 1. Detectar contexto (geolocalización + clima)
  const result = await CTX_detect();

  // 2. Seleccionar reto inicial según clima o fallback
  const type   = window.CTX.autoType || 'outdoor';
  const energy = window.CTX.energyLevel || 'medium';
  const ch     = pickChallenge(type, energy);
  CTX_renderChallenge(ch);

  // 3. Si hay clima detectado: marcar tipo automáticamente
  if (result.success && window.CTX.autoType) {
    window.CTX.pollType = window.CTX.autoType;

    // Marcar visualmente el botón correspondiente en la encuesta
    document.querySelectorAll('.poll-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.vote === window.CTX.autoType);
      if (btn.dataset.vote === window.CTX.autoType) {
        btn.classList.add('auto-selected');
      }
    });

    CTX_updatePollLabel();

    // Mostrar banner de clima
    CTX_showWeatherBanner();
  }

  // 4. Inicializar botones de encuesta
  CTX_initPollButtons();
}

/* ─────────────────────────────────────────────
   EXPONER pickChallenge globalmente
   (Usado desde maps.js para el punto de control)
───────────────────────────────────────────── */
window.pickChallenge    = pickChallenge;
window.CTX_init         = CTX_init;
window.CTX_renderChallenge = CTX_renderChallenge;
window.CTX_syncDetailModal = CTX_syncDetailModal;