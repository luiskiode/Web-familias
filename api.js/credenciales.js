(() => {
  console.log("📌 credenciales.js cargado correctamente");

  // ================== REFERENCIAS DOM ==================
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  const fotoInput = document.getElementById("foto");
  const btnCrear = document.getElementById("btnCrearCredencial");
  const btnVerTodas = document.getElementById("btnVerTodas");
  const credPreview = document.getElementById("credPreview");
  const credStatus = document.getElementById("credStatus");

  // ================== FUNCIONES AUXILIARES ==================
  function showStatus(msg, type = "info") {
    if (!credStatus) {
      alert(msg);
      return;
    }
    credStatus.textContent = msg;
    credStatus.style.color =
      type === "error" ? "red" : type === "success" ? "green" : "black";
  }

  function validateEnv() {
    if (!supabase || !auth || !QRCode) {
      showStatus("❌ Supabase, Firebase o QRCode no inicializado", "error");
      return false;
    }
    return true;
  }

  // ================== CREAR CREDENCIAL ==================
  if (btnCrear) {
    btnCrear.addEventListener("click", async () => {
      if (!validateEnv()) return;
      if (!auth.currentUser) {
        return showStatus("⚠️ Debes iniciar sesión para crear credenciales", "error");
      }

      const email = emailInput.value.trim();
      const password = passInput.value.trim();
      const foto = fotoInput.files[0];

      if (!email || !password || !foto) {
        return showStatus("⚠️ Completa todos los campos", "error");
      }

      btnCrear.disabled = true;
      showStatus("⏳ Creando credencial...");

      try {
        // 📌 Evitar duplicados en Supabase
        const { data: existing } = await supabase
          .from("credenciales")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (existing) {
          btnCrear.disabled = false;
          return showStatus("⚠️ Ya existe una credencial con este email", "error");
        }

        // 📌 Crear usuario en Firebase
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // 📌 Subir foto a Supabase Storage
        const ext = foto.name.split(".").pop();
        const remotePath = `credenciales/${Date.now()}_${Math.random()
          .toString(36)
          .substring(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("fotos")
          .upload(remotePath, foto);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("fotos")
          .getPublicUrl(remotePath);

        // 📌 Guardar credencial en Supabase
        const { data, error: insertError } = await supabase
          .from("credenciales")
          .insert([
            { email, user_id: user.uid, foto_url: publicUrl }
          ])
          .select()
          .single();

        if (insertError) throw insertError;

        // 📌 Mostrar en UI
        credPreview.innerHTML = `
          <p><b>Email:</b> ${data.email}</p>
          <img src="${data.foto_url}" width="150" />
          <div id="qrcode"></div>
        `;

        // 📌 Generar QR con datos de credencial
        new QRCode(document.getElementById("qrcode"), {
          text: JSON.stringify(data),
          width: 128,
          height: 128,
        });

        showStatus("✅ Credencial generada con éxito", "success");
      } catch (err) {
        console.error("❌ Error creando credencial:", err);
        showStatus("❌ Error: " + err.message, "error");
      } finally {
        btnCrear.disabled = false;
      }
    });
  }

  // ================== VER TODAS LAS CREDENCIALES ==================
  if (btnVerTodas) {
    btnVerTodas.addEventListener("click", async () => {
      if (!validateEnv()) return;
      if (!auth.currentUser) {
        return showStatus("⚠️ Debes iniciar sesión para ver credenciales", "error");
      }

      try {
        const { data, error } = await supabase
          .from("credenciales")
          .select("*");

        if (error) throw error;

        // 📌 Mostrar en modal
        const modal = document.createElement("div");
        modal.className = "modal";
        modal.innerHTML = `
          <div class="modal-content">
            <h2>Credenciales registradas</h2>
            <ul>
              ${data
                .map(
                  (c) =>
                    `<li>${c.email} <br><img src="${c.foto_url}" width="80"></li>`
                )
                .join("")}
            </ul>
            <button id="closeModal">Cerrar</button>
          </div>
        `;
        document.body.appendChild(modal);

        document
          .getElementById("closeModal")
          .addEventListener("click", () => modal.remove());
      } catch (err) {
        console.error("❌ Error mostrando credenciales:", err);
        showStatus("❌ Error: " + err.message, "error");
      }
    });
  }
})();
