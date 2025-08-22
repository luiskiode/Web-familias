console.log("📌 servicios.js cargado correctamente");

// Inicializar Firebase Auth (v8 UMD)
const auth = firebase.auth();

// Referencias HTML
const loginCard = document.getElementById("loginCard");
const serviciosPrivados = document.getElementById("serviciosPrivados");
const loginBtn = document.getElementById("btn-login");
const logoutBtn = document.getElementById("btn-logout");

// Escuchar estado de sesión Firebase
auth.onAuthStateChanged(user => {
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

// Iniciar sesión
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    alert("✅ Sesión iniciada con éxito");
  } catch (err) {
    alert("❌ Error al iniciar sesión: " + err.message);
  }
});

// Cerrar sesión
logoutBtn.addEventListener("click", async () => {
  await auth.signOut();
  alert("🚪 Sesión cerrada");
});
