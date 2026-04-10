// ═══════════════════════════════════════════════
//  MOVEUP — Firebase Config
//  Stubs seguros para modo demo.
//  Cando teñades credenciais reais, substituír
//  este ficheiro polo orixinal con firebase.initializeApp()
// ═══════════════════════════════════════════════

// auth.onAuthStateChanged nunca dispara en modo stub,
// así que o fluxo queda en mans do botón demo.
const auth = {
  onAuthStateChanged: (_cb) => {},
  signInWithPopup:    ()    => Promise.reject(new Error('Firebase non configurado')),
  signOut:            ()    => Promise.resolve(),
};
const db             = null;
const googleProvider = null;