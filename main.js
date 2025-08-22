// main.js - Entry Point de Cáritas CNC
// Asegúrate de cargar primero firebase-config.js y supabase-config.js en tu HTML

import { loadPendientes } from "./pendientes.js";
import { initCredenciales } from "./credenciales.js";
import { initCalendario } from "./calendario.js";
import { enviarNotificacion } from "./notificaciones.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // ✅ Inicializar pendientes
    if (typeof loadPendientes === "function") {
      await loadPendientes();
      console.log("📌 Pendientes cargados correctamente");
    } else {
      console.warn("⚠ loadPendientes no está definido");
    }

    // ✅ Inicializar credenciales
    if (typeof initCredenciales === "function") {
      initCredenciales();
      console.log("📌 Módulo de credenciales inicializado");
    } else {
      console.warn("⚠ initCredenciales no está definido");
    }

    // ✅ Inicializar calendario
    if (typeof initCalendario === "function") {
      initCalendario();
      console.log("📌 Calendario inicializado");
    } else {
      console.warn("⚠ initCalendario no está definido");
    }

    // Opcional: notificación de carga completa
    if (typeof enviarNotificacion === "function") {
      enviarNotificacion("Cáritas CNC", "Aplicación cargada correctamente ✅");
    }

  } catch (err) {
    console.error("❌ Error al inicializar la aplicación:", err);
  }
});
