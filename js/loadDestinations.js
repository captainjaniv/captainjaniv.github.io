const GEO_DB_API_KEY = "5931b2bb47msh78700b432711641p187d55jsncc429db2ba40";
const UNSPLASH_ACCESS_KEY = "tcJ3Enh1Hy6wLC1X3bziB0Rc2gZlKLPEHwy4YOPvGYQ";
const GEO_DB_HOST = "wft-geo-db.p.rapidapi.com"

async function loadDestinations() {
    try {
        // Send request to fetch cities data
        const response = await fetch("https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=4", {
            method: "GET",
            headers: {
                "x-rapidapi-key": GEO_DB_API_KEY,
                "x-rapidapi-host": GEO_DB_HOST
            }
        });        

        // Check if the response is ok (status 200-299)
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }
        
        const cities = await response.json();
        
        // Ensure `data` exists and is iterable
        if (!cities.data || !Array.isArray(cities.data)) {
            throw new Error("Unexpected response format: 'data' is missing or not an array");
        }

        const container = document.querySelector("main");
        if (!container) {
            console.error("Main container not found");
            return;
        }

        // Process each city in the response
        for (const city of cities.data) {
            const imageUrl = await fetchUnsplashImage(city.city);
            const section = document.createElement("section");
            section.className = "destination";
            section.innerHTML = `
                <img src="${imageUrl}" alt="${city.city}">
                <div>
                    <h2>${city.city}</h2>
                    <p>Discover ${city.city}, a hidden gem perfect for unique travel experiences.</p>
                </div>
            `;
            container.appendChild(section);
        }
    } catch (error) {
        console.error("Error loading destinations:", error);
    }
}

// Function to fetch a random image for a city from Unsplash
async function fetchUnsplashImage(query) {
    try {
        const response = await fetch(`https://api.unsplash.com/photos/random?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}`);
        const data = await response.json();
        
        if (data && data.urls && data.urls.small) {
            return data.urls.small;
        } else {
            console.warn(`No image found for ${query}. Using default image.`);
            return "images/default.jpg"; // Placeholder image if no result found
        }
    } catch (error) {
        console.error("Error fetching image:", error);
        return "https://via.placeholder.com/150"; // תמונה ממקור חיצוני כתחליף
    }
}


// Ensure loadDestinations runs after DOM is fully loaded
document.addEventListener("DOMContentLoaded", loadDestinations);