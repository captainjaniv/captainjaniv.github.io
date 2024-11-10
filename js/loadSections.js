const GEO_DB_API_KEY = "5931b2bb47msh78700b432711641p187d55jsncc429db2ba40";  // Replace with your GeoDB API key
const UNSPLASH_ACCESS_KEY = "tcJ3Enh1Hy6wLC1X3bziB0Rc2gZlKLPEHwy4YOPvGYQ";  // Replace with your Unsplash API key

// Fetch and render sections faster using async functions
(async function loadSections() {
    try {
        const response = await fetch('sectionsData.json');
        const sectionsData = await response.json();

        // Get the container in which sections will be rendered
        const container = document.getElementById('dynamic-sections');
        if (!container) return console.error("Container for dynamic sections not found!");

        // Load and append sections in parallel for better performance
        await Promise.all(sectionsData.map(async (section) => {
            const sectionElement = document.createElement('section');
            sectionElement.className = 'dynamic-section';

            const imageElement = document.createElement('img');
            imageElement.src = await fetchImage(section.query); // Fetch image asynchronously
            imageElement.alt = section.title;

            const titleElement = document.createElement('h2');
            titleElement.textContent = section.title;

            const descriptionElement = document.createElement('p');
            descriptionElement.textContent = section.description;

            const buttonElement = document.createElement('a');
            buttonElement.href = section.link;
            buttonElement.textContent = "Learn More";
            buttonElement.className = "section-button";

            sectionElement.append(imageElement, titleElement, descriptionElement, buttonElement);
            container.appendChild(sectionElement);
        }));
    } catch (error) {
        console.error("Error loading sections:", error);
    }
})();

// Fetch an image asynchronously for a given query
async function fetchImage(query) {
    const response = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=YOUR_UNSPLASH_ACCESS_KEY`);
    const data = await response.json();
    return data.urls.small;
}

function renderDestination(destination) {
    const container = document.querySelector("main");
    if (!container) return console.error("Main container not found");

    // Create a section element for each destination
    const sectionElement = document.createElement("section");
    sectionElement.className = "destination";

    // Image element
    const imageElement = document.createElement("img");
    imageElement.src = destination.imageUrl;
    imageElement.alt = destination.title;

    // Content element
    const contentElement = document.createElement("div");
    const titleElement = document.createElement("h2");
    titleElement.textContent = destination.title;

    const descriptionElement = document.createElement("p");
    descriptionElement.textContent = destination.description;

    contentElement.appendChild(titleElement);
    contentElement.appendChild(descriptionElement);

    // Alternate layout based on index for left-right alignment
    sectionElement.appendChild(imageElement);
    sectionElement.appendChild(contentElement);

    // Append section to main container
    container.appendChild(sectionElement);
}

// Load destinations when the page loads
document.addEventListener("DOMContentLoaded", fetchDestinations);
