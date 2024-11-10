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
