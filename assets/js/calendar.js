let selectedDate = null;
let selectedTime = null;
let previewEvent = null;

const WORK_SCHEDULE = {
    3: [ // mercredi
        { start: "08:30", end: "12:00" },
        { start: "12:30", end: "16:30" },
        { start: "16:30", end: "22:00" }
    ],
    4: [ // jeudi
        { start: "09:00", end: "13:00" },
        { start: "13:00", end: "18:00" }
    ],
    5: [ // vendredi
        { start: "08:30", end: "12:00" },
        { start: "12:30", end: "16:30" },
        { start: "16:30", end: "22:00" }
    ]
};

document.addEventListener('DOMContentLoaded', function () {

    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const isMobile = window.innerWidth <= 768;

    window.calendar = new FullCalendar.Calendar(calendarEl, {

        initialView: isMobile ? 'timeGridWeek' : 'timeGridWeek',

        locale: 'fr',
        selectable: false,
        selectMirror: false,
        selectLongPressDelay: 250,

        // 🔥 Granularité fine
        slotDuration: '01:00:00',
        snapDuration: '01:00:00',

        slotMinTime: '08:00:00',
        slotMaxTime: '22:00:00',

        slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        },

        /*businessHours: [
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
        ],*/

        businessHours: [
            {
                daysOfWeek: [3,5],
                startTime: '08:30',
                endTime: '22:00'
            },
            {
                daysOfWeek: [4],
                startTime: '09:00',
                endTime: '18:00'
            }
        ],

        businessHoursColor: "#e0e0e0",

        // 🔥 BLOQUE TOUT CHEVAUCHEMENT ICI
        /*selectAllow: function(selectInfo) {

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
        },*/

        // 🔥 Création du bloc dynamique
        /*select(info) {

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

                display: "block",
                overlap: true,

                backgroundColor: '#6c5ce7',
                borderColor: '#341f97',
                textColor: '#ffffff'
            });

            window.calendar.unselect();
        },*/

        /*eventClick: function(info) {

            const event = info.event;

            // 🔥 Si c'est un slot disponible
            if (event.id.startsWith("slot-")) {

                const start = event.start;
                const duration = Number(localStorage.getItem("selectedStyleDuration"));

                const end = new Date(start);
                end.setMinutes(end.getMinutes() + duration);

                selectedDate = start.toISOString().split("T")[0];
                selectedTime = start.toTimeString().substring(0,5);

                localStorage.setItem("selectedDate", selectedDate);
                localStorage.setItem("selectedTime", selectedTime);

                calendar.getEvents().forEach(e => {
                    if (e.id.startsWith("slot-")) {
                        e.setProp("display", "block");
                    }
                });

                if (previewEvent) previewEvent.remove();

                // 🔥 supprimer le slot vert cliqué
                event.setProp("display", "none");

                previewEvent = window.calendar.addEvent({
                    id: "preview",
                    title: "Votre créneau",
                    start,
                    end,
                    display: "block",
                    backgroundColor: '#6c5ce7',
                    borderColor: '#341f97',
                    textColor: '#fff'
                });
            }
        },*/

        eventStartEditable: false,
        eventDurationEditable: false,
        eventOverlap: false,

        dateClick: function(info) {

            const selectedDay = formatLocalDate(info.date);
            localStorage.setItem("selectedDate", selectedDay);

            // 🔥 FORMAT AFFICHAGE JOUR
            const options = { weekday: 'long', day: 'numeric', month: 'long' };
            const formattedLabel = new Date(info.date).toLocaleDateString('fr-FR', options);

            document.getElementById("selected-day-label").innerText =
                "Créneaux pour " + formattedLabel;

            // 🔥 RESET
            document.querySelectorAll(".fc-col-highlight").forEach(el =>
                el.classList.remove("fc-col-highlight")
            );

            // 🔥 TROUVER LA COLONNE
            const colIndex = info.dayEl.cellIndex + 1;

            document.querySelector(`.fc-col-header-cell:nth-child(${colIndex})`)
                ?.classList.add("fc-col-highlight");

            document.querySelectorAll(`.fc-timegrid-col:nth-child(${colIndex})`)
                .forEach(el => el.classList.add("fc-col-highlight"));

            // 🔥 SLOTS
            const slots = getAvailableSlots(window.calendar);
            const filtered = slots.filter(slot =>
                formatLocalDate(slot) === selectedDay
            );

            renderSlots(filtered);

            document.getElementById("slots-container")
                ?.scrollIntoView({ behavior: "smooth" });
        },

        datesSet: function() {

            const selectedDay = formatLocalDate(window.calendar.getDate());

            localStorage.setItem("selectedDate", selectedDay);

            setTimeout(() => {
                displayAvailableSlots(window.calendar);
            }, 0);

            const slots = getAvailableSlots(window.calendar);

            const filtered = slots.filter(slot =>
                formatLocalDate(slot) === selectedDay
            );

            renderSlots(filtered);

            const options = { weekday: 'long', day: 'numeric', month: 'long' };
            const formattedLabel = new Date(window.calendar.getDate()).toLocaleDateString('fr-FR', options);

            document.getElementById("selected-day-label").innerText =
                "Créneaux pour " + formattedLabel;
        },

        headerToolbar: {
            left: 'title',
            right: 'prev,next'
        },

        height: 'auto'
    });

    window.calendar.render();

    (async () => {
        await loadReservations(window.calendar);

        displayAvailableSlots(window.calendar);
    })();
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


function isWithinSchedule(start, end) {

    const day = start.getDay();
    const schedules = WORK_SCHEDULE[day];

    if (!schedules) return false;

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    for (const period of schedules) {

        const [sh, sm] = period.start.split(":").map(Number);
        const [eh, em] = period.end.split(":").map(Number);

        const periodStart = sh * 60 + sm;
        const periodEnd = eh * 60 + em;

        if (startMinutes >= periodStart && endMinutes <= periodEnd) {
            return true;
        }
    }

    return false;
}

function addMinutes(date, minutes) {
    const newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() + Number(minutes));
    return newDate;
}

function formatLocalDate(date) {
    return date.getFullYear() + "-" +
        String(date.getMonth()+1).padStart(2,'0') + "-" +
        String(date.getDate()).padStart(2,'0');
}

function getAvailableSlots(calendar) {

    const duration = Number(localStorage.getItem("selectedStyleDuration"));
    if (!duration) return [];

    const slots = [];

    const view = calendar.view;
    const startDate = new Date(view.currentStart);
    const endDate = new Date(view.currentEnd);

    for (let day = new Date(startDate); day < endDate; day.setDate(day.getDate() + 1)) {

        const dayOfWeek = day.getDay();
        const schedules = WORK_SCHEDULE[dayOfWeek];

        if (!schedules) continue; // jour fermé

        for (const period of schedules) {

            const periodStart = setTime(day, period.start);
            const periodEnd = setTime(day, period.end);

            for (let current = new Date(periodStart); current < periodEnd; current.setMinutes(current.getMinutes() + 30)) {

                const start = new Date(current);
                const end = new Date(current);
                end.setMinutes(end.getMinutes() + duration);

                // 🔥 Empêche de dépasser la fin du shift (TRÈS IMPORTANT)
                if (end > periodEnd) continue;

                const events = calendar.getEvents();
                let isOverlapping = false;

                for (const event of events) {

                    if (event.extendedProps?.isSlot) continue;
                    if (event.id === "preview") continue;

                    if (start < event.end && end > event.start) {
                        isOverlapping = true;
                        break;
                    }
                }

                if (isOverlapping) continue;

                slots.push(start);
            }
        }
    }

    return slots;
}

function renderSlots(slots) {

    const container = document.getElementById("slots-container");
    container.innerHTML = "";

    if (slots.length === 0) {
        container.innerHTML = "<p>Aucun créneau disponible</p>";
        return;
    }

    slots.forEach(slot => {

        const btn = document.createElement("button");

        const time = slot.toTimeString().substring(0,5);

        btn.innerText = time;
        btn.classList.add("slot-btn");

        btn.onclick = () => {

            selectedDate = formatLocalDate(slot);
            selectedTime = time;

            localStorage.setItem("selectedDate", selectedDate);
            localStorage.setItem("selectedTime", selectedTime);

            document.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
        };

        container.appendChild(btn);
    });
}

function displayAvailableSlots(calendar) {

    // 🔥 supprimer anciens blocs
    calendar.getEvents().forEach(event => {
        if (event.extendedProps?.isSlot) {
            event.remove();
        }
    });

    const ranges = getFreeRanges(calendar);

    ranges.forEach(range => {

        calendar.addEvent({
            id: "range-" + range.start.getTime(),
            start: range.start,
            end: range.end,
            display: "block",
            backgroundColor: "#2ecc71",
            overlap: false,
            extendedProps: { isSlot: true }
        });

    });
}

/*function groupSlotsIntoRanges(slots, duration) {

    if (slots.length === 0) return [];

    slots.sort((a, b) => a - b);

    const ranges = [];

    let rangeStart = slots[0];
    let prev = slots[0];

    for (let i = 1; i < slots.length; i++) {

        const current = slots[i];

        // 🔥 FIN du slot précédent (avec durée réelle)
        const prevEnd = new Date(prev);
        prevEnd.setMinutes(prevEnd.getMinutes() + duration);

        // 🔥 Si le prochain slot commence AVANT la fin → overlap → on coupe
        if (current < prevEnd) {

            const end = new Date(prev);
            end.setMinutes(end.getMinutes() + duration);

            ranges.push({ start: rangeStart, end });

            // 🔥 nouveau bloc
            rangeStart = current;
        }

        prev = current;
    }

    // 🔥 dernier bloc
    const end = new Date(prev);
    end.setMinutes(end.getMinutes() + duration);

    ranges.push({ start: rangeStart, end });

    return ranges;
}*/

function getFreeRanges(calendar) {

    const ranges = [];

    const view = calendar.view;
    const startDate = new Date(view.currentStart);
    const endDate = new Date(view.currentEnd);

    for (let day = new Date(startDate); day < endDate; day.setDate(day.getDate() + 1)) {

        const dayOfWeek = day.getDay();
        const schedules = WORK_SCHEDULE[dayOfWeek];

        if (!schedules) continue;

        for (const period of schedules) {

            let currentStart = setTime(day, period.start);
            const periodEnd = setTime(day, period.end);

            const events = calendar.getEvents()
                .filter(e => !e.extendedProps?.isSlot && e.id !== "preview")
                .sort((a, b) => a.start - b.start);

            for (const event of events) {

                // Si event hors période → skip
                if (event.end <= currentStart || event.start >= periodEnd) continue;

                // 🔥 Ajouter bloc libre avant réservation
                if (event.start > currentStart) {
                    ranges.push({
                        start: new Date(currentStart),
                        end: new Date(event.start)
                    });
                }

                // 🔥 avancer après la réservation
                currentStart = new Date(Math.max(currentStart, event.end));
            }

            // 🔥 ajouter fin de période libre
            if (currentStart < periodEnd) {
                ranges.push({
                    start: new Date(currentStart),
                    end: new Date(periodEnd)
                });
            }
        }
    }

    return ranges;
}

function setTime(date, timeStr) {
    const [h, m] = timeStr.split(":");
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d;
}