// ═══════════════════════════════════════════════
//  MOVEUP — Firebase Config (REAL)
// ═══════════════════════════════════════════════

const firebaseConfig = {
  apiKey:            "AIzaSyAVeCxPBLoT0tKjrmen5BOr1KT59MhM7mw",
  authDomain:        "hackathon-cca43.firebaseapp.com",
  projectId:         "hackathon-cca43",
  storageBucket:     "hackathon-cca43.firebasestorage.app",
  messagingSenderId: "1020399569915",
  appId:             "1:1020399569915:web:1c33b744a54cc35e5c995e"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias globais usadas en app.js
const auth = firebase.auth();
const db   = firebase.firestore();

// Provider de Google
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });