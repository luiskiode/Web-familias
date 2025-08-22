document.addEventListener("DOMContentLoaded", () => {
  console.log("📌 credenciales.js cargado correctamente");

  // --- Elementos del DOM ---
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  const fotoInput = document.getElementById("foto-perfil");
  const crearBtn = document.getElementById("crear-credenciales");
  const qrCanvas = document.getElementById("qr-canvas");
  const verCredencialBtn = document.getElementById("ver-credencial");
  const toggleCredenciales = document.getElementById("toggle-credenciales");
  const contenidoCredenciales = document.getElementById("credenciales-contenido");
  const arrowIcon = document.getElementById("arrow-icon");

  if (!crearBtn || !toggleCredenciales || !contenidoCredenciales || !arrowIcon || !verCredencialBtn) {
    console.warn("❌ Algunos elementos del DOM no se encontraron. Revisa los IDs.");
    return;
  }

  let ultimoUsuario = null; // guardará los datos del último usuario

  // --- Crear credencial ---
  crearBtn.addEventListener("click", async () => {
    try {
      console.log("📌 Generando credencial...");

      const user = firebase.auth().currentUser;
      if (!user) {
        alert("Debes iniciar sesión primero.");
        return;
      }

      if (!fotoInput.files.length) {
        alert("Por favor seleccione una foto de perfil");
        return;
      }

      const file = fotoInput.files[0];
      if (file.size === 0) {
        alert("El archivo seleccionado está vacío. Selecciona una imagen válida.");
        return;
      }

      const userId = user.uid;
      const email = user.email;
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}.${fileExt}`;

      console.log("📌 Subiendo foto:", filePath);

      // Subir foto a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("fotos-perfil")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;
      console.log("✅ Foto subida correctamente");

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from("fotos-perfil")
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("No se pudo obtener la URL pública de la foto.");
      }
      const fotoUrl = publicUrlData.publicUrl;

      // Guardar en tabla foto_perfil
      const { error: insertFotoError } = await supabase
        .from("foto_perfil")
        .upsert([{ user_id: userId, filename: filePath, url: fotoUrl }]);

      if (insertFotoError) throw insertFotoError;
      console.log("✅ Registro en tabla foto_perfil correcto");

      // Generar código único
      const codigo = `CCNC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Guardar en tabla credenciales
      const { error: insertCredError } = await supabase
        .from("credenciales")
        .upsert([{ uid: userId, email, codigo, foto_url: fotoUrl, fecha: new Date().toISOString() }]);

      if (insertCredError) throw insertCredError;
      console.log("✅ Registro en tabla credenciales correcto");

      // Guardar en memoria para el modal
      ultimoUsuario = { id: userId, email, ext: fileExt, foto: fotoUrl, codigo };

      // Generar QR
      const credencialUrl = `${window.location.origin}/credencial.html?id=${userId}`;
      await QRCode.toCanvas(qrCanvas, credencialUrl);

      // Mostrar botón de ver credencial
      verCredencialBtn.style.display = "block";

      mostrarMensaje("✅ Credencial generada con éxito");

      // Notificación opcional
      if (typeof enviarNotificacion === "function") {
        enviarNotificacion("Credencial creada", `🆔 Usuario: ${email}`);
      }

    } catch (err) {
      console.error("❌ Error inesperado:", err);
      mostrarMensaje("❌ Error al generar credencial");
    }
  });

  // --- Mostrar modal tipo carnet ---
  verCredencialBtn.addEventListener("click", async () => {
    if (!ultimoUsuario) {
      alert("Primero crea un usuario.");
      return;
    }

    document.getElementById("foto-modal").src = ultimoUsuario.foto;
    document.getElementById("correo-modal").innerText = ultimoUsuario.email;
    document.getElementById("id-modal").innerText = ultimoUsuario.id;
    document.getElementById("codigo-modal").innerText = ultimoUsuario.codigo;

    const credencialUrl = `${window.location.origin}/credencial.html?id=${ultimoUsuario.id}`;
    QRCode.toCanvas(document.getElementById("qr-modal"), credencialUrl);

    document.getElementById("modalCredencial").style.display = "flex";
  });

  // --- Toggle desplegable ---
  toggleCredenciales.addEventListener("click", () => {
    if (contenidoCredenciales.style.display === "none") {
      contenidoCredenciales.style.display = "block";
      arrowIcon.textContent = "▲";
    } else {
      contenidoCredenciales.style.display = "none";
      arrowIcon.textContent = "▼";
    }
  });

  // --- Mensaje de confirmación ---
  function mostrarMensaje(texto) {
    const msg = document.createElement("div");
    msg.textContent = texto;
    msg.style.cssText = `
      background: #4caf50; 
      color: white; 
      padding: 10px; 
      border-radius: 8px; 
      margin-top: 10px; 
      text-align: center;
      font-weight: bold;
    `;
    contenidoCredenciales.prepend(msg);
    setTimeout(() => msg.remove(), 3000);
  }

});
