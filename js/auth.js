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

// Show the login form
window.showLoginForm = function() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.style.display = "block";
    }
}

// Close login form
window.closeLoginForm = function() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.style.display = "none";
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

// Local sign-up with profile initials format
window.signUpUser = function(event) {
    event.preventDefault();
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    // Extract initials from first two uppercase letters and the first digit
    const initials = username.match(/[A-Z]/g)?.slice(0, 2).join("") || "";
    const firstDigit = username.match(/\d/); // First digit only
    const displayId = `${initials}${firstDigit ? firstDigit[0] : ""}`;

    // Save displayId and other user info in localStorage
    localStorage.setItem("displayId", displayId);
    showProfile(); // Update UI to show profile icon
    closeLoginForm(); // Close the login form after sign-up
};

// Local sign-in
window.signInUser = function(event) {
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

// Logout and clear profile info
window.logout = function() {
    localStorage.removeItem("username");
    localStorage.removeItem("profileImageUrl");
    document.getElementById("loginButton").style.display = "block";
    document.getElementById("profileInfo").style.display = "none";
}

// Show profile with initials for local authentication
window.showProfile = function() {
    const displayId = localStorage.getItem("displayId");
    if (displayId) {
        const profilePic = document.getElementById("profilePic");
        profilePic.innerText = displayId;

        // Hide login button and show profile container
        document.getElementById("loginButton").style.display = "none";
        document.getElementById("profilePicContainer").style.display = "inline-block";
    }
}

// Toggle profile dropdown on profile icon click
document.addEventListener("DOMContentLoaded", () => {
    showProfile(); // Display profile if logged in

    const profilePic = document.getElementById("profilePic");
    const profileDropdown = document.getElementById("profileDropdown");
    const profilePicContainer = document.getElementById("profilePicContainer");

    if (profilePic) {
        profilePic.addEventListener("click", () => {
            profileDropdown.style.display = 
                profileDropdown.style.display === "none" ? "block" : "none";
        });
    }

    // Close dropdown when clicking outside the profile container
    document.addEventListener("click", (event) => {
        if (!profilePicContainer.contains(event.target)) {
            profileDropdown.style.display = "none";
        }
    });
});