// main.js — Orquestador global
console.log("📌 main.js cargado");

(() => {
  "use strict";

  /**
   * Ejecuta una función de forma segura y loggea el resultado
   * @param {Function} fn - Función a ejecutar
   * @param {string} name - Nombre descriptivo de la tarea
   */
  async function safeCall(fn, name) {
    try {
      if (typeof fn === "function") {
        const out = await fn();
        if (name) console.log(`✅ ${name}`);
        return out;
      } else if (name) {
        console.warn(`⚠️ ${name} no está definida`);
      }
    } catch (e) {
      console.error(`❌ Error en ${name || "tarea"}`, e);
    }
  }

  /**
   * Inicializa los módulos principales de la app
   */
  async function initApp() {
    console.group("🚀 Inicialización Cáritas CNC");

    await safeCall(window._pendientes?.load, "Pendientes cargados");
    await safeCall(window.initCalendario, "Calendario inicializado");
    await safeCall(window.initCredenciales, "Módulo de credenciales inicializado");

    // Notificación de bienvenida (opcional)
    if (typeof window.enviarNotificacion === "function") {
      window.enviarNotificacion(
        "Cáritas CNC",
        "Aplicación cargada correctamente ✅"
      );
    }

    console.groupEnd();
  }

  // Iniciar al cargar el DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();