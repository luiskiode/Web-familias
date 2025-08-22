console.log("📌 familias.js cargado correctamente");

// ================== Referencias HTML ==================
const tabla = document.getElementById("familiasTable");
const formFamilia = document.getElementById("familiaForm");
const direccionInput = formFamilia?.querySelector("input[name='direccion']");
let map;

// ================== Utilidades ==================
async function geocodeDireccion(direccion) {
  try {
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`);
    const data = await resp.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (err) {
    console.error("❌ Error geocodificando dirección:", err);
  }
  return null;
}

// ================== Mapa ==================
function initMapa() {
  map = L.map("mapa").setView([-12.0464, -77.0428], 13); // Lima como ejemplo
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
}

async function mostrarEnMapa(familias) {
  for (const fam of familias) {
    let lat = fam.lat, lng = fam.lng;
    if ((!lat || !lng) && fam.direccion) {
      const coords = await geocodeDireccion(fam.direccion);
      if (coords) { lat = coords.lat; lng = coords.lng; }
    }
    if (lat && lng) {
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<b>${fam.nombre}</b><br>${fam.direccion}`);
    }
  }
}

// ================== Cargar Familias ==================
async function cargarFamilias() {
  if (!tabla) return console.warn("⚠ No se encontró la tabla con id='familiasTable'");
  try {
    const { data, error } = await supabase.from("familias").select("*");
    if (error) throw error;

    // Limpiar tbody
    let tbody = tabla.querySelector("tbody");
    if (!tbody) { tbody = document.createElement("tbody"); tabla.appendChild(tbody); }
    tbody.innerHTML = "";

    if (!data || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Sin registros</td></tr>`;
      return [];
    }

    data.forEach(fam => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${fam.id ?? ""}</td><td>${fam.nombre ?? ""}</td><td>${fam.direccion ?? ""}</td><td>${fam.telefono ?? ""}</td>`;
      tbody.appendChild(tr);
    });

    await mostrarEnMapa(data);
    console.log("✅ Familias cargadas:", data);
    return data;
  } catch (err) {
    console.error("❌ Error al cargar familias:", err);
    return [];
  }
}

// ================== Registrar Familia ==================
if (formFamilia) {
  formFamilia.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombres_apellidos = formFamilia.nombres_apellidos.value;
    const dni_solicitante = formFamilia.dni_solicitante.value;
    const apellido_familia = formFamilia.apellido_familia.value;
    const direccion = formFamilia.direccion.value;
    const fecha_registro = formFamilia.fecha_registro.value;
    const telefono_contacto = formFamilia.telefono_contacto.value;
    const observaciones = formFamilia.observaciones.value;

    try {
      const coords = await geocodeDireccion(direccion);
      const { error } = await supabase.from("familias").insert([{
        nombres_apellidos,
        dni_solicitante,
        apellido_familia,
        direccion,
        fecha_registro,
        telefono_contacto,
        observaciones,
        lat: coords?.lat || null,
        lng: coords?.lng || null
      }]);
      if (error) throw error;

      alert("✅ Familia registrada correctamente");
      formFamilia.reset();
      cargarFamilias();

      if (typeof enviarNotificacion === "function") {
        enviarNotificacion("Nueva familia registrada", `👨‍👩‍👧‍👦 ${nombres_apellidos} fue añadida al sistema`);
      }
    } catch (err) {
      console.error("❌ Error al registrar familia:", err);
      alert("Error al registrar familia: " + (err.message || err));
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
    if (!direccion) return alert("Ingrese una dirección para ver en el mapa");
    const url = `https://www.openstreetmap.org/search?query=${encodeURIComponent(direccion)}`;
    window.open(url, "_blank");
  });
}

// ================== Inicializar al cargar DOM ==================
document.addEventListener("DOMContentLoaded", async () => {
  initMapa();
  await cargarFamilias();
});
