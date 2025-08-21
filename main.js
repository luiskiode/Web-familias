<<<<<<< HEAD
<<<<<<< HEAD
// =======================================================
// Configuración de Supabase
// =======================================================
const supabaseUrl = "https://qivjlsvcjyqymommfdke.supabase.co";
const supabaseAnonKey = "TU_KEY_AQUI"; // ⚠️ Pon la real desde supabase-config.js

// =======================================================
// Pendientes (Supabase REST)
// =======================================================
async function loadPendientes() {
  const url = `${supabaseUrl}/rest/v1/pendientes?select=id,descripcion,estado&order=id.asc`;

  try {
    const res = await fetch(url, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`
      }
    });

    if (!res.ok) {
      console.error("❌ Error HTTP al cargar pendientes:", res.status);
      showPendientesError("No se pudieron cargar los pendientes.");
      return;
    }

    const data = await res.json();
    renderPendientes(data);
  } catch (err) {
    console.error("❌ Error de red al cargar pendientes:", err);
    showPendientesError("No se pudieron cargar los pendientes (sin conexión).");
  }
}

function renderPendientes(items = []) {
  const table = document.getElementById("pendientesTable");
  const list = document.getElementById("pendientesList");

  if (table) {
    const tbody = table.querySelector("tbody") || table.appendChild(document.createElement("tbody"));
    tbody.innerHTML = "";

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="2" style="text-align:center; color:#888;">No hay pendientes</td></tr>`;
      return;
    }

    items.forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHTML(t.descripcion ?? "")}</td>
        <td style="text-align:center;">
          <input type="checkbox" ${t.estado ? "checked" : ""} onchange="togglePendiente(${t.id}, this.checked)">
        </td>
      `;
      tbody.appendChild(tr);
    });
  } else if (list) {
    list.innerHTML = "";

    if (items.length === 0) {
      list.innerHTML = `<p style="color:#888; text-align:center;">No hay pendientes</p>`;
      return;
    }

    items.forEach(t => {
      const row = document.createElement("div");
      row.className = "pendiente-row";
      row.innerHTML = `
        <span>${escapeHTML(t.descripcion ?? "")}</span>
        <input type="checkbox" ${t.estado ? "checked" : ""} onchange="togglePendiente(${t.id}, this.checked)">
      `;
      list.appendChild(row);
    });
  }
}

async function togglePendiente(id, estado) {
  const url = `${supabaseUrl}/rest/v1/pendientes?id=eq.${id}`;
  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({ estado })
    });

    if (!res.ok) {
      console.error("❌ Error HTTP al actualizar pendiente:", res.status);
      showPendientesError("No se pudo actualizar la tarea.");
    }
  } catch (err) {
    console.error("❌ Error de red al actualizar pendiente:", err);
    showPendientesError("No se pudo actualizar la tarea (sin conexión).");
  }
}

// =======================================================
// Helpers
// =======================================================
function showPendientesError(msg) {
  const errBox = document.getElementById("pendientesError");
  if (errBox) {
    errBox.textContent = msg;
    errBox.style.display = "block";
  }
}

function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// =======================================================
// Inicio
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("pendientesTable") || document.getElementById("pendientesList")) {
    loadPendientes();
  }
});
=======
=======
>>>>>>> 2f6b862eaadeaae75197048f29d1c96d4bcf7495
// =======================================================
// Configuración de Supabase
// =======================================================
const supabaseUrl = "https://qivjlsvcjyqymommfdke.supabase.co";
const supabaseAnonKey = "TU_KEY_AQUI"; // ⚠️ Pon la real desde supabase-config.js

// =======================================================
// Pendientes (Supabase REST)
// =======================================================
async function loadPendientes() {
  const url = `${supabaseUrl}/rest/v1/pendientes?select=id,descripcion,estado&order=id.asc`;

  try {
    const res = await fetch(url, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`
      }
    });

    if (!res.ok) {
      console.error("❌ Error HTTP al cargar pendientes:", res.status);
      showPendientesError("No se pudieron cargar los pendientes.");
      return;
    }

    const data = await res.json();
    renderPendientes(data);
  } catch (err) {
    console.error("❌ Error de red al cargar pendientes:", err);
    showPendientesError("No se pudieron cargar los pendientes (sin conexión).");
  }
}

function renderPendientes(items = []) {
  const table = document.getElementById("pendientesTable");
  const list = document.getElementById("pendientesList");

  if (table) {
    const tbody = table.querySelector("tbody") || table.appendChild(document.createElement("tbody"));
    tbody.innerHTML = "";

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="2" style="text-align:center; color:#888;">No hay pendientes</td></tr>`;
      return;
    }

    items.forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHTML(t.descripcion ?? "")}</td>
        <td style="text-align:center;">
          <input type="checkbox" ${t.estado ? "checked" : ""} onchange="togglePendiente(${t.id}, this.checked)">
        </td>
      `;
      tbody.appendChild(tr);
    });
  } else if (list) {
    list.innerHTML = "";

    if (items.length === 0) {
      list.innerHTML = `<p style="color:#888; text-align:center;">No hay pendientes</p>`;
      return;
    }

    items.forEach(t => {
      const row = document.createElement("div");
      row.className = "pendiente-row";
      row.innerHTML = `
        <span>${escapeHTML(t.descripcion ?? "")}</span>
        <input type="checkbox" ${t.estado ? "checked" : ""} onchange="togglePendiente(${t.id}, this.checked)">
      `;
      list.appendChild(row);
    });
  }
}

async function togglePendiente(id, estado) {
  const url = `${supabaseUrl}/rest/v1/pendientes?id=eq.${id}`;
  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({ estado })
    });

    if (!res.ok) {
      console.error("❌ Error HTTP al actualizar pendiente:", res.status);
      showPendientesError("No se pudo actualizar la tarea.");
    }
  } catch (err) {
    console.error("❌ Error de red al actualizar pendiente:", err);
    showPendientesError("No se pudo actualizar la tarea (sin conexión).");
  }
}

// =======================================================
// Helpers
// =======================================================
function showPendientesError(msg) {
  const errBox = document.getElementById("pendientesError");
  if (errBox) {
    errBox.textContent = msg;
    errBox.style.display = "block";
  }
}

function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// =======================================================
// Inicio
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("pendientesTable") || document.getElementById("pendientesList")) {
    loadPendientes();
  }
});
<<<<<<< HEAD
>>>>>>> a0338b9 (Actualizaci├│n r├ípida desde script)
=======
>>>>>>> 2f6b862eaadeaae75197048f29d1c96d4bcf7495
