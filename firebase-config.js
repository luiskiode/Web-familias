// ⚠️ Asegúrate de haber cargado Firebase antes en index.html con:
// <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-storage-compat.js"></script>

const firebaseConfig = {
  apiKey: "AIzaSyD5X6LUG_dOwuaUf6jQUHw_LM5PFgOmc40",
  authDomain: "web-familias.firebaseapp.com",
  projectId: "web-familias",
  storageBucket: "web-familias.appspot.com",
  messagingSenderId: "261699620792",
  appId: "1:261699620792:web:8ff59afb72e96c371dc94d"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

// Instancias globales
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
