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

  // Rutas absolutas a cada vista
  const ROUTES = {
    "inicio": "pestanas/inicio.html",
    "login": "pestanas/login.html",
    "registro-fam": "pestanas/registro-familias/registro-fam.html",
    "listado": "pestanas/registro-familias/listado.html",
    "familias-list": "pestanas/registro-familias/familias-list.html",
    "terminos": "pestanas/registro-familias/terminos.html",
    "validar-direccion": "pestanas/registro-familias/validar-direccion.html",
    "perfil": "pestanas/herramientas/perfil.html",
    "register": "pestanas/herramientas/register.html",
    "servicios": "pestanas/herramientas/servicios.html",
    "validar": "pestanas/herramientas/validar.html",
    "carnet": "pestanas/perfil-y-carnet/carnet.html",
    "credencial": "pestanas/perfil-y-carnet/credencial.html",
    "credenciales-admin": "pestanas/perfil-y-carnet/credenciales-admin.html"
  };

  const PROTECTED = new Set([
    "perfil", "servicios", "credenciales-admin", "listado", "carnet"
  ]);

  const TITLES = {
    "inicio": "Inicio — Cáritas CNC",
    "login": "Login — Cáritas CNC",
    "registro-fam": "Registro de Familias — Cáritas CNC",
    "listado": "Listado de Familias — Cáritas CNC",
    "familias-list": "Familias Registradas — Cáritas CNC",
    "terminos": "Términos y Condiciones — Cáritas CNC",
    "validar-direccion": "Validar Dirección — Cáritas CNC",
    "perfil": "Mi Perfil — Cáritas CNC",
    "register": "Registro de Usuario — Cáritas CNC",
    "servicios": "Servicios — Cáritas CNC",
    "validar": "Validar Credencial — Cáritas CNC",
    "carnet": "Carnet — Cáritas CNC",
    "credencial": "Credencial Pública — Cáritas CNC",
    "credenciales-admin": "Gestión de Credenciales — Cáritas CNC"
  };

  let currentView = null;

  function isLoggedIn() {
    try {
      const u = window.CARITAS?.auth?.currentUser;
      if (u) return true;
      return !!JSON.parse(localStorage.getItem("caritasUser") || "{}")?.uid;
    } catch {
      return false;
    }
  }

  function sanitizeView(v) {
    return ROUTES[v] ? v : "inicio";
  }

  function setTitle(view) {
    const t = TITLES[view] || "Cáritas CNC";
    if (document.title !== t) document.title = t;
  }

  async function loadView(view) {
    const v = sanitizeView(view);
    if (currentView === v) return;

    if (PROTECTED.has(v) && !isLoggedIn()) {
      app.innerHTML = `
        <div class="card" style="max-width:720px;margin:1rem auto">
          <h2>🔒 Acceso restringido</h2>
          <p>Debes iniciar sesión para acceder a <b>${v}</b>.</p>
          <button class="btn" id="goLogin">Ir a Login</button>
        </div>`;
      document.getElementById("goLogin")?.addEventListener("click", () => {
        sessionStorage.setItem("caritas:next", "#" + v);
        location.href = "pestanas/login.html";
      });
      return;
    }

    setTitle(v);
    app.innerHTML = `<div class="card" style="margin:1rem auto">⏳ Cargando...</div>`;

    try {
      const res = await fetch(ROUTES[v], { cache: "no-cache" });
      if (!res.ok) throw new Error(res.statusText);
      const html = await res.text();
      app.innerHTML = html;
      currentView = v;
      document.dispatchEvent(new CustomEvent("view:loaded:caritas", { detail: { view: v } }));
    } catch (err) {
      console.error("❌ Error cargando vista", v, err);
      app.innerHTML = `
        <div class="card" style="margin:1rem auto;max-width:720px;">
          <h2>⚠️ Error</h2>
          <p>No se pudo cargar <b>${v}</b>.</p>
          <a href="#inicio" class="btn">Ir a inicio</a>
        </div>`;
    }
  }

  function goto(view) {
    const v = sanitizeView(view);
    if (location.hash !== "#" + v) {
      history.pushState(null, "", "#" + v);
    }
    loadView(v);
  }

  window.addEventListener("hashchange", () => {
    const v = (location.hash || "#inicio").replace("#", "") || "inicio";
    goto(v);
  });

  document.addEventListener("DOMContentLoaded", () => {
    const next = sessionStorage.getItem("caritas:next");
    if (next && isLoggedIn()) {
      sessionStorage.removeItem("caritas:next");
      history.replaceState(null, "", next);
      goto(next.replace("#", ""));
      return;
    }
    const v = (location.hash || "#inicio").replace("#", "") || "inicio";
    goto(v);
  });

  window.CARITAS = window.CARITAS || {};
  window.CARITAS.goto = goto;
})();
