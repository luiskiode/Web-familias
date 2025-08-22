import { supabase } from './supabase-config.js';

const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const fotoInput = document.getElementById('foto-perfil');
const crearBtn = document.getElementById('crear-credenciales');
const qrCanvas = document.getElementById('qr-canvas');
const verCredencialBtn = document.getElementById('ver-credencial');

let ultimoUsuario = null;

crearBtn.addEventListener('click', async () => {
  try {
    console.log("📌 Creando usuario en Supabase...");

    if (!emailInput.value || !passInput.value) {
      alert("Por favor complete correo y contraseña");
      return;
    }
    if (!fotoInput.files.length) {
      alert("Por favor seleccione una foto de perfil");
      return;
    }

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailInput.value,
      password: passInput.value
    });
    if (authError) throw authError;

    // 2. Generar ID y preparar foto
    const userId = authData.user?.id || crypto.randomUUID();
    const file = fotoInput.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}.${fileExt}`;

    // 3. Subir foto a Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('fotos-perfil')
      .upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;

    // 4. Obtener URL pública de la foto
    const { data: publicUrlData } = supabase
      .storage
      .from('fotos-perfil')
      .getPublicUrl(filePath);
    const fotoUrl = publicUrlData.publicUrl;

    // 5. Guardar credencial en tabla
    const { error: insertError } = await supabase
      .from('credenciales')
      .insert([{ id: userId, email: emailInput.value, foto_url: fotoUrl, ext: fileExt }]);
    if (insertError) throw insertError;

    // 6. Guardar usuario en memoria
    ultimoUsuario = { id: userId, email: emailInput.value, ext: fileExt };

    // 7. Generar QR con enlace
    const credencialUrl = `${window.location.origin}/credencial.html?id=${userId}`;
    await QRCode.toCanvas(qrCanvas, credencialUrl);

    verCredencialBtn.style.display = "block";
    verCredencialBtn.onclick = () => window.open(credencialUrl, "_blank");

    alert("✅ Usuario creado con éxito. QR generado.");
  } catch (err) {
    console.error("❌ Error inesperado:", err);
    alert("Error: " + err.message);
  }
});

// ✅ Un solo listener para mostrar modal
verCredencialBtn.addEventListener("click", async () => {
  if (!ultimoUsuario) {
    alert("Primero crea un usuario.");
    return;
  }

  const { data: publicUrlData } = supabase
    .storage
    .from("fotos-perfil")
    .getPublicUrl(`${ultimoUsuario.id}.${ultimoUsuario.ext}`);

  document.getElementById("foto-modal").src = publicUrlData.publicUrl;
  document.getElementById("correo-modal").innerText = ultimoUsuario.email;
  document.getElementById("id-modal").innerText = ultimoUsuario.id;

  const credencialUrl = `${window.location.origin}/credencial.html?id=${ultimoUsuario.id}`;
  QRCode.toCanvas(document.getElementById("qr-modal"), credencialUrl);

  document.getElementById("modalCredencial").style.display = "flex";
});
