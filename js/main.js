// Fetch user's location
async function fetchLocation() {
    try {
        const response = await fetch("https://ipwhois.app/json/");
        const data = await response.json();
        document.getElementById("location").value = `${data.city}, ${data.country}`;
    } catch (error) {
        console.error("Location detection failed:", error);
        document.getElementById("location").placeholder = "Unable to detect location.";
    }
}

// Update currency symbol
document.getElementById("currency").addEventListener("change", function() {
    const currencySymbols = { USD: "$", EUR: "€", ILS: "₪", GBP: "£" };
    const selectedCurrency = this.value;
    document.getElementById("currencySymbol").textContent = currencySymbols[selectedCurrency] || "$";
});

// Run location fetch on load
document.addEventListener("DOMContentLoaded", fetchLocation);

document.getElementById("tripPlannerForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const startingLocation = document.getElementById("location").value;
    const numDestinations = parseInt(document.getElementById("numDestinations").value);
    const minDays = parseInt(document.getElementById("minDays").value);
    const currency = document.getElementById("currency").value;  // Selected currency
    const budget = parseInt(document.getElementById("budget").value);

    const itinerary = generateItinerary(startingLocation, numDestinations, minDays, currency);
    displayItinerary(itinerary);
});

function generateItinerary(startingLocation, numDestinations, minDays, currency) {
    const itinerary = [];
    for (let i = 1; i <= numDestinations; i++) {
        itinerary.push({
            destination: `Destination ${i}`,  // Placeholder; replace with actual data
            days: minDays,
            currency: currency
        });
    }
    itinerary.push({ destination: startingLocation, days: 0, currency: currency }); // Return to starting location
    return itinerary;
}

function displayItinerary(itinerary) {
    const itineraryContainer = document.createElement("div");
    itineraryContainer.innerHTML = "<h2>Your Itinerary:</h2>";
    itinerary.forEach(stop => {
        const stopElement = document.createElement("p");
        stopElement.textContent = `Destination: ${stop.destination}, Days: ${stop.days}, Currency: ${stop.currency}`;
        itineraryContainer.appendChild(stopElement);
    });
    document.body.appendChild(itineraryContainer);
}

