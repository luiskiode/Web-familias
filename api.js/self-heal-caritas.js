// api.js/self-heal-caritas.js
// 🛠 Autorreparador Cáritas CNC — corrige rutas, CSP y boot
console.log("🛠 self-heal-caritas.js cargado");

(async () => {
  'use strict';

  const headOK = async (url) => {
    try { const r = await fetch(url, { method: 'HEAD', cache: 'no-store' }); return r.ok; }
    catch { return false; }
  };

  // ========= Asegurar <base> =========
  (function ensureBase() {
    const EXPECTED = '/Web-familias/';
    let base = document.querySelector('base');
    if (!base) {
      base = document.createElement('base');
      document.head.prepend(base);
    }
    const target = new URL(EXPECTED, location.origin).href;
    if (!base.href || base.href !== target) {
      base.href = target;
      console.log('🔧 Base href fijado a', base.href);
    }
  })();

  const baseHref = document.querySelector('base')?.href || (location.origin + location.pathname);
  const abs = (p) => new URL(p, baseHref).href;

  // ========= Asegurar estilos =========
  async function ensureStyles() {
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

  // ========= Sustituir UMD por ESM =========
  async function ensureESMLibs() {
    const bad = ['qrcode.min.js','jsQR.min.js','html2canvas.min.js'];
    document.querySelectorAll('script[src]').forEach(s => {
      const src = s.getAttribute('src') || '';
      if (bad.some(b => src.includes(b))) {
        console.warn('🧹 Removiendo UMD por CSP:', src);
        s.remove();
      }
    });
    try {
      if (!window.QRCode) {
        const mod = await import('https://esm.sh/qrcode@1');
        window.QRCode = mod.default || mod;
        console.log('✅ QRCode (ESM) listo');
      }
    } catch {}
    try {
      if (!window.jsQR) {
        const mod = await import('https://esm.sh/jsqr@1.4.0');
        window.jsQR = mod.default || mod;
        console.log('✅ jsQR (ESM) listo');
      }
    } catch {}
    try {
      if (!window.html2canvas) {
        const mod = await import('https://esm.sh/html2canvas@1.4.1');
        window.html2canvas = mod.default || mod;
        console.log('✅ html2canvas (ESM) listo');
      }
    } catch {}
  }

  // ========= Asegurar Supabase =========
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

  // ========= Ejecutar plan de reparación =========
  await ensureStyles();
  await ensureESMLibs();
  await ensureSupabase();

  console.log('✅ Autorreparación aplicada.');
})();