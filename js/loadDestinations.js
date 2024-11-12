const GEO_DB_API_KEY = "5931b2bb47msh78700b432711641p187d55jsncc429db2ba40";
const UNSPLASH_ACCESS_KEY = "tcJ3Enh1Hy6wLC1X3bziB0Rc2gZlKLPEHwy4YOPvGYQ";
const GEO_DB_HOST = "wft-geo-db.p.rapidapi.com"

async function loadDestinations() {
    try {
        // בחירת נקודת התחלה אקראית לתוצאות 
        const randomOffset = Math.floor(Math.random() * 100); // למשל עד 100 תוצאות ראשונות

        // שליחת בקשה ל-GeoDB API לשליפת ערים
        const response = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?limit=6&offset=${randomOffset}`, {
            method: "GET",
            headers: {
                "x-rapidapi-key": GEO_DB_API_KEY,
                "x-rapidapi-host": GEO_DB_HOST
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const cities = await response.json();

        const overTouristedCities = ["Barcelona", "Venice", "Amsterdam", "Dubrovnik", "Reykjavik", "Florence", "Bruges", "Santorini", "Kyoto", "Prague", "Lisbon", "Dublin", "Siem Reap", "Havana", "Phuket", "Cusco", "Bali", "Mykonos", "Cancun", "Bern", "Bergen", "Bratislava", "Brussels", "Anseong", "Kuta", "Paris", "Vienna", "Budapest", "Copenhagen", "Salzburg"];
        const filteredCities = cities.data.filter(city => !overTouristedCities.includes(city.city));

        const container = document.querySelector("main");
        if (!container) {
            console.error("Main container not found");
            return;
        }

        for (const city of filteredCities) {
            const imageUrl = await fetchUnsplashImage(city.city);
            const description = await fetchCityDescription(city.city);
            const section = document.createElement("section");
            section.className = "destination";
            section.innerHTML = `
                <img src="${imageUrl}" alt="${city.city}">
                <div>
                    <h2>${city.city}</h2>
                    <p>${description}</p>
                </div>
            `;
            container.appendChild(section);
        }
    } catch (error) {
        console.error("Error loading destinations:", error);
    }
}

async function fetchCityDescription(cityName) {
    try {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cityName)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.extract || "No description available.";
    } catch (error) {
        console.error("Error fetching city description:", error);
        return "No description available.";
    }
}

async function fetchUnsplashImage(query) {
    try {
        const response = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}`);
        const data = await response.json();
        return data.urls.small || "images/default.jpg";
    } catch (error) {
        console.error("Error fetching image:", error);
        return "images/default.jpg";
    }
}

document.addEventListener("DOMContentLoaded", loadDestinations);
