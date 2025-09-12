// api.js/login.js — robusto (espera Firebase listo antes de permitir enviar el form)
console.log("📌 login.js cargado");

(function () {
  'use strict';

  const ready = (fn) =>
    document.readyState !== 'loading'
      ? fn()
      : document.addEventListener('DOMContentLoaded', fn);

  const $ = (sel) => document.querySelector(sel);

  function setMsg(text, type) {
    const el = $('#loginMessage') || $('#msg');
    if (!el) return console.warn("MSG:", text);
    el.textContent = text || '';
    el.className = type || '';
  }

  function getAuth() {
    return window.CARITAS?.auth || (window.firebase?.auth && firebase.auth()) || null;
  }

  function waitForFirebase(timeout = 8000) {
    return new Promise((resolve, reject) => {
      if (getAuth()) return resolve(getAuth());
      const t0 = performance.now();
      const onReady = () => {
        document.removeEventListener('firebase:ready:caritas', onReady);
        resolve(getAuth());
      };
      document.addEventListener('firebase:ready:caritas', onReady);
      const iv = setInterval(() => {
        if (getAuth()) { clearInterval(iv); document.removeEventListener('firebase:ready:caritas', onReady); resolve(getAuth()); }
        if (performance.now() - t0 > timeout) { clearInterval(iv); document.removeEventListener('firebase:ready:caritas', onReady); reject(new Error("Firebase no inicializado")); }
      }, 50);
    });
  }

  async function doLogin(email, password, btn) {
    let auth = getAuth();
    if (!auth) {
      try { auth = await waitForFirebase(8000); }
      catch (e) { setMsg('❌ Firebase no inicializado. Revisa el orden de scripts.', 'error'); return; }
    }
    if (!email || !password) return setMsg('⚠️ Completa email y contraseña.', 'error');

    btn && (btn.disabled = true);
    try {
      await auth.signInWithEmailAndPassword(email, password);
      setMsg('✅ Acceso concedido. Redirigiendo…', 'success');
      setTimeout(() => (window.location.href = 'index.html'), 800);
    } catch (err) {
      console.error('❌ login error:', err);
      const hint =
        err?.code === 'auth/network-request-failed' ? 'Error de red. Verifica tu conexión.' :
        err?.message || 'Error de autenticación.';
      setMsg('❌ ' + hint, 'error');
    } finally {
      btn && (btn.disabled = false);
    }
  }

  async function doRegister(email, password) {
    let auth = getAuth();
    if (!auth) {
      try { auth = await waitForFirebase(8000); }
      catch (e) { setMsg('❌ Firebase no inicializado. Revisa el orden de scripts.', 'error'); return; }
    }
    if (!email || !password) return setMsg('⚠️ Completa email y contraseña.', 'error');
    try {
      const { user } = await auth.createUserWithEmailAndPassword(email, password);
      setMsg('✅ Cuenta creada, completa tu credencial.', 'success');
      // Muestra el formulario de credencial si existe en la página
      const credBox = $('#credForm');
      if (credBox) {
        credBox.style.display = '';
        $('#nombreCred') && ($('#nombreCred').value = (user.email||"").split("@")[0]);
      } else {
        // Si no tienes ese formulario aquí, redirige al carnet (lo completará allá)
        setTimeout(()=> window.location.href = 'credenciales.html?view=carnet', 1200);
      }
    } catch (err) {
      console.error('❌ register error:', err);
      setMsg('❌ '+(err.message||'Error registrando.'), 'error');
    }
  }

  ready(async () => {
    // Deshabilita el submit hasta que Firebase esté listo
    const form = $('#loginForm');
    if (!form) return console.warn('⚠️ login.js: no hay #loginForm');

    const emailInput = form.querySelector('input[type="email"]');
    const passInput  = form.querySelector('input[type="password"]');
    const submitBtn  = form.querySelector('button[type="submit"], .submit-btn');
    const regBtn     = $('#registerBtn');
    const resetBtn   = $('#resetPassBtn');

    submitBtn && (submitBtn.disabled = true);
    regBtn     && (regBtn.disabled = true);

    try {
      await waitForFirebase(8000);
      submitBtn && (submitBtn.disabled = false);
      regBtn     && (regBtn.disabled = false);
      setMsg('', '');
    } catch (e) {
      setMsg('❌ Firebase no inicializado. Verifica las etiquetas de Firebase en <head>.', 'error');
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      doLogin(emailInput.value.trim(), passInput.value, submitBtn);
    });

    regBtn && regBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      doRegister(emailInput.value.trim(), passInput.value);
    });

    resetBtn && resetBtn.addEventListener('click', async ()=>{
      const auth = getAuth() || await waitForFirebase().catch(()=>null);
      const email = prompt("Ingresa tu correo para restablecer:");
      if (!email || !auth) return;
      try{
        await auth.sendPasswordResetEmail(email);
        setMsg('📩 Revisa tu correo', 'success');
      }catch(err){
        setMsg('❌ '+(err.message||'No se pudo enviar el correo'), 'error');
      }
    });
  });
})();