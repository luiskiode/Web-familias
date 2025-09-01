// login-supabase.js (corregido) — Ahora usa Firebase Auth para mantener consistencia del proyecto
console.log("✅ login-supabase.js cargado (modo Firebase Auth)");

(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }
  const form = $("loginForm");
  if (!form) {
    console.warn("ℹ️ loginForm no encontrado en este documento");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("email")?.value?.trim();
    const password = $("password")?.value || "";
    const msg = $("loginMessage");

    if (msg) { msg.textContent = ""; msg.style.color = ""; }

    if (!email || !password) {
      if (msg) { msg.textContent = "⚠️ Completa correo y contraseña"; msg.style.color = "red"; }
      return;
    }

    try {
      if (!window.firebase?.auth) throw new Error("Firebase Auth no inicializado");
      await firebase.auth().signInWithEmailAndPassword(email, password);
      if (msg) { msg.textContent = "✅ Acceso concedido, redirigiendo…"; msg.style.color = "green"; }
      setTimeout(() => (window.location.href = "index.html"), 800);
    } catch (err) {
      console.error("❌ Error de login:", err?.message || err);
      if (msg) { msg.textContent = "❌ " + (err?.message || err); msg.style.color = "red"; }
    }
  });
})();
