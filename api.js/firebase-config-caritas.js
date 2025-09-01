// api.js/firebase-config-caritas.js
(function () {
  'use strict';

  // 1) Verifica que el SDK compat esté cargado
  if (!window.firebase || !firebase.apps) {
    console.error('❌ Firebase SDK (compat) no cargado. Revisa las <script> de gstatic en tu HTML.');
    return;
  }

  // 2) Evita doble inicialización si ya existe una app
  if (window.CARITAS?.app || firebase.apps.length > 0) {
    // Exponer referencias si no existieran
    window.CARITAS = window.CARITAS || {};
    window.CARITAS.app  = firebase.app();
    window.CARITAS.auth = firebase.auth ? firebase.auth() : null;
    document.dispatchEvent(new Event('firebase:ready:caritas'));
    return;
  }

  // 3) Configuración del proyecto
  const firebaseConfig = {
    apiKey: "AIzaSyD5X6LUG_dOwuaUf6jQUHw_LM5PFgOmc40",
    authDomain: "web-familias.firebaseapp.com",
    projectId: "web-familias",
    storageBucket: "web-familias.appspot.com",
    messagingSenderId: "261699620792",
    appId: "1:261699620792:web:8ff59afb72e96c371dc94d"
  };

  try {
    // 4) Inicializa (compat)
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();

    // Idioma en correos (opcional)
    try { auth.languageCode = 'es'; } catch {}

    // Persistencia local (mantener sesión entre recargas)
    try {
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
    } catch {}

    // 5) Expón en el namespace del proyecto
    window.CARITAS = window.CARITAS || {};
    window.CARITAS.app  = app;
    window.CARITAS.auth = auth;

    // 6) Sincroniza encabezado/bienvenida vía localStorage
    auth.onAuthStateChanged((user) => {
      if (user) {
        // Rellena/actualiza un mínimo de datos
        let stored = {};
        try { stored = JSON.parse(localStorage.getItem('caritasUser') || '{}'); } catch {}
        const base = {
          uid: user.uid,
          email: user.email || stored.email || '',
          nombre: stored.nombre || (user.email ? user.email.split('@')[0] : 'Voluntario'),
          rol: stored.rol || 'voluntario'
        };
        localStorage.setItem('caritasUser', JSON.stringify(base));
      }
      // Notifica a la UI para refrescar (bienvenida, botones, etc.)
      document.dispatchEvent(new CustomEvent('firebase:auth:changed', { detail: { user } }));
    });

    // 7) Señal global de listo
    document.dispatchEvent(new Event('firebase:ready:caritas'));
    console.log('✅ Firebase listo (Cáritas).');
  } catch (e) {
    console.error('❌ Error inicializando Firebase:', e);
  }
})();