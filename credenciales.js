document.addEventListener("DOMContentLoaded", () => {
  console.log("📌 credenciales.js cargado correctamente");

  // --- Elementos del DOM ---
  const nombreInput = document.getElementById("nombre");
  const emailInput = document.getElementById("email");
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

  let ultimoUsuario = null;

  // --- Crear credencial ---
  crearBtn.addEventListener("click", async () => {
    console.log("🔹 Click en Generar Credencial");
    try {
      const user = firebase.auth().currentUser;
      if (!user) { alert("Debes iniciar sesión primero."); return; }
      if (!fotoInput.files.length) { alert("Selecciona una foto de perfil"); return; }

      const file = fotoInput.files[0];
      if (file.size === 0) { alert("El archivo está vacío"); return; }

      const userId = user.uid;  // Firebase UID
      const email = user.email;
      const nombre = nombreInput?.value || "Usuario";
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}.${fileExt}`;

      // Subir foto a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("fotos-perfil")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from("fotos-perfil")
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) throw new Error("No se pudo obtener URL pública de la foto.");
      const fotoUrl = publicUrlData.publicUrl;

      // Código único
      const codigo = `CCNC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Guardar en tabla credenciales
      const { error: insertCredError } = await supabase.from("credenciales").upsert([{
        user_id: userId,
        nombre,
        email,
        foto_url: fotoUrl,
        codigo_verificacion: codigo,
        created_at: new Date().toISOString()
      }]);

      if (insertCredError) throw insertCredError;

      ultimoUsuario = { id: userId, nombre, email, foto: fotoUrl, codigo };

      // Generar QR en canvas interno
      const credencialUrl = `${window.location.origin}/credencial.html?id=${userId}`;
      await QRCode.toCanvas(qrCanvas, credencialUrl);

      // Mostrar botón ver credencial
      verCredencialBtn.style.display = "block";

      // Abrir carnet en nueva pestaña automáticamente
      abrirCarnet(ultimoUsuario);

      mostrarMensaje("✅ Credencial generada con éxito", true);

    } catch (err) {
      console.error("❌ Error al generar credencial:", err);
      mostrarMensaje(`❌ Error: ${err.message || err}`, false);
    }
  });

  // --- Abrir carnet en nueva pestaña ---
  function abrirCarnet(usuario) {
    if (!usuario) return;
    const credencialUrl = `${window.location.origin}/credencial.html?id=${usuario.id}`;
    const nuevaVentana = window.open("", "_blank", "width=400,height=600");
    const htmlCarnet = `
      <html>
      <head>
        <title>Carnet CCNC</title>
        <style>
          body { font-family: Arial; display:flex; justify-content:center; align-items:center; background:#f0f0f0; }
          .carnet { width:320px; border:2px solid #444; border-radius:15px; padding:20px; background:white; text-align:center; }
          img { width:100px; height:100px; border-radius:50%; object-fit:cover; margin-bottom:15px; }
          .qr { margin-top:15px; }
          h2,p { margin:5px; }
        </style>
      </head>
      <body>
        <div class="carnet">
          <h2>📌 Cáritas CNC</h2>
          <img src="${usuario.foto}" alt="Foto perfil">
          <p><b>Nombre:</b> ${usuario.nombre}</p>
          <p><b>Email:</b> ${usuario.email}</p>
          <p><b>ID:</b> ${usuario.id}</p>
          <p><b>Código:</b> ${usuario.codigo}</p>
          <canvas id="qrCarnet" class="qr"></canvas>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
        <script>
          const canvas = document.getElementById('qrCarnet');
          QRCode.toCanvas(canvas, "${credencialUrl}");
        </script>
      </body>
      </html>
    `;
    nuevaVentana.document.write(htmlCarnet);
    nuevaVentana.document.close();
  }

  // --- Botón ver credencial ---
  verCredencialBtn.addEventListener("click", () => {
    if (!ultimoUsuario) {
      alert("Primero crea una credencial");
      return;
    }
    abrirCarnet(ultimoUsuario);
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
  function mostrarMensaje(texto, exito = true) {
    const msg = document.createElement("div");
    msg.textContent = texto;
    msg.style.cssText = `
      background: ${exito ? "#4caf50" : "#f44336"};
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

const verTodasBtn = document.getElementById("btn-ver-todas");
const listaCredenciales = document.getElementById("lista-credenciales");

if (verTodasBtn) {
  verTodasBtn.addEventListener("click", async () => {
    try {
      const { data, error } = await supabase
        .from("credenciales")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      listaCredenciales.innerHTML = ""; // limpiar antes

      data.forEach(cred => {
        const div = document.createElement("div");
        div.classList.add("carnet");
        div.innerHTML = `
          <div class="foto">
            <img src="${cred.foto_url}" alt="Foto perfil">
          </div>
          <div class="info">
            <h3>Cáritas CNC</h3>
            <p><b>Email:</b> ${cred.email}</p>
            <p><b>Código:</b> ${cred.codigo_verificacion}</p>
            <p><b>Fecha:</b> ${new Date(cred.created_at).toLocaleDateString()}</p>
          </div>
          <div class="qr">
            <canvas id="qr-${cred.user_id}" width="60" height="60"></canvas>
          </div>
        `;
        listaCredenciales.appendChild(div);

        // Generar QR dinámico
        const canvas = div.querySelector(`#qr-${cred.user_id}`);
        const url = `${window.location.origin}/credencial.html?id=${cred.user_id}`;
        QRCode.toCanvas(canvas, url, { width: 60 });
      });

    } catch (err) {
      console.error("❌ Error al cargar credenciales:", err);
      alert("No se pudieron cargar las credenciales");
    }
  });
}
