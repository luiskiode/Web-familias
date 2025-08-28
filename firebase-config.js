// firebase-config.js (compat) — Unifica todo el proyecto en compat
// Asegúrate de cargar en el HTML:
//   <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
//   <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
//   (Opcional) Firestore y Storage si los usas:
//   <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
//   <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js"></script>

(function () {
  'use strict';
  const firebaseConfig = {
    apiKey: "AIzaSyD5X6LUG_dOwuaUf6jQUHw_LM5PFgOmc40",
    authDomain: "web-familias.firebaseapp.com",
    projectId: "web-familias",
    storageBucket: "web-familias.appspot.com",
    messagingSenderId: "261699620792",
    appId: "1:261699620792:web:8ff59afb72e96c371dc94d"
  };

  if (!window.firebase || !firebase?.initializeApp) {
    console.error("❌ Firebase compat no está cargado. Verifica los <script> en tu HTML.");
    return;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Exponer accesos globales
  window.auth = firebase.auth();
  window.db = firebase.firestore ? firebase.firestore() : undefined;
  window.storage = firebase.storage ? firebase.storage() : undefined;

  console.log("✅ Firebase compat inicializado");
})();
