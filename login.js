// login.js (nuevo) — Controlador genérico para pantallas de login con Firebase compat
console.log("📌 login.js cargado");

(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }
  const form = $("loginForm");
  const msg = $("loginMessage");

  if (!form) {
    console.warn("ℹ️ loginForm no existe en esta página");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("email")?.value?.trim();
    const password = $("password")?.value || "";

    if (msg) { msg.textContent = ""; msg.className = ""; }

    if (!email || !password) {
      if (msg) { msg.textContent = "Completa email y contraseña"; msg.className = "error"; }
      return;
    }

    try {
      if (!window.firebase?.auth) throw new Error("Firebase Auth no inicializado");
      await firebase.auth().signInWithEmailAndPassword(email, password);
      if (msg) { msg.textContent = "Acceso concedido, redirigiendo…"; msg.className = "success"; }
      setTimeout(() => (location.href = "index.html"), 800);
    } catch (err) {
      console.error(err);
      if (msg) { msg.textContent = err?.message || "Error de autenticación"; msg.className = "error"; }
    }
  });
})();
