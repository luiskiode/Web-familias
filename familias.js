console.log("📌 familias.js cargado correctamente");

// Referencias HTML
const tabla = document.getElementById("familiasTable");
const formFamilia = document.getElementById("familiaForm");
const direccionInput = formFamilia?.querySelector("input[name='direccion']");

// ================== Cargar Familias ==================
async function cargarFamilias() {
  if (!tabla) {
    console.warn("⚠ No se encontró la tabla con id='familiasTable'");
    return;
  }

  try {
    const { data, error } = await window.supabase
      .from("familias")
      .select("*");

    if (error) throw error;
    console.log("✅ Familias cargadas:", data);

    // Limpiar tbody
    let tbody = tabla.querySelector("tbody");
    if (!tbody) {
      tbody = document.createElement("tbody");
      tabla.appendChild(tbody);
    }
    tbody.innerHTML = "";

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

    // Mostrar en el mapa
    if (typeof mostrarEnMapa === "function") mostrarEnMapa(data);

  } catch (err) {
    console.error("❌ Error al cargar familias:", err);
    let tbody = tabla.querySelector("tbody");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="color:red; text-align:center;">
            Error al cargar familias
          </td>
        </tr>`;
    }
  }
}

// ================== Geocodificación con Nominatim ==================
async function geocodeDireccion(direccion) {
  try {
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`);
    const data = await resp.json();

    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } else {
      console.warn("⚠ No se encontraron coordenadas para:", direccion);
      return { lat: null, lng: null };
    }
  } catch (err) {
    console.error("❌ Error en geocodificación:", err);
    return { lat: null, lng: null };
  }
}

// ================== Registrar Familia ==================
if (formFamilia) {
  formFamilia.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = formFamilia.nombre.value;
    const direccion = formFamilia.direccion.value;
    const telefono = formFamilia.telefono.value;

    try {
      const { lat, lng } = await geocodeDireccion(direccion);

      const { error } = await window.supabase
        .from("familias")
        .insert([{ nombre, direccion, telefono, lat, lng }]);

      if (error) throw error;

      alert("✅ Familia registrada correctamente");
      if (typeof enviarNotificacion === "function") {
        enviarNotificacion("Nueva familia registrada", `👨‍👩‍👧‍👦 ${nombre} fue añadida al sistema`);
      }

      formFamilia.reset();
      cargarFamilias();
    } catch (err) {
      console.error("❌ Error al registrar familia:", err);
      alert("Error al registrar familia: " + err.message);
    }
  });
}

// ================== Botón "Ver en mapa" ==================
if (direccionInput) {
  const btnMapa = document.createElement("button");
  btnMapa.type = "button";
  btnMapa.textContent = "Ver en mapa";
  btnMapa.style.marginLeft = "8px";
  direccionInput.insertAdjacentElement("afterend", btnMapa);

  btnMapa.addEventListener("click", () => {
    const direccion = direccionInput.value;
    if (!direccion) {
      alert("Ingrese una dirección para ver en el mapa");
      return;
    }
    const url = `https://www.openstreetmap.org/search?query=${encodeURIComponent(direccion)}`;
    window.open(url, "_blank");
  });
}

// ================== Mapa ==================
let map;
function initMapa() {
  map = L.map("map").setView([-12.0464, -77.0428], 13); // ejemplo: Lima
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
}

function mostrarEnMapa(familias) {
  familias.forEach(fam => {
    if (fam.lat && fam.lng) {
      L.marker([fam.lat, fam.lng]).addTo(map)
        .bindPopup(`<b>${fam.nombre}</b><br>${fam.direccion}`);
    }
  });
}

// Ejecutar al inicio
document.addEventListener("DOMContentLoaded", () => {
  cargarFamilias();
  initMapa();
});
