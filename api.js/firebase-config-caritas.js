// firebase-config-caritas.js — Inicialización robusta Firebase Cáritas CNC
console.log("📌 firebase-config-caritas.js cargado");

(function () {
  'use strict';

  if (window.CARITAS?.app) {
    console.warn("⚠️ Firebase ya estaba inicializado");
    document.dispatchEvent(new Event('firebase:ready:caritas'));
    return;
  }

  if (typeof firebase === "undefined" || !firebase.initializeApp) {
    console.error("❌ Firebase SDK no está cargado. Revisa <script src='https://www.gstatic.com/firebasejs/...'> en tu HTML.");
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
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();

    // Persistencia local
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(err => {
      console.warn("⚠️ No se pudo establecer persistencia local:", err);
    });

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
      try {
        if (user) {
          const stored = JSON.parse(localStorage.getItem("caritasUser") || "{}");
          const userData = {
            uid: user.uid,
            email: user.email,
            nombre: user.displayName || stored.nombre || user.email?.split("@")[0] || "Usuario",
            rol: normalizarRol(stored.rol)
          };
          localStorage.setItem("caritasUser", JSON.stringify(userData));
          console.log("👤 Sesión iniciada:", userData);
        } else {
          localStorage.removeItem("caritasUser");
          console.log("👤 Sesión cerrada");
        }
        document.dispatchEvent(new Event("firebase:ready:caritas"));
      } catch (err) {
        console.error("❌ Error procesando estado de autenticación:", err);
        document.dispatchEvent(new Event("firebase:error:caritas"));
      }
    });

    // Guardar en global
    window.CARITAS = Object.assign({}, window.CARITAS, { app, auth });

    console.log("✅ Firebase listo (Cáritas)");
  } catch (err) {
    console.error("❌ Error inicializando Firebase Cáritas:", err);
    document.dispatchEvent(new Event("firebase:error:caritas"));
  }
})();