(() => {
  console.log("📌 familias.js cargado correctamente");

  // ================== Referencias HTML ==================
  const tabla = document.getElementById("familiasTable");
  const formFamilia = document.getElementById("familiaForm");
  const direccionInput = formFamilia?.querySelector("input[name='direccion']");
  const mapaContainer = document.getElementById("mapa");
  let map;

  // ================== Helpers ==================
  const supabase = window.CARITAS?.supabase;
  const auth = window.CARITAS?.auth;

  function notify(msg, type = "info") {
    // 👉 Reemplazar alert() con un sistema de toasts si ya tienes
    const prefix = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️";
    console.log(`${prefix} ${msg}`);
    alert(`${prefix} ${msg}`);
  }

  async function geocodeDireccion(direccion) {
    if (!direccion) return null;
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`
      );
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (err) {
      console.error("❌ Error geocodificando dirección:", err);
    }
    return null;
  }

  // ================== Mapa ==================
  function initMapa() {
    if (!mapaContainer) {
      console.warn("⚠ No se encontró el contenedor del mapa (#mapa)");
      return;
    }
    map = L.map("mapa").setView([-12.0464, -77.0428], 13); // Lima por defecto
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
  }

  async function mostrarEnMapa(familias) {
    if (!map) return;
    for (const fam of familias) {
      let { lat, lng } = fam;
      if ((!lat || !lng) && fam.direccion) {
        const coords = await geocodeDireccion(fam.direccion);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        }
      }
      if (lat && lng) {
        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(
            `<b>${fam.nombres_apellidos || fam.nombre || "Sin nombre"}</b><br>${
              fam.direccion || ""
            }`
          );
      }
    }
  }

  // ================== Cargar Familias ==================
  async function cargarFamilias() {
    if (!tabla) return console.warn("⚠ No se encontró la tabla con id='familiasTable'");
    try {
      const { data, error } = await supabase
        .from("familias")
        .select("*")
        .order("id", { ascending: true });
      if (error) throw error;

      let tbody = tabla.querySelector("tbody");
      if (!tbody) {
        tbody = document.createElement("tbody");
        tabla.appendChild(tbody);
      }
      tbody.innerHTML = "";

      if (!data || data.length === 0) {
        tbody.innerHTML =
          `<tr><td colspan="4" style="text-align:center;">Sin registros</td></tr>`;
        return [];
      }

      data.forEach((fam) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${fam.id ?? ""}</td>
          <td>${fam.nombres_apellidos ?? fam.nombre ?? ""}</td>
          <td>${fam.direccion ?? ""}</td>
          <td>${fam.telefono_contacto ?? fam.telefono ?? ""}</td>`;
        tbody.appendChild(tr);
      });

      await mostrarEnMapa(data);
      console.log("✅ Familias cargadas:", data);
      return data;
    } catch (err) {
      console.error("❌ Error al cargar familias:", err);
      notify("Error al cargar familias", "error");
      return [];
    }
  }
data.forEach((fam) => {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${fam.id ?? ""}</td>
    <td>${fam.nombres_apellidos ?? fam.nombre ?? ""}</td>
    <td>${fam.direccion ?? ""}</td>
    <td>${fam.telefono_contacto ?? fam.telefono ?? ""}</td>
    <td><input type="checkbox" data-id="${fam.id}" ${fam.visitada ? "checked":""}></td>
    <td>
      <button data-map="${fam.direccion}">📍 Ver en mapa</button>
      <button data-del="${fam.id}">🗑 Eliminar</button>
    </td>
  `;
  tbody.appendChild(tr);
});

  // ================== Registrar Familia ==================
  if (formFamilia) {
    formFamilia.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(formFamilia);

      const payload = {
        nombres_apellidos: fd.get("nombres_apellidos")?.trim(),
        dni_solicitante: fd.get("dni_solicitante")?.trim(),
        apellido_familia: fd.get("apellido_familia")?.trim(),
        direccion: fd.get("direccion")?.trim(),
        fecha_registro:
          fd.get("fecha_registro") || new Date().toISOString().split("T")[0],
        telefono_contacto: fd.get("telefono_contacto")?.trim(),
        observaciones: fd.get("observaciones")?.trim(),
      };

      try {
        const coords = await geocodeDireccion(payload.direccion);
        payload.lat = coords?.lat || null;
        payload.lng = coords?.lng || null;

        const { error } = await supabase.from("familias").insert([payload]);
        if (error) throw error;

        notify("Familia registrada correctamente", "success");
        formFamilia.reset();
        await cargarFamilias();

        if (typeof enviarNotificacion === "function") {
          enviarNotificacion(
            "Nueva familia registrada",
            `👨‍👩‍👧‍👦 ${payload.nombres_apellidos} fue añadida al sistema`
          );
        }
      } catch (err) {
        console.error("❌ Error al registrar familia:", err);
        notify("Error al registrar familia: " + (err.message || err), "error");
      }
    });
  }

  // ================== Botón "Ver en mapa" ==================
  if (direccionInput) {
    const btnMapa = document.createElement("button");
    btnMapa.type = "button";
    btnMapa.textContent = "Ver en mapa";
    btnMapa.className = "btn-peque"; // usa clase de tu CSS si la tienes
    direccionInput.insertAdjacentElement("afterend", btnMapa);

    btnMapa.addEventListener("click", () => {
      const direccion = direccionInput.value;
      if (!direccion)
        return notify("Ingrese una dirección para ver en el mapa", "error");
      const url = `https://www.openstreetmap.org/search?query=${encodeURIComponent(
        direccion
      )}`;
      window.open(url, "_blank");
    });
  }

  // ================== Inicializar ==================
  auth?.onAuthStateChanged(async (user) => {
    if (user) {
      console.log("👤 Usuario autenticado:", user.email);
      initMapa();
      await cargarFamilias();
    } else {
      console.warn("⚠ Usuario no autenticado, redirigiendo a login...");
      window.location.href = "login.html";
    }
  });
})();