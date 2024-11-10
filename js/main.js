// main.js - פונקציות בסיסיות עבור אינטראקטיביות באתר
function submitForm() {
    alert("Form submitted successfully!");
}

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

// Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Your Firebase configuration (replace with your Firebase project settings)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Show login form
function showLoginForm() {
    document.getElementById("loginForm").style.display = "block";
}

// Close login form
function closeLoginForm() {
    document.getElementById("loginForm").style.display = "none";
}

// Show Sign In Form
function showSignIn() {
    document.getElementById("signInForm").style.display = "flex";
    document.getElementById("signUpForm").style.display = "none";
    document.getElementById("modalTitle").textContent = "Sign In";
}

// Show Sign Up Form
function showSignUp() {
    document.getElementById("signInForm").style.display = "none";
    document.getElementById("signUpForm").style.display = "flex";
    document.getElementById("modalTitle").textContent = "Sign Up";
}

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
        document.getElementById("signup-username").value = username;
    } catch (error) {
        console.error("Error fetching words:", error);
        alert("Could not generate a username. Please try again.");
    }
}

// Helper function to capitalize the first letter of each word
function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

// Firebase Authentication - Sign Up with Email and Password
function signUpUser(event) {
    event.preventDefault();
    const username = document.getElementById("signup-username").value;
    const email = `${username}@example.com`; // For demo, convert username to email format
    const password = document.getElementById("signup-password").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Sign Up Successful!");
            closeLoginForm();
        })
        .catch((error) => {
            alert("Sign Up Failed: " + error.message);
        });
}

// Firebase Authentication - Sign In with Email and Password
function signInUser(event) {
    event.preventDefault();
    const username = document.getElementById("signin-username").value;
    const email = `${username}@example.com`; // For demo, convert username to email format
    const password = document.getElementById("signin-password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Sign In Successful!");
            closeLoginForm();
        })
        .catch((error) => {
            alert("Sign In Failed: " + error.message);
        });
}

// Firebase Authentication - Google Sign In
function googleSignIn() {
    signInWithPopup(auth, provider)
        .then((result) => {
            alert("Google Sign In Successful!");
            closeLoginForm();
        })
        .catch((error) => {
            alert("Google Sign In Failed: " + error.message);
        });
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