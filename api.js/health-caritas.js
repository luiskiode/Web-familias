// api.js/health-caritas.js
// 🩺 Panel de salud para Cáritas CNC (Alt+H para abrir/cerrar)

console.log("🩺 health-caritas.js cargado");

(function(){
  'use strict';

  const state = { checks: [] };

  function log(ok, msg) {
    state.checks.push({ ok, msg });
    console[ok ? "log" : "warn"]("🩺", msg);
  }

  function render() {
    let panel = document.getElementById("hc-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "hc-panel";
      panel.style.cssText = "position:fixed;bottom:10px;right:10px;z-index:99999;background:#111;color:#eee;padding:10px;border-radius:8px;max-width:300px;font:12px monospace;overflow:auto;max-height:60vh";
      document.body.appendChild(panel);
    }
    panel.innerHTML = `<b>Health Check</b><br>${state.checks.map(c => (c.ok?"✅":"❌")+" "+c.msg).join("<br>")}`;
  }

  async function runChecks() {
    state.checks = [];
    // base
    const base = document.querySelector("base")?.href;
    log(!!base, "Base href: "+(base||"faltante"));
    // css
    const css = [...document.querySelectorAll("link[rel=stylesheet]")].map(l=>l.href).find(h=>h.includes("styles-caritas.css"));
    log(!!css, "styles-caritas.css presente");
    // supabase
    log(!!window.CARITAS?.supabase, "Supabase inicializado");
    // render
    render();
  }

  document.addEventListener("keydown", e=>{
    if (e.altKey && e.key.toLowerCase()==="h") runChecks();
  });

  // primera pasada en 3s
  setTimeout(runChecks,3000);
})();
