let selectedDate = null;
let selectedTime = null;

document.addEventListener('DOMContentLoaded', async function () {

    const calendarEl = document.getElementById('calendar');

    if(!calendarEl) return; // empêche erreur sur autres pages

    const calendar = new FullCalendar.Calendar(calendarEl, {

        initialView: 'timeGridWeek',
        selectable: true,

        businessHours: {
            daysOfWeek: [1,2,3,4,5,6],
            startTime: '09:00',
            endTime: '18:00'
        },

        select: function(info) {

            selectedDate = info.startStr.split("T")[0];
            selectedTime = info.startStr.split("T")[1].substring(0,5);

            localStorage.setItem("selectedDate", selectedDate);
            localStorage.setItem("selectedTime", selectedTime);

            alert("Créneau choisi : " + selectedDate + " " + selectedTime);
        }

    });

    calendar.render();
    loadReservations(calendar);
});

async function loadReservations(calendar){

    const { data } = await supabaseClient
        .from('reservations')
        .select('*');

    data.forEach(res => {

        calendar.addEvent({
            start: res.appointment_date + "T" + res.appointment_time,
            end: res.appointment_date + "T" + add30min(res.appointment_time),
            display: 'background'
        });

    });
}

function add30min(time){

    let [h,m] = time.split(":");
    let date = new Date();
    date.setHours(h);
    date.setMinutes(Number(m) + 30);

    return date.toTimeString().substring(0,5);
}
