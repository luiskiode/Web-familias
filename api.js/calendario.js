// api.js/calendario.js
document.addEventListener("DOMContentLoaded", () => {
  const supabase = window.CARITAS?.supabase || window.supabase;
  const calendarEl = document.getElementById("calendar");
  const toggleBtn = document.getElementById("toggle-calendario");
  const calendarioContainer = document.getElementById("calendario-container");

  // === Obtener rol del usuario ===
  function getRol() {
    try {
      return JSON.parse(localStorage.getItem("caritasUser"))?.rol || "invitado";
    } catch {
      return "invitado";
    }
  }
  const rol = getRol();
  const canEdit = ["admin", "editor"].includes(rol);

  // === Notificación simple ===
  function notify(msg, type = "info") {
    const prefix =
      type === "error" ? "❌" : type === "success" ? "✅" : "🔔";
    console.log(prefix, msg);
    // ⚠️ Puedes reemplazar por un toast en pantalla
    if (type === "error") alert(prefix + " " + msg);
  }

  // === Toggle del contenedor calendario ===
  if (toggleBtn && calendarioContainer) {
    toggleBtn.addEventListener("click", () => {
      const visible = calendarioContainer.style.display !== "none";
      calendarioContainer.style.display = visible ? "none" : "block";
      toggleBtn.textContent = visible
        ? "📅 Ver Calendario de Actividades"
        : "📅 Ocultar Calendario de Actividades";
    });
  }

  if (!calendarEl || !window.FullCalendar || !supabase) {
    console.warn("⚠️ No se encontró #calendar, o faltan FullCalendar/Supabase");
    return;
  }

  // === Cargar eventos desde Supabase ===
  async function fetchEventos() {
    try {
      const { data, error } = await supabase
        .from("eventos")
        .select("id, titulo, fecha_inicio, fecha_fin, all_day");

      if (error) throw error;

      return (data || []).map((evt) => ({
        id: evt.id,
        title: evt.titulo,
        start: evt.fecha_inicio,
        end: evt.fecha_fin || null,
        allDay: !!evt.all_day,
      }));
    } catch (err) {
      console.error("❌ Error al cargar eventos:", err);
      notify("Error al cargar eventos", "error");
      return [];
    }
  }

  // === Inicializar FullCalendar ===
  async function initCalendar() {
    const eventos = await fetchEventos();

    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      locale: "es",
      height: "auto",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
      events: eventos,
      editable: canEdit,
      selectable: canEdit,

      // Crear evento
      dateClick: async (info) => {
        if (!canEdit) return;
        const titulo = prompt("Ingrese título del evento:")?.trim();
        if (!titulo) return;

        try {
          const { data, error } = await supabase
            .from("eventos")
            .insert([
              {
                titulo,
                fecha_inicio: info.dateStr, // YYYY-MM-DD
                all_day: true,
              },
            ])
            .select()
            .single();

          if (error) throw error;

          calendar.addEvent({
            id: data.id,
            title: data.titulo,
            start: data.fecha_inicio,
            allDay: data.all_day,
          });

          notify("Evento agregado correctamente", "success");
        } catch (err) {
          console.error("❌ Error al guardar:", err);
          notify("Error al guardar evento", "error");
        }
      },

      // Editar evento (mover/redimensionar)
      eventChange: async (info) => {
        if (!canEdit) return;
        try {
          const { error } = await supabase
            .from("eventos")
            .update({
              fecha_inicio: info.event.start
                ? info.event.start.toISOString()
                : null,
              fecha_fin: info.event.end
                ? info.event.end.toISOString()
                : null,
              all_day: info.event.allDay,
            })
            .eq("id", info.event.id);

          if (error) throw error;
          notify("Evento actualizado", "success");
        } catch (err) {
          console.error("❌ Error al actualizar:", err);
          notify("Error al actualizar evento", "error");
        }
      },

      // Eliminar evento
      eventClick: async (info) => {
        if (!canEdit) {
          alert(`📌 Evento: ${info.event.title}`);
          return;
        }
        if (!confirm(`¿Eliminar evento "${info.event.title}"?`)) return;

        try {
          const { error } = await supabase
            .from("eventos")
            .delete()
            .eq("id", info.event.id);

          if (error) throw error;
          info.event.remove();
          notify("Evento eliminado", "success");
        } catch (err) {
          console.error("❌ Error al eliminar:", err);
          notify("Error al eliminar evento", "error");
        }
      },
    });

    calendar.render();
  }

  initCalendar();
});