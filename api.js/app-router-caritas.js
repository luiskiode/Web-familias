// api.js/app-router-caritas.js — corregido y robusto
console.log("📌 app-router-caritas.js cargado");

(() => {
  'use strict';

  const app = document.getElementById('app');
  const nav = document.getElementById('main-nav');

  if (!app) {
    console.error("❌ No se encontró #app en el DOM. Router deshabilitado.");
    return;
  }

  const ROUTES = new Set([
    'inicio',
    'registro-fam',
    'perfil',
    'servicios',
    'listado',
    'carnet',
    'credencial',
    'credenciales-admin',
    'terminos',
    'validar',
    'validar-direccion'
  ]);

  const PROTECTED = new Set([
    'perfil',
    'servicios',
    'credenciales-admin',
    'listado',
    'carnet'
  ]);

  const BASE_PATHS = ['pestanas', 'pestañas', ''];

  const TITLES = {
    'inicio':              'Inicio — Cáritas CNC',
    'registro-fam':        'Registro de Familias — Cáritas CNC',
    'perfil':              'Mi Perfil — Cáritas CNC',
    'servicios':           'Servicios — Cáritas CNC',
    'listado':             'Listado de Familias — Cáritas CNC',
    'carnet':              'Carnet Personal — Cáritas CNC',
    'credencial':          'Credencial Pública — Cáritas CNC',
    'credenciales-admin':  'Gestión de Credenciales — Cáritas CNC',
    'terminos':            'Términos y Condiciones — Cáritas CNC',
    'validar':             'Validar Credencial — Cáritas CNC',
    'validar-direccion':   'Validar Dirección — Cáritas CNC'
  };

  let currentView = null;
  let inFlight = null;
  let lastLoadedHash = null;

  const isLoggedIn = () => {
    try {
      const u = window.CARITAS?.auth?.currentUser;
      if (u) return true;
      return !!JSON.parse(localStorage.getItem('caritasUser') || "{}")?.uid;
    } catch {
      return false;
    }
  };

  function sanitizeView(v) {
    return ROUTES.has((v || '').trim()) ? v.trim() : 'inicio';
  }

  function setTitle(view) {
    const t = TITLES[view] || 'Cáritas CNC';
    if (document.title !== t) document.title = t;
  }

  async function fetchViewHTML(view, signal) {
    for (const base of BASE_PATHS) {
      try {
        const res = await fetch(`${base}/${view}.html`, { cache: 'no-cache', signal });
        if (res.ok) return await res.text();
      } catch (e) {
        if (signal?.aborted) throw e;
      }
    }
    return `<div class="card" style="margin:1rem auto;max-width:720px;">
              <h2>⚠️ Página no encontrada</h2>
              <p>No existe la vista <code>${view}.html</code></p>
              <a href="#inicio" class="btn">🏠 Ir a inicio</a>
            </div>`;
  }

  function showProtectedNotice(view) {
    app.innerHTML = `
      <div class="card" style="max-width:720px;margin:1rem auto">
        <h2>🔒 Acceso restringido</h2>
        <p>Para ver <b>${view}</b> debes iniciar sesión.</p>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <button class="btn" id="goLogin">🔑 Ir a login</button>
          <a class="btn" href="#inicio">🏠 Ir a inicio</a>
        </div>
      </div>`;
    document.getElementById('goLogin')?.addEventListener('click', () => {
      sessionStorage.setItem('caritas:next', '#' + view);
      location.href = 'login.html';
    });
  }

  function showSkeleton() {
    app.innerHTML = `<div class="card skeleton" style="margin:1rem auto;max-width:960px;">⏳ Cargando...</div>`;
  }

  async function loadView(view) {
    const v = sanitizeView(view);
    if (currentView === v && lastLoadedHash === location.hash) return;

    if (PROTECTED.has(v) && !isLoggedIn()) {
      setTitle('inicio');
      showProtectedNotice(v);
      currentView = 'inicio';
      return;
    }

    inFlight?.abort?.();
    const controller = new AbortController();
    inFlight = controller;

    try {
      setTitle(v);
      showSkeleton();
      const html = await fetchViewHTML(v, controller.signal);
      if (controller.signal.aborted) return;

      app.innerHTML = html;

      if (!/Mobi|Android/i.test(navigator.userAgent)) {
        const focusEl = app.querySelector('[autofocus], h1, h2, h3, [tabindex], button, a, input, textarea, select');
        focusEl?.focus?.();
      }

      window.scrollTo({ top: 0, behavior: 'instant' });
      document.dispatchEvent(new CustomEvent('view:loaded:caritas', { detail: { view: v } }));

      currentView = v;
      lastLoadedHash = location.hash;
      sessionStorage.setItem('caritas:lastView', v);
    } catch (err) {
      console.error('❌ No se pudo cargar la vista', v, err);
      app.innerHTML = `<div class="card" style="margin:1rem auto;max-width:720px;">
        <h2>❌ Error</h2>
        <p>Ocurrió un problema al cargar <code>${v}.html</code>.</p>
        <a href="#inicio" class="btn">🏠 Ir a inicio</a>
      </div>`;
    }
  }

  function goto(view) {
    const v = sanitizeView(view);
    if (location.hash !== '#' + v) {
      history.pushState(null, '', '#' + v);
    }
    loadView(v);
  }

  window.addEventListener('hashchange', () => {
    const v = (location.hash || '#inicio').replace('#', '') || 'inicio';
    goto(v);
  });

  document.addEventListener('DOMContentLoaded', () => {
    const next = sessionStorage.getItem('caritas:next');
    if (next && isLoggedIn()) {
      sessionStorage.removeItem('caritas:next');
      history.replaceState(null, '', next);
    }
    let v = (location.hash || '').replace('#', '');
    if (!v) {
      v = sessionStorage.getItem('caritas:lastView') || 'inicio';
      history.replaceState(null, '', '#' + v);
    }
    goto(v);
  });

  document.addEventListener('firebase:ready:caritas', () => {
    const auth = window.CARITAS?.auth;
    if (!auth) return;

    auth.onAuthStateChanged(u => {
      const show = !!u;
      const btnPerfil = document.getElementById('btnPerfil');
      const btnServicios = document.getElementById('btnServicios');
      const btnLogout = document.getElementById('btnLogout');

      if (btnPerfil) btnPerfil.style.display = show ? '' : 'none';
      if (btnServicios) btnServicios.style.display = show ? '' : 'none';
      if (btnLogout) btnLogout.style.display = show ? '' : 'none';

      const current = (location.hash || '#inicio').replace('#', '') || 'inicio';
      if (!u && PROTECTED.has(current)) goto('inicio');

      const pending = sessionStorage.getItem('caritas:next');
      if (u && pending) {
        sessionStorage.removeItem('caritas:next');
        const target = pending.replace('#', '');
        history.replaceState(null, '', '#' + target);
        goto(target);
      }
    });
  });

  // 🚀 Exponer global
  window.CARITAS = window.CARITAS || {};
  window.CARITAS.goto = goto;
})();