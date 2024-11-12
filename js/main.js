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

// Update currency symbol when currency is selected
document.getElementById("currency").addEventListener("change", function() {
    const currencySymbols = { USD: "$", EUR: "€", ILS: "₪", GBP: "£" };
    const selectedCurrency = this.value;
    document.getElementById("currencySymbol").textContent = currencySymbols[selectedCurrency] || "$";
});

// Toggle minimum days vs. number of destinations fields
document.getElementById("optionDays").addEventListener("change", function() {
    if (this.checked) {
        document.getElementById("daysContainer").style.display = "block";
        document.getElementById("destinationsContainer").style.display = "none";
    }
});

document.getElementById("optionDestinations").addEventListener("change", function() {
    if (this.checked) {
        document.getElementById("daysContainer").style.display = "none";
        document.getElementById("destinationsContainer").style.display = "block";
    }
});

// Toggle Profile dropdown on profile picture click
document.getElementById("profilePic").addEventListener("click", function() {
    const profileInfo = document.getElementById("profileInfo");
    profileInfo.style.display = profileInfo.style.display === "none" ? "block" : "none";
});


// Form submission handling
document.getElementById("tripPlannerForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const startingLocation = document.getElementById("location").value;
    const budget = parseInt(document.getElementById("budget").value);
    const currency = document.getElementById("currency").value;
    const transportation = document.getElementById("transportation").value;
    
    let tripDetails;
    if (document.getElementById("optionDays").checked) {
        const minDays = parseInt(document.getElementById("minDays").value);
        tripDetails = { type: "days", startingLocation, minDays, budget, currency, transportation };
    } else if (document.getElementById("optionDestinations").checked) {
        const numDestinations = parseInt(document.getElementById("numDestinations").value);
        tripDetails = { type: "destinations", startingLocation, numDestinations, budget, currency, transportation };
    }

    displayTripDetails(tripDetails);
});

// Display trip details function
function displayTripDetails(details) {
    const outputContainer = document.createElement("div");
    outputContainer.innerHTML = "<h2>Your Trip Details:</h2>";
    for (const [key, value] of Object.entries(details)) {
        const detailElement = document.createElement("p");
        detailElement.textContent = `${key}: ${value}`;
        outputContainer.appendChild(detailElement);
    }
    document.body.appendChild(outputContainer);
}

// Fetch location on load
document.addEventListener("DOMContentLoaded", fetchLocation);
