// Wait for the DOM to load before adding event listeners
document.addEventListener("DOMContentLoaded", () => {

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
    fetchLocation(); // Call fetchLocation when DOM is ready

    async function loadCurrencies() {
        try {
            const response = await fetch("https://open.er-api.com/v6/latest");
            const data = await response.json();
            const currencySelect = document.getElementById("currency");
    
            // Populate the dropdown with currencies
            Object.keys(data.rates).forEach(currency => {
                const option = document.createElement("option");
                option.value = currency;
                option.textContent = currency;
                currencySelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error loading currencies:", error);
        }
    }

    // Update currency symbol when currency is selected
    const currencySelect = document.getElementById("currency");
    const currencySymbol = document.getElementById("currencySymbol");
    if (currencySelect && currencySymbol) {
        currencySelect.addEventListener("change", function() {
            const currencySymbols = { USD: "$", EUR: "€", ILS: "₪", GBP: "£" };
            const selectedCurrency = this.value;
            currencySymbol.textContent = currencySymbols[selectedCurrency] || "$";
        });
    }

    document.addEventListener("DOMContentLoaded", loadCurrencies);
    

    // Toggle minimum days vs. number of destinations fields
    const optionDays = document.getElementById("optionDays");
    const optionDestinations = document.getElementById("optionDestinations");
    const daysContainer = document.getElementById("daysContainer");
    const destinationsContainer = document.getElementById("destinationsContainer");

    if (optionDays && optionDestinations && daysContainer && destinationsContainer) {
        optionDays.addEventListener("change", function() {
            if (this.checked) {
                daysContainer.style.display = "block";
                destinationsContainer.style.display = "none";
            }
        });

        optionDestinations.addEventListener("change", function() {
            if (this.checked) {
                daysContainer.style.display = "none";
                destinationsContainer.style.display = "block";
            }
        });
    }

    // Toggle Profile dropdown on profile picture click
    const profilePic = document.getElementById("profilePic");
    const profileInfo = document.getElementById("profileInfo");
    if (profilePic && profileInfo) {
        profilePic.addEventListener("click", function() {
            profileInfo.style.display = profileInfo.style.display === "none" ? "block" : "none";
        });
    }

    // Form submission handling
    const tripPlannerForm = document.getElementById("tripPlannerForm");
    if (tripPlannerForm) {
        tripPlannerForm.addEventListener("submit", function(event) {
            event.preventDefault();
            
            const location = document.getElementById("location");
            const budget = document.getElementById("budget");
            const currency = document.getElementById("currency");
            const transportationOptions = Array.from(document.querySelectorAll("input[name='transportation']:checked"))
                .map(option => option.value);
            
            let tripDetails = {};
            if (optionDays && optionDays.checked) {
                const minDays = document.getElementById("minDays");
                tripDetails = { 
                    type: "days", 
                    startingLocation: location ? location.value : "Unknown", 
                    minDays: minDays ? parseInt(minDays.value) : 0, 
                    budget: budget ? parseInt(budget.value) : 0, 
                    currency: currency ? currency.value : "USD", 
                    transportationOptions 
                };
            } else if (optionDestinations && optionDestinations.checked) {
                const numDestinations = document.getElementById("numDestinations");
                tripDetails = { 
                    type: "destinations", 
                    startingLocation: location ? location.value : "Unknown", 
                    numDestinations: numDestinations ? parseInt(numDestinations.value) : 0, 
                    budget: budget ? parseInt(budget.value) : 0, 
                    currency: currency ? currency.value : "USD", 
                    transportationOptions 
                };
            }

            displayTripDetails(tripDetails);
        });
    }

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

});
