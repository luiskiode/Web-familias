console.log("✅ login-supabase.js cargado");

// Ejemplo: login con Supabase
const form = document.getElementById("loginForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("loginMessage");

    msg.textContent = "";
    if (!email || !password) {
      msg.textContent = "⚠️ Completa correo y contraseña";
      msg.style.color = "red";
      return;
    }

    try {
      const { data, error } = await window.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      msg.textContent = "✅ Acceso concedido, redirigiendo...";
      msg.style.color = "green";
      setTimeout(() => (window.location.href = "index.html"), 1000);
    } catch (err) {
      console.error("❌ Error de login:", err.message);
      msg.textContent = "❌ " + err.message;
      msg.style.color = "red";
    }
  });
}
