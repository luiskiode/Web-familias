console.log("📌 credenciales.js cargado correctamente");

// Encapsulamos todo para evitar redefiniciones
(() => {
  // === Obtener elementos del DOM ===
  const form = document.getElementById("credencialForm");
  const btnCrear = document.getElementById("crear-credenciales");
  const contenedorAcciones = document.getElementById("credenciales-contenido");
  const btnToggle = document.getElementById("toggle-credenciales");
  const btnVer = document.getElementById("ver-credencial");
  const btnVerTodas = document.getElementById("btn-ver-todas");
  const listaCredenciales = document.getElementById("lista-credenciales");
  const qrCanvas = document.getElementById("qr-canvas");

  // Verificación de elementos
  if (!form || !btnCrear || !contenedorAcciones || !btnToggle || !btnVer || !btnVerTodas || !listaCredenciales || !qrCanvas) {
    console.warn("⚠️ Algunos elementos de credenciales no están en este documento (esto es normal en páginas como carnet.html).");
    return;
  }

  // === Crear credencial ===
  btnCrear.addEventListener("click", async () => {
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const fotoInput = document.getElementById("foto-perfil");

    if (!nombre || !email || !password || !fotoInput.files.length) {
      alert("⚠️ Completa todos los campos");
      return;
    }

    try {
      // 1. Crear usuario en Firebase
      const userCred = await auth.createUserWithEmailAndPassword(email, password);
      const uid = userCred.user.uid;

      // 2. Subir foto a Supabase Storage
      const file = fotoInput.files[0];
      const filePath = `credenciales/${uid}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("fotos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("fotos").getPublicUrl(filePath);
      const foto_url = urlData.publicUrl;

      // 3. Guardar credencial en Supabase
      const { error: dbError } = await supabase.from("credenciales").insert([
        { uid, nombre, email, foto_url, codigo: Math.random().toString(36).substring(2, 8).toUpperCase() }
      ]);

      if (dbError) throw dbError;

      alert("✅ Credencial generada con éxito");

      // Mostrar botones y QR
      contenedorAcciones.style.display = "block";
      btnVer.style.display = "inline-block";

      const credencialUrl = `${window.location.origin}/carnet.html?id=${uid}`;
      QRCode.toCanvas(qrCanvas, credencialUrl, err => {
        if (err) console.error("Error generando QR:", err);
      });

    } catch (err) {
      console.error("❌ Error al generar credencial:", err);
      alert("❌ Error: " + (err.message || err));
    }
  });

  // === Toggle mostrar/ocultar credenciales ===
  btnToggle.addEventListener("click", () => {
    if (listaCredenciales.style.display === "none" || listaCredenciales.style.display === "") {
      listaCredenciales.style.display = "block";
      btnToggle.textContent = "▲ Ocultar Credenciales";
    } else {
      listaCredenciales.style.display = "none";
      btnToggle.textContent = "▼ Mostrar Credenciales";
    }
  });

  // === Ver mi credencial ===
  btnVer.addEventListener("click", () => {
    if (!auth.currentUser) return alert("⚠️ Debes iniciar sesión");
    const uid = auth.currentUser.uid;
    window.open(`carnet.html?id=${uid}`, "_blank");
  });

  // === Ver todas las credenciales ===
  btnVerTodas.addEventListener("click", async () => {
    try {
      const { data, error } = await supabase.from("credenciales").select("*");
      if (error) throw error;

      listaCredenciales.innerHTML = "";
      data.forEach(c => {
        const card = document.createElement("div");
        card.className = "credencial-card";
        card.innerHTML = `
          <img src="${c.foto_url}" alt="foto" width="60" height="60" style="border-radius:50%;" />
          <p><b>${c.nombre}</b></p>
          <p>${c.email}</p>
          <button onclick="window.open('carnet.html?id=${c.uid}','_blank')">Ver</button>
        `;
        listaCredenciales.appendChild(card);
      });

    } catch (err) {
      console.error("❌ Error cargando lista de credenciales:", err);
      alert("❌ No se pudieron cargar las credenciales");
    }
  });
})();
