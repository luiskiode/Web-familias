// familias.js
import { supabase } from './supabase-config.js';

console.log("📌 familias.js cargado correctamente");

// Referencia a la tabla en el HTML
const tabla = document.getElementById("familiasTable");

// Función para cargar familias desde Supabase
async function cargarFamilias() {
  try {
    const { data, error } = await supabase
      .from("familias")  // 👈 nombre de tu tabla en Supabase
      .select("*");

    if (error) throw error;

    console.log("✅ Familias cargadas:", data);

    if (!tabla) {
      console.warn("⚠ No se encontró la tabla con id='familiasTable'");
      return;
    }

    // Limpia antes de renderizar
    tabla.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Dirección</th>
          <th>Teléfono</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = tabla.querySelector("tbody");

    data.forEach(familia => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${familia.id || ""}</td>
        <td>${familia.nombre || ""}</td>
        <td>${familia.direccion || ""}</td>
        <td>${familia.telefono || ""}</td>
      `;
      tbody.appendChild(fila);
    });

  } catch (err) {
    console.error("❌ Error al cargar familias:", err);
    if (tabla) {
      tabla.innerHTML = "<tr><td colspan='4'>Error al cargar familias</td></tr>";
    }
  }
}

// Ejecutar cuando cargue la página
document.addEventListener("DOMContentLoaded", cargarFamilias);
