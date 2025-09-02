// main.js — Inicializador global Cáritas CNC

(function () {
  'use strict';

  // Utilidad: ejecutar módulos de forma segura
  function safeCall(fn) {
    try { fn && fn(); }
    catch (e) { console.error("❌ Error en módulo:", e); }
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Ejecutar módulos disponibles
    safeCall(window.initPendientes);
    safeCall(window.initCalendario);
    safeCall(window.initNotificaciones);
    safeCall(window.initFamilias);

    console.log("✅ Módulos inicializados");
  });
})();