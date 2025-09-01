// servicios.js (corregido) — Soporta IDs alternos y Firebase compat/modular
console.log("📌 servicios.js cargado");

(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }
  const loginCard = $("loginCard") || $("login-card");
  const serviciosPrivados = $("serviciosPrivados") || $("serviciosGrid");
  const loginBtn = $("btn-login") || $("btnLogin");
  const logoutBtn = $("btn-logout") || $("btnLogout");

  if (!loginCard || !serviciosPrivados || !loginBtn || !logoutBtn) {
    console.warn("❌ Algunos elementos de login no se encontraron");
    return;
  }

  function onAuthStateChanged(handler) {
    if (window.firebase?.auth) return firebase.auth().onAuthStateChanged(handler);
    if (window.auth?.onAuthStateChanged) return window.auth.onAuthStateChanged(handler);
    console.warn("⚠ No hay proveedor de Auth disponible.");
    handler(null);
  }

  onAuthStateChanged((user) => {
    if (user) {
      console.log("✅ Sesión activa:", user.email);
      loginCard.style.display = "none";
      serviciosPrivados.style.display = "block";
    } else {
      console.log("🚪 Sesión cerrada");
      loginCard.style.display = "block";
      serviciosPrivados.style.display = "none";
    }
  });

  // Login
  loginBtn.addEventListener("click", async () => {
    const email = $("login-email")?.value;
    const password = $("login-password")?.value;
    try {
      if (window.firebase?.auth) {
        await firebase.auth().signInWithEmailAndPassword(email, password);
      } else if (window.auth?.signInWithEmailAndPassword) {
        await window.auth.signInWithEmailAndPassword(email, password);
      } else {
        throw new Error("Auth no disponible");
      }
      alert("✅ Sesión iniciada con éxito");
    } catch (err) {
      alert("❌ Error al iniciar sesión: " + (err?.message || err));
    }
  });

  // Logout
  logoutBtn.addEventListener("click", async () => {
    try {
      if (window.firebase?.auth) {
        await firebase.auth().signOut();
      } else if (window.auth?.signOut) {
        await window.auth.signOut();
      } else {
        throw new Error("Auth no disponible");
      }
      alert("🚪 Sesión cerrada");
    } catch (err) {
      alert("❌ Error al cerrar sesión: " + (err?.message || err));
    }
  });
})();
