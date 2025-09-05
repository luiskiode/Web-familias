// familias.js — Gestión de familias en Cáritas CNC
console.log("📌 familias.js cargado");

(function () {
  'use strict';

  let supabase;            // ⬅️ antes era const ...
  let tabla, msgBox;

  function showMsg(text, type = "info") {
    if (!msgBox) return console.warn("MSG:", text);
    msgBox.textContent = text;
    msgBox.className = type;
    setTimeout(() => { msgBox.textContent = ""; msgBox.className = ""; }, 4000);
  }

  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, m =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
    );

  async function cargarFamilias() {
    if (!supabase || !tabla) return;

    tabla.innerHTML = "<tr><td colspan='6'>Cargando...</td></tr>";
    try {
      const { data, error } = await supabase
        .from("familias")
        .select("*")
        .order("id", { ascending: false })
        .limit(50);

      if (error) throw error;

      tabla.innerHTML = "";
      if (!data || data.length === 0) {
        tabla.innerHTML = "<tr><td colspan='6'>No hay familias registradas</td></tr>";
        return;
      }

      data.forEach(f => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${esc(f.id)}</td>
          <td>${esc(f.nombres_apellidos || "")}</td>
          <td>${esc(f.dni_solicitante || "")}</td>
          <td>${esc(f.apellido_familia || "")}</td>
          <td>${esc(f.direccion || "")}</td>
          <td>${esc(f.telefono_contacto || "")}</td>
        `;
        tabla.appendChild(tr);
      });

      showMsg("✅ Familias cargadas correctamente", "success");
    } catch (err) {
      console.error("❌ Error cargando familias:", err);
      tabla.innerHTML = "<tr><td colspan='6'>Error al cargar familias</td></tr>";
      showMsg("❌ Error al cargar familias", "error");
    }
  }

  // 🚀 Exponer inicializador global para el router
  window.initFamilias = function () {
    // Asegurar que Supabase ya esté listo
    supabase = window.CARITAS?.supabase;
    if (!supabase) {
      setTimeout(window.initFamilias, 150);
      return;
    }

    const tableEl = document.getElementById("familiasTable");
    msgBox = document.getElementById("msg");
    tabla = tableEl ? tableEl.querySelector("tbody") : null;

    if (!tabla) {
      console.warn("⚠️ No se encontró #familiasTable en DOM");
      return;
    }

    cargarFamilias();
  };
})();