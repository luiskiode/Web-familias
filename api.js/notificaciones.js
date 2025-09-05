// notificaciones.js — corregido y robusto
console.log("📌 notificaciones.js cargado");

(function () {
  'use strict';

  function showFallback(titulo, mensaje) {
    const box = document.createElement("div");
    box.textContent = `${titulo}: ${mensaje}`;
    box.style.cssText = `
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      background: #111;
      color: #fff;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 0.9rem;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,.25);
    `;
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 4000);
  }

  async function enviarNotificacion(titulo, mensaje) {
    if (!("Notification" in window)) {
      console.warn("⚠️ Este navegador no soporta notificaciones.");
      showFallback("🔔 " + titulo, mensaje);
      return;
    }

    let permiso = Notification.permission;
    if (permiso !== "granted") {
      try {
        permiso = await Notification.requestPermission();
      } catch {
        permiso = "denied";
      }
    }

    if (permiso === "granted") {
      try {
        new Notification(titulo, { body: mensaje, icon: "img/icon-512.png" });
      } catch (e) {
        console.warn("⚠️ No se pudo mostrar la notificación:", e);
        showFallback(titulo, mensaje);
      }
    } else {
      showFallback("🔔 " + titulo, mensaje);
    }
  }

  // 🚀 Exponer global para uso en otros scripts
  window.enviarNotificacion = enviarNotificacion;

  // 🚀 Exponer inicializador para main.js
  window.initNotificaciones = function () {
    console.log("✅ initNotificaciones listo");
  };
})();