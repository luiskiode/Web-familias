// familias.js
console.log("📌 familias.js cargado correctamente");

// Referencia a la tabla en el HTML
const tabla = document.getElementById("familiasTable");

// Función para cargar familias desde Supabase
async function cargarFamilias() {
  if (!tabla) {
    console.warn("⚠ No se encontró la tabla con id='familiasTable'");
    return;
  }

  try {
    // 1. Obtener datos
    const { data, error } = await window.supabase
      .from("familias") // 👈 nombre de tu tabla en Supabase
      .select("*");

    if (error) throw error;
    console.log("✅ Familias cargadas:", data);

    // 2. Limpiar tabla y crear cabecera
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

    let tbody = tabla.querySelector("tbody");
    if (!tbody) { tbody = document.createElement("tbody"); tabla.appendChild(tbody); }

    // 3. Renderizar filas
    if (!data || data.length === 0) {
      const fila = document.createElement("tr");
      fila.innerHTML = `<td colspan="4" style="text-align:center;">Sin registros</td>`;
      tbody.appendChild(fila);
      return;
    }

    data.forEach(familia => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${familia.id ?? ""}</td>
        <td>${familia.nombre ?? ""}</td>
        <td>${familia.direccion ?? ""}</td>
        <td>${familia.telefono ?? ""}</td>
      `;
      tbody.appendChild(fila);
    });

  } catch (err) {
    console.error("❌ Error al cargar familias:", err);
    tabla.innerHTML = `
      <tr>
        <td colspan="4" style="color:red; text-align:center;">
          Error al cargar familias
        </td>
      </tr>`;
  }
}

// Ejecutar cuando cargue la página
document.addEventListener("DOMContentLoaded", cargarFamilias);
