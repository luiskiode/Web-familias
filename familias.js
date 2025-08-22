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

    // Obtener valores del formulario
    const nombres_apellidos = formFamilia.nombres_apellidos.value;
    const dni_solicitante = formFamilia.dni_solicitante.value;
    const apellido_familia = formFamilia.apellido_familia.value;
    const direccion = formFamilia.direccion.value;
    const fecha_registro = formFamilia.fecha_registro.value;
    const telefono_contacto = formFamilia.telefono_contacto.value;
    const observaciones = formFamilia.observaciones.value;

    try {
      // Geocoding si tienes lat/lng
      const { lat, lng } = await geocodeDireccion(direccion);

      // Insertar en Supabase
      const { error } = await supabase
        .from("familias")
        .insert([{
          nombres_apellidos,
          dni_solicitante,
          apellido_familia,
          direccion,
          fecha_registro,
          telefono_contacto,
          observaciones,
          lat,
          lng
        }]);

      if (error) throw error;

      alert("✅ Familia registrada correctamente");

      if (typeof enviarNotificacion === "function") {
        enviarNotificacion(
          "Nueva familia registrada",
          `👨‍👩‍👧‍👦 ${nombres_apellidos} fue añadida al sistema`
        );
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

// Inicializa el mapa
function initMapa() {
  map = L.map("mapa").setView([-12.0464, -77.0428], 13); // Ejemplo: Lima
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
}

// Geocodifica una dirección usando Nominatim
async function geocodeDireccion(direccion) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (err) {
    console.error("❌ Error geocodificando dirección:", err);
    return null;
  }
}

// Muestra familias en el mapa
async function mostrarEnMapa(familias) {
  for (const fam of familias) {
    let lat = fam.lat;
    let lng = fam.lng;

    // Si no tiene coordenadas, geocodifica
    if ((!lat || !lng) && fam.direccion) {
      const coords = await geocodeDireccion(fam.direccion);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
        // Aquí podrías actualizar la tabla de Supabase si quieres guardar coords
      }
    }

    if (lat && lng) {
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<b>${fam.nombre}</b><br>${fam.direccion}`);
    }
  }
}

// Cargar familias desde Supabase
async function cargarFamilias() {
  try {
    const { data, error } = await supabase
      .from("familias")
      .select("nombre, direccion, telefono, lat, lng");
    if (error) throw error;

    // Mostrar en tabla HTML
    const tbody = document.getElementById("familiasTable");
    tbody.innerHTML = "";
    data.forEach(fam => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${fam.nombre}</td><td>${fam.direccion}</td><td>${fam.telefono || ""}</td>`;
      tbody.appendChild(tr);
    });

    // Mostrar en el mapa
    await mostrarEnMapa(data);

    console.log("✅ Familias cargadas:", data);
    return data;
  } catch (err) {
    console.error("❌ Error al cargar familias:", err);
    return [];
  }
}

// ================== Ejecutar al cargar DOM ==================
document.addEventListener("DOMContentLoaded", async () => {
  initMapa();          // Inicializa mapa primero
  await cargarFamilias(); // Luego carga familias y añade marcadores
});

