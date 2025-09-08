// api.js/self-heal-caritas.js
// 🛠 Autorreparador Cáritas CNC — corrige rutas, CSP, ESM y boot de vistas
console.log("🛠 self-heal-caritas.js cargado");

(async () => {
  'use strict';

  // ========= Helpers =========
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const headOK = async (url) => {
    try { const r = await fetch(url, { method: 'HEAD', cache: 'no-store' }); return r.ok; }
    catch { return false; }
  };

  // Asegurar <base href="/Web-familias/">
  (function ensureBase() {
    const EXPECTED = '/Web-familias/';
    let base = document.querySelector('base');
    if (!base) {
      base = document.createElement('base');
      document.head.prepend(base);
    }
    // Usamos ruta absoluta basada en el host
    const target = new URL(EXPECTED, location.origin).href;
    if (!base.href || base.href !== target) {
      base.href = target;
      console.log('🔧 Base href fijado a', base.href);
    }
  })();

  const baseHref = document.querySelector('base')?.href || (location.origin + location.pathname);
  const abs = (p) => new URL(p, baseHref).href;

  // ========= Arreglar estilos (404) =========
  async function ensureStyles() {
    // ¿Existe ya un link funcional?
    const link = [...document.querySelectorAll('link[rel="stylesheet"]')]
      .find(l => /styles-caritas\.css(\?|$)/.test(l.getAttribute('href') || ''));

    const candidates = [
      'styles-caritas.css',
      '/Web-familias/styles-caritas.css'
    ].map(abs);

    const ok = await headOK(candidates[0]) || await headOK(candidates[1]);

    if (!link && ok) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = candidates[0];
      document.head.appendChild(l);
      console.log("🎨 styles-caritas.css insertado:", l.href);
    } else if (!ok) {
      console.warn("⚠️ styles-caritas.css no accesible en", candidates);
    }
  }

  // ========= Sustituir UMD por ESM (CSP-safe) =========
  async function ensureESMLibs() {
    // Elimina UMD conflictivos con CSP
    const bad = [
      'qrcode/build/qrcode.min.js',
      '/jsqr', 'jsQR.min.js',
      'html2canvas.min.js'
    ];
    document.querySelectorAll('script[src]').forEach(s => {
      const src = s.getAttribute('src') || '';
      if (bad.some(b => src.includes(b))) {
        console.warn('🧹 Removiendo UMD por CSP:', src);
        s.remove();
      }
    });
    // Carga ESM y expone globales si no existen
    try {
      if (!window.QRCode) {
        const mod = await import('https://esm.sh/qrcode@1');
        window.QRCode = mod.default || mod;
        console.log('✅ QRCode (ESM) listo');
      }
    } catch (e) { console.warn('⚠️ No se pudo cargar QRCode ESM', e); }
    try {
      if (!window.jsQR) {
        const mod = await import('https://esm.sh/jsqr@1.4.0');
        window.jsQR = mod.default || mod;
        console.log('✅ jsQR (ESM) listo');
      }
    } catch (e) { console.warn('⚠️ No se pudo cargar jsQR ESM', e); }
    try {
      if (!window.html2canvas) {
        const mod = await import('https://esm.sh/html2canvas@1.4.1');
        window.html2canvas = mod.default || mod;
        console.log('✅ html2canvas (ESM) listo');
      }
    } catch (e) { console.warn('⚠️ No se pudo cargar html2canvas ESM', e); }
  }

  // ========= Asegurar Supabase (ESM, sin eval) =========
  async function ensureSupabase() {
    window.CARITAS = window.CARITAS || {};
    if (window.CARITAS.supabase) {
      console.log('↩️ Reutilizando Supabase global');
      return;
    }
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const SUPABASE_URL = 'https://qivjlsvcjyqymommfdke.supabase.co';
      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdmpsc3ZjanlxeW1vbW1mZGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjA2MjUsImV4cCI6MjA2OTkzNjYyNX0.YN0W5miJeWwu96jhqKiGB-cA8t9TeIboQWURCjTFVbw';
      window.CARITAS.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ Supabase inicializado (self-heal)');
      document.dispatchEvent(new Event('supabase:ready:caritas'));
    } catch (e) {
      console.error('❌ No se pudo inicializar Supabase ESM', e);
    }
  }

  // ========= Arreglar ruta de familias.js (404) =========
  async function ensureFamiliasJs() {
    // Evita doble carga si ya está definido el inicializador
    if (window.initListadoView || window.initFamiliasView || window.initFamilias) return;

    const candidates = [
      'api.js/familias.js',
      '/Web-familias/api.js/familias.js',
      'familias.js',
      '/Web-familias/familias.js'
    ];

    for (const c of candidates) {
      const url = abs(c);
      if (await headOK(url)) {
        const s = document.createElement('script');
        s.defer = true;
        s.src = url;
        document.body.appendChild(s);
        console.log('📎 familias.js cargado desde', url);
        return;
      }
    }
    console.warn('⚠️ No se encontró familias.js en ninguna ruta candidata');
  }

  // ========= Detectar carpeta de vistas (pestanas vs pestañas) =========
  async function detectViewDir() {
    let dir = 'pestanas';
    if (!await headOK(abs('pestanas/registro-fam.html'))) {
      if (await headOK(abs('pesta%C3%B1as/registro-fam.html'))) dir = 'pesta%C3%B1as';
    }
    window.CARITAS_VIEW_DIR = dir;
    console.log('📂 Directorio de vistas:', dir);
  }

  // ========= Reparar navegación del header =========
  function patchNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    nav.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-view]');
      if (!btn) return;
      const view = btn.dataset.view;
      if (view && view !== 'inicio') {
        e.preventDefault();
        const url = abs(`${window.CARITAS_VIEW_DIR || 'pestanas'}/${view}.html`);
        console.log('🧭 Abrir vista:', url);
        window.open(url, '_blank', 'noopener');
      } else {
        location.hash = '#inicio';
      }
    }, { capture: true });
  }

  // ========= Hook tras cargar una vista con el router =========
  function hookViewLoaded() {
    document.addEventListener('view:loaded:caritas', () => {
      // Llama a cualquiera de los inicializadores que exporten tus vistas de listado
      if (window.initListadoView)      window.initListadoView();
      else if (window.initFamiliasView) window.initFamiliasView();
      else if (window.initFamilias)     window.initFamilias();
    });
  }

  // ========= Ejecutar plan de reparación =========
  await ensureStyles();
  await ensureESMLibs();
  await ensureSupabase();
  await ensureFamiliasJs();
  await detectViewDir();
  patchNav();
  hookViewLoaded();

  console.log('✅ Autorreparación aplicada.');
})();