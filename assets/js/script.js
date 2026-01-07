function afficherPrix(taille){
    const sections = ["SM", "AM"];

    sections.forEach(id => {
        const section = document.getElementById(id)
        const arrow = document.querySelector(`#aff${id} .arrow`);


        if(id === taille) {
            const isVisible = section.style.display === "block"
            section.style.display = isVisible ? "none" : "block";
            arrow.classList.toggle("active", !isVisible);
        }else{
            section.style.display = "none";
            const otherArrow = document.querySelector(`#aff${id} .arrow`);
            if(otherArrow) otherArrow.classList.remove("active");
        }
    });
}

document.getElementById("affSM").addEventListener("click", () => afficherPrix("SM"));
document.getElementById("affAM").addEventListener("click", () => afficherPrix("AM"));

