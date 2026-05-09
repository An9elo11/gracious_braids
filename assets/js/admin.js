const days = {
    0: "Dimanche",
    1: "Lundi",
    2: "Mardi",
    3: "Mercredi",
    4: "Jeudi",
    5: "Vendredi",
    6: "Samedi"
};

// =========================
// LOGIN
// =========================

document.addEventListener("DOMContentLoaded", () => {

    const loginBtn = document.getElementById("login-btn");
    const saveBtn = document.getElementById("save-btn");

    if (loginBtn) {
        loginBtn.addEventListener("click", login);
    }

    if (saveBtn) {
        saveBtn.addEventListener("click", saveAll);
    }

});

// =========================
// CONNEXION
// =========================

async function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error(error);
        alert(error.message);
        return;
    }

    await loadAdmin();
}

// =========================
// CHARGEMENT ADMIN
// =========================

async function loadAdmin() {

    document.getElementById("login-section").style.display = "none";
    document.getElementById("admin-section").style.display = "block";

    const { data, error } = await supabaseClient
        .from("availability")
        .select("*")
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

    if (error) {
        console.error(error);
        alert("Erreur chargement horaires");
        return;
    }

    console.log("Availability:", data);

    const container = document.getElementById("schedule-container");

    container.innerHTML = "";

    for (let day = 0; day <= 6; day++) {

        const daySlots = data.filter(
            slot => Number(slot.day_of_week) === day
        );

        const dayBlock = document.createElement("div");
        dayBlock.classList.add("day-block");

        // Titre
        const title = document.createElement("h2");
        title.innerText = days[day];
        dayBlock.appendChild(title);

        // Container des shifts
        const slotsContainer = document.createElement("div");

        // Aucun shift
        if (daySlots.length === 0) {

            const empty = document.createElement("p");
            empty.innerText = "Aucun shift";
            slotsContainer.appendChild(empty);
        }

        // Affichage shifts
        daySlots.forEach(slot => {

            const row = document.createElement("div");
            row.classList.add("slot-row");

            // Start
            const startInput = document.createElement("input");
            startInput.type = "time";
            startInput.value = slot.start_time.substring(0, 5);
            startInput.classList.add("start");
            startInput.dataset.id = slot.id;

            // End
            const endInput = document.createElement("input");
            endInput.type = "time";
            endInput.value = slot.end_time.substring(0, 5);
            endInput.classList.add("end");
            endInput.dataset.id = slot.id;

            // Delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.innerText = "Supprimer";

            deleteBtn.addEventListener("click", async () => {
                await deleteSlot(slot.id);
            });

            row.appendChild(startInput);
            row.appendChild(endInput);
            row.appendChild(deleteBtn);

            slotsContainer.appendChild(row);
        });

        dayBlock.appendChild(slotsContainer);

        // Bouton ajouter
        const addBtn = document.createElement("button");
        addBtn.type = "button";
        addBtn.innerText = "+ Ajouter un shift";

        addBtn.addEventListener("click", async () => {
            await addSlot(day);
        });

        dayBlock.appendChild(addBtn);

        // HR
        dayBlock.appendChild(document.createElement("hr"));

        container.appendChild(dayBlock);
    }
}

// =========================
// AJOUT SHIFT
// =========================

async function addSlot(day) {

    console.log("Ajout shift :", day);

    const { data, error } = await supabaseClient
        .from("availability")
        .insert([
            {
                day_of_week: day,
                start_time: "09:00:00",
                end_time: "17:00:00"
            }
        ])
        .select();

    if (error) {
        console.error(error);
        alert("Erreur ajout shift");
        return;
    }

    console.log("Shift ajouté :", data);

    await loadAdmin();
}

// =========================
// SUPPRESSION SHIFT
// =========================

async function deleteSlot(id) {

    console.log("Suppression shift :", id);

    const { error } = await supabaseClient
        .from("availability")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);
        alert("Erreur suppression shift");
        return;
    }

    await loadAdmin();
}

// =========================
// SAUVEGARDE
// =========================

async function saveAll() {

    const starts = document.querySelectorAll(".start");
    const ends = document.querySelectorAll(".end");

    try {

        for (let i = 0; i < starts.length; i++) {

            const id = starts[i].dataset.id;

            const startValue = starts[i].value;
            const endValue = ends[i].value;

            if (startValue >= endValue) {
                alert("Une heure de début est après l'heure de fin.");
                return;
            }

            const { error } = await supabaseClient
                .from("availability")
                .update({
                    start_time: startValue,
                    end_time: endValue
                })
                .eq("id", id);

            if (error) {
                throw error;
            }
        }

        alert("Horaires sauvegardés !");

    } catch (err) {

        console.error(err);
        alert("Erreur sauvegarde.");
    }
}