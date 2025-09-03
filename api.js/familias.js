// familias.js — Gestión de familias en Cáritas CNC

const supabase = window.CARITAS?.supabase;
const tabla = document.getElementById("familiasTable")?.querySelector("tbody");
const msgBox = document.getElementById("msg");

function showMsg(text, type = "info") {
  if (!msgBox) return;
  msgBox.textContent = text;
  msgBox.className = type;
  setTimeout(() => { msgBox.textContent = ""; }, 4000);
}

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, m =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );

// Cargar familias desde Supabase
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
    showMsg("❌ Error cargando familias", "error");
  }
}

document.addEventListener("DOMContentLoaded", cargarFamilias);