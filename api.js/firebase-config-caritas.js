// firebase-config-caritas.js — Inicialización Firebase Cáritas CNC

(function () {
  'use strict';

  if (window.CARITAS?.app) {
    document.dispatchEvent(new Event('firebase:ready:caritas'));
    return;
  }

  const firebaseConfig = {
    apiKey: "AIzaSyD5X6LUG_dOwuaUf6jQUHw_LM5PFgOmc40",
    authDomain: "web-familias.firebaseapp.com",
    projectId: "web-familias",
    storageBucket: "web-familias.appspot.com",
    messagingSenderId: "261699620792",
    appId: "1:261699620792:web:8ff59afb72e96c371dc94d"
  };

  try {
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();

    // Persistencia local
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

    // Normalización de roles
    function normalizarRol(rol) {
      if (!rol) return "Voluntario Cáritas CNC";
      const r = rol.toLowerCase();
      if (r.includes("admin")) return "Administrador";
      if (r.includes("editor")) return "Editor";
      return "Voluntario Cáritas CNC";
    }

    // Estado de autenticación
    auth.onAuthStateChanged(user => {
      if (user) {
        const stored = JSON.parse(localStorage.getItem("caritasUser") || "{}");
        const userData = {
          uid: user.uid,
          email: user.email,
          nombre: user.displayName || stored.nombre || user.email.split("@")[0],
          rol: normalizarRol(stored.rol)
        };
        localStorage.setItem("caritasUser", JSON.stringify(userData));
      } else {
        localStorage.removeItem("caritasUser");
      }
      document.dispatchEvent(new Event("firebase:ready:caritas"));
    });

    window.CARITAS = Object.assign({}, window.CARITAS, { app, auth });

    console.log("✅ Firebase listo (Cáritas)");
  } catch (err) {
    console.error("❌ Error inicializando Firebase Cáritas:", err);
  }
})();