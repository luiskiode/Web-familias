// main.js — Inicializador global Cáritas CNC (robusto)
console.log("📌 main.js cargado");

(function () {
  'use strict';

  // Ejecutar módulos de forma segura
  function safeCall(name, fn) {
    try {
      if (typeof fn === "function") {
        console.log(`▶️ Iniciando módulo: ${name}`);
        fn();
      } else {
        console.warn(`⚠️ Módulo ${name} no está definido`);
      }
    } catch (e) {
      console.error(`❌ Error en módulo ${name}:`, e);
    }
  }

  function initAll() {
    safeCall("Pendientes", window.initPendientes);
    safeCall("Calendario", window.initCalendario);
    safeCall("Notificaciones", window.initNotificaciones);
    safeCall("Familias", window.initFamilias);
    console.log("✅ Todos los módulos inicializados");
  }

  // Esperar a que DOM cargue y Supabase esté listo
  document.addEventListener("DOMContentLoaded", () => {
    if (window.CARITAS?.supabase) {
      initAll();
    } else {
      document.addEventListener("supabase:ready:caritas", initAll, { once: true });
    }
  });
})();