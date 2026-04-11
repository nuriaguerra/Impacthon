// ═══════════════════════════════════════════════
//  TOUCHGRASS — challenges.js
//  Sistema de retos: 100% local, sen Firebase.
//  Inclúe: array de retos, selección por data,
//  completar reto, suma de XP e actualización UI.
// ═══════════════════════════════════════════════

/* ─────────────────────────────────────────────
   ARRAY DE RETOS
   Campos: id, name, desc, xp, duration, type
           ('physical'|'mental'), location
           ('indoor'|'outdoor'), difficulty
           ('easy'|'medium'|'hard'), icon
───────────────────────────────────────────── */
const CHALLENGES = [
  {
    id: 'run5k',
    name: 'Carrera de 5 km',
    desc: 'Completa 5 kilómetros corriendo ou camiñando rápido. O percorrido é libre, ti decides a ruta. Podes usar calquera app de running para rexistrar a distancia.',
    xp: 150,
    duration: '~45 min',
    type: 'physical',
    location: 'outdoor',
    difficulty: 'medium',
    icon: '🏃',
  },
  {
    id: 'meditation10',
    name: 'Meditación 10 minutos',
    desc: 'Senta en silencio, pecha os ollos e céntrate na respiración durante 10 minutos seguidos. Sen móbil, sen música. Podes usar un temporizador.',
    xp: 80,
    duration: '~10 min',
    type: 'mental',
    location: 'indoor',
    difficulty: 'easy',
    icon: '🧘',
  },
  {
    id: 'cold_shower',
    name: 'Ducha fría completa',
    desc: 'Termina a túa ducha con polo menos 2 minutos de auga completamente fría. Empeza pola nuca e baixa ata os pés. Nada de trampa.',
    xp: 120,
    duration: '~5 min',
    type: 'physical',
    location: 'indoor',
    difficulty: 'medium',
    icon: '🚿',
  },
  {
    id: 'pushups50',
    name: '50 flexiones',
    desc: 'Fai 50 flexiones nun mesmo día. Podes distribuílas en series como queiras, pero ten que ser o mesmo día. Conta cada unha en voz alta.',
    xp: 100,
    duration: '~20 min',
    type: 'physical',
    location: 'indoor',
    difficulty: 'medium',
    icon: '💪',
  },
  {
    id: 'journaling',
    name: 'Diario de gratitud',
    desc: 'Escribe nun papel ou no móbil polo menos 5 cousas polas que estás agradecido hoxe. Sé específico: nada de "a miña familia" en xeral, entra en detalle.',
    xp: 70,
    duration: '~15 min',
    type: 'mental',
    location: 'indoor',
    difficulty: 'easy',
    icon: '📓',
  },
  {
    id: 'hike',
    name: 'Ruta de senderismo',
    desc: 'Fai unha ruta de senderismo de polo menos 5 km. Pode ser un monte, un parque forestal ou un camiño rural. Fai unha foto no punto máis alto ou bonito.',
    xp: 200,
    duration: '~2 horas',
    type: 'physical',
    location: 'outdoor',
    difficulty: 'hard',
    icon: '🥾',
  },
  {
    id: 'no_social',
    name: 'Día sen redes sociais',
    desc: 'Pasa todo o día sen abrir Instagram, TikTok, Twitter/X nin YouTube. Permitido: mensaxería con amigos e chamadas. Rexistra como te sentes ao final.',
    xp: 130,
    duration: 'Todo o día',
    type: 'mental',
    location: 'indoor',
    difficulty: 'hard',
    icon: '📵',
  },
  {
    id: 'plank3min',
    name: 'Plancha de 3 minutos',
    desc: 'Mantén a posición de plancha durante 3 minutos seguidos. Podes facelo en calquera superficie plana. Cronometra e non te rindas!',
    xp: 90,
    duration: '~5 min',
    type: 'physical',
    location: 'indoor',
    difficulty: 'medium',
    icon: '⏱️',
  },
  {
    id: 'read30',
    name: 'Lectura 30 minutos',
    desc: 'Le un libro físico ou ebook durante 30 minutos continuos. Non conta ler artigos curtos nin redes sociais. Cando remates, escribe nunha liña de qué tratar o que leches.',
    xp: 75,
    duration: '~30 min',
    type: 'mental',
    location: 'indoor',
    difficulty: 'easy',
    icon: '📚',
  },
  {
    id: 'bike10k',
    name: 'Bicicleta 10 km',
    desc: 'Pedalea 10 km sen parar (agás semáforos). Pode ser en bici de estrada, de montaña ou mesmo bici estática no ximnasio. Rexistra a ruta.',
    xp: 140,
    duration: '~35 min',
    type: 'physical',
    location: 'outdoor',
    difficulty: 'medium',
    icon: '🚴',
  },
  {
    id: 'new_recipe',
    name: 'Cocina algo novo',
    desc: 'Cociña un prato que nunca fixeras antes. Busca a receita, merda os ingredientes e prepáraa desde cero. Fai unha foto do resultado final.',
    xp: 110,
    duration: '~1 hora',
    type: 'mental',
    location: 'indoor',
    difficulty: 'medium',
    icon: '🍳',
  },
  {
    id: 'swim',
    name: '500 m a nado',
    desc: 'Nada 500 metros nun lago, piscina ou no mar sen parar. Podes alternar estilos, pero non podes tocar as paredes para descansar.',
    xp: 180,
    duration: '~25 min',
    type: 'physical',
    location: 'outdoor',
    difficulty: 'hard',
    icon: '🏊',
  },
  {
    id: 'learn_skill',
    name: 'Aprende algo novo en 1 hora',
    desc: 'Dedica 1 hora a aprender algo concreto: un acorde de guitarra, 20 palabras nun idioma novo, un truco de mazo de cartas... O que sexa, pero cunha meta medible.',
    xp: 100,
    duration: '~1 hora',
    type: 'mental',
    location: 'indoor',
    difficulty: 'medium',
    icon: '🎯',
  },
  {
    id: 'sunrise',
    name: 'Levántate co sol',
    desc: 'Pon o alarmó 10 minutos antes do amencer, saí fóra e observa o sol saír. Sen móbil durante os primeiros 5 minutos. Respira fondo e sé presente.',
    xp: 120,
    duration: '~15 min',
    type: 'mental',
    location: 'outdoor',
    difficulty: 'medium',
    icon: '🌅',
  },
  {
    id: 'squat100',
    name: '100 sentadillas',
    desc: 'Fai 100 sentadillas nun día. Distribúeas en series, pero todas co día. Bota as costas rectas e os xeonllos non pasen das punteiras dos pés.',
    xp: 110,
    duration: '~25 min',
    type: 'physical',
    location: 'indoor',
    difficulty: 'medium',
    icon: '🦵',
  },
];

/* ─────────────────────────────────────────────
   ESTADO LOCAL DOS RETOS
   (persistido en localStorage para que aguante
    recargas mentres non hai Firebase)
───────────────────────────────────────────── */
const CHALLENGE_STORAGE_KEY = 'tg_challenge_state';

function loadChallengeState() {
  try {
    const raw = localStorage.getItem(CHALLENGE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignora JSON roto */ }
  return {
    completedIds: [],   // ids de retos completados (historial)
    todayDone: false,   // completouse o reto de hoxe?
    todayDate: null,    // 'YYYY-MM-DD' do último reto completado
  };
}

function saveChallengeState(cs) {
  try {
    localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(cs));
  } catch (e) { /* ignora se non hai localStorage */ }
}

// Estado reactivo: fusiona co estado global de app.js se existe.
// Se state non está definido (este arquivo cárgase só), créase un local.
let challengeState = loadChallengeState();

/* ─────────────────────────────────────────────
   SELECCIÓN DO RETO DO DÍA
   → Determinista por data: todos os usuarios
     do mesmo grupo ven o mesmo reto cada día.
───────────────────────────────────────────── */

/**
 * Devolve a string 'YYYY-MM-DD' do día actual.
 */
function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Devolve o índice do reto para unha data dada.
 * Algoritmo: hash numérico do string 'YYYY-MM-DD' módulo total de retos.
 * Reproducible en calquera dispositivo sen servidor.
 */
function challengeIndexForDate(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0; // unsigned 32-bit
  }
  return hash % CHALLENGES.length;
}

/**
 * Devolve o obxecto reto do día actual.
 */
function getTodayChallenge() {
  const idx = challengeIndexForDate(todayString());
  return CHALLENGES[idx];
}

/* ─────────────────────────────────────────────
   LÓXICA DE COMPLETAR RETO
───────────────────────────────────────────── */

/**
 * Chama a esta función para rexistrar o reto de hoxe como completado.
 * - Suma XP ao state (global de app.js ou local).
 * - Persiste en localStorage.
 * - Actualiza a UI.
 * - Mostra a animación de celebración.
 */
function completeTodayChallenge() {
  const today = todayString();
  const challenge = getTodayChallenge();

  // Gardia: xa completado hoxe
  if (challengeState.todayDone && challengeState.todayDate === today) {
    showToast('¡Ya completaste el reto de hoy! 🎉', '');
    return;
  }

  // Actualizar estado local dos retos
  challengeState.todayDone   = true;
  challengeState.todayDate   = today;
  if (!challengeState.completedIds.includes(challenge.id + '_' + today)) {
    challengeState.completedIds.push(challenge.id + '_' + today);
  }
  saveChallengeState(challengeState);

  // ── Sumar XP ao estado global de app.js ──
  // Se state.userDoc existe (Firebase cargado) sumamos alí.
  // Se non, traballamos cun estado local mínimo.
  if (typeof state !== 'undefined' && state.userDoc) {
    state.userDoc.xp     = (state.userDoc.xp     || 0) + challenge.xp;
    state.userDoc.coins  = (state.userDoc.coins   || 0) + Math.round(challenge.xp / 3);
    state.userDoc.streak = (state.userDoc.streak  || 0) + 1;
    // Engadir ao historial de completados
    if (!state.userDoc.completedChallenges) state.userDoc.completedChallenges = [];
    state.userDoc.completedChallenges.unshift({
      id:        challenge.id,
      name:      challenge.name,
      xp:        challenge.xp,
      date:      today,
      timestamp: Date.now(),
    });

    // Actualizar UI global
    if (typeof updateProfileUI === 'function') updateProfileUI();
    if (typeof saveUser === 'function') {
      // Persistir en Firebase se está dispoñible
      saveUser({
        xp:                  state.userDoc.xp,
        coins:               state.userDoc.coins,
        streak:              state.userDoc.streak,
        completedChallenges: state.userDoc.completedChallenges,
      });
    }
  }

  // Marcar o botón como completado
  markChallengeCardDone(challenge);

  // Mostrar celebración
  const coinsEarned = Math.round(challenge.xp / 3);
  if (typeof showCelebration === 'function') {
    showCelebration(challenge.xp, coinsEarned);
  } else {
    showToast(`¡+${challenge.xp} XP conseguidos! 🔥`, 'success');
  }
}

/* ─────────────────────────────────────────────
   RENDERIZADO DA TARXETA DO RETO
───────────────────────────────────────────── */

/**
 * Renderiza o reto do día no card existente no HTML.
 */
function renderTodayChallenge() {
  const challenge = getTodayChallenge();
  const today     = todayString();
  const done      = challengeState.todayDone && challengeState.todayDate === today;

  // Localización en español de tipo e dificultade
  const typeLabel = {
    physical: 'Físico',
    mental:   'Mental',
  };
  const diffLabel = {
    easy:   'Suave',
    medium: 'Moderado',
    hard:   'Intenso',
  };
  const locationLabel = {
    indoor:  '🏠 Interior',
    outdoor: '🌳 Exterior',
  };

  // ── Tarxeta principal (page-home) ──
  const card = document.getElementById('challenge-card');
  if (card) {
    card.innerHTML = `
      <div class="challenge-header">
        <span class="challenge-type-badge ${challenge.location}">${locationLabel[challenge.location]}</span>
        <span class="challenge-xp">+${challenge.xp} XP</span>
      </div>
      <h2 class="challenge-title">${challenge.icon} ${challenge.name}</h2>
      <p class="challenge-desc">${challenge.desc}</p>
      <div class="challenge-meta">
        <span class="meta-item">⏱️ ${challenge.duration}</span>
        <span class="meta-item">💪 ${typeLabel[challenge.type]}</span>
        <span class="meta-item">🌡️ ${diffLabel[challenge.difficulty]}</span>
      </div>
      <div class="challenge-actions">
        <button class="btn-primary btn-complete" id="btn-complete-challenge" ${done ? 'disabled' : ''}>
          ${done ? '✅ ¡Ya completado!' : '✅ Marcar completado'}
        </button>
        <button class="btn-secondary btn-details" id="btn-challenge-details">
          Ver detalles
        </button>
      </div>
      ${done ? '<p class="challenge-done-label">🏆 Reto completado hoy — ¡buen trabajo!</p>' : ''}
    `;

    // Re-enganchar listeners (innerHTML borra os anteriores)
    card.querySelector('#btn-complete-challenge')?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeModal('modal-challenge-detail');
      completeTodayChallenge();
    });
    card.querySelector('#btn-challenge-details')?.addEventListener('click', (e) => {
      e.stopPropagation();
      renderChallengeDetailModal(challenge, done);
      openModal('modal-challenge-detail');
    });
  }

  // ── Label no poll header ──
  const pollLabel = document.querySelector('#daily-poll .poll-label');
  if (pollLabel) pollLabel.textContent = `${challenge.icon} Reto de hoy`;
}

/**
 * Rellena el modal de detalle co reto recibido.
 */
function renderChallengeDetailModal(challenge, done = false) {
  const typeLabel = { physical: 'Físico', mental: 'Mental' };
  const diffLabel = { easy: 'Suave', medium: 'Moderado', hard: 'Intenso' };
  const locationLabel = { indoor: '🏠 Interior', outdoor: '🌳 Exterior' };

  const el = (id) => document.getElementById(id);

  if (el('detail-type-badge')) {
    el('detail-type-badge').textContent  = locationLabel[challenge.location];
    el('detail-type-badge').className    = `challenge-detail-type ${challenge.location}`;
  }
  if (el('detail-title'))      el('detail-title').textContent      = `${challenge.icon} ${challenge.name}`;
  if (el('detail-desc'))       el('detail-desc').textContent       = challenge.desc;
  if (el('detail-duration'))   el('detail-duration').textContent   = challenge.duration;
  if (el('detail-xp'))         el('detail-xp').textContent         = `+${challenge.xp}`;
  if (el('detail-type'))       el('detail-type').textContent       = typeLabel[challenge.type];
  if (el('detail-difficulty')) el('detail-difficulty').textContent = diffLabel[challenge.difficulty];

  const btnModal = el('btn-modal-complete');
  if (btnModal) {
    btnModal.disabled    = done;
    btnModal.textContent = done ? '✅ Ya completado' : '✅ Reto completado';
    // Limpar listener anterior e engadir novo
    const newBtn = btnModal.cloneNode(true);
    btnModal.parentNode.replaceChild(newBtn, btnModal);
    newBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeModal('modal-challenge-detail');
      completeTodayChallenge();
    });
  }
}

/**
 * Pon a tarxeta en estado "completado" visualmente (sen re-renderizar todo).
 */
function markChallengeCardDone(challenge) {
  const btn = document.getElementById('btn-complete-challenge');
  if (btn) {
    btn.disabled     = true;
    btn.textContent  = '✅ ¡Ya completado!';
  }
  // Engadir etiqueta de completado se non existe
  const card = document.getElementById('challenge-card');
  if (card && !card.querySelector('.challenge-done-label')) {
    const label = document.createElement('p');
    label.className   = 'challenge-done-label';
    label.textContent = '🏆 Reto completado hoy — ¡buen trabajo!';
    card.appendChild(label);
  }
}

/* ─────────────────────────────────────────────
   HISTORIAL DE RETOS (para renderChallengeHistory
   en app.js, que busca state.userDoc.completedChallenges)
───────────────────────────────────────────── */

/**
 * Devolve os últimos N retos completados, fusionando
 * os datos de localStorage cos de Firebase se existen.
 */
function getCompletedHistory(limit = 10) {
  // Se temos Firebase, usamos o seu array (xa está en state.userDoc)
  if (typeof state !== 'undefined' && state.userDoc?.completedChallenges?.length) {
    return state.userDoc.completedChallenges.slice(0, limit);
  }
  // Fallback: reconstruír desde localStorage
  return challengeState.completedIds
    .slice(-limit)
    .reverse()
    .map(entry => {
      const [id, date] = entry.split('_');
      const found = CHALLENGES.find(c => c.id === id);
      return found ? { id, name: found.name, xp: found.xp, date, icon: found.icon } : null;
    })
    .filter(Boolean);
}

/* ─────────────────────────────────────────────
   INIT: chámase desde DOMContentLoaded en app.js
   ou desde aquí se se carga só este arquivo.
───────────────────────────────────────────── */

/**
 * Inicializa o sistema de retos.
 * Chama a esta función no DOMContentLoaded DESPOIS de
 * que Firebase cargue (ou inmediatamente se é modo local).
 */
function initChallenges() {
  renderTodayChallenge();
  console.log(
    `[Challenges] Reto de hoy (${todayString()}): "${getTodayChallenge().name}" — ${getTodayChallenge().xp} XP`
  );
}

// Auto-init se o DOM xa está listo cando este script carga
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChallenges);
} else {
  initChallenges();
}
