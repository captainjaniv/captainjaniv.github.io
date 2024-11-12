const GEO_DB_HOST = "wft-geo-db.p.rapidapi.com"
const GEO_DB_API_KEY = "5931b2bb47msh78700b432711641p187d55jsncc429db2ba40";

// Fetch user's location
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
        
        // Populate the dropdown with currencies
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

async function getCoordinates(city) {
    try {
        const response = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(city)}&limit=1`, {
            method: "GET",
            headers: {
                "x-rapidapi-key":GEO_DB_API_KEY,
                "x-rapidapi-host": GEO_DB_HOST
            }
        });
        const data = await response.json();
        if (data && data.data && data.data.length > 0) {
            const cityData = data.data[0];
            return { lat: cityData.latitude, lon: cityData.longitude };
        } else {
            console.error("City not found");
            return null;
        }
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        return null;
    }
}

// Wait for the DOM to load before adding event listeners
document.addEventListener("DOMContentLoaded", () => {
    fetchLocation(); 
    loadCurrencies();

    // Check if user is logged in (using placeholder method here)
    let isUserLoggedIn = checkUserLoggedIn(); // Placeholder function, implement in auth.js

    const tripPlannerForm = document.getElementById("tripPlannerForm");
    const itineraryContainer = document.createElement("div");
    document.body.appendChild(itineraryContainer);

    const transportPrices = {
        flight: 0.084, 
        boat: 0.05,
        train: 0.03,
        bus: 0.02,
        car: 0.04
    };

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
        const fromCoords = await getCoordinates(from);
        const toCoords = await getCoordinates(to);
        
        if (!fromCoords || !toCoords) {
            console.warn(`Coordinates not available for ${from} or ${to}`);
            return null;
        }
    
        const distance = haversineDistance(fromCoords, toCoords);
        const pricePerKm = transportPrices[transport];
        return distance * pricePerKm;
    }
    
    tripPlannerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const startingLocation = document.getElementById("location").value;
        const departureDate = new Date(document.getElementById("start-date").value);
        const endDate = new Date(document.getElementById("end-date").value);
        const budget = parseFloat(document.getElementById("budget").value);
        const transportOptions = Array.from(document.querySelectorAll("input[name='transportation']:checked")).map(el => el.value);

        const tripOption = document.querySelector("input[name='tripOption']:checked").value;
        const daysPerDestination = tripOption === "days" ? parseInt(document.getElementById("minDays").value) : null;
        const destinationsCount = tripOption === "destinations" ? parseInt(document.getElementById("numDestinations").value) : null;

        const itinerary = await createItinerary({
            startingLocation, departureDate, endDate, budget, transportOptions, daysPerDestination, destinationsCount
        });

        displayItinerary(itinerary, itineraryContainer);

        if (itinerary && isUserLoggedIn) {
            saveTripToMyTrips(itinerary);
        }
    });

    async function createItinerary({ startingLocation, departureDate, endDate, budget, transportOptions, daysPerDestination, destinationsCount }) {
        const itinerary = [];
        let currentLocation = startingLocation;
        let currentDate = new Date(departureDate);
        const totalDays = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));
        const numDestinations = destinationsCount || Math.floor(totalDays / daysPerDestination);
        const dayInterval = daysPerDestination || Math.floor(totalDays / numDestinations);
        let remainingBudget = budget;

        for (let i = 0; i < numDestinations && remainingBudget > 0; i++) {
            const nextCity = selectNextCity(currentLocation);
            if (!nextCity) break;

            const feasibleTransports = transportOptions.filter(transport => {
                const cost = calculateCost(currentLocation, nextCity, transport);
                return cost !== null && remainingBudget >= cost;
            });

            if (feasibleTransports.length === 0) {
                alert(`Insufficient budget to travel from ${currentLocation} to ${nextCity}. Consider increasing your budget.`);
                break;
            }

            const transport = feasibleTransports[0];
            const transportCost = calculateCost(currentLocation, nextCity, transport);

            itinerary.push({
                from: currentLocation,
                to: nextCity,
                date: currentDate.toISOString().split("T")[0],
                transport,
                duration: dayInterval,
                cost: transportCost
            });

            currentLocation = nextCity;
            currentDate.setDate(currentDate.getDate() + dayInterval);
            remainingBudget -= transportCost;
        }

        if (currentLocation !== startingLocation && remainingBudget > calculateCost(currentLocation, startingLocation, transportOptions[0])) {
            itinerary.push({
                from: currentLocation,
                to: startingLocation,
                date: currentDate.toISOString().split("T")[0],
                transport: transportOptions[0],
                duration: 1,
                cost: calculateCost(currentLocation, startingLocation, transportOptions[0])
            });
        } else {
            alert("Budget exceeded for return trip. Consider increasing your budget.");
        }

        return itinerary;
    }

    function selectNextCity(currentCity) {
        const availableCities = Object.keys(cityCoordinates).filter(city => city !== currentCity);
        return availableCities.length > 0 ? availableCities[Math.floor(Math.random() * availableCities.length)] : null;
    }

    function displayItinerary(itinerary, container) {
        container.innerHTML = "<h2>Your Itinerary:</h2>";
        itinerary.forEach((leg, index) => {
            const legInfo = `<p>Day ${index + 1}: From ${leg.from} to ${leg.to} on ${leg.date} by ${leg.transport} - Cost: ${leg.cost.toFixed(2)}$</p>`;
            container.innerHTML += legInfo;
        });
    }

    function saveTripToMyTrips(itinerary) {
        const myTrips = JSON.parse(localStorage.getItem("myTrips")) || [];
        myTrips.push(itinerary);
        localStorage.setItem("myTrips", JSON.stringify(myTrips));
        alert("Trip saved to My Trips!");
    }

    function checkUserLoggedIn() {
        // Placeholder: Replace with actual logic to check if user is logged in
        return true;
    }
});
