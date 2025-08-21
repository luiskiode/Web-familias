console.log("✅ login.js cargado");

function login(event) {
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

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      console.log("🔑 Usuario autenticado:", user.email);

      // Valida si es admin
      if (user.email === "admin@caritas.com") {
        msg.textContent = "Inicio de sesión exitoso. Redirigiendo...";
        msg.classList.add("success");

        // Guardar sesión en localStorage
        localStorage.setItem("caritasUser", JSON.stringify({ email: user.email, uid: user.uid }));

        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);

      } else {
        // No autorizado
        auth.signOut();
        msg.textContent = "⛔ No tienes permisos para acceder a esta página.";
        msg.classList.add("error");
      }
    })
    .catch(error => {
      console.error("❌ Error al iniciar sesión:", error);
      let errorMessage = "Usuario o contraseña incorrectos.";
      if (error.code === "auth/network-request-failed") {
        errorMessage = "Error de red. Verifica tu conexión.";
      }
      msg.textContent = errorMessage;
      msg.classList.add("error");
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", login);
  }
});
