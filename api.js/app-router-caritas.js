// api.js/app-router-caritas.js — corregido y robusto
console.log("📌 app-router-caritas.js cargado");

(() => {
  'use strict';

  const app = document.getElementById('app');
  if (!app) {
    console.error("❌ No se encontró #app en el DOM. Router deshabilitado.");
    return;
  }

  // ----------------- Config -----------------
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

  const PROTECTED = new Set(['perfil','servicios','credenciales-admin','listado','carnet']);

  // Orden de búsqueda de vistas (relativo a <base href="/Web-familias/">)
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

  // ----------------- Helpers -----------------
  const isLoggedIn = () => {
    try {
      if (window.CARITAS?.auth?.currentUser) return true;
      return !!JSON.parse(localStorage.getItem('caritasUser') || "{}")?.uid;
    } catch { return false; }
  };

  const sanitizeView = (v) => ROUTES.has((v || '').trim()) ? v.trim() : 'inicio';

  function setTitle(view) {
    const t = TITLES[view] || 'Cáritas CNC';
    if (document.title !== t) document.title = t;
  }

  async function fetchViewHTML(view, signal) {
    for (const base of BASE_PATHS) {
      const url = base ? `${base}/${view}.html` : `${view}.html`;
      try {
        const res = await fetch(url, { cache: 'no-cache', signal });
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
      location.href = 'pestanas/login.html';
    });
  }

  function showSkeleton() {
    app.innerHTML = `<div class="card skeleton" style="margin:1rem auto;max-width:960px;">⏳ Cargando...</div>`;
  }

  // Extrae sólo <body> del documento remoto (si existe)
  function extractBody(html) {
    const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return m ? m[1] : html;
  }

  // Inyecta CSS al <head> y ejecuta los <script> de la vista
  function hydrateViewAssets(fullHTML) {
    const tmp = document.createElement('html');
    tmp.innerHTML = fullHTML;

    // --- 1) CSS: <link rel="stylesheet"> sin duplicar
    const existingHrefs = new Set(
      [...document.querySelectorAll('link[rel="stylesheet"]')]
        .map(l => new URL(l.getAttribute('href'), location.href).href)
    );

    tmp.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const hrefAttr = link.getAttribute('href');
      if (!hrefAttr) return;
      const abs = new URL(hrefAttr, location.href).href;
      if (existingHrefs.has(abs)) return;
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = hrefAttr; // respeta <base>
      document.head.appendChild(l);
      existingHrefs.add(abs);
    });

    // --- 2) Scripts: ejecutar inline y con src (soporta type="module")
    const existingScriptSrcs = new Set(
      [...document.scripts].map(s => s.src).filter(Boolean)
    );

    tmp.querySelectorAll('script').forEach(old => {
      const src = old.getAttribute('src');
      const isModule = (old.getAttribute('type') || '').toLowerCase() === 'module';

      if (src) {
        const abs = new URL(src, location.href).href;
        if (existingScriptSrcs.has(abs)) return; // evita recargar el mismo src
        const s = document.createElement('script');
        if (isModule) s.type = 'module';
        s.src = src;
        document.body.appendChild(s);
        existingScriptSrcs.add(abs);
      } else {
        // Inline: se ejecuta cada vez (algunas vistas necesitan boot cada carga)
        const s = document.createElement('script');
        if (isModule) s.type = 'module';
        s.textContent = old.textContent || '';
        document.body.appendChild(s);
      }
    });
  }

  // ----------------- Carga de vistas -----------------
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

      const fullHTML = await fetchViewHTML(v, controller.signal);
      if (controller.signal.aborted) return;

      // 1) Inyectar estilos y scripts de la vista
      hydrateViewAssets(fullHTML);

      // 2) Renderizar sólo el contenido del <body> en #app
      const htmlForApp = extractBody(fullHTML);
      app.innerHTML = htmlForApp;

      // Accesibilidad / foco
      if (!/Mobi|Android/i.test(navigator.userAgent)) {
        const focusEl = app.querySelector('[autofocus], h1, h2, h3, [tabindex], button, a, input, textarea, select');
        focusEl?.focus?.();
      }

      // Scroll arriba
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Notificar a listeners (ej. index.html que llama initListadoView())
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

  // ----------------- Hooks globales -----------------
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

  // Sincronizar con Firebase Auth para rutas protegidas
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

  // 🚀 Exponer atajo global
  window.CARITAS = window.CARITAS || {};
  window.CARITAS.goto = goto;
})();