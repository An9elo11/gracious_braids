let selectedDate = null;
let selectedTime = null;

document.addEventListener('DOMContentLoaded', async function () {

    const calendarEl = document.getElementById('calendar');
    if(!calendarEl) return; // empêche erreur sur autres pages

    const calendar = new FullCalendar.Calendar(calendarEl, {

        initialView: 'timeGridWeek',
        selectable: true,

        // Header avec navigation et vue
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
        },

        // Affichage des heures
        slotMinTime: '08:00:00',
        slotMaxTime: '20:00:00',
        slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        },

        businessHours: {
            daysOfWeek: [1,2,3,4,5,6],
            startTime: '09:00',
            endTime: '18:00'
        },

        // Sélection d’un créneau
        select: function(info) {
            selectedDate = info.startStr.split("T")[0];
            selectedTime = info.startStr.split("T")[1].substring(0,5);

            localStorage.setItem("selectedDate", selectedDate);
            localStorage.setItem("selectedTime", selectedTime);

            alert(`Créneau choisi : ${selectedDate} ${selectedTime}`);
        },

        // Styles par défaut pour les événements
        eventBackgroundColor: '#6c5ce7',
        eventBorderColor: '#341f97',
        eventTextColor: '#ffffff'
    });

    calendar.render();
    loadReservations(calendar);
});

// Fonction pour afficher les réservations existantes
async function loadReservations(calendar){
    const { data } = await supabaseClient
        .from('reservations')
        .select('*');

    data.forEach(res => {
        calendar.addEvent({
            start: res.appointment_date + "T" + res.appointment_time,
            end: res.appointment_date + "T" + add30min(res.appointment_time),
            display: 'background',
            backgroundColor: '#d63031', // rouge pour créneau occupé
            borderColor: '#b71c1c'
        });
    });
}

// Ajouter 30 minutes à l’heure de fin
function add30min(time){
    let [h,m] = time.split(":");
    let date = new Date();
    date.setHours(h);
    date.setMinutes(Number(m) + 30);
    return date.toTimeString().substring(0,5);
}
