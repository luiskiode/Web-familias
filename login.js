console.log("✅ login.js cargado");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMessage");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    msg.classList.remove("error", "success");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      msg.textContent = "Por favor completa email y contraseña.";
      msg.classList.add("error");
      return;
    }

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      console.log("🔑 Usuario autenticado:", user.email);

      // Validar admin
      if (user.email !== "admin@caritas.com") {
        await auth.signOut();
        msg.textContent = "⛔ No tienes permisos para acceder a esta página.";
        msg.classList.add("error");
        return;
      }

      // Login exitoso
      msg.textContent = "✔ Inicio de sesión exitoso. Redirigiendo...";
      msg.classList.add("success");

      // Guardar sesión en localStorage
      localStorage.setItem("caritasUser", JSON.stringify({ email: user.email, uid: user.uid }));

      setTimeout(() => window.location.href = "index.html", 1000);

    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
      let errorMessage = "Usuario o contraseña incorrectos.";
      if (err.code === "auth/network-request-failed") {
        errorMessage = "Error de red. Verifica tu conexión.";
      }
      msg.textContent = errorMessage;
      msg.classList.add("error");
    }
  });
});
