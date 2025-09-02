// login.js — robusto: soporta distintos IDs y botones
(function () {
  'use strict';

  const ready = (fn) => (document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn));
  const $ = (sel) => document.querySelector(sel);
  const msgEl = () => $('#loginMessage') || $('#login-msg') || $('#msg');

  function setMsg(text, type) {
    const el = msgEl(); if (!el) return;
    el.textContent = text || '';
    el.classList.remove('error', 'success');
    if (type) el.classList.add(type);
  }

 function getAuth() {
  return (window.auth && typeof window.auth.signInWithEmailAndPassword === 'function' && window.auth)
      || (window.CARITAS && window.CARITAS.auth)
      || (window.firebase && firebase.auth && firebase.auth())
      || null;
  }

  async function doLogin(getters) {
    const auth = getAuth();
    if (!auth) { setMsg('Firebase no inicializado (revisa orden de scripts).', 'error'); return; }

    const email = getters.email()?.value?.trim();
    const password = getters.password()?.value || '';
    if (!email || !password) { setMsg('Completa email y contraseña.', 'error'); return; }

    const btn = getters.submit?.();
    btn && (btn.disabled = true);
    try {
      await auth.signInWithEmailAndPassword(email, password);
      setMsg('✅ Acceso concedido. Redirigiendo…', 'success');
      setTimeout(() => (window.location.href = 'index.html'), 800);
    } catch (err) {
      console.error('login error:', err);
      const hint = err?.code === 'auth/network-request-failed'
        ? 'Error de red. Verifica tu conexión.'
        : (err?.message || 'Error de autenticación.');
      setMsg('❌ ' + hint, 'error');
    } finally {
      btn && (btn.disabled = false);
    }
  }

  ready(() => {
    // Caso 1: <form id="loginForm"> con #email y #password
    const form = $('#loginForm');
    if (form) {
      const getters = {
        email: () => $('#email') || form.querySelector('input[type="email"]'),
        password: () => $('#password') || form.querySelector('input[type="password"]'),
        submit: () => form.querySelector('button[type="submit"], .submit-btn')
      };
      form.addEventListener('submit', (e) => { e.preventDefault(); doLogin(getters); });
      return;
    }

    // Caso 2: botón + campos alternativos
    const btn = $('#btn-login') || $('#btnLogin');
    const emailAlt = $('#login-email');
    const passAlt  = $('#login-password');
    if (btn && emailAlt && passAlt) {
      const getters = { email: () => emailAlt, password: () => passAlt, submit: () => btn };
      btn.addEventListener('click', (e) => { e.preventDefault(); doLogin(getters); });
      return;
    }

    // Caso 3: formulario genérico
    const anyForm = document.querySelector('form[action*="login"], form[data-login], form');
    if (anyForm) {
      const getters = {
        email: () => anyForm.querySelector('input[type="email"]'),
        password: () => anyForm.querySelector('input[type="password"]'),
        submit: () => anyForm.querySelector('button[type="submit"]') || anyForm.querySelector('button')
      };
      anyForm.addEventListener('submit', (e) => { e.preventDefault(); doLogin(getters); });
      return;
    }

    console.warn('login.js: no se encontró un formulario ni botón de login compatibles.');
  });
})();
