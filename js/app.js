// ═══════════════════════════════════════════════
//  MOVEUP — app.js
// ═══════════════════════════════════════════════

/* ─────────────────────────────────────────────
   ESTADO GLOBAL
───────────────────────────────────────────── */
const state = {
  user:                   null,
  userDoc:                null,
  group:                  null,
  currentPage:            'home',
  pollVoted:              false,
  unsubscribeLeaderboard: null,
  authResolved:           false, // evitar que onAuthStateChanged corra dúas veces
};

/* ─────────────────────────────────────────────
   DATOS MOCK
───────────────────────────────────────────── */
const MOCK = {
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
   UTILIDADES UI
───────────────────────────────────────────── */
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.className = 'toast'; }, 2800);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function navigateTo(pageId) {
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

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

function genGroupCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/* ─────────────────────────────────────────────
   TIMER
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
   FIREBASE AUTH
───────────────────────────────────────────── */
function loginWithGoogle() {
  const btn = document.getElementById('btn-google-login');
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '⏳ Conectando...';
  btn.disabled = true;

  auth.signInWithPopup(googleProvider)
    .catch(err => {
      console.error('Login error:', err);
      showToast('Error al iniciar sesión 😢', 'error');
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    });
}

function logout() {
  if (state.unsubscribeLeaderboard) {
    state.unsubscribeLeaderboard();
    state.unsubscribeLeaderboard = null;
  }
  state.authResolved = false;
  auth.signOut().then(() => {
    state.user    = null;
    state.userDoc = null;
    state.group   = null;
    closeAllModals();
    showScreen('screen-auth');
  });
}

// onAuthStateChanged: punto de entrada único do fluxo.
// Usamos authResolved para que só corra unha vez por sesión.
auth.onAuthStateChanged(async (user) => {
  // Restaurar botón de login se existe
  const btn = document.getElementById('btn-google-login');
  if (btn) { btn.innerHTML = '<svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Continuar con Google'; btn.disabled = false; }

  if (!user) {
    // Sen sesión → mostrar auth (só se aínda non resolvemos)
    if (!state.authResolved) showScreen('screen-auth');
    return;
  }

  // Evitar procesar dúas veces o mesmo usuario
  if (state.authResolved && state.user?.uid === user.uid) return;
  state.authResolved = true;
  state.user = user;

  try {
    await loadOrCreateUser(user);

    if (state.userDoc.groupId) {
      await loadGroup(state.userDoc.groupId);
      closeAllModals();
      showScreen('screen-app');
      navigateTo('home');
    } else {
      updateProfileUI();
      closeAllModals();
      showScreen('screen-onboarding');
    }
  } catch (err) {
    console.error('Error cargando usuario:', err);
    showToast('Error de conexión 😢', 'error');
    showScreen('screen-auth');
  }
});

/* ─────────────────────────────────────────────
   FIRESTORE: USUARIOS
───────────────────────────────────────────── */
async function loadOrCreateUser(firebaseUser) {
  const userRef = db.collection('users').doc(firebaseUser.uid);
  const snap    = await userRef.get();

  if (!snap.exists) {
    const newUser = {
      uid:                 firebaseUser.uid,
      name:                firebaseUser.displayName || 'Jugador',
      email:               firebaseUser.email || '',
      photoURL:            firebaseUser.photoURL || '',
      xp:                  0,
      coins:               50,
      streak:              0,
      groupId:             null,
      completedChallenges: [],
      createdAt:           firebase.firestore.FieldValue.serverTimestamp(),
    };
    await userRef.set(newUser);
    state.userDoc = newUser;
    showToast('¡Bienvenido a MoveUp! 🎉', 'success');
  } else {
    state.userDoc = snap.data();
  }
  updateProfileUI();
}

async function saveUser(fields) {
  if (!state.user) return;
  try {
    await db.collection('users').doc(state.user.uid).update(fields);
    Object.assign(state.userDoc, fields);
    updateProfileUI();
  } catch (err) {
    console.error('Error gardando usuario:', err);
  }
}

/* ─────────────────────────────────────────────
   FIRESTORE: GRUPOS
───────────────────────────────────────────── */
async function loadGroup(groupId) {
  const snap = await db.collection('groups').doc(groupId).get();
  if (!snap.exists) {
    await saveUser({ groupId: null });
    showScreen('screen-onboarding');
    return;
  }
  state.group = { id: snap.id, ...snap.data() };
  updateGroupUI();
  startLeaderboardListener(groupId);
}

async function createGroup(name) {
  if (!state.user) return;
  const code = genGroupCode();
  try {
    const groupRef = await db.collection('groups').add({
      name,
      code,
      ownerId:   state.user.uid,
      members:   [state.user.uid],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await saveUser({ groupId: groupRef.id });
    state.group = { id: groupRef.id, name, code, members: [state.user.uid] };
    updateGroupUI();
    startLeaderboardListener(groupRef.id);
    closeAllModals();
    showScreen('screen-app');
    navigateTo('home');
    showToast(`¡Grupo "${name}" creado! 🏆`, 'success');
  } catch (err) {
    console.error('Error creando grupo:', err);
    showToast('Error al crear el grupo 😢', 'error');
  }
}

async function joinGroup(code) {
  if (!state.user) return;
  const cleanCode = code.trim().toUpperCase();
  if (cleanCode.length !== 6) { showToast('El código tiene 6 caracteres', 'error'); return; }
  try {
    const snap = await db.collection('groups')
      .where('code', '==', cleanCode).limit(1).get();
    if (snap.empty) { showToast('Código no encontrado 🔍', 'error'); return; }
    const groupDoc = snap.docs[0];
    await groupDoc.ref.update({
      members: firebase.firestore.FieldValue.arrayUnion(state.user.uid)
    });
    await saveUser({ groupId: groupDoc.id });
    state.group = { id: groupDoc.id, ...groupDoc.data() };
    updateGroupUI();
    startLeaderboardListener(groupDoc.id);
    closeAllModals();
    showScreen('screen-app');
    navigateTo('home');
    showToast(`¡Unido a "${state.group.name}"! 🤝`, 'success');
  } catch (err) {
    console.error('Error uniéndose al grupo:', err);
    showToast('Error al unirse al grupo 😢', 'error');
  }
}

async function leaveGroup() {
  if (!state.user || !state.group) return;
  try {
    if (state.unsubscribeLeaderboard) {
      state.unsubscribeLeaderboard();
      state.unsubscribeLeaderboard = null;
    }
    await db.collection('groups').doc(state.group.id).update({
      members: firebase.firestore.FieldValue.arrayRemove(state.user.uid)
    });
    await saveUser({ groupId: null });
    state.group = null;
    showScreen('screen-onboarding');
    showToast('Saliste del grupo', '');
  } catch (err) {
    console.error('Error saíndo do grupo:', err);
    showToast('Error al salir del grupo 😢', 'error');
  }
}

/* ─────────────────────────────────────────────
   LEADERBOARD EN TEMPO REAL
───────────────────────────────────────────── */
function startLeaderboardListener(groupId) {
  if (state.unsubscribeLeaderboard) state.unsubscribeLeaderboard();
  state.unsubscribeLeaderboard = db.collection('users')
    .where('groupId', '==', groupId)
    .onSnapshot((snap) => {
      const members = snap.docs
        .map(doc => doc.data())
        .sort((a, b) => (b.xp || 0) - (a.xp || 0));
      renderLeaderboard('leaderboard-mini', members, 3);
      renderLeaderboard('leaderboard-full', members, null);
    }, (err) => {
      console.error('Error no listener do leaderboard:', err);
    });
}

/* ─────────────────────────────────────────────
   RETO COMPLETADO
───────────────────────────────────────────── */
async function completeChallenge(xp = 150, coins = 50, challengeName = 'Reto del día') {
  if (!state.user || !state.userDoc) return;
  const newXp     = (state.userDoc.xp     || 0) + xp;
  const newCoins  = (state.userDoc.coins  || 0) + coins;
  const newStreak = (state.userDoc.streak || 0) + 1;
  const historyEntry = { name: challengeName, xp, date: new Date().toISOString() };
  try {
    await db.collection('users').doc(state.user.uid).update({
      xp:     newXp,
      coins:  newCoins,
      streak: newStreak,
      completedChallenges: firebase.firestore.FieldValue.arrayUnion(historyEntry),
    });
    Object.assign(state.userDoc, { xp: newXp, coins: newCoins, streak: newStreak });
    updateProfileUI();
  } catch (err) {
    console.error('Error gardando reto completado:', err);
  }
  showCelebration(xp, coins);
}

/* ─────────────────────────────────────────────
   RENDERS
───────────────────────────────────────────── */
function renderLeaderboard(containerId, members, limit) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const items = limit ? members.slice(0, limit) : members;
  const medals = ['🥇', '🥈', '🥉'];
  if (items.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-tertiary);padding:16px">Sin miembros aún</p>';
    return;
  }
  container.innerHTML = items.map((p, i) => {
    const isMe = state.user && p.uid === state.user.uid;
    const rankClasses = ['gold', 'silver', 'bronze'];
    const avatar = p.photoURL
      ? `<img src="${p.photoURL}" style="width:32px;height:32px;border-radius:50%;object-fit:cover" />`
      : `<div class="lb-avatar">${(p.name || '?').charAt(0)}</div>`;
    return `
      <div class="lb-item ${isMe ? 'me' : ''}">
        <span class="lb-rank ${rankClasses[i] || ''}">${i < 3 ? medals[i] : i + 1}</span>
        ${avatar}
        <span class="lb-name">${p.name || 'Jugador'}${isMe ? ' (tú)' : ''}</span>
        <span class="lb-xp">${(p.xp || 0).toLocaleString()} XP</span>
        <span class="lb-streak">🔥${p.streak || 0}</span>
      </div>
    `;
  }).join('');
}

function renderChallengeHistory() {
  const history = state.userDoc?.completedChallenges || [];
  const html = history.length === 0
    ? '<p style="color:var(--text-tertiary);font-size:14px;text-align:center;padding:16px">Aún no has completado ningún reto</p>'
    : [...history].reverse().slice(0, 10).map(c => {
        const date = c.date ? new Date(c.date).toLocaleDateString('es-ES') : '';
        return `
          <div class="history-item">
            <span class="history-icon">✅</span>
            <div class="history-info">
              <p class="history-name">${c.name}</p>
              <p class="history-date">${date}</p>
            </div>
            <span class="history-xp">+${c.xp} XP</span>
          </div>
        `;
      }).join('');
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
      const coins = state.userDoc?.coins || 0;
      const item  = items.find(i => i.id === el.dataset.itemId);
      if (!item) return;
      if (coins < item.price) { showToast('MoveCoins insuficientes 😢', 'error'); return; }
      saveUser({ coins: coins - item.price });
      showToast(`¡${item.name} comprado! ${item.icon}`, 'success');
    });
  });
}

function renderStreakDots(streak = 0) {
  const container = document.getElementById('streak-dots');
  if (!container) return;
  container.innerHTML = Array.from({ length: 7 }, (_, i) =>
    `<div class="streak-dot ${i < Math.min(streak, 7) ? 'done' : ''}"></div>`
  ).join('');
}

function renderNotifications() {
  const container = document.getElementById('notifications-list');
  if (!container) return;
  const notifs = [
    { icon: '🔥', title: 'Racha activa', sub: 'No olvides completar el reto de hoy', unread: true },
  ];
  const badge = document.getElementById('notif-badge');
  const unread = notifs.filter(n => n.unread).length;
  if (badge) { badge.textContent = unread; badge.style.display = unread > 0 ? 'flex' : 'none'; }
  container.innerHTML = notifs.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}">
      <span class="notif-icon">${n.icon}</span>
      <div class="notif-body">
        <p class="notif-title">${n.title}</p>
        <p class="notif-sub">${n.sub}</p>
      </div>
    </div>
  `).join('');
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
   UI
───────────────────────────────────────────── */
function updateProfileUI() {
  if (!state.userDoc) return;
  const name   = state.userDoc.name   || 'Jugador';
  const photo  = state.userDoc.photoURL;
  const xp     = state.userDoc.xp     || 0;
  const coins  = state.userDoc.coins  || 0;
  const streak = state.userDoc.streak || 0;
  const done   = (state.userDoc.completedChallenges || []).length;
  const el = (id) => document.getElementById(id);

  if (el('onboarding-name'))   el('onboarding-name').textContent   = `¡Hola, ${name.split(' ')[0]}!`;
  if (el('onboarding-avatar')) el('onboarding-avatar').textContent = name.charAt(0).toUpperCase();
  if (el('profile-name'))      el('profile-name').textContent      = name;
  if (el('profile-avatar-img')) {
    if (photo) { el('profile-avatar-img').src = photo; }
    else { el('profile-avatar-img').style.display = 'none'; }
  }
  if (el('stat-xp'))         el('stat-xp').textContent        = xp.toLocaleString();
  if (el('stat-challenges')) el('stat-challenges').textContent = done;
  if (el('stat-streak'))     el('stat-streak').textContent     = streak;
  if (el('user-coins'))      el('user-coins').textContent      = coins;
  if (el('streak-count'))    el('streak-count').textContent    = `${streak} días`;
  const level = Math.floor(xp / 500) + 1;
  if (el('profile-level')) el('profile-level').textContent = `Nv. ${level}`;

  renderStreakDots(streak);
  renderChallengeHistory();
  renderAchievements();
}

function updateGroupUI() {
  if (!state.group) return;
  const el = (id) => document.getElementById(id);
  if (el('group-name-display')) el('group-name-display').textContent = state.group.name || 'Mi Grupo';
  if (el('group-code-display')) el('group-code-display').textContent = `Código: ${state.group.code || '------'}`;
  if (el('modal-group-code'))   el('modal-group-code').textContent   = state.group.code || '------';
}

function showCelebration(xp = 150, coins = 50) {
  document.getElementById('completed-xp').textContent = `+${xp} XP`;
  const coinsEl = document.querySelector('.celebration-coins span:last-child');
  if (coinsEl) coinsEl.textContent = `+${coins} MoveCoins`;
  openModal('modal-completed');
  setTimeout(() => {
    const bar = document.getElementById('xp-bar-fill');
    if (bar) {
      const xpInLevel = (state.userDoc?.xp || 0) % 500;
      bar.style.width = `${(xpInLevel / 500) * 100}%`;
    }
  }, 300);
}

/* ─────────────────────────────────────────────
   MAIN — DOMContentLoaded
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  closeAllModals();
  // O splash está activo no HTML, onAuthStateChanged decide a seguinte pantalla

  // ── Auth ──
  document.getElementById('btn-google-login')?.addEventListener('click', loginWithGoogle);
  document.getElementById('btn-logout')?.addEventListener('click', logout);

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
      .then(() => showToast('Código copiado 📋', 'success'))
      .catch(() => showToast('Código: ' + code, ''));
  });

  // ── Encuesta ──
  document.querySelectorAll('.poll-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.pollVoted) { showToast('Ya votaste hoy', ''); return; }
      document.querySelectorAll('.poll-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.pollVoted = true;
      showToast('Voto registrado ✅', 'success');
    });
  });

  // ── Reto ──
  document.getElementById('btn-complete-challenge')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal('modal-challenge-detail');
    completeChallenge(150, 50, 'Carrera de 5km');
  });

  document.getElementById('btn-modal-complete')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal('modal-challenge-detail');
    completeChallenge(150, 50, 'Carrera de 5km');
  });

  document.getElementById('btn-challenge-details')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal('modal-challenge-detail');
  });

  // ── Celebración ──
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

  // ── Pechar modais ──
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => closeAllModals());
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // ── Axustes ──
  document.getElementById('settings-edit-name')?.addEventListener('click', () => {
    const newName = prompt('Nuevo nombre de usuario:', state.userDoc?.name || '');
    if (newName && newName.trim()) {
      saveUser({ name: newName.trim() });
      showToast('Nombre actualizado ✅', 'success');
    }
  });

  document.getElementById('settings-leave-group')?.addEventListener('click', () => {
    if (confirm('¿Seguro que quieres salir del grupo?')) leaveGroup();
  });

  // ── Renders iniciais ──
  renderShop('powerups');
  renderAchievements();
  startPollTimer();
  renderNotifications();
});