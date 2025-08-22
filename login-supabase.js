console.log("✅ login-supabase.js cargado");

// Configuración
const SUPABASE_URL = "https://qivjlsvcjyqymommfdke.supabase.co";
const SUPABASE_KEY = "TU_API_KEY_AQUI"; // reemplaza con tu anon key

async function login(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("loginMessage");

  msg.textContent = "";
  msg.classList.remove("error", "success");

  if (!email || !password) {
    msg.textContent = "Por favor completa email y contraseña.";
    msg.classList.add("error");
    return;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/credenciales`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation" // devuelve el registro insertado
      },
      body: JSON.stringify({ usuario: email, clave: password })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Usuario o contraseña incorrectos");
    }

    const data = await res.json();

    // Guardar sesión local
    localStorage.setItem("caritasUser", JSON.stringify({ email, id: data[0].id }));

    msg.style.color = "#0a7b2e";
    msg.textContent = "✔ Acceso concedido. Redirigiendo…";

    setTimeout(() => window.location.href = "index.html", 1000);

  } catch (err) {
    console.error("❌ Error login:", err);
    msg.style.color = "#b00020";
    msg.textContent = `❌ ${err.message}`;
    msg.classList.add("error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (form) form.addEventListener("submit", login);
});
