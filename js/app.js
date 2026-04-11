// ═══════════════════════════════════════════════
//  MOVEUP — app.js
//  Lóxica principal: navegación, grupos, retos,
//  leaderboard, modais e toasts.
//  Firebase desactivado ata ter credenciais reais.
// ═══════════════════════════════════════════════

/* ─────────────────────────────────────────────
   ESTADO GLOBAL
───────────────────────────────────────────── */
const state = {
  user:        null,
  userDoc:     null,
  group:       null,
  currentPage: 'home',
  pollVoted:   false,
};

/* ─────────────────────────────────────────────
   DATOS MOCK
───────────────────────────────────────────── */
const MOCK = {
  leaderboard: [
    { uid: 'u1', name: 'Ana García',  xp: 3200, streak: 14, avatar: '🦊', rank: 1 },
    { uid: 'me', name: 'Tú',          xp: 2400, streak:  7, avatar: '⚡', rank: 2 },
    { uid: 'u2', name: 'Carlos M.',   xp: 1980, streak:  5, avatar: '🐺', rank: 3 },
    { uid: 'u3', name: 'Marta R.',    xp: 1500, streak:  3, avatar: '🦅', rank: 4 },
    { uid: 'u4', name: 'Pablo S.',    xp:  900, streak:  1, avatar: '🐉', rank: 5 },
  ],
  challengeHistory: [
    { name: 'Carrera 5km',        date: 'Ayer',        xp: 150, type: '🌳' },
    { name: 'Meditación 10 min',  date: 'Hace 2 días', xp:  80, type: '🏠' },
    { name: 'Encuentra el lugar', date: 'Hace 3 días', xp: 200, type: '📍' },
    { name: 'Reto de flexiones',  date: 'Hace 4 días', xp: 120, type: '💪' },
  ],
  shopItems: {
    powerups: [
      { id: 'xp2x',   name: 'XP x2 (1 día)', icon: '⚡', price: 100 },
      { id: 'shield', name: 'Escudo racha',   icon: '🛡️', price: 150 },
      { id: 'skip',   name: 'Saltar reto',    icon: '⏭️', price: 200 },
      { id: 'hint',   name: 'Pista extra',    icon: '💡', price:  50 },
    ],
    avatars: [
      { id: 'av1', name: 'Zorro élite', icon: '🦊', price: 300 },
      { id: 'av2', name: 'Lobo alfa',   icon: '🐺', price: 300 },
      { id: 'av3', name: 'Águila real', icon: '🦅', price: 400 },
      { id: 'av4', name: 'Dragón',      icon: '🐉', price: 500 },
    ],
    titles: [
      { id: 't1', name: 'Corredor Élite',  icon: '🏃', price: 200 },
      { id: 't2', name: 'Mente de Hierro', icon: '🧠', price: 200 },
      { id: 't3', name: 'Explorador',      icon: '🗺️', price: 250 },
      { id: 't4', name: 'Leyenda',         icon: '👑', price: 800 },
    ],
  },
  notifications: [
    {
      id: 'n1', type: 'invite', unread: true,
      icon: '📨',
      title: 'Invitación de grupo',
      sub: 'Carlos M. te invita a "Runners 2025"',
      hasActions: true,
    },
    {
      id: 'n2', type: 'challenge', unread: true,
      icon: '🏆',
      title: '¡Ana superó tu puntuación!',
      sub: 'Ana García tiene ahora 3200 XP',
      hasActions: false,
    },
    {
      id: 'n3', type: 'streak', unread: false,
      icon: '🔥',
      title: 'Racha de 7 días',
      sub: '¡Sigue así! No rompas tu racha hoy.',
      hasActions: false,
    },
  ],
  achievements: [
    { icon: '🔥', name: 'Racha 7d',    unlocked: true  },
    { icon: '💪', name: 'Primer reto', unlocked: true  },
    { icon: '🏃', name: '10 retos',    unlocked: true  },
    { icon: '🌳', name: 'Explorador',  unlocked: false },
    { icon: '🧠', name: 'Mental x5',   unlocked: false },
    { icon: '👑', name: 'Nº1 semana',  unlocked: false },
    { icon: '🌍', name: 'Viajero',     unlocked: false },
    { icon: '🎯', name: '30 retos',    unlocked: false },
  ],
};

/* ─────────────────────────────────────────────
   UTILIDADES
───────────────────────────────────────────── */

function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.className = 'toast'; }, 2800);
}

// Mostra só a pantalla indicada, oculta o resto
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// Navega a unha páxina dentro da app, asegurando
// que todos os modais están pechados antes
function navigateTo(pageId) {
  // Pechar calquera modal aberto antes de navegar
  closeAllModals();

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === pageId);
  });
  const page = document.getElementById(`page-${pageId}`);
  if (page) page.classList.add('active');
  state.currentPage = pageId;
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

// Pecha TODOS os modais dunha vez
function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

function genGroupCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/* ─────────────────────────────────────────────
   TIMER: conta atrás ata medianoche
───────────────────────────────────────────── */
function startPollTimer() {
  const el = document.getElementById('poll-timer');
  if (!el) return;
  function update() {
    const now = new Date();
    const end = new Date(now); end.setHours(24, 0, 0, 0);
    const diff = Math.floor((end - now) / 1000);
    const h = String(Math.floor(diff / 3600)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const s = String(diff % 60).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  }
  update();
  setInterval(update, 1000);
}

/* ─────────────────────────────────────────────
   RENDERS
───────────────────────────────────────────── */
function renderLeaderboard(containerId, limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const items = limit ? MOCK.leaderboard.slice(0, limit) : MOCK.leaderboard;
  const rankClasses = ['gold', 'silver', 'bronze'];
  container.innerHTML = items.map((p, i) => `
    <div class="lb-item ${p.uid === 'me' ? 'me' : ''}">
      <span class="lb-rank ${rankClasses[i] || ''}">${i < 3 ? ['🥇','🥈','🥉'][i] : p.rank}</span>
      <div class="lb-avatar">${p.avatar}</div>
      <span class="lb-name">${p.name}</span>
      <span class="lb-xp">${p.xp.toLocaleString()} XP</span>
      <span class="lb-streak">🔥${p.streak}</span>
    </div>
  `).join('');
}

function renderChallengeHistory() {
  const html = MOCK.challengeHistory.map(c => `
    <div class="history-item">
      <span class="history-icon">${c.type}</span>
      <div class="history-info">
        <p class="history-name">${c.name}</p>
        <p class="history-date">${c.date}</p>
      </div>
      <span class="history-xp">+${c.xp} XP</span>
    </div>
  `).join('');
  const h1 = document.getElementById('challenge-history');
  const h2 = document.getElementById('completed-challenges');
  if (h1) h1.innerHTML = html;
  if (h2) h2.innerHTML = html;
}

function renderShop(cat = 'powerups') {
  const container = document.getElementById('shop-grid');
  if (!container) return;
  const items = MOCK.shopItems[cat] || [];
  container.innerHTML = items.map(item => `
    <div class="shop-item" data-item-id="${item.id}">
      <span class="shop-item-icon">${item.icon}</span>
      <span class="shop-item-name">${item.name}</span>
      <div class="shop-item-price">
        <span class="coin-icon">🪙</span>
        <span>${item.price}</span>
      </div>
    </div>
  `).join('');
  container.querySelectorAll('.shop-item').forEach(el => {
    el.addEventListener('click', () => {
      const coins = parseInt(document.getElementById('user-coins').textContent);
      const item  = items.find(i => i.id === el.dataset.itemId);
      if (!item) return;
      if (coins < item.price) { showToast('MoveCoins insuficientes 😢', 'error'); return; }
      document.getElementById('user-coins').textContent = coins - item.price;
      showToast(`¡${item.name} comprado! ${item.icon}`, 'success');
    });
  });
}

function renderStreakDots(streak = 7) {
  const container = document.getElementById('streak-dots');
  if (!container) return;
  container.innerHTML = Array.from({ length: 7 }, (_, i) =>
    `<div class="streak-dot ${i < streak ? 'done' : ''}"></div>`
  ).join('');
}

function renderNotifications() {
  const container = document.getElementById('notifications-list');
  if (!container) return;
  const badge = document.getElementById('notif-badge');
  const unreadCount = MOCK.notifications.filter(n => n.unread).length;
  if (badge) {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
  }
  if (MOCK.notifications.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-tertiary);padding:24px 0">Sin notificaciones</p>';
    return;
  }
  container.innerHTML = MOCK.notifications.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" data-notif-id="${n.id}">
      <span class="notif-icon">${n.icon}</span>
      <div class="notif-body">
        <p class="notif-title">${n.title}</p>
        <p class="notif-sub">${n.sub}</p>
        ${n.hasActions ? `
          <div class="notif-actions">
            <button class="btn-notif-accept" data-action="accept" data-id="${n.id}">Aceptar</button>
            <button class="btn-notif-reject" data-action="reject" data-id="${n.id}">Rechazar</button>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id    = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === 'accept') showToast('¡Te has unido al grupo! 🎉', 'success');
      else showToast('Invitación rechazada', '');
      const idx = MOCK.notifications.findIndex(n => n.id === id);
      if (idx > -1) MOCK.notifications.splice(idx, 1);
      renderNotifications();
    });
  });
}

function renderAchievements() {
  const container = document.getElementById('achievements-grid');
  if (!container) return;
  container.innerHTML = MOCK.achievements.map(a => `
    <div class="achievement-item ${a.unlocked ? '' : 'locked'}">
      <span class="achievement-icon">${a.icon}</span>
      <span class="achievement-name">${a.name}</span>
    </div>
  `).join('');
}

/* ─────────────────────────────────────────────
   CELEBRACIÓN
───────────────────────────────────────────── */
function showCelebration(xp = 150) {
  document.getElementById('completed-xp').textContent = `+${xp} XP`;
  openModal('modal-completed');
  setTimeout(() => {
    const bar = document.getElementById('xp-bar-fill');
    if (bar) bar.style.width = '65%';
  }, 300);
}

/* ─────────────────────────────────────────────
   MODO DEMO: entrada sen Firebase
───────────────────────────────────────────── */
function enterDemoMode() {
  // Gardar estado mock do usuario
  state.user = { uid: 'demo-123' };
  state.userDoc = {
    uid:      'demo-123',
    name:     'Demo User',
    email:    'demo@moveup.app',
    photoURL: '',
    xp:       2400,
    coins:    320,
    streak:   7,
    groupId:  'demo-group',
  };
  state.group = {
    id:   'demo-group',
    name: 'Los Invencibles',
    code: 'ABC123',
  };

  // Actualizar UI con datos demo
  updateProfileUI();
  updateGroupUI();

  // Pechar calquera modal aberto e ir á app
  closeAllModals();
  showScreen('screen-app');
  navigateTo('home');
}

/* ─────────────────────────────────────────────
   UI: actualizar perfil e grupo
───────────────────────────────────────────── */
function updateProfileUI() {
  if (!state.userDoc) return;
  const name   = state.userDoc.name || 'Jugador';
  const photo  = state.userDoc.photoURL;
  const xp     = state.userDoc.xp     || 0;
  const coins  = state.userDoc.coins  || 0;
  const streak = state.userDoc.streak || 0;

  const el = (id) => document.getElementById(id);

  if (el('onboarding-name'))  el('onboarding-name').textContent  = `¡Hola, ${name.split(' ')[0]}!`;
  if (el('onboarding-avatar')) el('onboarding-avatar').textContent = name.charAt(0).toUpperCase();
  if (el('profile-name'))     el('profile-name').textContent     = name;
  if (el('profile-avatar-img') && photo) {
    el('profile-avatar-img').src = photo;
    el('profile-avatar-img').onerror = () => { el('profile-avatar-img').src = ''; };
  }
  if (el('stat-xp'))      el('stat-xp').textContent      = xp.toLocaleString();
  if (el('user-coins'))   el('user-coins').textContent   = coins;
  if (el('streak-count')) el('streak-count').textContent = `${streak} días`;

  renderStreakDots(streak);
}

function updateGroupUI() {
  if (!state.group) return;
  const el = (id) => document.getElementById(id);
  if (el('group-name-display')) el('group-name-display').textContent = state.group.name || 'Mi Grupo';
  if (el('group-code-display')) el('group-code-display').textContent = `Código: ${state.group.code || '------'}`;
  if (el('modal-group-code'))   el('modal-group-code').textContent   = state.group.code || '------';
}

/* ─────────────────────────────────────────────
   GRUPOS
───────────────────────────────────────────── */
function createGroup(name) {
  const code = genGroupCode();
  state.group = { id: 'group-' + Date.now(), name, code };
  if (state.userDoc) state.userDoc.groupId = state.group.id;
  updateGroupUI();
  closeAllModals();
  showScreen('screen-app');
  navigateTo('home');
  showToast(`¡Grupo "${name}" creado! 🏆`, 'success');
}

function joinGroup(code) {
  const cleanCode = code.trim().toUpperCase();
  if (cleanCode.length !== 6) { showToast('El código tiene 6 caracteres', 'error'); return; }
  state.group = { id: 'group-joined', name: 'Grupo encontrado', code: cleanCode };
  if (state.userDoc) state.userDoc.groupId = state.group.id;
  updateGroupUI();
  closeAllModals();
  showScreen('screen-app');
  navigateTo('home');
  showToast('¡Unido al grupo! 🤝', 'success');
}

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Arranque directo: sen splash, sen login, entrar en modo demo inmediatamente
  closeAllModals();
  enterDemoMode();

  // ── Logout ──
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    state.user    = null;
    state.userDoc = null;
    state.group   = null;
    closeAllModals();
    showScreen('screen-auth');
  });

  // ── Onboarding ──
  document.getElementById('btn-create-group')?.addEventListener('click', () => openModal('modal-create-group'));
  document.getElementById('btn-join-group')?.addEventListener('click', () => openModal('modal-join-group'));

  document.getElementById('btn-confirm-create-group')?.addEventListener('click', () => {
    const name = document.getElementById('input-group-name').value.trim();
    if (!name) { showToast('Escribe un nombre', 'error'); return; }
    createGroup(name);
  });

  document.getElementById('btn-confirm-join-group')?.addEventListener('click', () => {
    const code = document.getElementById('input-group-code').value.trim();
    joinGroup(code);
  });

  // ── Navegación ──
  // Só aplicamos o listener de navegación á barra inferior e botóns de ligazón explícitos,
  // NON a calquera elemento con data-page (evita conflitos con outros botóns).
  document.querySelectorAll('.nav-btn[data-page], .btn-link[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigateTo(el.dataset.page);
    });
  });

  // ── Notificacións ──
  document.getElementById('btn-notifications')?.addEventListener('click', () => {
    renderNotifications();
    openModal('modal-notifications');
  });

  // ── Invitar membro ──
  document.getElementById('btn-invite-member')?.addEventListener('click', () => {
    updateGroupUI();
    openModal('modal-invite');
  });

  document.getElementById('btn-confirm-invite')?.addEventListener('click', () => {
    const email = document.getElementById('input-invite-email').value.trim();
    if (!email || !email.includes('@')) { showToast('Correo inválido', 'error'); return; }
    closeModal('modal-invite');
    showToast(`Invitación enviada a ${email} ✉️`, 'success');
    document.getElementById('input-invite-email').value = '';
  });

  document.getElementById('btn-copy-code')?.addEventListener('click', () => {
    const code = document.getElementById('modal-group-code').textContent;
    navigator.clipboard.writeText(code)
      .then(() => showToast('Código copiado 📋', 'success'));
  });

  // ── Encuesta do día ──
  document.querySelectorAll('.poll-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.pollVoted) { showToast('Ya votaste hoy', ''); return; }
      document.querySelectorAll('.poll-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.pollVoted = true;
      showToast(`Voto registrado ✅`, 'success');
    });
  });

  // ── 3. RETO: CORRECCIÓN CRÍTICA AQUÍ ──
  // Usamos e.stopPropagation para que el click no active nada más en la pantalla
  document.getElementById('btn-complete-challenge')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal('modal-challenge-detail');
    showCelebration(150);
  });

  document.getElementById('btn-modal-complete')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal('modal-challenge-detail');
    showCelebration(150);
  });

  document.getElementById('btn-challenge-details')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openModal('modal-challenge-detail');
  });

  // ── Celebración: pechar ──
  document.getElementById('btn-close-celebration')?.addEventListener('click', () => {
    closeModal('modal-completed');
    setTimeout(() => {
      const bar = document.getElementById('xp-bar-fill');
      if (bar) bar.style.width = '0%';
    }, 300);
  });

  // ── Tienda ──
  document.querySelectorAll('.shop-cat').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.shop-cat').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderShop(btn.dataset.cat);
    });
  });

  // ── 4. GESTIÓN DE CIERRE DE MODALES ──
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllModals();
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // ── Renders iniciais ──
  renderLeaderboard('leaderboard-mini', 3);
  renderLeaderboard('leaderboard-full');
  renderChallengeHistory();
  renderShop('powerups');
  renderAchievements();
  startPollTimer();
  renderNotifications();
});