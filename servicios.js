document.addEventListener("DOMContentLoaded", () => {
  const loginCard = document.getElementById("loginCard");
  const serviciosPrivados = document.getElementById("serviciosPrivados");
  const loginBtn = document.getElementById("btn-login");
  const logoutBtn = document.getElementById("btn-logout");

  if (!loginCard || !serviciosPrivados || !loginBtn || !logoutBtn) {
    console.warn("❌ Algunos elementos de login no se encontraron");
    return;
  }

  // Escuchar estado de sesión
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      console.log("✅ Sesión activa:", user.email);
      loginCard.style.display = "none";
      serviciosPrivados.style.display = "block";
    } else {
      console.log("🚪 Sesión cerrada");
      loginCard.style.display = "block";
      serviciosPrivados.style.display = "none";
    }
  });

  // Login
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      alert("✅ Sesión iniciada con éxito");
    } catch (err) {
      alert("❌ Error al iniciar sesión: " + err.message);
    }
  });

  // Logout
  logoutBtn.addEventListener("click", async () => {
    await firebase.auth().signOut();
    alert("🚪 Sesión cerrada");
  });
});
