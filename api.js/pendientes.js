// pendientes.js (corregido) — expone API global y usa Supabase + Firebase Auth
console.log("📌 pendientes.js cargado");

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const escapeHTML = (str) => String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

  function showError(msg) {
    const box = $("#pendientesError");
    if (!box) return console.warn("Pendientes:", msg);
    box.textContent = msg;
    box.style.display = "block";
    setTimeout(() => (box.style.display = "none"), 4000);
  }

  function showToast(msg, ok = true) {
    const cont = $("#pendientes-contenido") || document.body;
    const el = document.createElement("div");
    el.textContent = msg;
    el.style.cssText = `
      position: relative;
      background: ${ok ? "#16a34a" : "#dc2626"};
      color: white;
      padding: 10px 12px;
      border-radius: 10px;
      margin: 8px 0;
      text-align: center;
      font-weight: 600;
      box-shadow: 0 6px 14px rgba(0,0,0,.15);
    `;
    cont.prepend(el);
    setTimeout(() => el.remove(), 2500);
  }

  let isOpen = false;
  let currentUser = null;

  function renderPendientes(items = []) {
    const tbody = $("#pendientesBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!items.length) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="3" style="text-align:center; color:#888;">No hay pendientes</td>`;
      tbody.appendChild(tr);
      return;
    }

    for (const t of items) {
      const tr = document.createElement("tr");
      tr.dataset.id = t.id;
      tr.innerHTML = `
        <td class="desc" style="padding-right: 8px;">${escapeHTML(t.descripcion)}</td>
        <td style="text-align:center;"><input class="chk-estado" type="checkbox" ${t.estado ? "checked" : ""} /></td>
        <td style="text-align:right;"><button class="btn-del" style="background:#fee2e2;border:1px solid #fecaca;border-radius:8px;padding:6px 10px;cursor:pointer;">🗑️</button></td>
      `;
      tbody.appendChild(tr);
    }
  }

  async function load() {
    if (!window.supabase) return showError("Supabase no inicializado.");
    if (!currentUser) return showError("Debes iniciar sesión.");
    const { data, error } = await window.supabase
      .from("pendientes")
      .select("id, descripcion, estado")
      .eq("user_id", currentUser.uid)
      .order("id", { ascending: true });

    if (error) { console.error(error); return showError("No se pudieron cargar los pendientes."); }
    renderPendientes(data || []);
  }

  async function add(desc) {
    if (!currentUser) return showError("Debes iniciar sesión.");
    desc = (desc || "").trim();
    if (!desc) return showError("Escribe una descripción.");

    const { error } = await window.supabase.from("pendientes").insert([{
      descripcion: desc,
      estado: false,
      user_id: currentUser.uid
    }]);

    if (error) { console.error(error); return showToast("Error al agregar pendiente", false); }
    showToast("✅ Pendiente agregado");
    await load();
  }

  async function upd(id, estado) {
    if (!currentUser) return;
    const { error } = await window.supabase
      .from("pendientes")
      .update({ estado })
      .eq("id", id)
      .eq("user_id", currentUser.uid);
    if (error) { console.error(error); showToast("No se pudo actualizar", false); }
  }

  async function del(id) {
    if (!currentUser) return;
    const { error } = await window.supabase
      .from("pendientes")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUser.uid);
    if (error) { console.error(error); showToast("No se pudo eliminar", false); return; }
    showToast("🗑️ Eliminado");
    await load();
  }

  function wireUI() {
    const header = $("#toggle-pendientes");
    const content = $("#pendientes-contenido");
    const arrow = $("#arrow-pendientes");

    if (header && content) {
      header.addEventListener("click", () => {
        isOpen = !isOpen;
        content.style.display = isOpen ? "block" : "none";
        if (arrow) arrow.textContent = isOpen ? "▲" : "▼";
        if (isOpen) setTimeout(load, 60);
      });
    }

    const form = $("#nuevoPendienteForm");
    const input = $("#nuevo-pendiente");
    if (form && input) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        await add(input.value);
        input.value = "";
        input.focus();
      });
    }

    const tbody = $("#pendientesBody");
    if (tbody) {
      tbody.addEventListener("change", async (e) => {
        const chk = e.target.closest(".chk-estado");
        if (!chk) return;
        const tr = e.target.closest("tr");
        if (!tr) return;
        const id = tr.dataset.id;
        await upd(id, chk.checked);
      });

      tbody.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btn-del");
        if (!btn) return;
        const tr = e.target.closest("tr");
        if (!tr) return;
        const id = tr.dataset.id;
        if (confirm("¿Seguro que quieres eliminar este pendiente?")) await del(id);
      });
    }
  }

  function bindAuth() {
    // Soporta Firebase compat y modular expuesto en window.auth
    if (window.firebase?.auth) {
      firebase.auth().onAuthStateChanged((user) => {
        currentUser = user;
        if (user && isOpen) load();
      });
    } else if (window.auth?.onAuthStateChanged) {
      window.auth.onAuthStateChanged((user) => {
        currentUser = user;
        if (user && isOpen) load();
      });
    } else {
      console.warn("⚠ No hay proveedor de Auth disponible.");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    wireUI();
    bindAuth();
  });

  // API global
  window._pendientes = { load, add, upd, del };
})();
