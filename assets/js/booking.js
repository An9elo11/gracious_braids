document.addEventListener("DOMContentLoaded", () => {

    let selectedStyleId = localStorage.getItem("selectedStyleId");
    let selectedStyleImage = localStorage.getItem("selectedStyleImage");

    const display = document.getElementById("selected-style-display");

    if(display && selectedStyleId && selectedStyleImage){

        display.innerHTML = `
            <h3>Coiffure choisie :</h3>
            <img src="${selectedStyleImage}" width="150">
            <p>${selectedStyleId}</p>
        `;
    }

    const form = document.getElementById("booking-form");

    if(!form) return;

    form.addEventListener("submit", async function(e){

        e.preventDefault();

        let selectedDate = localStorage.getItem("selectedDate");
        let selectedTime = localStorage.getItem("selectedTime");

        if(!selectedDate || !selectedTime){
            alert("Choisissez un créneau");
            return;
        }

        if(!selectedStyleId){
            alert("Choisissez une coiffure");
            return;
        }

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        const service = document.getElementById("service").value;

        const { error } = await supabaseClient
            .from("reservations")
            .insert([{
                name,
                email,
                phone,
                service,
                hairstyle_id: selectedStyleId,
                appointment_date: selectedDate,
                appointment_time: selectedTime
            }]);

        if(error){
            alert("Erreur réservation");
        } else {

            const { data, error: functionError } = await supabaseClient.functions.invoke(
                "send-booking-email",
                {
                    body: {
                        name,
                        email,
                        date: selectedDate,
                        time: selectedTime,
                        hairstyle: selectedStyleId
                    }
                }
            );

            console.log("Function response:", data);
            console.log("Function error:", functionError);


            localStorage.removeItem("selectedStyleId");
            localStorage.removeItem("selectedStyleImage");
            localStorage.removeItem("selectedDate");
            localStorage.removeItem("selectedTime");

            alert("Réservation confirmée !");
            location.reload();
        }

    });

});
