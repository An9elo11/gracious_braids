let selectedDate = null;
let selectedTime = null;
let previewEvent = null;

document.addEventListener('DOMContentLoaded', function () {

    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const isMobile = window.innerWidth <= 768;

    window.calendar = new FullCalendar.Calendar(calendarEl, {

        initialView: isMobile ? 'timeGridDay' : 'timeGridWeek',

        locale: 'fr',
        selectable: true,
        selectMirror: false,
        selectLongPressDelay: 250,

        // 🔥 Granularité fine
        slotDuration: '00:30:00',
        snapDuration: '00:30:00',

        slotMinTime: '08:00:00',
        slotMaxTime: '22:00:00',

        slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        },

        businessHours: [
            {
                daysOfWeek: [3,4],
                startTime: '09:00',
                endTime: '18:00'
            },
            {
                daysOfWeek: [3,5],
                startTime: '08:30',
                endTime: '22:00'
            }
        ],

        // 🔥 BLOQUE TOUT CHEVAUCHEMENT ICI
        selectAllow: function(selectInfo) {

            const duration = Number(localStorage.getItem("selectedStyleDuration"));
            if (!duration) return false;

            const newStart = selectInfo.start;
            const newEnd = new Date(newStart);
            newEnd.setMinutes(newEnd.getMinutes() + duration);

            // 🔹 Vérifie horaires business
            if (!isWithinBusinessHours(newStart, newEnd)) {
                return false;
            }

            // 🔹 Vérifie chevauchement
            const events = window.calendar.getEvents();

            for (const event of events) {

                if (event.id === "preview") continue;

                const existingStart = event.start;
                const existingEnd = event.end;

                // condition mathématique de chevauchement
                if (newStart < existingEnd && newEnd > existingStart) {
                    return false;
                }
            }

            return true;
        },

        // 🔥 Création du bloc dynamique
        select(info) {

            const duration = Number(localStorage.getItem("selectedStyleDuration"));
            if (!duration) {
                alert("Veuillez choisir une coiffure.");
                window.calendar.unselect();
                return;
            }

            const start = info.start;
            const end = new Date(start);
            end.setMinutes(end.getMinutes() + duration);

            selectedDate = start.toISOString().split("T")[0];
            selectedTime = start.toTimeString().substring(0,5);

            localStorage.setItem("selectedDate", selectedDate);
            localStorage.setItem("selectedTime", selectedTime);

            if (previewEvent) {
                previewEvent.remove();
            }

            previewEvent = window.calendar.addEvent({
                id: "preview",
                title: "Votre créneau",
                start,
                end,

                display: "background",
                overlap: true,

                backgroundColor: '#6c5ce7',
                borderColor: '#341f97',
                textColor: '#ffffff'
            });

            window.calendar.unselect();
        },

        headerToolbar: {
            left: 'title',
            right: 'prev,next'
        },

        height: 'auto'
    });

    window.calendar.render();
    loadReservations(window.calendar);
});


// 🔥 Charger réservations
window.loadReservations = async function(calendar) {

    const { data, error } = await supabaseClient
        .from('reservations')
        .select('*');

    console.log("Réservations chargées :", data);

    if (error || !data) return;

    data.forEach(res => {

        if (!res.duration) return;

        const start = new Date(`${res.appointment_date}T${res.appointment_time}:00`);
        const end = addMinutes(start, res.duration); //L'erreur est peut-être qq part ici, disparité avec addMinutes.

        calendar.addEvent({
            id: "reservation-" + res.id,
            title: `Réservé`,
            start,
            end,
            backgroundColor: '#e74c3c',
            borderColor: '#c0392b',
            textColor: '#ffffff'
        });
    });
}


// 🔧 Vérifie horaires business
function isWithinBusinessHours(start, end) {

    const day = start.getDay();
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    if (day === 4) {
        return startMinutes >= 9*60 && endMinutes <= 18*60;
    }

    if (day === 3 || day === 5) {

        if (startMinutes >= (8*60+30) && endMinutes <= 12*60)
            return true;

        if (startMinutes >= (12*60+30) && endMinutes <= 22*60)
            return true;
    }

    return false;
}

function addMinutes(date, minutes) {
    const newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() + Number(minutes));
    return newDate;
}
