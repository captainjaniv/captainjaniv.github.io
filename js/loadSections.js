const GEO_DB_API_KEY = "5931b2bb47msh78700b432711641p187d55jsncc429db2ba40";  // Replace with your GeoDB API key
const UNSPLASH_ACCESS_KEY = "tcJ3Enh1Hy6wLC1X3bziB0Rc2gZlKLPEHwy4YOPvGYQ";  // Replace with your Unsplash API key

async function fetchDestinations() {
    try {
        // GeoDB API: Fetch less-touristic cities
        const geoDbResponse = await fetch("https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=4&minPopulation=10000&maxPopulation=50000", {
            method: "GET",
            headers: {
                "x-rapidapi-key": GEO_DB_API_KEY,
                "x-rapidapi-host": "wft-geo-db.p.rapidapi.com"
            }
        });
        const geoDbData = await geoDbResponse.json();

        // Load each destination with its image
        for (const city of geoDbData.data) {
            const cityName = city.city;

            // Fetch an image for the destination using Unsplash
            const imageUrl = await fetchUnsplashImage(cityName);

            // Render the destination
            renderDestination({
                title: cityName,
                description: `Explore ${cityName}, a unique and less-visited location. Perfect for travelers seeking new experiences.`,
                imageUrl: imageUrl
            });
        }
    } catch (error) {
        console.error("Error fetching destinations:", error);
    }
}

async function fetchUnsplashImage(query) {
    try {
        const unsplashResponse = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}`);
        const unsplashData = await unsplashResponse.json();
        return unsplashData.urls.small;
    } catch (error) {
        console.error("Error fetching image:", error);
        return "images/default.jpg";  // Fallback image if Unsplash API fails
    }
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
