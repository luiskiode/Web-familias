import { loadPendientes } from "./pendientes.js";
import { initCredenciales } from "./credenciales.js";
import { initCalendario } from "./calendario.js";

document.addEventListener("DOMContentLoaded", () => {
  loadPendientes();
  initCredenciales();
  initCalendario();
});
