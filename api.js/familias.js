// api.js/familias.js
console.log("📌 familias.js cargado");

document.addEventListener("DOMContentLoaded", () => {
  const tabla = document.querySelector("#familiasTable tbody");
  if (!tabla) {
    // 👉 Evita warnings en páginas sin tabla
    console.log("ℹ️ familias.js: no hay #familiasTable en esta página, se omite.");
    return;
  }

  const msg = document.getElementById("msg");
  const cambios = new Map();
  let page = 0;
  const pageSize = 20;

  function showMsg(text, type="info"){
    msg.textContent = text;
    msg.className = type;
    setTimeout(()=>{ msg.textContent=""; msg.className=""; }, 4000);
  }

  const esc = (s="") => String(s).replace(/[&<>"']/g,
    m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])
  );

  async function cargarFamilias(){
    const supabase = window.CARITAS?.supabase;
    if (!supabase) {
      console.warn("familias.js: Supabase no inicializado aún");
      return;
    }
    try {
      const start = page * pageSize;
      const end = start + pageSize - 1;
      tabla.innerHTML = "<tr><td colspan='6'>Cargando...</td></tr>";
      const { data, error } = await supabase
        .from("familias")
        .select("*")
        .order("id",{ascending:true})
        .range(start,end);

      if (error) throw error;
      if (!data || data.length === 0) {
        tabla.innerHTML = "<tr><td colspan='6'>Sin registros</td></tr>";
        return;
      }

      tabla.innerHTML = "";
      data.forEach(fam => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${fam.id}</td>
          <td>${esc(fam.nombres_apellidos||"")}</td>
          <td>${esc(fam.direccion||"")}</td>
          <td>${esc(fam.telefono_contacto||"")}</td>
          <td><input type="checkbox" data-id="${fam.id}" ${fam.visitada?"checked":""}></td>
          <td><button class="btn btn-del" data-del="${fam.id}">🗑 Eliminar</button></td>`;
        tabla.appendChild(tr);
      });
    } catch(err){
      console.error("❌ Error cargando familias:", err);
      tabla.innerHTML = "<tr><td colspan='6'>Error al cargar datos</td></tr>";
    }
  }

  // Guardar cambios visitada
  document.getElementById("guardarCambios")?.addEventListener("click", async ()=>{
    const supabase = window.CARITAS?.supabase;
    if (!supabase) return;
    try {
      for(const [id,v] of cambios){
        await supabase.from("familias").update({visitada:v}).eq("id",id);
      }
      showMsg("✅ Cambios guardados","success");
      cambios.clear();
      cargarFamilias();
    } catch(err){
      showMsg("❌ Error guardando cambios","error");
    }
  });

  // Detectar cambios en checkboxes
  document.getElementById("familiasTable")?.addEventListener("change", e=>{
    if(e.target.type==="checkbox"){
      cambios.set(e.target.dataset.id, e.target.checked);
    }
  });

  // Eliminar
  document.getElementById("familiasTable")?.addEventListener("click", async e=>{
    if(e.target.dataset.del){
      if(confirm("¿Eliminar familia?")){
        try{
          await window.CARITAS.supabase.from("familias").delete().eq("id",e.target.dataset.del);
          showMsg("🗑️ Familia eliminada","success");
          cargarFamilias();
        } catch{
          showMsg("❌ Error eliminando familia","error");
        }
      }
    }
  });

  // Paginación
  document.getElementById("prevPage")?.addEventListener("click",()=>{
    if(page>0){ page--; cargarFamilias(); }
  });
  document.getElementById("nextPage")?.addEventListener("click",()=>{
    page++; cargarFamilias();
  });

  // 🚀 Iniciar carga
  if (window.CARITAS?.supabase) cargarFamilias();
  else document.addEventListener("supabase:ready:caritas", ()=> cargarFamilias(), {once:true});
});