// api.js/firebase-config-caritas.js — Inicialización robusta Firebase Cáritas CNC
console.log("📌 firebase-config-caritas.js cargado");

(function () {
  'use strict';

  // Evita doble init
  if (window.CARITAS?.app) {
    console.warn("⚠️ Firebase ya estaba inicializado");
    document.dispatchEvent(new Event('firebase:ready:caritas'));
    return;
  }

  if (typeof firebase === "undefined" || !firebase.initializeApp) {
    console.error("❌ Firebase SDK no está cargado. Revisa las etiquetas <script src='https://www.gstatic.com/firebasejs/...'> en tu HTML.");
    document.dispatchEvent(new Event("firebase:error:caritas"));
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
    const app  = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();

    // Persistencia local
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(err => {
      console.warn("⚠️ No se pudo establecer persistencia local:", err);
    });

    // Poner en global ANTES de onAuthStateChanged y disparar evento de inmediato
    window.CARITAS = Object.assign({}, window.CARITAS, { app, auth });
    document.dispatchEvent(new Event("firebase:ready:caritas"));

    // Normalización simple de rol
    function normalizarRol(rol) {
      if (!rol) return "Voluntario Cáritas CNC";
      const r = (rol+"").toLowerCase();
      if (r.includes("admin")) return "Administrador";
      if (r.includes("editor")) return "Editor";
      return "Voluntario Cáritas CNC";
    }

    // Cambios de sesión
    auth.onAuthStateChanged(user => {
      try {
        if (user) {
          const prev = JSON.parse(localStorage.getItem("caritasUser") || "{}");
          const userData = {
            uid: user.uid,
            email: user.email,
            nombre: user.displayName || prev.nombre || user.email?.split("@")[0] || "Usuario",
            rol: normalizarRol(prev.rol)
          };
          localStorage.setItem("caritasUser", JSON.stringify(userData));
          console.log("👤 Sesión iniciada:", userData);
        } else {
          localStorage.removeItem("caritasUser");
          console.log("👤 Sesión cerrada");
        }
        // Re-dispara por si algún listener esperaba este momento
        document.dispatchEvent(new Event("firebase:ready:caritas"));
      } catch (err) {
        console.error("❌ Error gestionando auth state:", err);
        document.dispatchEvent(new Event("firebase:error:caritas"));
      }
    });

    console.log("✅ Firebase listo (Cáritas)");
  } catch (err) {
    console.error("❌ Error inicializando Firebase Cáritas:", err);
    document.dispatchEvent(new Event("firebase:error:caritas"));
  }
})();