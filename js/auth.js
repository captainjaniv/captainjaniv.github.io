// Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration (replace with your Firebase project settings)
const firebaseConfig = {
    apiKey: "AIzaSyATDQLpR_-isRU7Vnqg50tsUI8bzGOGv2E",
    authDomain: "explorely-poc.firebaseapp.com",
    projectId: "explorely-poc",
    storageBucket: "explorely-poc.firebasestorage.app",
    messagingSenderId: "642209287692",
    appId: "1:642209287692:web:2055c2b30f59e97456a829",
    measurementId: "G-FYBPH901SR"
};

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Show login form
window.showLoginForm = function() {
    document.getElementById("loginForm").style.display = "block";
}

// Close login form
window.closeLoginForm = function() {
    document.getElementById("loginForm").style.display = "none";
}

// Show Profile UI (replaces login button)
window.showProfile = function() {
    const username = localStorage.getItem("username");
    const profileImageUrl = localStorage.getItem("profileImageUrl");

    if (username) {
        document.getElementById("loginButton").style.display = "none";
        const profileInfo = document.getElementById("profileInfo");
        profileInfo.style.display = "flex";
        profileInfo.innerHTML = `
            <p>Welcome, <span id="usernameDisplay">${username}</span></p>
            <a href="my-trips.html" class="profile-option">My Trips</a>
            <button onclick="logout()">Logout</button>
            <img src="${profileImageUrl}" alt="Profile Picture" style="border-radius: 50%; width: 40px; height: 40px;">
        `;
    }
}

// Google Sign-In
window.googleSignIn = function() {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            localStorage.setItem("username", user.displayName);
            localStorage.setItem("profileImageUrl", user.photoURL || "images/default-profile.png");
            showProfile();
            closeLoginForm();
        })
        .catch((error) => {
            console.error("Google Sign In Failed:", error.message);
        });
}

// Local Sign-In
window.signInUser = function(event) {
    event.preventDefault();
    const username = document.getElementById("signin-username").value;
    const email = `${username}@example.com`;
    const password = document.getElementById("signin-password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            localStorage.setItem("username", username);
            localStorage.setItem("profileImageUrl", "images/default-profile.png");  // Optional placeholder image
            showProfile();
            closeLoginForm();
        })
        .catch((error) => {
            console.error("Sign In Failed:", error.message);
        });
}

// Logout and clear profile info
window.logout = function() {
    localStorage.removeItem("username");
    localStorage.removeItem("profileImageUrl");
    document.getElementById("loginButton").style.display = "block";
    document.getElementById("profileInfo").style.display = "none";
}

// Check and display profile on page load
document.addEventListener("DOMContentLoaded", showProfile);