console.log("login.js cargado ✅");

function login(event) {
    if (event) event.preventDefault(); // Evita recarga del formulario

    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value.trim();

    if (!email || !password) {
        alert("Completa email y contraseña");
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            alert("Inicio de sesión exitoso");
            window.location.href = "index.html";
        })
        .catch(err => {
            console.error("Error al iniciar sesión:", err);
            const msg = document.getElementById('loginMessage');
            if (msg) msg.textContent = "Usuario o contraseña incorrectos";
        });
}

// Enganchar al submit del formulario
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    if (form) {
        form.addEventListener("submit", login);
    }
});
