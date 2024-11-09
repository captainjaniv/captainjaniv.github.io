// main.js - פונקציות בסיסיות עבור אינטראקטיביות באתר
function submitForm() {
    alert("Form submitted successfully!");
}

// Fetch user's location
async function fetchLocation() {
    try {
        const response = await fetch("https://ipgeolocation.io/json");
        const data = await response.json();
        document.getElementById("location").value = data.city + ", " + data.country_name;
    } catch (error) {
        console.error("Location detection failed:", error);
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

// Generate a unique username with two random words from an API + a 6-digit number
async function generateUser() {
    try {
        // Fetch two random words from the API
        const response1 = await fetch("https://random-word-api.herokuapp.com/word?number=1");
        const response2 = await fetch("https://random-word-api.herokuapp.com/word?number=1");

        const word1 = await response1.json();
        const word2 = await response2.json();

        // Generate a random 6-digit number
        const randomNumber = Math.floor(100000 + Math.random() * 900000);

        // Combine the words and number to form the username
        const username = `${capitalize(word1[0])}${capitalize(word2[0])}${randomNumber}`;
        document.getElementById("username").value = username;
    } catch (error) {
        console.error("Error fetching words:", error);
        alert("Could not generate a username. Please try again.");
    }
}

// Helper function to capitalize the first letter of each word
function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

// Password validation to ensure it meets complexity requirements
function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    return passwordRegex.test(password);
}

// Local login function
function loginUser(event) {
    event.preventDefault();
    const password = document.getElementById("password").value;
    
    if (!validatePassword(password)) {
        alert("Password must be at least 12 characters long, with uppercase, lowercase, numbers, and special characters.");
        return;
    }

    localStorage.setItem("username", document.getElementById("username").value);
    showProfile();
    hideLoginForm();
}

// Google login (preparation for OAuth integration)
function googleLogin() {
    alert("Google login integration is in progress.");
    // Placeholder for Google OAuth implementation
    // Once implemented, use response to populate user profile
}

// Show profile if user is logged in
function showProfile() {
    const username = localStorage.getItem("username");
    if (username) {
        document.getElementById("loginButton").style.display = "none";
        document.getElementById("profileInfo").style.display = "flex";
        document.getElementById("usernameDisplay").innerText = username;
    }
}

// Logout and clear profile
function logout() {
    localStorage.removeItem("username");
    document.getElementById("loginButton").style.display = "block";
    document.getElementById("profileInfo").style.display = "none";
}

// Load profile on page load
document.addEventListener("DOMContentLoaded", showProfile);