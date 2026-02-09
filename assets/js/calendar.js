let selectedDate = null;
let selectedTime = null;
let previewEvent = null; // empêche empilement visuel

document.addEventListener('DOMContentLoaded', async function () {

    const calendarEl = document.getElementById('calendar');
    if(!calendarEl) return;

    const isMobile = window.innerWidth <= 768;

    window.calendar = new FullCalendar.Calendar(calendarEl, {

        initialView: isMobile ? 'timeGridDay' : 'timeGridWeek',

        selectable: true,
        selectMirror: true,
        selectLongPressDelay: 250,

        datesSet() {
            setTimeout(() => window.calendar.updateSize(), 100);
        },

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

        select(info) {

            const duration = Number(localStorage.getItem("selectedStyleDuration"));

            if(!duration){
                alert("Veuillez choisir une coiffure avant.");
                window.calendar.unselect();
                return;
            }

            selectedDate = info.startStr.split("T")[0];
            selectedTime = info.startStr.split("T")[1].substring(0,5);

            localStorage.setItem("selectedDate", selectedDate);
            localStorage.setItem("selectedTime", selectedTime);

            const endDate = addMinutes(info.start, duration);

            // Supprimer ancienne preview
            if(previewEvent){
                previewEvent.remove();
            }

            previewEvent = window.calendar.addEvent({
                start: info.start,
                end: endDate,
                display: 'background',
                backgroundColor: '#6c5ce7'
            });

            alert(`Créneau choisi : ${selectedDate} ${selectedTime} (${duration} min)`);
        },

        eventBackgroundColor: '#6c5ce7',
        eventBorderColor: '#341f97',
        eventTextColor: '#ffffff',

        headerToolbar: {
            left: 'today',
            center: 'title',
            right: 'prev,next'
        },

        height: 'auto'
    });

    window.calendar.render();
    loadReservations(window.calendar);
});

window.addEventListener("resize", () => {
    if(window.calendar){
        window.calendar.updateSize();
    }
});


// 🔹 Charger réservations existantes
async function loadReservations(calendar){

    const { data, error } = await supabaseClient
        .from('reservations')
        .select('*');

    if(error || !data) return;

    data.forEach(res => {

        if(!res.duration) return;

        const start = new Date(`${res.appointment_date}T${res.appointment_time}`);
        const end = addMinutes(start, res.duration);

        calendar.addEvent({
            start,
            end,
            display: 'background',
            backgroundColor: '#d63031',
            borderColor: '#b71c1c'
        });
    });
}


// 🔹 Ajouter X minutes
function addMinutes(date, minutes){
    const newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() + Number(minutes));
    return newDate;
}
