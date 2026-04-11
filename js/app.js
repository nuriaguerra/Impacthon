// ═══════════════════════════════════════════════
//  TouchGrass — app.js
//  Multi-grupo: groupIds (array) en vez de groupId
// ═══════════════════════════════════════════════

/* ─────────────────────────────────────────────
   ESTADO GLOBAL
───────────────────────────────────────────── */
const state = {
  user:                   null,
  userDoc:                null,
  groups:                 [],
  activeGroup:            null,
  currentPage:            'home',
  pollVoted:              false,
  unsubscribeLeaderboard: null,
  unsubscribeNotifs:      null,
  notifications:          [],
  authResolved:           false,
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
  if (state.unsubscribeLeaderboard) { state.unsubscribeLeaderboard(); state.unsubscribeLeaderboard = null; }
  if (state.unsubscribeNotifs)      { state.unsubscribeNotifs();      state.unsubscribeNotifs = null; }
  if (unsubscribeChat)              { unsubscribeChat();               unsubscribeChat = null; }
  state.authResolved = false;
  auth.signOut().then(() => {
    state.user        = null;
    state.userDoc     = null;
    state.groups      = [];
    state.activeGroup = null;
    closeAllModals();
    showScreen('screen-auth');
  });
}

auth.onAuthStateChanged(async (user) => {
  const btn = document.getElementById('btn-google-login');
  if (btn) {
    btn.innerHTML = '<svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Continuar con Google';
    btn.disabled = false;
  }

  if (!user) {
    if (!state.authResolved) showScreen('screen-auth');
    return;
  }

  if (state.authResolved && state.user?.uid === user.uid) return;
  state.authResolved = true;
  state.user = user;

  try {
    await loadOrCreateUser(user);
    const groupIds = state.userDoc.groupIds || [];
    if (groupIds.length > 0) {
      await loadAllGroups(groupIds);
      closeAllModals();
      showScreen('screen-app');
      navigateTo('home');
      //Detectar clima y cargar reto
      if (typeof CTX_init === 'function') CTX_init();
      if (typeof initChallenges === 'function') initChallenges();
      // Reto de grupo si toca hoy
      _checkGroupChallenge();

      startNotificationsListener();
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
      groupIds:            [],
      completedChallenges: [],
      createdAt:           firebase.firestore.FieldValue.serverTimestamp(),
    };
    await userRef.set(newUser);
    state.userDoc = newUser;
    showToast('¡Bienvenido a MoveUp! 🎉', 'success');
  } else {
    state.userDoc = snap.data();
    // Migración: se tiña groupId (singular) convérteo a groupIds
    if (state.userDoc.groupId && !state.userDoc.groupIds) {
      const migrated = { groupIds: [state.userDoc.groupId], groupId: null };
      await userRef.update(migrated);
      Object.assign(state.userDoc, migrated);
    }
    if (!state.userDoc.groupIds) state.userDoc.groupIds = [];
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
   FIRESTORE: GRUPOS (MULTI)
───────────────────────────────────────────── */
async function loadAllGroups(groupIds) {
  const promises = groupIds.map(id => db.collection('groups').doc(id).get());
  const snaps    = await Promise.all(promises);
  state.groups   = snaps.filter(s => s.exists).map(s => ({ id: s.id, ...s.data() }));
  if (state.groups.length > 0) setActiveGroup(state.groups[0]);
  renderGroupSelector();
}

function setActiveGroup(group) {
  state.activeGroup = group;
  updateGroupUI();
  startLeaderboardListener(group.id);
  startChatListener(group.id);
  renderGroupSelector();
}

async function createGroup(name) {
  if (!state.user) return;
  const code = genGroupCode();
  try {
    const groupRef = await db.collection('groups').add({
      name, code,
      ownerId:   state.user.uid,
      members:   [state.user.uid],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await db.collection('users').doc(state.user.uid).update({
      groupIds: firebase.firestore.FieldValue.arrayUnion(groupRef.id)
    });
    state.userDoc.groupIds = [...(state.userDoc.groupIds || []), groupRef.id];
    const newGroup = { id: groupRef.id, name, code, members: [state.user.uid] };
    state.groups.push(newGroup);
    setActiveGroup(newGroup);
    closeAllModals();
    showScreen('screen-app');
    navigateTo('groups');
    showToast(`¡Grupo "${name}" creado! 🏆`, 'success');
    if (typeof CTX_init === 'function'){
      CTX_init();
    }
    if (typeof initChallenges === 'function') initChallenges();
  } catch (err) {
    console.error('Error creando grupo:', err);
    showToast('Error al crear el grupo 😢', 'error');
  }
}

async function joinGroup(code) {
  if (!state.user) return;
  const cleanCode = code.trim().toUpperCase();
  if (cleanCode.length !== 6) { showToast('El código tiene 6 caracteres', 'error'); return; }
  const alreadyIn = state.groups.find(g => g.code === cleanCode);
  if (alreadyIn) { showToast('Ya estás en ese grupo', 'error'); return; }
  try {
    const snap = await db.collection('groups').where('code', '==', cleanCode).limit(1).get();
    if (snap.empty) { showToast('Código no encontrado 🔍', 'error'); return; }
    const groupDoc = snap.docs[0];
    await groupDoc.ref.update({ members: firebase.firestore.FieldValue.arrayUnion(state.user.uid) });
    await db.collection('users').doc(state.user.uid).update({
      groupIds: firebase.firestore.FieldValue.arrayUnion(groupDoc.id)
    });
    state.userDoc.groupIds = [...(state.userDoc.groupIds || []), groupDoc.id];
    const joinedGroup = { id: groupDoc.id, ...groupDoc.data() };
    state.groups.push(joinedGroup);
    setActiveGroup(joinedGroup);
    closeAllModals();
    showScreen('screen-app');
    navigateTo('home');
    showToast(`¡Unido a "${state.group.name}"! 🤝`, 'success');
    if (typeof CTX_init === 'function'){
      CTX_init();
    }
    if (typeof initChallenges === 'function') initChallenges();
  } catch (err) {
    console.error('Error uniéndose al grupo:', err);
    showToast('Error al unirse al grupo 😢', 'error');
  }
}

async function leaveGroup(groupId) {
  if (!state.user) return;
  try {
    if (state.unsubscribeLeaderboard) { state.unsubscribeLeaderboard(); state.unsubscribeLeaderboard = null; }
    if (unsubscribeChat)              { unsubscribeChat();               unsubscribeChat = null; }
    await db.collection('groups').doc(groupId).update({
      members: firebase.firestore.FieldValue.arrayRemove(state.user.uid)
    });
    await db.collection('users').doc(state.user.uid).update({
      groupIds: firebase.firestore.FieldValue.arrayRemove(groupId)
    });
    state.userDoc.groupIds = (state.userDoc.groupIds || []).filter(id => id !== groupId);
    state.groups = state.groups.filter(g => g.id !== groupId);
    if (state.groups.length > 0) {
      setActiveGroup(state.groups[0]);
      showToast('Saliste del grupo', '');
    } else {
      state.activeGroup = null;
      showScreen('screen-onboarding');
      showToast('Saliste del último grupo', '');
    }
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
    .where('groupIds', 'array-contains', groupId)
    .onSnapshot((snap) => {
      const members = snap.docs.map(doc => doc.data()).sort((a, b) => (b.xp || 0) - (a.xp || 0));
      renderLeaderboard('leaderboard-mini', members, 3);
      renderLeaderboard('leaderboard-full', members, null);
      if (state.userDoc && state.user) {
        const myXp = state.userDoc.xp || 0;
        members.forEach(m => {
          if (m.uid !== state.user.uid && m.xp > myXp) {
            createNotification(state.user.uid, 'superado', `🏆 ${m.name} te ha superado con ${m.xp.toLocaleString()} XP`);
          }
        });
      }
    }, err => console.error('Error leaderboard:', err));
}

/* ─────────────────────────────────────────────
   NOTIFICACIÓNS
───────────────────────────────────────────── */
async function createNotification(toUid, type, text) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const existing = await db.collection('notifications')
      .where('toUid', '==', toUid).where('type', '==', type).where('day', '==', today).limit(1).get();
    if (!existing.empty) return;
    await db.collection('notifications').add({
      toUid, type, text, day: today, unread: true,
      date: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('Error creando notificación:', err);
  }
}

function startNotificationsListener() {
  if (!state.user) return;
  if (state.unsubscribeNotifs) state.unsubscribeNotifs();
  state.unsubscribeNotifs = db.collection('notifications')
    .where('toUid', '==', state.user.uid)
    .orderBy('date', 'desc')
    .limit(20)
    .onSnapshot((snap) => {
      state.notifications = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const unread = state.notifications.filter(n => n.unread).length;
      const badge = document.getElementById('notif-badge');
      if (badge) { badge.textContent = unread; badge.style.display = unread > 0 ? 'flex' : 'none'; }
    }, err => console.error('Error notifs:', err));
}

/* ─────────────────────────────────────────────
   CHAT
───────────────────────────────────────────── */
let unsubscribeChat = null;

function startChatListener(groupId) {
  if (unsubscribeChat) { unsubscribeChat(); unsubscribeChat = null; }
  const container = document.getElementById('chat-messages');
  if (!container) return;

  unsubscribeChat = db.collection('messages')
    .where('groupId', '==', groupId)
    .orderBy('timestamp', 'asc')
    .limit(50)
    .onSnapshot((snap) => {
      if (snap.empty) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-tertiary);font-size:13px;padding:16px">Sin mensajes aún</p>';
        return;
      }
      container.innerHTML = snap.docs.map(doc => {
        const m    = doc.data();
        const isMe = m.uid === state.user?.uid;
        const time = m.timestamp?.toDate
          ? m.timestamp.toDate().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          : '';
        return `
          <div class="chat-msg ${isMe ? 'me' : 'other'}">
            ${!isMe ? `<span class="chat-msg-name">${m.name || 'Jugador'}</span>` : ''}
            <div class="chat-msg-bubble">${escapeHtml(m.text)}</div>
            <span class="chat-msg-time">${time}</span>
          </div>
        `;
      }).join('');
      container.scrollTop = container.scrollHeight;
    }, err => console.error('Error chat:', err));
}

async function sendMessage() {
  if (!state.user || !state.activeGroup) return;
  const input = document.getElementById('chat-input');
  const text  = input.value.trim();
  if (!text) return;
  input.value = '';
  try {
    await db.collection('messages').add({
      groupId:   state.activeGroup.id,
      uid:       state.user.uid,
      name:      state.userDoc?.name || 'Jugador',
      photoURL:  state.userDoc?.photoURL || '',
      text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('Error enviando mensaje:', err);
    showToast('Error al enviar 😢', 'error');
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
      xp: newXp, coins: newCoins, streak: newStreak,
      completedChallenges: firebase.firestore.FieldValue.arrayUnion(historyEntry),
    });
    Object.assign(state.userDoc, { xp: newXp, coins: newCoins, streak: newStreak });
    updateProfileUI();
    if (state.activeGroup?.members) {
      state.activeGroup.members.forEach(uid => {
        if (uid !== state.user.uid) {
          createNotification(uid, 'reto', `✅ ${state.userDoc.name} completó el reto del día`);
        }
      });
    }
  } catch (err) {
    console.error('Error gardando reto:', err);
  }
  showCelebration(xp, coins);
}

/* ─────────────────────────────────────────────
   RENDERS
───────────────────────────────────────────── */
function renderGroupSelector() {
  const selector = document.getElementById('group-selector');
  if (!selector) return;
  selector.innerHTML = state.groups.map(g => `
    <option value="${g.id}" ${state.activeGroup?.id === g.id ? 'selected' : ''}>${g.name}</option>
  `).join('');
}

function renderLeaderboard(containerId, members, limit) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const items  = limit ? members.slice(0, limit) : members;
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
        <span class="coin-icon">🌰</span>
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
  const notifs = state.notifications || [];
  if (notifs.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-tertiary);padding:24px 0">Sin notificaciones</p>';
    return;
  }
  container.innerHTML = notifs.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
      <span class="notif-icon">${n.text?.split(' ')[0] || '🔔'}</span>
      <div class="notif-body">
        <p class="notif-title">${n.text?.slice(n.text.indexOf(' ') + 1) || ''}</p>
        <p class="notif-sub">${n.day || ''}</p>
      </div>
    </div>
  `).join('');
  container.querySelectorAll('.notif-item.unread').forEach(item => {
    item.addEventListener('click', async () => {
      const id = item.dataset.id;
      item.classList.remove('unread');
      try { await db.collection('notifications').doc(id).update({ unread: false }); } catch (err) { console.error(err); }
      const unreadNow = container.querySelectorAll('.notif-item.unread').length;
      const badge = document.getElementById('notif-badge');
      if (badge) { badge.textContent = unreadNow; badge.style.display = unreadNow > 0 ? 'flex' : 'none'; }
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
  if (!state.activeGroup) return;
  const el = (id) => document.getElementById(id);
  if (el('group-name-display')) el('group-name-display').textContent = state.activeGroup.name || 'Mi Grupo';
  if (el('group-code-display')) el('group-code-display').textContent = `Código: ${state.activeGroup.code || '------'}`;
  if (el('modal-group-code'))   el('modal-group-code').textContent   = state.activeGroup.code || '------';
}

function showCelebration(xp = 150, coins = 50) {
  document.getElementById('completed-xp').textContent = `+${xp} XP`;
  const coinsEl = document.querySelector('.celebration-coins span:last-child');
  if (coinsEl) coinsEl.textContent = `+${coins} MoveCoins`;
  openModal('modal-completed');
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#e8ff47', '#4ade80', '#4e9eff', '#ff5f5f', '#a78bfa'] });
  setTimeout(() => {
    confetti({ particleCount: 60, spread: 120, origin: { x: 0.2, y: 0.6 }, colors: ['#e8ff47', '#4ade80'] });
    confetti({ particleCount: 60, spread: 120, origin: { x: 0.8, y: 0.6 }, colors: ['#4e9eff', '#a78bfa'] });
  }, 400);
  setTimeout(() => {
    const bar = document.getElementById('xp-bar-fill');
    if (bar) { const xpInLevel = (state.userDoc?.xp || 0) % 500; bar.style.width = `${(xpInLevel / 500) * 100}%`; }
  }, 300);
}

// ── Reto de grupo: comprueba si hoy toca ──
  function _checkGroupChallenge() {
    if (!state.group?.id) return;
    const today = typeof todayString === 'function' ? todayString() : new Date().toISOString().slice(0, 10);
    if (typeof isGroupChallengeDay !== 'function') return;
    if (!isGroupChallengeDay(state.group.id, today)) return;

    const groupChallenge = pickGroupChallenge(state.group.id, today);
    if (!groupChallenge) return;

    // Mostrar toast + card especial solo si no se ha visto hoy
    const seenKey = `gch_seen_${state.group.id}_${today}`;
    if (localStorage.getItem(seenKey)) return;
    localStorage.setItem(seenKey, '1');

    setTimeout(() => {
      showToast('👥 ¡Reto de grupo disponible hoy! Míralo en Home 🏆', 'success');
      // Mostrar una segunda card de reto grupal si hay espacio
      _renderGroupChallengeCard(groupChallenge);
    }, 1500);
  }

  function _renderGroupChallengeCard(challenge) {
    const home = document.getElementById('page-home');
    if (!home) return;
    // Evitar duplicados
    if (home.querySelector('.group-challenge-card')) return;

    const div = document.createElement('div');
    div.className = 'challenge-card group-challenge-card';
    div.innerHTML = `
      <div class="challenge-header">
        <span class="challenge-type-badge group">👥 Reto de Grupo</span>
        <span class="challenge-xp">+${challenge.xp} XP</span>
      </div>
      <h2 class="challenge-title">${challenge.icon} ${challenge.title}</h2>
      <p class="challenge-desc">${challenge.desc}</p>
      <div class="challenge-meta">
        <span class="meta-item">⏱️ ${challenge.duration}</span>
        <span class="meta-item">👥 ${challenge.type}</span>
        <span class="meta-item">🌡️ ${challenge.difficulty}</span>
      </div>
      <button class="btn-secondary btn-full" id="btn-group-challenge-details">Ver detalles del reto grupal</button>
    `;

    // Insertar justo despues de la challenge-card individual
    const individualCard = document.getElementById('challenge-card');
    if (individualCard?.parentNode) {
      individualCard.parentNode.insertBefore(div, individualCard.nextSibling);
    } else {
      home.prepend(div);
    }

    div.querySelector('#btn-group-challenge-details')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof renderChallengeDetailModal === 'function') renderChallengeDetailModal(challenge);
      if (typeof MAPS_loadForCurrentChallenge === 'function') {
        window.CTX && (window.CTX.challenge = challenge);
        MAPS_loadForCurrentChallenge();
      }
      if (typeof openModal === 'function') openModal('modal-challenge-detail');
    });
  }

/* ─────────────────────────────────────────────
   MAIN — DOMContentLoaded
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  closeAllModals();

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

  // ── Botóns de grupo dentro da app ──
  document.getElementById('btn-add-group')?.addEventListener('click', () => openModal('modal-join-group'));
  document.getElementById('btn-create-new-group')?.addEventListener('click', () => openModal('modal-create-group'));

  // ── Despregable de selección de grupo ──
  document.getElementById('group-selector')?.addEventListener('change', (e) => {
    const group = state.groups.find(g => g.id === e.target.value);
    if (group) setActiveGroup(group);
  });

  // ── Saír do grupo activo ──
  document.getElementById('settings-leave-group')?.addEventListener('click', () => {
    if (!state.activeGroup) return;
    if (confirm(`¿Salir de "${state.activeGroup.name}"?`)) leaveGroup(state.activeGroup.id);
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

  document.getElementById('btn-copy-code')?.addEventListener('click', () => {
    const code = document.getElementById('modal-group-code').textContent;
    navigator.clipboard.writeText(code)
      .then(() => showToast('Código copiado 📋', 'success'))
      .catch(() => showToast('Código: ' + code, ''));
  });

  document.getElementById('btn-share-code')?.addEventListener('click', () => {
    const code = document.getElementById('modal-group-code').textContent;
    if (navigator.share) {
      navigator.share({ title: 'MoveUp', text: `¡Únete a mi grupo en MoveUp! Código: ${code}` });
    } else {
      navigator.clipboard.writeText(code).then(() => showToast('Código copiado 📋', 'success'));
    }
  });

  // ── Encuesta — Paso 1: elegir tipo (indoor/outdoor/random) ──
  document.querySelectorAll('.poll-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Bloquear si ya se eligió hoy (y el reto está cargado)
      if (window.challengeState?.pollChosen && window.challengeState?.todayDate === todayString()) {
        showToast('Ya elegiste el tipo de reto hoy 💪', '');
        return;
      }
      document.querySelectorAll('.poll-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      // Si el clima ya decidió automáticamente, usar ese tipo
      const vote = window.CTX?.autoType || btn.dataset.vote;
      window.CTX && (window.CTX.pollType = vote);

      // Mostrar la sección de energía
      const energySection = document.getElementById('poll-energy-section');
      if (energySection) energySection.style.display = '';

      showToast('Ahora elige tu nivel de energía ⚡', '');
    });
  });

  // ── Encuesta — Paso 2: elegir energía -> cargar reto
  document.querySelectorAll('.energy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.challengeState?.pollChosen && window.challengeState?.todayDate === todayString()) {
        showToast('Ya elegiste la energía hoy 💪', '');
        return;
      }
      document.querySelectorAll('.energy-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const energy = btn.dataset.energy;
      window.CTX && (window.CTX.energyLevel = energy);

      // Determinar tipo (automático por clima o manual)
      const type = window.CTX?.pollType || window.CTX?.autoType || 'outdoor';

      // Obtener userId para el reto determinista por usuario
      const userId = state.user?.uid || 'guest';
      const today  = todayString();

      // Seleccionar reto: diferente por usuario, igual para el mismo usuario cada día
      const challenge = pickChallengeForUser(type, energy, userId, today);

      // Marcar como elegido para no poder cambiar
      window.challengeState.pollChosen = true;
      window.challengeState.todayDate  = today;
      window.challengeState.currentChallenge = challenge;
      saveChallengeState(window.challengeState);

      // Renderizar reto en la card
      if (typeof renderChallengeCard === 'function') renderChallengeCard(challenge);

      // Ocultar sección de energía (ya eligió)
      const energySection = document.getElementById('poll-energy-section');
      if (energySection) energySection.style.display = 'none';

      const toasts = {
        low:    '🪫 Reto suave asignado',
        medium: '🔋 Reto moderado asignado',
        high:   '⚡ Reto intenso asignado',
      };
      showToast(toasts[energy] || '✅ ¡Tu reto está listo!', 'success');
    });
  });

  // ── Reto ──
  /* document.getElementById('btn-complete-challenge')?.addEventListener('click', (e) => {
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
    //sincronizar datos del reto actual
    if (typeof CTX_syncDetailModal === 'function'){
      CTX_syncDetailModal();
    }
    openModal('modal-challenge-detail');
    //cargar mapa / Street View
    if (typeof MAPS_loadForCurrentChallenge === 'function'){
      MAPS_loadForCurrentChallenge();
    }
  }); */

  // ── Celebración ──
  document.getElementById('btn-close-celebration')?.addEventListener('click', () => {
    closeModal('modal-completed');
    setTimeout(() => { const bar = document.getElementById('xp-bar-fill'); if (bar) bar.style.width = '0%'; }, 300);
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
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay.id); });
  });

  // ── Axustes: editar nome ──
  document.getElementById('settings-edit-name')?.addEventListener('click', () => {
    const newName = prompt('Nuevo nombre de usuario:', state.userDoc?.name || '');
    if (newName && newName.trim()) { saveUser({ name: newName.trim() }); showToast('Nombre actualizado ✅', 'success'); }
  });

  // ── Chat ──
  document.getElementById('btn-send-message')?.addEventListener('click', sendMessage);
  document.getElementById('chat-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  /* document.querySelectorAll('.energy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.energy-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      window.CTX.energyLevel = btn.dataset.energy;

      // Si ya hay tipo seleccionado, regenerar el reto con la nueva energía
      const type = window.CTX.pollType || window.CTX.autoType || 'outdoor';
      const ch   = pickChallenge(type, btn.dataset.energy);
      CTX_renderChallenge(ch);
      showToast({ low: '🔋 Reto suave activado', medium: '🔋 Reto moderado', high: '⚡ Reto intenso' }[btn.dataset.energy], 'success');
    });
  }); */

  // ── Renders iniciais ──
  renderShop('powerups');
  renderAchievements();
  startPollTimer();
});