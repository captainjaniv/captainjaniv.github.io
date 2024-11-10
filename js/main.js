// Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyATDQLpR_-isRU7Vnqg50tsUI8bzGOGv2E",
    authDomain: "explorely-poc.firebaseapp.com",
    projectId: "explorely-poc",
    storageBucket: "explorely-poc.firebasestorage.app",
    messagingSenderId: "642209287692",
    appId: "1:642209287692:web:2055c2b30f59e97456a829",
    measurementId: "G-FYBPH901SR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

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

// Functions to manage login modal
window.showLoginForm = function() {
    document.getElementById("loginForm").style.display = "block";
}

window.closeLoginForm = function() {
    document.getElementById("loginForm").style.display = "none";
}

window.showSignIn = function() {
    document.getElementById("signInForm").style.display = "flex";
    document.getElementById("signUpForm").style.display = "none";
    document.getElementById("modalTitle").textContent = "Sign In";
}

window.showSignUp = function() {
    document.getElementById("signInForm").style.display = "none";
    document.getElementById("signUpForm").style.display = "flex";
    document.getElementById("modalTitle").textContent = "Sign Up";
}

// Generate a unique username with two random words from an API + a 6-digit number
window.generateUser = async function() {
    try {
        const response1 = await fetch("https://random-word-api.herokuapp.com/word?number=1");
        const response2 = await fetch("https://random-word-api.herokuapp.com/word?number=1");
        const word1 = await response1.json();
        const word2 = await response2.json();
        const randomNumber = Math.floor(100000 + Math.random() * 900000);
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
window.signUpUser = function(event) {
    event.preventDefault();
    const username = document.getElementById("signup-username").value;
    const email = `${username}@example.com`;
    const password = document.getElementById("signup-password").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            alert("Sign Up Successful!");
            closeLoginForm();
        })
        .catch((error) => {
            alert("Sign Up Failed: " + error.message);
        });
}

// Firebase Authentication - Sign In with Email and Password
window.signInUser = function(event) {
    event.preventDefault();
    const username = document.getElementById("signin-username").value;
    const email = `${username}@example.com`;
    const password = document.getElementById("signin-password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            alert("Sign In Successful!");
            closeLoginForm();
        })
        .catch((error) => {
            alert("Sign In Failed: " + error.message);
        });
}

// Firebase Authentication - Google Sign In
window.googleSignIn = function() {
    signInWithPopup(auth, provider)
        .then(() => {
            alert("Google Sign In Successful!");
            closeLoginForm();
        })
        .catch((error) => {
            alert("Google Sign In Failed: " + error.message);
        });
}

// Show profile if user is logged in
window.showProfile = function() {
    const username = localStorage.getItem("username");
    if (username) {
        document.getElementById("loginButton").style.display = "none";
        document.getElementById("profileInfo").style.display = "flex";
        document.getElementById("usernameDisplay").innerText = username;
    }
}

// Logout and clear profile
window.logout = function() {
    localStorage.removeItem("username");
    document.getElementById("loginButton").style.display = "block";
    document.getElementById("profileInfo").style.display = "none";
}

// Load profile on page load
document.addEventListener("DOMContentLoaded", showProfile);
