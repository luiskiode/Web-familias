// api.js/app-router-caritas.js
(() => {
  "use strict";

  const app = document.getElementById("app");
  const nav = document.getElementById("main-nav");

  // Rutas válidas
  const ROUTES = new Set(["inicio", "registro-fam", "perfil", "servicios"]);
  // Vistas protegidas
  const PROTECTED = new Set(["perfil", "servicios"]);
  // Solo usamos pestanas/ (sin ñ) para evitar problemas en despliegue
  const BASE_PATH = "pestanas";

  const TITLES = {
    inicio: "Inicio — Cáritas CNC",
    "registro-fam": "Registro de Familias — Cáritas CNC",
    perfil: "Mi Perfil — Cáritas CNC",
    servicios: "Servicios — Cáritas CNC",
  };

  let currentView = null;
  let controller = null;
  let lastLoadedHash = null;

  // === Helpers sesión ===
  const isLoggedIn = () => {
    const u = window.CARITAS?.auth?.currentUser;
    if (u) return true;
    try {
      return !!JSON.parse(localStorage.getItem("caritasUser"))?.uid;
    } catch {
      return false;
    }
  };

  // === UI helpers ===
  function markActive(view) {
    nav?.querySelectorAll("button[data-view]").forEach((b) => {
      const active = b.dataset.view === view;
      b.classList.toggle("active", active);
      b.setAttribute("aria-current", active ? "page" : "false");
    });
  }

  function setTitle(view) {
    document.title = TITLES[view] || "Cáritas CNC";
  }

  function sanitizeView(v) {
    const clean = (v || "").trim();
    return ROUTES.has(clean) ? clean : "inicio";
  }

  async function fetchViewHTML(view, signal) {
    const res = await fetch(`${BASE_PATH}/${view}.html`, {
      cache: "no-cache",
      signal,
    });
    if (!res.ok) throw new Error(res.status);
    return await res.text();
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
    document.getElementById("goLogin")?.addEventListener("click", () => {
      sessionStorage.setItem("caritas:next", "#" + view);
      location.href = "login.html";
    });
  }

  function showSkeleton() {
    app.innerHTML =
      '<div class="card skeleton" style="margin:1rem auto;max-width:960px;"></div>';
  }

  function showError(view) {
    app.innerHTML = `
      <div class="card" style="max-width:720px;margin:1rem auto">
        <h2>⚠️ Error</h2>
        <p>No se pudo cargar <code>${view}.html</code>.</p>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <button class="btn" id="btnRetry">Reintentar</button>
          <a class="btn" href="#inicio">Ir a inicio</a>
        </div>
      </div>`;
    document.getElementById("btnRetry")?.addEventListener("click", () =>
      goto(view)
    );
    document.dispatchEvent(
      new CustomEvent("view:error:caritas", { detail: { view } })
    );
  }

  async function loadView(view) {
    const sanitized = sanitizeView(view);
    if (currentView === sanitized && lastLoadedHash === location.hash) return;

    if (PROTECTED.has(sanitized) && !isLoggedIn()) {
      markActive("inicio");
      setTitle("inicio");
      showProtectedNotice(sanitized);
      currentView = "inicio";
      return;
    }

    controller?.abort();
    controller = new AbortController();

    try {
      setTitle(sanitized);
      markActive(sanitized);
      showSkeleton();

      const html = await fetchViewHTML(sanitized, controller.signal);
      if (controller.signal.aborted) return;

      app.innerHTML = html;

      const focusEl = app.querySelector(
        "[autofocus], h1, h2, h3, [tabindex], button, a, input, textarea, select"
      );
      if (focusEl) {
        if (!focusEl.hasAttribute("tabindex")) {
          focusEl.setAttribute("tabindex", "-1");
        }
        focusEl.focus();
      }

      try {
        window.scrollTo({ top: 0, behavior: "instant" });
      } catch {
        window.scrollTo(0, 0);
      }

      document.dispatchEvent(
        new CustomEvent("view:loaded:caritas", { detail: { view: sanitized } })
      );

      currentView = sanitized;
      lastLoadedHash = location.hash;
      sessionStorage.setItem("caritas:lastView", sanitized);
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error("No se pudo cargar la vista", sanitized, err);
      showError(sanitized);
    } finally {
      controller = null;
    }
  }

  function goto(view) {
    const sanitized = sanitizeView(view);
    if (location.hash !== "#" + sanitized) {
      history.replaceState(null, "", "#" + sanitized);
    }
    loadView(sanitized);
  }

  // Eventos de navegación
  nav?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-view]");
    if (!btn) return;
    e.preventDefault();
    goto(btn.dataset.view);
  });

  window.addEventListener("hashchange", () => {
    const v = (location.hash || "#inicio").replace("#", "") || "inicio";
    goto(v);
  });

  document.addEventListener("DOMContentLoaded", () => {
    const next = sessionStorage.getItem("caritas:next");
    if (next && isLoggedIn()) {
      sessionStorage.removeItem("caritas:next");
      history.replaceState(null, "", next);
    }

    let v = (location.hash || "").replace("#", "");
    if (!v) {
      v = sessionStorage.getItem("caritas:lastView") || "inicio";
      history.replaceState(null, "", "#" + v);
    }
    goto(v);
  });

  // Reacción a cambios de auth
  document.addEventListener("firebase:ready:caritas", () => {
    window.CARITAS?.auth?.onAuthStateChanged((u) => {
      const show = !!u;
      ["btnPerfil", "btnServicios", "btnLogout"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = show ? "" : "none";
      });
      const btnLogin = document.getElementById("btnLogin");
      if (btnLogin) btnLogin.style.display = show ? "none" : "";

      const current = (location.hash || "#inicio").replace("#", "") || "inicio";
      if (!u && PROTECTED.has(current)) goto("inicio");

      const pending = sessionStorage.getItem("caritas:next");
      if (u && pending) {
        sessionStorage.removeItem("caritas:next");
        const target = pending.replace("#", "");
        history.replaceState(null, "", "#" + target);
        goto(target);
      }
    });
  });

  // Exponer navegación
  window.CARITAS = window.CARITAS || {};
  window.CARITAS.goto = goto;
})();