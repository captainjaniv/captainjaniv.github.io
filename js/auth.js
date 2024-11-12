// Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Helper function to capitalize the first letter of each word
function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
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

// Show Sign In and Sign Up Forms
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
            console.error("Google Sign-In Failed:", error.message);
        });
}

// Local Authentication Storage and Functions
const localUsers = JSON.parse(localStorage.getItem("localUsers")) || [];

// Local sign-up
window.localSignUp = function(event) {
    event.preventDefault();
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;
    
    // Save user initials and ID
    const initials = username.match(/[A-Z]/g).join("").substring(0, 2);
    const idNumber = username.match(/\d+/g)[0];
    const displayId = `${initials}-${idNumber}`;

    localStorage.setItem("displayId", displayId);
    // store user details in local storage...
}

// Local sign-in
window.localSignIn = function(event) {
    event.preventDefault();
    const username = document.getElementById("signin-username").value;
    const password = document.getElementById("signin-password").value;

    const userExists = localUsers.some(user => user.username === username && user.password === password);

    if (userExists) {
        localStorage.setItem("username", username);
        localStorage.setItem("profileImageUrl", "images/default-profile.png"); // Optional placeholder image
        showProfile();
        closeLoginForm();
    } else {
        alert("Incorrect username or password.");
    }
}

// Show Profile with initials
window.showProfile = function() {
    const displayId = localStorage.getItem("displayId"); // Initials + ID format like "AC-546"
    const profilePic = document.getElementById("profilePic");
    profilePic.innerText = displayId;

    // Hide the login button, show profile container
    document.getElementById("loginButton").style.display = "none";
    document.getElementById("profilePicContainer").style.display = "inline-block";
}

// Toggle dropdown menu on profile icon click
document.getElementById("profilePicContainer").addEventListener("click", function() {
    const dropdown = document.getElementById("profileDropdown");
    dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
});

// Close dropdown when clicking outside
document.addEventListener("click", function(event) {
    const dropdown = document.getElementById("profileDropdown");
    const profilePicContainer = document.getElementById("profilePicContainer");
    if (!profilePicContainer.contains(event.target)) {
        dropdown.style.display = "none";
    }
});

// Show and Close Login Modal
window.showLoginForm = function() {
    document.getElementById("loginForm").style.display = "block";
}

window.closeLoginForm = function() {
    document.getElementById("loginForm").style.display = "none";
}

// Logout and clear profile info
window.logout = function() {
    localStorage.removeItem("username");
    localStorage.removeItem("profileImageUrl");
    document.getElementById("loginButton").style.display = "block";
    document.getElementById("profileInfo").style.display = "none";
}

// Display profile on page load if logged in
document.addEventListener("DOMContentLoaded", showProfile);