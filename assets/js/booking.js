document.addEventListener("DOMContentLoaded", () => {

    let selectedStyleId = localStorage.getItem("selectedStyleId");
    let selectedStyleImage = localStorage.getItem("selectedStyleImage");
    let selectedStyleDuration = Number(localStorage.getItem("selectedStyleDuration"));

    const display = document.getElementById("selected-style-display");

    // Ajustement calendrier si bloc change taille
    if(display){
        const resizeObserver = new ResizeObserver(() => {
            if(window.calendar){
                window.calendar.updateSize();
            }
        });
        resizeObserver.observe(display);
    }

    // Affichage coiffure choisie
    if(display && selectedStyleId){

        display.innerHTML = `
            <h3>Coiffure choisie :</h3>
            <img src="${selectedStyleImage}" width="150">
            <p>${selectedStyleId}</p>
            <p><strong>Durée :</strong> ${selectedStyleDuration || 0} min</p>
        `;

        setTimeout(() => {
            if(window.calendar){
                window.calendar.updateSize();
            }
        }, 100);
    }

    const form = document.getElementById("booking-form");
    if(!form) return;

    form.addEventListener("submit", async function(e){

        e.preventDefault();

        const selectedDate = localStorage.getItem("selectedDate");
        const selectedTime = localStorage.getItem("selectedTime");

        if(!selectedDate || !selectedTime){
            alert("Choisissez un créneau");
            return;
        }

        if(!selectedStyleId || !selectedStyleDuration){
            alert("Choisissez une coiffure");
            return;
        }

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;

        try {

            // 🔍 Vérifier chevauchement
            const { data: reservations, error } = await supabaseClient
                .from("reservations")
                .select("*")
                .eq("appointment_date", selectedDate);

            if(error) throw error;

            const newStart = new Date(`${selectedDate}T${selectedTime}`);
            const newEnd = new Date(newStart);
            newEnd.setMinutes(newEnd.getMinutes() + selectedStyleDuration);

            for(const r of reservations){

                if(!r.duration) continue;

                const start = new Date(`${r.appointment_date}T${r.appointment_time}`);
                const end = new Date(start);
                end.setMinutes(end.getMinutes() + r.duration);

                if(newStart < end && newEnd > start){
                    alert("Ce créneau chevauche une réservation existante.");
                    return;
                }
            }

            // ➕ Ajouter réservation
            const { error: insertError } = await supabaseClient
                .from("reservations")
                .insert([{
                    name,
                    email,
                    phone,
                    hairstyle_id: selectedStyleId,
                    appointment_date: selectedDate,
                    appointment_time: selectedTime,
                    duration: selectedStyleDuration
                }]);

            if(insertError) throw insertError;

            // Envoyer email de confirmation
            const { data, error: emailError } =
                await supabaseClient.functions.invoke("send-booking-email", {
                    body: {
                        name,
                        email,
                        date: selectedDate,
                        time: selectedTime,
                        duration: selectedStyleDuration,
                        hairstyle: selectedStyleId,
                        image: selectedStyleImage
                    }
                });

            if(emailError){
                console.error("Erreur email :", emailError);
            }

            alert("Réservation confirmée !");

            localStorage.removeItem("selectedDate");
            localStorage.removeItem("selectedTime");

            location.reload();

        } catch(err){
            console.error(err);
            alert("Erreur lors de la réservation.");
        }
    });
});
