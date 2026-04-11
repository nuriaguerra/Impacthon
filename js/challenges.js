// ═══════════════════════════════════════════
//  TouchGrass — challenges.js  v3.1
// ═══════════════════════════════════════════

/* ─────────────────────────────────────────────
   CONSTANTES
───────────────────────────────────────────── */
const CHALLENGE_STORAGE_KEY    = 'tg_challenge_state';
const ARRIVAL_RADIUS_METERS    = 80;
const GROUP_CHALLENGE_INTERVAL = [4, 8];

/* ─────────────────────────────────────────────
   BASE DE DATOS DE RETOS
───────────────────────────────────────────── */
const CHALLENGES_DB = [

  /* ══════════════ OUTDOOR · LOW ══════════════ */
  {
    id:         'walk_no_phone',
    title:      'Paseo desconectado',
    desc:       '30 minutos de paseo al aire libre con el teléfono en el bolsillo sin tocarlo.',
    detailDesc: 'Sal a caminar durante 30 minutos sin consultar el móvil. Puedes ir al parque, pasear por el barrio o explorar una calle nueva. El tracker registra tu ruta automáticamente. Al acabar pulsa "Parar" para guardar el recorrido.',
    xp: 80, coins: 30,
    duration: '~30 min', type: 'Mental', difficulty: 'Fácil',
    badgeText: '🌳 Exterior', badgeClass: 'outdoor', icon: '🚶',
    location: 'outdoor', energy: ['low'],
    hasTracker: true, minKm: 1.5,
    checkpoint: { name: 'Alameda de Santiago', query: 'Alameda de Santiago de Compostela' },
  },
  {
    id:         'sunrise_walk',
    title:      'Levántate con el sol',
    desc:       'Pon la alarma antes del amanecer, sal fuera y observa el amanecer. Sin móvil los primeros 5 minutos.',
    detailDesc: 'Consulta la hora del amanecer en tu ciudad, pon la alarma 10 minutos antes y sal a la calle o a un balcón. Respira hondo, no cojas el móvil durante los primeros 5 minutos. El tracker registrará tu posición.',
    xp: 90, coins: 35,
    duration: '~20 min', type: 'Mental', difficulty: 'Fácil',
    badgeText: '🌳 Exterior', badgeClass: 'outdoor', icon: '🌅',
    location: 'outdoor', energy: ['low'],
    hasTracker: false, minKm: 0,
    checkpoint: null,
  },

  /* ══════════════ OUTDOOR · MEDIUM ══════════════ */
  {
    id:         'run5k',
    title:      'Carrera de 5 km',
    desc:       'Completa 5 kilómetros corriendo o caminando rápido. El tracker mide tu recorrido en tiempo real.',
    detailDesc: 'Pulsa "Iniciar tracker" para empezar a contar kilómetros. El reto se completa automáticamente al superar los 5 km. Puedes ir más lejos, pero menos de 5 km no cuenta. La ruta queda guardada para compartir con el grupo.',
    xp: 150, coins: 50,
    duration: '~45 min', type: 'Físico', difficulty: 'Moderado',
    badgeText: '🌳 Exterior', badgeClass: 'outdoor', icon: '🏃',
    location: 'outdoor', energy: ['medium'],
    hasTracker: true, minKm: 5,
    checkpoint: { name: 'Parque de Bonaval', query: 'Parque de Bonaval Santiago de Compostela' },
  },
  {
    id:         'bike10k',
    title:      'Bicicleta 10 km',
    desc:       'Pedalea 10 km sin límite de tiempo. El tracker registra el recorrido.',
    detailDesc: 'Puede ser en bici de carretera, montaña o incluso patinete. Pulsa "Iniciar tracker" antes de salir para registrar la ruta. Sube una foto del recorrido al grupo al terminar.',
    xp: 140, coins: 50,
    duration: '~35 min', type: 'Físico', difficulty: 'Moderado',
    badgeText: '🌳 Exterior', badgeClass: 'outdoor', icon: '🚴',
    location: 'outdoor', energy: ['medium'],
    hasTracker: true, minKm: 0,
    checkpoint: null,
  },
  {
    id:         'sport_group',
    title:      'Deporte en grupo',
    desc:       'Organiza una quedada con otro miembro del grupo para hacer deporte juntos al menos 45 min.',
    detailDesc: 'Fútbol, baloncesto, frisbee, lo que queráis. El requisito es que seáis al menos dos del grupo y que el tracker registre movimiento durante 45 minutos. Haced una foto juntos al terminar y súbela al chat del grupo.',
    xp: 200, coins: 70,
    duration: '~60 min', type: 'Social', difficulty: 'Moderado',
    badgeText: '🌳 Exterior', badgeClass: 'outdoor', icon: '⚽',
    location: 'outdoor', energy: ['medium'],
    hasTracker: true, minKm: 0,
    checkpoint: { name: 'Campo de Deporte USC', query: 'Campus Norte USC Santiago de Compostela' },
  },

  /* ══════════════ OUTDOOR · HIGH ══════════════ */
  {
    id:         'treasure_hunt',
    title:      'Búsqueda del tesoro',
    desc:       'Llega al punto de control marcado en el mapa. El GPS detectará tu llegada automáticamente.',
    detailDesc: 'Tu misión: llega al punto de control indicado. El sistema detecta automáticamente cuando estás a menos de 80 metros del objetivo y marca el reto como completado. Haz una foto en el lugar y súbela al grupo. El primero en llegar obtiene +50 XP extra.',
    xp: 250, coins: 90,
    duration: '~60 min', type: 'Exploración', difficulty: 'Difícil',
    badgeText: '🌳 Exterior', badgeClass: 'outdoor', icon: '🗺️',
    location: 'outdoor', energy: ['high'],
    hasTracker: true, minKm: 0,
    checkpoint: { name: 'Catedral de Santiago', query: 'Catedral de Santiago de Compostela' },
    arrivalRequired: true,
  },
  {
    id:         'hike',
    title:      'Ruta de senderismo',
    desc:       'Haz una ruta de senderismo de al menos 5 km. El tracker registra el recorrido completo.',
    detailDesc: 'Puede ser un monte, parque forestal o camino rural. Pulsa "Iniciar tracker" al comenzar. El reto se valida al superar los 5 km registrados. Saca una foto en el punto más alto o bonito y compártela.',
    xp: 200, coins: 75,
    duration: '~2 horas', type: 'Físico', difficulty: 'Intenso',
    badgeText: '🌳 Exterior', badgeClass: 'outdoor', icon: '🥾',
    location: 'outdoor', energy: ['high'],
    hasTracker: true, minKm: 5,
    checkpoint: null,
  },

  /* ══════════════ INDOOR · LOW ══════════════ */
  {
    id:         'meditation',
    title:      'Meditación 10 minutos',
    desc:       'Siéntate en silencio, cierra los ojos y céntrate en la respiración durante 10 minutos seguidos.',
    detailDesc: 'Sin móvil, sin música. Busca un sitio tranquilo, pon un temporizador de 10 minutos y cierra los ojos. No hace falta experiencia. Al terminar escribe en el chat del grupo cómo te has sentido con una sola frase.',
    xp: 70, coins: 25,
    duration: '~10 min', type: 'Mental', difficulty: 'Fácil',
    badgeText: '🏠 Interior', badgeClass: 'indoor', icon: '🧘',
    location: 'indoor', energy: ['low'],
    hasTracker: false, minKm: 0, checkpoint: null,
  },
  {
    id:         'journaling',
    title:      'Diario de gratitud',
    desc:       'Escribe en papel al menos 5 cosas por las que estás agradecido hoy. Sé específico.',
    detailDesc: 'Nada de "mi familia" en general: entra en detalle. Por ejemplo "Hoy me alegré cuando mi compañero de clase me ayudó con el apunte". Al terminar, fotografía la página y súbela al grupo.',
    xp: 70, coins: 25,
    duration: '~15 min', type: 'Mental', difficulty: 'Fácil',
    badgeText: '🏠 Interior', badgeClass: 'indoor', icon: '📓',
    location: 'indoor', energy: ['low'],
    hasTracker: false, minKm: 0, checkpoint: null,
  },
  {
    id:         'read30',
    title:      'Lectura 30 minutos',
    desc:       'Lee un libro físico o ebook durante 30 minutos continuos. No cuentan artículos cortos.',
    detailDesc: 'Cuando termines, escribe en el chat del grupo en una línea de qué trataba lo que leíste. Sin eso, el reto no cuenta. Los libros de texto de la carrera también valen.',
    xp: 75, coins: 28,
    duration: '~30 min', type: 'Mental', difficulty: 'Fácil',
    badgeText: '🏠 Interior', badgeClass: 'indoor', icon: '📚',
    location: 'indoor', energy: ['low'],
    hasTracker: false, minKm: 0, checkpoint: null,
  },
  {
    id:         'no_social',
    title:      'Tarde sin redes sociales',
    desc:       'Pasa 4 horas sin abrir Instagram, TikTok, Twitter/X ni YouTube. Anota cómo te sientes.',
    detailDesc: 'Permitido: mensajería con amigos, llamadas, música. Prohibido: scroll infinito. Al final del período, escribe en el chat del grupo cómo pasaste el tiempo y cómo te sentiste.',
    xp: 100, coins: 40,
    duration: '4 horas', type: 'Mental', difficulty: 'Fácil',
    badgeText: '🏠 Interior', badgeClass: 'indoor', icon: '📵',
    location: 'indoor', energy: ['low'],
    hasTracker: false, minKm: 0, checkpoint: null,
  },

  /* ══════════════ INDOOR · MEDIUM ══════════════ */
  {
    id:         'pushups50',
    title:      '50 flexiones',
    desc:       'Haz 50 flexiones en un mismo día. Distribúyelas en series, pero el mismo día.',
    detailDesc: 'Cuenta cada una en voz alta. Puedes hacer series de 10, de 5 o como quieras, pero las 50 deben ser el mismo día. Si no puedes hacer flexiones normales, hazlas con las rodillas apoyadas. Graba la última serie.',
    xp: 100, coins: 38,
    duration: '~20 min', type: 'Físico', difficulty: 'Moderado',
    badgeText: '🏠 Interior', badgeClass: 'indoor', icon: '💪',
    location: 'indoor', energy: ['medium'],
    hasTracker: false, minKm: 0, checkpoint: null,
  },
  {
    id:         'squat100',
    title:      '100 sentadillas',
    desc:       'Haz 100 sentadillas en un día. Mantén la espalda recta y las rodillas sin pasar la punta de los pies.',
    detailDesc: 'Distribúyelas en series como quieras, todas el mismo día. Si te fallan las rodillas, baja el rango de movimiento. Graba la última serie para subirla al grupo como validación.',
    xp: 110, coins: 42,
    duration: '~25 min', type: 'Físico', difficulty: 'Moderado',
    badgeText: '🏠 Interior', badgeClass: 'indoor', icon: '🦵',
    location: 'indoor', energy: ['medium'],
    hasTracker: false, minKm: 0, checkpoint: null,
  },
  {
    id:         'plank3min',
    title:      'Plancha de 3 minutos',
    desc:       'Mantén la posición de plancha durante 3 minutos seguidos. Cronometra.',
    detailDesc: 'Puedes hacerla en cualquier superficie plana. Si a los 3 minutos seguidos no puedes, haz 3 series de 1 minuto con 30 segundos de descanso. Graba el último minuto para validar en el grupo.',
    xp: 90, coins: 35,
    duration: '~5 min', type: 'Físico', difficulty: 'Moderado',
    badgeText: '🏠 Interior', badgeClass: 'indoor', icon: '⏱️',
    location: 'indoor', energy: ['medium'],
    hasTracker: false, minKm: 0, checkpoint: null,
  },
  {
    id:         'cold_shower',
    title:      'Ducha fría completa',
    desc:       'Termina tu ducha con al menos 2 minutos de agua completamente fría.',
    detailDesc: 'Empieza por la nuca y baja hasta los pies. Nada de trampas. Al terminar escribe en el grupo "ducha completada" con la hora. La exposición al frío reduce el estrés y mejora la recuperación muscular.',
    xp: 120, coins: 45,
    duration: '~5 min', type: 'Físico', difficulty: 'Moderado',
    badgeText: '🏠 Interior', badgeClass: 'indoor', icon: '🚿',
    location: 'indoor', energy: ['medium'],
    hasTracker: false, minKm: 0, checkpoint: null,
  },
  {
    id:         'learn_skill',
    title:      'Aprende algo nuevo en 1 hora',
    desc:       'Dedica 1 hora a aprender algo concreto con una meta medible.',
    detailDesc: 'Un acorde de guitarra, 20 palabras en otro idioma, un truco de magia, la historia de un acontecimiento histórico... Lo que sea, pero con una meta clara que puedas demostrar. Al terminar cuéntaselo al grupo.',
    xp: 100, coins: 38,
    duration: '~1 hora', type: 'Mental', difficulty: 'Moderado',
    badgeText: '🏠 Interior', badgeClass: 'indoor', icon: '🎯',
    location: 'indoor', energy: ['medium'],
    hasTracker: false, minKm: 0, checkpoint: null,
  },
  {
    id:         'new_recipe',
    title:      'Cocina algo nuevo',
    desc:       'Cocina un plato que nunca hayas hecho antes desde cero. Saca una foto del resultado.',
    detailDesc: 'Busca la receta, compra los ingredientes (o usa lo que tengas) y prepáralo. Sin comida precocinada. Al terminar sube la foto al grupo. Mínimo 30 minutos de preparación real.',
    xp: 110, coins: 42,
    duration: '~1 hora', type: 'Social', difficulty: 'Moderado',
    badgeText: '🏠 Interior', badgeClass: 'indoor', icon: '🍳',
    location: 'indoor', energy: ['medium'],
    hasTracker: false, minKm: 0, checkpoint: null,
  },

  /* ══════════════ INDOOR · HIGH ══════════════ */
  {
    id:         'no_social_day',
    title:      'Día completo sin redes sociales',
    desc:       'Pasa TODO el día sin abrir Instagram, TikTok, Twitter/X ni YouTube.',
    detailDesc: 'Permitido: mensajería con amigos, llamadas, mapas. Prohibido: cualquier red social y YouTube. Al final del día escribe en el grupo 3 cosas que hiciste en lugar de mirar el móvil.',
    xp: 180, coins: 65,
    duration: 'Todo el día', type: 'Mental', difficulty: 'Intenso',
    badgeText: '🏠 Interior', badgeClass: 'indoor', icon: '📵',
    location: 'indoor', energy: ['high'],
    hasTracker: false, minKm: 0, checkpoint: null,
  },
  {
    id:         'cook_healthy',
    title:      'Cocina saludable 3 días',
    desc:       'Prepara al menos una comida saludable desde cero cada día durante 3 días seguidos.',
    detailDesc: 'Sin ultraprocesados. Ingredientes reales, preparación mínima de 20 minutos por comida. Sube una foto cada día al grupo. Al tercer día recibes el XP completo.',
    xp: 200, coins: 75,
    duration: '3 días', type: 'Social', difficulty: 'Intenso',
    badgeText: '🏠 Interior', badgeClass: 'indoor', icon: '🥗',
    location: 'indoor', energy: ['high'],
    hasTracker: false, minKm: 0, checkpoint: null,
  },

  /* ══════════════ RETOS DE GRUPO ══════════════ */
  {
    id:         'group_photo',
    title:      '📸 Foto de grupo en un lugar icónico',
    desc:       'Todos los miembros del grupo deben hacerse una foto juntos en un punto icónico de la ciudad.',
    detailDesc: 'Coordinaos para quedar en el mismo lugar. El reto se valida cuando todos los miembros suben una foto desde el mismo sitio. ¡Primero en quedar, primero en sumar XP grupal!',
    xp: 300, coins: 120,
    duration: 'Variable', type: 'Social', difficulty: 'Grupal',
    badgeText: '👥 Grupal', badgeClass: 'group', icon: '📸',
    location: 'outdoor', energy: ['low', 'medium', 'high'],
    hasTracker: false, minKm: 0,
    checkpoint: { name: 'Catedral de Santiago', query: 'Catedral de Santiago de Compostela' },
    arrivalRequired: true,
    groupOnly: true, isGroup: true,
  },
  {
    id:         'group_run',
    title:      '🏃 Carrera de grupo: 3 km juntos',
    desc:       'Todos los miembros del grupo deben completar 3 km corriendo el mismo día.',
    detailDesc: 'No tienen que ser al mismo tiempo, pero sí el mismo día. Cada miembro activa su tracker y corre sus 3 km. Cuando todos completan la distancia, el grupo recibe XP extra para todos.',
    xp: 200, coins: 80,
    duration: '~30 min', type: 'Físico', difficulty: 'Grupal',
    badgeText: '👥 Grupal', badgeClass: 'group', icon: '🏃',
    location: 'outdoor', energy: ['medium', 'high'],
    hasTracker: true, minKm: 3,
    checkpoint: null,
    groupOnly: true, isGroup: true,
  },
  {
    id:         'group_cook',
    title:      '🍳 Cena en casa: todos cocinan',
    desc:       'Cada miembro del grupo cocina una receta saludable el mismo día y la comparte en el chat.',
    detailDesc: 'La gracia está en que todos cocinan el mismo día aunque estéis en sitios distintos. Subid las fotos de vuestros platos al chat del grupo. Votad cuál tiene mejor pinta. El más votado recibe +50 XP extra.',
    xp: 180, coins: 70,
    duration: '~1 hora', type: 'Social', difficulty: 'Grupal',
    badgeText: '👥 Grupal', badgeClass: 'group', icon: '🍳',
    location: 'indoor', energy: ['low', 'medium', 'high'],
    hasTracker: false, minKm: 0, checkpoint: null,
    groupOnly: true, isGroup: true,
  },
  {
    id:         'group_trivia',
    title:      '🧠 Trivia de grupo en tiempo real',
    desc:       'Todos los miembros responden 10 preguntas de cultura general al mismo tiempo.',
    detailDesc: 'Os coordinaos para conectaros al mismo tiempo. Cada uno responde individualmente en su app. Al final se suman los puntos del grupo. Si el grupo acierta más del 70%, todos reciben XP doble.',
    xp: 150, coins: 60,
    duration: '~20 min', type: 'Mental', difficulty: 'Grupal',
    badgeText: '👥 Grupal', badgeClass: 'group', icon: '🧠',
    location: 'indoor', energy: ['low', 'medium', 'high'],
    hasTracker: false, minKm: 0, checkpoint: null,
    groupOnly: true, isGroup: true,
  },
];

/* ─────────────────────────────────────────────
   FUNCIONES DE SELECCIÓN DE RETO
───────────────────────────────────────────── */
function getChallengePool(type, energy) {
  let resolvedType = type;
  if (type === 'random') {
    resolvedType = Math.random() > 0.5 ? 'outdoor' : 'indoor';
  }
  return CHALLENGES_DB.filter(c =>
    !c.groupOnly &&
    c.location === resolvedType &&
    c.energy.includes(energy)
  );
}

function pickChallengeForUser(type, energy, userId, dateStr) {
  const pool = getChallengePool(type, energy);
  if (!pool.length) {
    const fallback = CHALLENGES_DB.filter(c => !c.groupOnly && c.location === (type === 'random' ? 'outdoor' : type));
    if (!fallback.length) return CHALLENGES_DB[0];
    return fallback[0];
  }
  const seed = `${userId}_${dateStr}_${type}_${energy}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length];
}

function pickGroupChallenge(groupId, dateStr) {
  const pool = CHALLENGES_DB.filter(c => c.groupOnly && c.isGroup);
  if (!pool.length) return null;
  const seed = `group_${groupId}_${dateStr}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length];
}

function isGroupChallengeDay(groupId, dateStr) {
  const seed = `gcd_${groupId}_${dateStr}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return (hash % 5) === 0;
}

/* ─────────────────────────────────────────────
   ESTADO LOCAL (localStorage)
───────────────────────────────────────────── */
function loadChallengeState() {
  try {
    const raw = localStorage.getItem(CHALLENGE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    completedIds:          [],
    todayDone:             false,
    todayDate:             null,
    groupTodayDone:        false,
    groupTodayDate:        null,
    currentChallenge:      null,
    currentGroupChallenge: null,
    pollChosen:            false,
    energyChosen:          false,
  };
}

function saveChallengeState(cs) {
  try { localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(cs)); } catch (e) {}
}

let challengeState = loadChallengeState();

/* ─────────────────────────────────────────────
   TRACKER GPS
───────────────────────────────────────────── */
let _trackerActive    = false;
let _trackerWatchId   = null;
let _trackerPoints    = [];
let _trackerKm        = 0;
let _trackerInterval  = null;
let _trackerChallenge = null;

function _haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
    * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function TRACKER_start(challenge) {
  if (_trackerActive) return;
  if (!navigator.geolocation) {
    if (typeof showToast === 'function') showToast('GPS no disponible en este dispositivo', 'error');
    return;
  }
  _trackerActive    = true;
  _trackerPoints    = [];
  _trackerKm        = 0;
  _trackerChallenge = challenge;

  _trackerUpdateUI();

  _trackerWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      const pt = { lat: pos.coords.latitude, lon: pos.coords.longitude, ts: Date.now() };
      if (_trackerPoints.length > 0) {
        const prev  = _trackerPoints[_trackerPoints.length - 1];
        const delta = _haversineKm(prev.lat, prev.lon, pt.lat, pt.lon);
        const dtSec = (pt.ts - prev.ts) / 1000;
        if (dtSec > 0 && (delta / dtSec) * 3600 < 180) {
          _trackerKm += delta;
        }
      }
      _trackerPoints.push(pt);
      _trackerUpdateUI();
      _trackerCheckArrival(pt.lat, pt.lon);
      _trackerCheckDistance();
    },
    (err) => console.warn('GPS error:', err.message),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
  );

  if (typeof showToast === 'function') showToast('📍 Tracker iniciado', 'success');
}

function TRACKER_stop() {
  if (!_trackerActive) return;
  _trackerActive = false;
  if (_trackerWatchId !== null) {
    navigator.geolocation.clearWatch(_trackerWatchId);
    _trackerWatchId = null;
  }
  _trackerUpdateUI();

  const minKm  = _trackerChallenge?.minKm || 0;
  const earned = minKm === 0 || _trackerKm >= minKm;

  if (earned) {
    if (typeof showToast === 'function') showToast(`✅ ${_trackerKm.toFixed(2)} km — ¡Reto superado!`, 'success');
    setTimeout(() => completeTodayChallenge(_trackerChallenge), 600);
  } else {
    if (typeof showToast === 'function') {
      showToast(`Solo ${_trackerKm.toFixed(2)} km de ${minKm} km necesarios`, 'error');
    }
  }
}

function _trackerUpdateUI() {
  const km    = document.getElementById('tracker-km');
  const btn   = document.getElementById('btn-tracker-toggle');
  const panel = document.getElementById('tracker-panel');

  // FIX: solo mostrar/ocultar si el panel existe en el DOM actual
  // No forzar display='' si el panel no corresponde al reto activo
  if (panel) {
    // El panel solo se muestra si el tracker está activo o tiene km registrados
    panel.style.display = (_trackerActive || _trackerKm > 0) ? '' : 'none';
  }

  if (km) {
    km.textContent = `${_trackerKm.toFixed(2)} km`;
  }

  if (btn) {
    if (_trackerActive) {
      btn.textContent = '⏹ Parar tracker';
      btn.className   = 'btn-tracker-stop';
    } else {
      btn.textContent = '▶ Iniciar tracker';
      btn.className   = 'btn-tracker-start';
    }
  }

  _trackerDrawRoute();
}

function _trackerDrawRoute() {
  const svg = document.getElementById('tracker-route-svg');
  if (!svg || _trackerPoints.length < 2) return;

  const lats   = _trackerPoints.map(p => p.lat);
  const lons   = _trackerPoints.map(p => p.lon);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const padLat = (maxLat - minLat) * 0.1 || 0.001;
  const padLon = (maxLon - minLon) * 0.1 || 0.001;

  const W = 300, H = 150;
  const toX = lon => ((lon - (minLon - padLon)) / ((maxLon + padLon) - (minLon - padLon))) * W;
  const toY = lat => H - ((lat - (minLat - padLat)) / ((maxLat + padLat) - (minLat - padLat))) * H;

  const pts      = _trackerPoints.map(p => `${toX(p.lon).toFixed(1)},${toY(p.lat).toFixed(1)}`).join(' ');
  const startPt  = _trackerPoints[0];
  const lastPt   = _trackerPoints[_trackerPoints.length - 1];

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = `
    <polyline points="${pts}"
      fill="none" stroke="#e8ff47" stroke-width="3"
      stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
    <circle cx="${toX(startPt.lon).toFixed(1)}" cy="${toY(startPt.lat).toFixed(1)}"
      r="5" fill="#4ade80"/>
    <circle cx="${toX(lastPt.lon).toFixed(1)}"  cy="${toY(lastPt.lat).toFixed(1)}"
      r="5" fill="#e8ff47"/>
  `;
}

function _trackerCheckArrival(lat, lon) {
  const ch = _trackerChallenge;
  if (!ch?.arrivalRequired || !window.CTX?.checkpoint) return;

  const cpLat = window.CTX.checkpoint.lat;
  const cpLon = window.CTX.checkpoint.lon;
  if (!cpLat || !cpLon) return;

  const distM  = _haversineKm(lat, lon, cpLat, cpLon) * 1000;
  const distEl = document.getElementById('tracker-dist-to-cp');
  if (distEl) distEl.textContent = `📍 ${distM < 1000 ? Math.round(distM) + 'm' : (distM / 1000).toFixed(1) + 'km'} al objetivo`;

  if (distM <= ARRIVAL_RADIUS_METERS) {
    TRACKER_stop();
    if (typeof showToast === 'function') showToast('🎯 ¡Has llegado al punto de control!', 'success');
  }
}

function _trackerCheckDistance() {
  const minKm = _trackerChallenge?.minKm || 0;
  if (minKm > 0 && _trackerKm >= minKm) {
    const msg = document.getElementById('tracker-status-msg');
    if (msg) { msg.textContent = '✅ ¡Distancia mínima alcanzada!'; msg.style.color = 'var(--green)'; }
  }
}

/* ─────────────────────────────────────────────
   COMPLETAR RETO
───────────────────────────────────────────── */
function completeTodayChallenge(challenge) {
  challenge = challenge || window.CTX?.challenge;
  if (!challenge) return;

  const today = todayString();

  if (challengeState.todayDone && challengeState.todayDate === today) {
    if (typeof showToast === 'function') showToast('¡Ya completaste el reto de hoy! 🎉', '');
    return;
  }

  challengeState.todayDone = true;
  challengeState.todayDate = today;
  const entryId = challenge.id + '_' + today;
  if (!challengeState.completedIds.includes(entryId)) {
    challengeState.completedIds.push(entryId);
  }
  saveChallengeState(challengeState);

  if (typeof state !== 'undefined' && state.userDoc) {
    state.userDoc.xp     = (state.userDoc.xp    || 0) + challenge.xp;
    state.userDoc.coins  = (state.userDoc.coins  || 0) + challenge.coins;
    state.userDoc.streak = (state.userDoc.streak || 0) + 1;
    if (!state.userDoc.completedChallenges) state.userDoc.completedChallenges = [];
    state.userDoc.completedChallenges.unshift({
      id: challenge.id, name: challenge.title, xp: challenge.xp,
      date: today, timestamp: Date.now(),
    });
    if (typeof updateProfileUI === 'function') updateProfileUI();
    if (typeof saveUser === 'function') {
      saveUser({
        xp:                  state.userDoc.xp,
        coins:               state.userDoc.coins,
        streak:              state.userDoc.streak,
        completedChallenges: state.userDoc.completedChallenges,
      });
    }
  }

  markChallengeCardDone(challenge);
  if (typeof showCelebration === 'function') showCelebration(challenge.xp, challenge.coins);
  else if (typeof showToast === 'function') showToast(`¡+${challenge.xp} XP! 🔥`, 'success');
}

/* ─────────────────────────────────────────────
   RENDERIZADO
───────────────────────────────────────────── */
function todayString() {
  const d   = new Date();
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Renderiza el reto en la challenge card.
 * FIX: sincroniza window.CTX.challenge para que el modal
 * y MAPS_loadForCurrentChallenge reciban siempre el reto correcto.
 */
function renderChallengeCard(challenge) {
  if (!challenge) return;
  challengeState.currentChallenge = challenge;
  saveChallengeState(challengeState);

  // FIX: sincronizar CTX con el reto que se va a renderizar
  if (window.CTX) {
    window.CTX.challenge = challenge;
    if (typeof window.MoveUp?.onUpdate === 'function') {
      window.MoveUp.onUpdate({ ...window.CTX });
    }
  }

  const today = todayString();
  const done  = challengeState.todayDone && challengeState.todayDate === today;

  const locationLabel = { outdoor: '🌳 Exterior', indoor: '🏠 Interior' };
  const loc = challenge.badgeClass === 'group'
    ? '👥 Grupal'
    : (locationLabel[challenge.location] || challenge.badgeText);

  const card = document.getElementById('challenge-card');
  if (!card) return;

  // Tracker: el panel se renderiza pero oculto por defecto si el tracker no está activo
  // Solo se muestra cuando el usuario pulsa "Iniciar tracker"
  const trackerHTML = challenge.hasTracker ? `
    <div id="tracker-panel" class="tracker-panel" style="display:none">
      <div class="tracker-stats">
        <div class="tracker-km-wrap">
          <span class="tracker-km" id="tracker-km">0.00 km</span>
          ${challenge.minKm > 0 ? `<span class="tracker-min">/ ${challenge.minKm} km mínimo</span>` : ''}
        </div>
        <span class="tracker-status" id="tracker-status-msg"></span>
        ${challenge.arrivalRequired ? `<span class="tracker-dist-cp" id="tracker-dist-to-cp">📍 Calculando distancia...</span>` : ''}
      </div>
      <svg id="tracker-route-svg" class="tracker-route-svg" viewBox="0 0 300 150"></svg>
    </div>
  ` : '';

  // Botón de tracker separado del panel (siempre visible si hasTracker)
  const trackerBtnHTML = challenge.hasTracker ? `
    <button class="btn-tracker-start" id="btn-tracker-toggle">▶ Iniciar tracker</button>
  ` : '';

  card.innerHTML = `
    <div class="challenge-header">
      <span class="challenge-type-badge ${challenge.badgeClass}">${loc}</span>
      <span class="challenge-xp">+${challenge.xp} XP</span>
    </div>
    <h2 class="challenge-title">${challenge.icon} ${challenge.title}</h2>
    <p class="challenge-desc">${challenge.desc}</p>
    <div class="challenge-meta">
      <span class="meta-item">⏱️ ${challenge.duration}</span>
      <span class="meta-item">💪 ${challenge.type}</span>
      <span class="meta-item">🌡️ ${challenge.difficulty}</span>
    </div>
    ${trackerHTML}
    ${trackerBtnHTML}
    <div class="challenge-actions">
      <button class="btn-primary btn-complete" id="btn-complete-challenge" ${done ? 'disabled' : ''}>
        ${done ? '✅ ¡Ya completado!' : '✅ Marcar completado'}
      </button>
      <button class="btn-secondary btn-details" id="btn-challenge-details">Ver detalles</button>
    </div>
    ${done ? '<p class="challenge-done-label">🏆 Reto completado hoy — ¡buen trabajo!</p>' : ''}
  `;

  // Listeners
  card.querySelector('#btn-complete-challenge')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (_trackerActive) TRACKER_stop();
    else completeTodayChallenge(challenge);
  });

  card.querySelector('#btn-challenge-details')?.addEventListener('click', (e) => {
    e.stopPropagation();
    // FIX: pasar el challenge actual directamente a renderChallengeDetailModal
    // en vez de depender de window.CTX.challenge (que podría estar desincronizado)
    renderChallengeDetailModal(challenge, done);
    if (typeof openModal === 'function') openModal('modal-challenge-detail');
    if (typeof MAPS_loadForCurrentChallenge === 'function') MAPS_loadForCurrentChallenge();
  });

  card.querySelector('#btn-tracker-toggle')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (_trackerActive) {
      TRACKER_stop();
    } else {
      TRACKER_start(challenge);
      // Mostrar el panel al iniciar
      const panel = document.getElementById('tracker-panel');
      if (panel) panel.style.display = '';
    }
  });

  // Animación
  card.classList.remove('challenge-enter');
  void card.offsetWidth;
  card.classList.add('challenge-enter');
}

/**
 * Rellena el modal de detalle con el reto.
 * FIX: recibe el challenge directamente, no depende de CTX.
 */
function renderChallengeDetailModal(challenge, done = false) {
  const el = (id) => document.getElementById(id);

  if (!challenge) return;

  if (el('detail-type-badge')) {
    el('detail-type-badge').textContent = challenge.badgeText;
    el('detail-type-badge').className   = `challenge-detail-type ${challenge.badgeClass}`;
  }
  if (el('detail-title'))      el('detail-title').textContent      = `${challenge.icon} ${challenge.title}`;
  if (el('detail-desc'))       el('detail-desc').textContent       = challenge.detailDesc || challenge.desc;
  if (el('detail-duration'))   el('detail-duration').textContent   = challenge.duration;
  if (el('detail-xp'))         el('detail-xp').textContent         = `+${challenge.xp}`;
  if (el('detail-type'))       el('detail-type').textContent       = challenge.type;
  if (el('detail-difficulty')) el('detail-difficulty').textContent = challenge.difficulty;

  const btnModal = el('btn-modal-complete');
  if (btnModal) {
    btnModal.disabled    = done;
    btnModal.textContent = done ? '✅ Ya completado' : '✅ Reto completado';
    const newBtn = btnModal.cloneNode(true);
    btnModal.parentNode.replaceChild(newBtn, btnModal);
    newBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof closeModal === 'function') closeModal('modal-challenge-detail');
      completeTodayChallenge(challenge);
    });
  }
}

function markChallengeCardDone(challenge) {
  const btn = document.getElementById('btn-complete-challenge');
  if (btn) { btn.disabled = true; btn.textContent = '✅ ¡Ya completado!'; }
  const card = document.getElementById('challenge-card');
  if (card && !card.querySelector('.challenge-done-label')) {
    const label = document.createElement('p');
    label.className   = 'challenge-done-label';
    label.textContent = '🏆 Reto completado hoy — ¡buen trabajo!';
    card.appendChild(label);
  }
}

function renderChallengePlaceholder() {
  const card = document.getElementById('challenge-card');
  if (!card) return;
  card.innerHTML = `
    <div class="challenge-placeholder">
      <span class="challenge-placeholder-icon">🎯</span>
      <h2 class="challenge-placeholder-title">Tu reto de hoy</h2>
      <p class="challenge-placeholder-desc">
        Elige dónde quieres hacer el reto y tu nivel de energía para descubrirlo.
        Una vez elegido, no podrás cambiarlo.
      </p>
    </div>
  `;
}

function getCompletedHistory(limit = 10) {
  if (typeof state !== 'undefined' && state.userDoc?.completedChallenges?.length) {
    return state.userDoc.completedChallenges.slice(0, limit);
  }
  return challengeState.completedIds
    .slice(-limit).reverse()
    .map(entry => {
      const [id, date] = entry.split('_');
      const found = CHALLENGES_DB.find(c => c.id === id);
      return found ? { id, name: found.title, xp: found.xp, date, icon: found.icon } : null;
    })
    .filter(Boolean);
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
function initChallenges() {
  const today = todayString();

  // Si ya eligió hoy, restaurar el reto guardado
  if (challengeState.pollChosen && challengeState.todayDate === today && challengeState.currentChallenge) {
    // Buscar el reto en CHALLENGES_DB por id para obtener datos frescos
    // (el objeto del localStorage puede estar desactualizado)
    const savedId    = challengeState.currentChallenge.id;
    const freshData  = CHALLENGES_DB.find(c => c.id === savedId);
    const challenge  = freshData || challengeState.currentChallenge;
    renderChallengeCard(challenge);

    // Ocultar secciones de elección
    const energySection = document.getElementById('poll-energy-section');
    if (energySection) energySection.style.display = 'none';

    // Marcar visualmente los botones de tipo/energía si se conocen
    if (window.CTX?.pollType) {
      document.querySelectorAll('.poll-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.vote === window.CTX.pollType);
      });
    }
    return;
  }

  // No ha elegido aún: mostrar placeholder
  renderChallengePlaceholder();
}

// Exposición global
window.CHALLENGES_DB          = CHALLENGES_DB;
window.getChallengePool       = getChallengePool;
window.pickChallengeForUser   = pickChallengeForUser;
window.pickGroupChallenge     = pickGroupChallenge;
window.isGroupChallengeDay    = isGroupChallengeDay;
window.renderChallengeCard    = renderChallengeCard;
window.completeTodayChallenge = completeTodayChallenge;
window.TRACKER_start          = TRACKER_start;
window.TRACKER_stop           = TRACKER_stop;
window.initChallenges         = initChallenges;
window.todayString            = todayString;
window.challengeState         = challengeState;
window.saveChallengeState     = saveChallengeState;
window.getCompletedHistory    = getCompletedHistory;