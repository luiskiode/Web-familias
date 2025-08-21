// firebase-config.js
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> 2f6b862eaadeaae75197048f29d1c96d4bcf7495

// ⚠️ Asegúrate de haber cargado Firebase antes en index.html con:
/// <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
/// <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js"></script>
/// <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js"></script>
/// <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-storage-compat.js"></script>

<<<<<<< HEAD
>>>>>>> a0338b9 (Actualizaci├│n r├ípida desde script)
=======
>>>>>>> 2f6b862eaadeaae75197048f29d1c96d4bcf7495
const firebaseConfig = {
  apiKey: "AIzaSyD5X6LUG_dOwuaUf6jQUHw_LM5PFgOmc40",
  authDomain: "web-familias.firebaseapp.com",
  projectId: "web-familias",
<<<<<<< HEAD
<<<<<<< HEAD
  storageBucket: "web-familias.firebasestorage.app",
=======
  storageBucket: "web-familias.appspot.com", // ✅ corregido
>>>>>>> a0338b9 (Actualizaci├│n r├ípida desde script)
=======
  storageBucket: "web-familias.appspot.com", // ✅ corregido
>>>>>>> 2f6b862eaadeaae75197048f29d1c96d4bcf7495
  messagingSenderId: "261699620792",
  appId: "1:261699620792:web:8ff59afb72e96c371dc94d"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

<<<<<<< HEAD
<<<<<<< HEAD
// Autenticación
const auth = firebase.auth();
=======
=======
>>>>>>> 2f6b862eaadeaae75197048f29d1c96d4bcf7495
// Instancias globales
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
<<<<<<< HEAD
>>>>>>> a0338b9 (Actualizaci├│n r├ípida desde script)
=======
>>>>>>> 2f6b862eaadeaae75197048f29d1c96d4bcf7495
