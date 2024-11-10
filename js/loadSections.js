// Sample static data for testing
const destinationsData = [
    {
        title: "Tierra del Fuego, Argentina",
        description: "Explore the rugged landscapes of Tierra del Fuego, where dramatic coastlines meet pristine wilderness. Perfect for adventurers seeking solitude.",
        imageUrl: "images/tierra_del_fuego.jpg"
    },
    {
        title: "Svaneti, Georgia",
        description: "Hidden in the Caucasus mountains, Svaneti offers stunning scenery and ancient towers. A true hidden gem for cultural and nature enthusiasts.",
        imageUrl: "images/svaneti.jpg"
    },
    {
        title: "Lofoten Islands, Norway",
        description: "Famous for its dramatic peaks and picturesque villages, the Lofoten Islands are perfect for those looking to experience Norway’s wild beauty.",
        imageUrl: "images/lofoten.jpg"
    },
    {
        title: "Faroe Islands, Denmark",
        description: "Remote and unspoiled, the Faroe Islands boast breathtaking landscapes and a unique cultural heritage. Ideal for those seeking a peaceful escape.",
        imageUrl: "images/faroe_islands.jpg"
    }
];

// Dynamically load destinations into the page
function loadDestinations() {
    const container = document.querySelector("main"); // Ensure this matches the main container
    if (!container) {
        console.error("Container for dynamic sections not found!");
        return;
    }

    destinationsData.forEach((destination, index) => {
        const sectionElement = document.createElement("section");
        sectionElement.className = "destination";

        const imageElement = document.createElement("img");
        imageElement.src = destination.imageUrl;
        imageElement.alt = destination.title;

        const contentElement = document.createElement("div");
        const titleElement = document.createElement("h2");
        titleElement.textContent = destination.title;

        const descriptionElement = document.createElement("p");
        descriptionElement.textContent = destination.description;

        contentElement.appendChild(titleElement);
        contentElement.appendChild(descriptionElement);

        // Alternate layout based on index for left-right alignment
        if (index % 2 === 0) {
            sectionElement.appendChild(imageElement);
            sectionElement.appendChild(contentElement);
        } else {
            sectionElement.appendChild(contentElement);
            sectionElement.appendChild(imageElement);
        }

        container.appendChild(sectionElement);
    });
}

// Run loadDestinations on page load
document.addEventListener("DOMContentLoaded", loadDestinations);
