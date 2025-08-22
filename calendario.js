// ================== CALENDARIO DE ACTIVIDADES ==================
document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("toggle-calendario");
  const calendarioContainer = document.getElementById("calendario-container");

  // 🔽 Mostrar/ocultar calendario al hacer clic en el botón
  toggleBtn.addEventListener("click", () => {
    if (calendarioContainer.style.display === "none" || calendarioContainer.style.display === "") {
      calendarioContainer.style.display = "block";
      toggleBtn.textContent = "📅 Ocultar Calendario de Actividades";
    } else {
      calendarioContainer.style.display = "none";
      toggleBtn.textContent = "📅 Ver Calendario de Actividades";
    }
  });

  // ================== Inicializar FullCalendar ==================
  const calendarEl = document.getElementById("calendar");

  if (calendarEl) {
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      locale: "es",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
      events: [
        // 📌 Eventos de ejemplo
        {
          title: "Misa comunitaria",
          start: "2025-08-25T19:00:00",
        },
        {
          title: "Reunión Cáritas",
          start: "2025-08-28",
        },
      ],
      editable: true,
      selectable: true,
      dateClick: function (info) {
        const titulo = prompt("Ingrese título del evento:");
        if (titulo) {
          calendar.addEvent({
            title: titulo,
            start: info.date,
            allDay: true,
          });
        }
      },
    });

    calendar.render();
  }
});
