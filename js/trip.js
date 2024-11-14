const transportPrices = {
    flight: 0.084, 
    boat: 0.05,
    train: 0.03,
    bus: 0.02,
    car: 0.04
};

function updateTripOptionField() {
    const tripOption = document.getElementById("tripOption").value;
    const tripOptionInput = document.getElementById("tripOptionInput");

    tripOptionInput.placeholder = tripOption === "days" ? "e.g., 2" : "e.g., 3";
}

// Location fetching
async function fetchLocation() {
    try {
        const response = await fetch("https://ipwhois.app/json/");
        const data = await response.json();
        const locationInput = document.getElementById("location");
        if (locationInput) {
            locationInput.value = `${data.city}, ${data.country}`;
        }
    } catch (error) {
        console.error("Location detection failed:", error);
        if (locationInput) {
            locationInput.placeholder = "Unable to detect location.";
        }
    }
}

async function loadCurrencies() {
    try {
        const response = await fetch("https://openexchangerates.org/api/currencies.json");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        const currencySelect = document.getElementById("currency");

        Object.entries(data).forEach(([currencyCode, currencyName]) => {
            const option = document.createElement("option");
            option.value = currencyCode;
            option.textContent = `${currencyCode} - ${currencyName}`;
            currencySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading currencies:", error);
    }
}

// Cache for coordinates
const cache = {};

async function getCoordinates(city) {
    if (cache[city]) return cache[city];

    let cityName = city.split(",")[0].trim();
    if (cityName.includes("-")) {
        cityName = cityName.split("-")[0].trim();
    }

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(cityName)}&format=json&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            cache[city] = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            return cache[city];
        } else {
            console.error(`City not found: ${cityName}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        return null;
    }
}

function haversineDistance(coords1, coords2) {
    const R = 6371;
    const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const dLon = (coords2.lon - coords1.lon) * Math.PI / 180;
    const lat1 = coords1.lat * Math.PI / 180;
    const lat2 = coords2.lat * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c;
}

async function calculateCost(from, to, transport) {
    try {
        const fromCoords = await getCoordinates(from);
        const toCoords = await getCoordinates(to);
        
        if (!fromCoords || !toCoords) {
            console.error(`Coordinates not found for ${from} or ${to}`);
            return null;
        }

        const distance = haversineDistance(fromCoords, toCoords);
        const pricePerKm = transportPrices[transport];
        return distance * pricePerKm;
    } catch (error) {
        console.error("Error calculating cost:", error);
        return null;
    }
}

async function selectNextCity(currentCity) {
    try {
        const currentCoords = await getCoordinates(currentCity);
        if (!currentCoords) return null;

        const coordinates = `${currentCoords.lat},${currentCoords.lon}`;
        const radius = 100000; // רדיוס מורחב של 100 ק"מ כדי להרחיב את טווח החיפוש
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=[out:json];node(around:${radius},${coordinates})["place"="city"]["population"];out;`);

        const data = await response.json();

        // סינון רשימת הערים כדי למצוא עיר שונה
        const cities = data.elements
            .filter(city => city.tags && city.tags.name && city.tags.name !== currentCity)
            .map(city => city.tags.name);

        if (cities.length === 0) {
            console.warn("No suitable nearby cities found");
            return null;
        }

        // בחירת עיר אקראית מתוך רשימת הערים
        const nextCity = cities[Math.floor(Math.random() * cities.length)];
        console.log(`Selected next city: ${nextCity}`);
        return nextCity;

    } catch (error) {
        console.error("Error selecting next city:", error);
        return null;
    }
}

async function createItinerary({ startingLocation, departureDate, endDate, budget, transportOptions }) {
    const itinerary = [];
    let currentLocation = startingLocation;
    let currentDate = new Date(departureDate);
    const totalDays = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));
    const tripOption = document.getElementById("tripOption").value;
    const tripOptionValue = parseInt(document.getElementById("tripOptionInput").value);
    const numDestinations = tripOption === "destinations" ? tripOptionValue : Math.floor(totalDays / tripOptionValue);
    const dayInterval = tripOption === "days" ? tripOptionValue : Math.floor(totalDays / numDestinations);
    let remainingBudget = budget;

    console.log(`Starting itinerary from ${currentLocation} with total days: ${totalDays} and budget: ${remainingBudget}`);

    for (let i = 0; i < numDestinations && remainingBudget > 0; i++) {
        const nextCity = await selectNextCity(currentLocation);
        if (!nextCity || nextCity === currentLocation) {
            console.warn(`No new city found. Stopping at ${currentLocation}`);
            break;
        }

        // בדיקת תחבורה לעיר הבאה
        const feasibleTransports = transportOptions.filter(async transport => {
            const cost = await calculateCost(currentLocation, nextCity, transport);
            return cost !== null && remainingBudget >= cost;
        });

        if (feasibleTransports.length === 0) {
            console.warn(`Insufficient budget to travel from ${currentLocation} to ${nextCity}.`);
            break;
        }

        const { transport, cost } = feasibleTransports[0];
        remainingBudget -= cost;

        itinerary.push({
            from: currentLocation,
            to: nextCity,
            date: currentDate.toISOString().split("T")[0],
            transport,
            duration: dayInterval,
            cost
        });

        console.log(`Traveling from ${currentLocation} to ${nextCity} by ${transport}, Cost: ${cost}, Remaining budget: ${remainingBudget}`);

        currentLocation = nextCity;
        currentDate.setDate(currentDate.getDate() + dayInterval);
    }

    return itinerary;
}

async function fetchActivities(city) {
    try {
        const cityCoords = await getCoordinates(city);
        if (!cityCoords) {
            return ["No activities found for this city"];
        }

        const query = `
            [out:json];
            node(around:5000, ${cityCoords.lat}, ${cityCoords.lon})
            ["tourism"];
            out 10;`;

        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await response.json();

        const activities = data.elements.map(element => element.tags.name).filter(Boolean);
        return activities.length ? activities : ["No activities found"];
    } catch (error) {
        console.error("Error fetching activities:", error);
        return ["No activities found"];
    }
}

async function displayItinerary(itinerary, container) {
    container.innerHTML = "<h2>Your Itinerary:</h2>";
    for (const [index, leg] of itinerary.entries()) {
        const activities = await fetchActivities(leg.to);
        const activityList = activities.map(activity => `<li>${activity}</li>`).join("");

        const legInfo = `
            <p>Day ${index + 1}: From ${leg.from} to ${leg.to} on ${leg.date} by ${leg.transport} - Cost: ${leg.cost.toFixed(2)}$</p>
            <ul>Activities:
                ${activityList}
            </ul>`;
        container.innerHTML += legInfo;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchLocation();
    loadCurrencies();

    const tripPlannerForm = document.getElementById("tripPlannerForm");
    const itineraryContainer = document.createElement("div");
    document.body.appendChild(itineraryContainer);

    const tripOptionElement = document.getElementById("tripOption");
    if (tripOptionElement) {
        tripOptionElement.addEventListener("change", updateTripOptionField);
    } else {
        console.error("tripOption element not found");
    }

    if (tripPlannerForm) {
        tripPlannerForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const startingLocation = document.getElementById("location")?.value || "";
            const departureDate = new Date(document.getElementById("start-date").value);
            const endDate = new Date(document.getElementById("end-date").value);
            const budget = parseFloat(document.getElementById("budget")?.value || 0);
            const transportOptions = Array.from(document.querySelectorAll("input[name='transportation']:checked")).map(el => el.value);

            const tripOption = tripOptionElement.value;
            const tripOptionInputElement = document.getElementById("tripOptionInput");
            const tripOptionValue = parseInt(tripOptionInputElement.value);

            const itinerary = await createItinerary({
                startingLocation, departureDate, endDate, budget, transportOptions, daysPerDestination: tripOption === "days" ? tripOptionValue : null, destinationsCount: tripOption === "destinations" ? tripOptionValue : null
            });

            displayItinerary(itinerary, itineraryContainer);
        });
    } else {
        console.error("tripPlannerForm element not found");
    }
});
