// notificaciones.js
console.log("📌 notificaciones.js cargado correctamente");

async function enviarNotificacion(titulo, mensaje) {
  if (!("Notification" in window)) {
    console.warn("⚠ Este navegador no soporta notificaciones");
    return;
  }

  let permiso = Notification.permission;
  if (permiso !== "granted") {
    permiso = await Notification.requestPermission();
  }

  if (permiso === "granted") {
    new Notification(titulo, {
      body: mensaje,
      icon: "icon-192.png" // asegúrate que este icono exista en tu proyecto
    });
  }
}
