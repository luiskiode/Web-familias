// Router mínimo para Cáritas
(function(){
  'use strict';

  const app = document.getElementById('app');
  const nav = document.getElementById('main-nav');

  async function loadView(view){
    const url = `pestañas/${view}.html`;
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      const html = await res.text();
      app.innerHTML = html;

      // Notificar a scripts externos
      document.dispatchEvent(new CustomEvent('view:loaded:caritas', { detail: { view } }));
    } catch(err){
      console.error('No se pudo cargar la vista', view, err);
      app.innerHTML = `<div class="card"><h2>⚠️ Error</h2><p>No se pudo cargar <code>${view}.html</code>.</p></div>`;
    }
  }

  function goto(view){
    // Activar botón
    nav.querySelectorAll('button[data-view]').forEach(b => {
      b.classList.toggle('active', b.dataset.view === view);
    });
    // Cargar contenido
    loadView(view);
    // Actualizar hash
    if (location.hash !== '#' + view) history.replaceState(null, '', '#' + view);
  }

  // Navegación por clicks
  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-view]');
    if (!btn) return;
    e.preventDefault();
    goto(btn.dataset.view);
  });

  // Navegación por hash directo
  window.addEventListener('hashchange', () => {
    const v = location.hash.replace('#','') || 'inicio';
    goto(v);
  });

  // Primera carga
  document.addEventListener('DOMContentLoaded', () => {
    const v = location.hash.replace('#','') || 'inicio';
    goto(v);
  });
})();