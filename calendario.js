document.addEventListener("DOMContentLoaded", async function () {
  const toggleBtn = document.getElementById("toggle-calendario");
  const calendarioContainer = document.getElementById("calendario-container");
  const calendarEl = document.getElementById("calendar");

  // 🔔 Notificación rápida
  function notify(msg) {
    console.log("🔔 " + msg);
    // 👉 Aquí luego se puede cambiar por un toast bonito
  }

  // 🔽 Validar existencia de elementos
  if (toggleBtn && calendarioContainer) {
    toggleBtn.addEventListener("click", () => {
      if (calendarioContainer.style.display === "none" || calendarioContainer.style.display === "") {
        calendarioContainer.style.display = "block";
        toggleBtn.textContent = "📅 Ocultar Calendario de Actividades";
      } else {
        calendarioContainer.style.display = "none";
        toggleBtn.textContent = "📅 Ver Calendario de Actividades";
      }
    });
  } else {
    console.warn("⚠️ toggle-calendario o calendario-container no encontrado");
  }

  if (!calendarEl) {
    console.error("❌ No se encontró el contenedor del calendario (#calendar)");
    return;
  }

  // ================== Cargar eventos desde Supabase ==================
  async function fetchEventos() {
    try {
      const { data, error } = await supabase
        .from("eventos")
        .select("id, titulo, fecha_inicio, fecha_fin, all_day");

      if (error) throw error;

      return data.map(evt => {
        const eventObj = {
          id: evt.id,
          title: evt.titulo,
          start: evt.fecha_inicio,
          allDay: evt.all_day
        };
        if (evt.fecha_fin) eventObj.end = evt.fecha_fin;
        return eventObj;
      });
    } catch (err) {
      console.error("❌ Error al cargar eventos:", err.message);
      notify("Error al cargar eventos");
      return [];
    }
  }

  const eventos = await fetchEventos();

  // ================== Inicializar FullCalendar ==================
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "es",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    events: eventos,
    editable: true,
    selectable: true,

    // Crear evento
    dateClick: async function (info) {
      const titulo = prompt("Ingrese título del evento:")?.trim();
      if (!titulo) return;

      try {
        const { data, error } = await supabase
          .from("eventos")
          .insert([{
            titulo: titulo,
            fecha_inicio: new Date(info.dateStr).toISOString(),
            all_day: true
          }])
          .select()
          .single();

        if (error) throw error;

        calendar.addEvent({
          id: data.id,
          title: data.titulo,
          start: data.fecha_inicio,
          allDay: data.all_day
        });

        notify("✅ Evento agregado correctamente");
      } catch (err) {
        console.error("❌ Error al guardar en Supabase:", err.message);
        notify("Error al guardar evento");
      }
    },

    // Editar evento (mover o redimensionar)
    eventChange: async function (info) {
      try {
        const { error } = await supabase
          .from("eventos")
          .update({
            fecha_inicio: info.event.start ? info.event.start.toISOString() : null,
            fecha_fin: info.event.end ? info.event.end.toISOString() : null,
            all_day: info.event.allDay
          })
          .eq("id", info.event.id);

        if (error) throw error;
        notify("✅ Evento actualizado");
      } catch (err) {
        console.error("❌ Error al actualizar evento:", err.message);
        notify("Error al actualizar evento");
      }
    },

    // Eliminar evento
    eventClick: async function (info) {
      if (!confirm(`¿Eliminar evento "${info.event.title}"?`)) return;

      try {
        const { error } = await supabase
          .from("eventos")
          .delete()
          .eq("id", info.event.id);

        if (error) throw error;
        info.event.remove();
        notify("🗑️ Evento eliminado");
      } catch (err) {
        console.error("❌ Error al eliminar evento:", err.message);
        notify("Error al eliminar evento");
      }
    }
  });

  calendar.render();
});
