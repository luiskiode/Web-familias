// notificaciones.js (corregido) — expone API global
console.log("📌 notificaciones.js cargado correctamente");

(function () {
  'use strict';

  async function enviarNotificacion(titulo, mensaje) {
    if (!("Notification" in window)) {
      console.warn("⚠ Este navegador no soporta notificaciones");
      return;
    }

    let permiso = Notification.permission;
    if (permiso !== "granted") {
      try { permiso = await Notification.requestPermission(); } catch {}
    }

    if (permiso === "granted") {
      try {
        new Notification(titulo, { body: mensaje, icon: "icon-192.png" });
      } catch (e) {
        console.warn("No se pudo mostrar la notificación:", e);
      }
    }
  }

  window.enviarNotificacion = enviarNotificacion;
})();
