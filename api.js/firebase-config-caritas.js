

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

  
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();

  // Guardamos en el namespace Cáritas
  window.CARITAS = window.CARITAS || {};
  window.CARITAS.app = app;
  window.CARITAS.auth = auth;

  // Avisamos al index que ya está listo
  document.dispatchEvent(new Event("firebase:ready:caritas"));
})();