// Transport cost rates per km
const transportPrices = {
    flight: 0.084, 
    boat: 0.05,
    train: 0.03,
    bus: 0.02,
    car: 0.04,
    taxi: 0.1
};

// Over-touristed cities list (this list can be extended or modified)
const overTouristedCities = [
    "Barcelona", "Venice", "Amsterdam", "Dubrovnik", "Reykjavik",
    "Florence", "Bruges", "Santorini", "Kyoto", "Prague", "Lisbon",
    "Dublin", "Siem Reap", "Havana", "Phuket", "Cusco", "Bali",
    "Mykonos", "Cancun", "Paris", "Vienna", "Budapest", "Salzburg"
];

// Function to get user's location for starting point
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

// Load preferred currency (optional for advanced settings)
async function loadCurrencies() {
    try {
        const response = await fetch("https://openexchangerates.org/api/currencies.json");
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

// Function to calculate transport cost between cities
async function calculateCost(fromCity, toCity, transport) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${fromCity}&format=json&limit=1`);
        const fromData = await response.json();
        const responseTo = await fetch(`https://nominatim.openstreetmap.org/search?q=${toCity}&format=json&limit=1`);
        const toData = await responseTo.json();
        
        const fromCoords = [parseFloat(fromData[0].lat), parseFloat(fromData[0].lon)];
        const toCoords = [parseFloat(toData[0].lat), parseFloat(toData[0].lon)];
        
        const distance = haversineDistance(fromCoords, toCoords);
        return distance * (transportPrices[transport] || 0);
    } catch (error) {
        console.error("Error calculating cost:", error);
        return null;
    }
}

// Calculate distance between two lat-lon coordinates
function haversineDistance(coords1, coords2) {
    const R = 6371; // Earth's radius in km
    const [lat1, lon1] = coords1.map(deg => deg * (Math.PI / 180));
    const [lat2, lon2] = coords2.map(deg => deg * (Math.PI / 180));

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Generate itinerary based on form input
async function createItinerary({ startingLocation, departureDate, endDate, budget, transportOptions }) {
    const itinerary = [];
    let currentLocation = startingLocation;
    let currentDate = new Date(departureDate);
    const totalDays = Math.ceil((endDate - departureDate) / (1000 * 60 * 60 * 24));
    
    const dayInterval = 2;
    const numDestinations = Math.floor(totalDays / dayInterval);
    let remainingBudget = budget;

    for (let i = 0; i < numDestinations && remainingBudget > 0; i++) {
        const nextCity = await getNextCity(currentLocation);
        if (!nextCity) break;

        const transport = transportOptions[0];
        const transportCost = await calculateCost(currentLocation, nextCity, transport);
        remainingBudget -= transportCost;

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
    }

    // Return to starting location if budget permits
    if (remainingBudget > 0) {
        const transportCost = await calculateCost(currentLocation, startingLocation, transportOptions[0]);
        itinerary.push({
            from: currentLocation,
            to: startingLocation,
            date: currentDate.toISOString().split("T")[0],
            transport: transportOptions[0],
            duration: 1,
            cost: transportCost
        });
    }

    return itinerary;
}

// Function to select the next city, avoiding over-touristed ones
async function getNextCity(currentCity) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${currentCity}&format=json&limit=10`);
        const cityData = await response.json();
        
        const validCities = cityData.filter(city => !overTouristedCities.includes(city.display_name));
        return validCities.length ? validCities[Math.floor(Math.random() * validCities.length)].display_name : null;
    } catch (error) {
        console.error("Error fetching next city:", error);
        return null;
    }
}

// Display itinerary to user
async function displayItinerary(itinerary, container) {
    container.innerHTML = "<h2>Your Itinerary:</h2>";
    itinerary.forEach((leg, index) => {
        container.innerHTML += `
            <p>Day ${index + 1}: From ${leg.from} to ${leg.to} on ${leg.date} by ${leg.transport} - Cost: ${leg.cost.toFixed(2)}$</p>
        `;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    fetchLocation();
    loadCurrencies(); // קריאת מטבעות מתווספת כאן

    // הפעלת טווח תאריכים
    flatpickr("#date-range", {
        mode: "range",
        dateFormat: "d/m/Y",
        onChange: function(selectedDates) {
            if (selectedDates.length === 2) {
                document.getElementById("start-date").value = selectedDates[0].toISOString();
                document.getElementById("end-date").value = selectedDates[1].toISOString();
            }
        }
    });

    // הצגת תפריט הגדרות מתקדמות
    const advancedSettingsToggle = document.getElementById("advancedSettingsToggle");
    const advancedSettings = document.getElementById("advancedSettings");

    advancedSettingsToggle.addEventListener("click", () => {
        if (advancedSettings.style.display === "none" || !advancedSettings.style.display) {
            advancedSettings.style.display = "block";
            advancedSettingsToggle.innerHTML = "Hide Advanced Settings &#9650;";
        } else {
            advancedSettings.style.display = "none";
            advancedSettingsToggle.innerHTML = "Advanced Settings &#9660;";
        }
    });

    // טיפול בטופס - שליחת נתונים
    document.getElementById("trip-form").addEventListener("submit", async (event) => {
        event.preventDefault();

        // שליפת ערכים מהטופס
        const startingLocation = document.getElementById("location").value;
        const departureDate = document.getElementById("start-date").value;
        const endDate = document.getElementById("end-date").value;
        const budget = parseFloat(document.getElementById("budget").value);
        const transportOptions = Array.from(
            document.querySelectorAll("input[name='transport']:checked")
        ).map(el => el.value);

        const tripOption = document.getElementById("tripOption").value;
        const tripOptionValue = parseInt(document.getElementById("tripOptionInput").value) || 2;
        const returnToStart = document.getElementById("returnToStart").checked;
        const preferredCurrency = document.getElementById("currency").value;

        const daysPerDestination = tripOption === "days" ? tripOptionValue : null;
        const destinationsCount = tripOption === "destinations" ? tripOptionValue : null;

        // יצירת המסלול
        const itinerary = await createItinerary({
            startingLocation, departureDate, endDate, budget, transportOptions, daysPerDestination, destinationsCount, returnToStart, preferredCurrency
        });

        displayItinerary(itinerary, document.getElementById("itineraryContainer"));
    });
});