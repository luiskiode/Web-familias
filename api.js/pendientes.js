// pendientes.js — corregido y expone API global initPendientes
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

  let isOpen = false;
  let currentUser = null;
  const supabase = window.CARITAS?.supabase;

  function showMsg(msg, ok = true) {
    const cont = $("#pendientes-contenido") || document.body;
    const el = document.createElement("div");
    el.textContent = msg;
    el.style.cssText = `
      background: ${ok ? "#16a34a" : "#dc2626"};
      color: white;
      padding: 8px 10px;
      border-radius: 8px;
      margin: 6px 0;
      text-align: center;
      font-weight: 600;
      box-shadow: 0 4px 10px rgba(0,0,0,.15);
    `;
    cont.prepend(el);
    setTimeout(() => el.remove(), 2500);
  }

  function renderPendientes(items = []) {
    const tbody = $("#pendientesBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#888;">No hay pendientes</td></tr>`;
      return;
    }

    for (const t of items) {
      const tr = document.createElement("tr");
      tr.dataset.id = t.id;
      tr.innerHTML = `
        <td class="desc">${escapeHTML(t.descripcion)}</td>
        <td style="text-align:center;"><input class="chk-estado" type="checkbox" ${t.estado ? "checked" : ""} /></td>
        <td style="text-align:right;">
          <button class="btn-del" style="background:#fee2e2;border:1px solid #fecaca;border-radius:6px;padding:5px 8px;cursor:pointer;">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    }
  }

  async function load() {
    if (!supabase) return console.warn("❌ Supabase no inicializado");
    if (!currentUser) return;
    const { data, error } = await supabase
      .from("pendientes")
      .select("id, descripcion, estado")
      .eq("user_id", currentUser.uid)
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      showMsg("❌ No se pudieron cargar los pendientes", false);
      return;
    }
    renderPendientes(data || []);
  }

  async function add(desc) {
    if (!currentUser) return showMsg("⚠️ Debes iniciar sesión", false);
    desc = (desc || "").trim();
    if (!desc) return showMsg("⚠️ Escribe una descripción", false);

    const { error } = await supabase.from("pendientes").insert([{
      descripcion: desc,
      estado: false,
      user_id: currentUser.uid
    }]);

    if (error) {
      console.error(error);
      return showMsg("❌ Error al agregar pendiente", false);
    }
    showMsg("✅ Pendiente agregado");
    await load();
  }

  async function upd(id, estado) {
    if (!currentUser) return;
    const { error } = await supabase
      .from("pendientes")
      .update({ estado })
      .eq("id", id)
      .eq("user_id", currentUser.uid);
    if (error) {
      console.error(error);
      showMsg("❌ No se pudo actualizar", false);
    }
  }

  async function del(id) {
    if (!currentUser) return;
    const { error } = await supabase
      .from("pendientes")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUser.uid);
    if (error) {
      console.error(error);
      return showMsg("❌ No se pudo eliminar", false);
    }
    showMsg("🗑️ Eliminado");
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
    const auth = window.CARITAS?.auth || window.auth || (window.firebase?.auth && firebase.auth());
    if (!auth) {
      console.warn("⚠️ No hay proveedor de Auth disponible");
      return;
    }
    auth.onAuthStateChanged((user) => {
      currentUser = user;
      if (user && isOpen) load();
    });
  }

  // 🚀 Exponer inicializador global para main.js
  window.initPendientes = function () {
    wireUI();
    bindAuth();
  };
})();