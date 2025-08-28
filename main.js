// main.js (corregido) — Orquestador sin imports de ES modules; usa objetos globales si existen
console.log("📌 main.js cargado");

(function () {
  'use strict';

  const safeCall = async (fn, name) => {
    try {
      const out = fn && typeof fn === "function" ? await fn() : undefined;
      if (name) console.log(`✅ ${name}`);
      return out;
    } catch (e) {
      console.error(`❌ Error en ${name || "tarea"}`, e);
    }
  };

  document.addEventListener("DOMContentLoaded", async () => {
    // Pendientes
    await safeCall(window._pendientes?.load, "Pendientes cargados");

    // Calendario (si tu proyecto define window.initCalendario)
    await safeCall(window.initCalendario, "Calendario inicializado");

    // Credenciales (si defines window.initCredenciales)
    await safeCall(window.initCredenciales, "Módulo de credenciales inicializado");

    // Notificación de bienvenida (opcional)
    if (window.enviarNotificacion) {
      window.enviarNotificacion("Cáritas CNC", "Aplicación cargada correctamente ✅");
    }
  });
})();
