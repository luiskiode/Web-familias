// login.js — corregido
console.log("📌 login.js cargado");

(function () {
  'use strict';

  const ready = (fn) =>
    document.readyState !== 'loading'
      ? fn()
      : document.addEventListener('DOMContentLoaded', fn);

  const $ = (sel) => document.querySelector(sel);
  const msgEl = () => $('#loginMessage') || $('#msg');

  function setMsg(text, type) {
    const el = msgEl();
    if (!el) return console.warn("MSG:", text);
    el.textContent = text || '';
    el.className = type || '';
  }

  function getAuth() {
    return window.CARITAS?.auth || (window.firebase?.auth && firebase.auth()) || null;
  }

  async function doLogin(email, password, btn) {
    const auth = getAuth();
    if (!auth) {
      setMsg('❌ Firebase no inicializado (revisa orden de scripts).', 'error');
      return;
    }

    if (!email || !password) {
      setMsg('⚠️ Completa email y contraseña.', 'error');
      return;
    }

    btn && (btn.disabled = true);
    try {
      await auth.signInWithEmailAndPassword(email, password);
      setMsg('✅ Acceso concedido. Redirigiendo…', 'success');
      // 🔄 Redirige usando hash SPA
      setTimeout(() => (window.location.href = 'index.html#inicio'), 800);
    } catch (err) {
      console.error('❌ login error:', err);
      const hint =
        err?.code === 'auth/network-request-failed'
          ? 'Error de red. Verifica tu conexión.'
          : err?.message || 'Error de autenticación.';
      setMsg('❌ ' + hint, 'error');
    } finally {
      btn && (btn.disabled = false);
    }
  }

  ready(() => {
    const form = $('#loginForm');
    if (form) {
      const emailInput = form.querySelector('input[type="email"]');
      const passInput = form.querySelector('input[type="password"]');
      const submitBtn = form.querySelector('button[type="submit"], .submit-btn');

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        doLogin(emailInput.value.trim(), passInput.value, submitBtn);
      });
      return;
    }

    const btn = $('#btnLogin') || $('#btn-login');
    const emailAlt = $('#login-email');
    const passAlt = $('#login-password');
    if (btn && emailAlt && passAlt) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        doLogin(emailAlt.value.trim(), passAlt.value, btn);
      });
      return;
    }

    console.warn('⚠️ login.js: no se encontró un formulario ni botón de login compatibles.');
  });

  // 🚀 Exponer inicializador (opcional)
  window.initLogin = () => console.log("✅ initLogin disponible");
})();