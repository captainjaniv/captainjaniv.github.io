// Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase configuration
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

// פונקציה לבדוק אם המשתמש מחובר על פי displayId או תמונת הפרופיל
function checkUserLoggedIn() {
    // בדיקה אם יש displayId ב-localStorage או אם יש תמונת פרופיל
    const displayId = localStorage.getItem("displayId");
    const profilePicContainer = document.getElementById("profilePicContainer");

    // אם יש displayId או אם תמונת הפרופיל מוצגת, נניח שהמשתמש מחובר
    return displayId || (profilePicContainer && profilePicContainer.style.display === "inline-block");
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

// Show the Sign In form and hide Sign Up form
window.showSignIn = function() {
    const signInForm = document.getElementById("signInForm");
    const signUpForm = document.getElementById("signUpForm");
    if (signInForm && signUpForm) {
        signInForm.style.display = "block";
        signUpForm.style.display = "none";
    }
}

// Show the Sign Up form and hide Sign In form
window.showSignUp = function() {
    const signInForm = document.getElementById("signInForm");
    const signUpForm = document.getElementById("signUpForm");
    if (signInForm && signUpForm) {
        signInForm.style.display = "none";
        signUpForm.style.display = "block";
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
    const firstDigit = username.match(/\d/) ? username.match(/\d/)[0] : "0"; // Use 0 if no digit
    const displayId = `${initials}${firstDigit}`;

    // Save displayId and other user info in localStorage
    localStorage.setItem("displayId", displayId);
    localStorage.setItem("username", username);
    localStorage.setItem("profileImageUrl", "images/default-profile.png"); // Placeholder image
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
        localStorage.setItem("profileImageUrl", "images/default-profile.png"); // Placeholder image
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
    localStorage.removeItem("displayId");

    document.getElementById("loginButton").style.display = "block";
    document.getElementById("profilePicContainer").style.display = "none";
    document.getElementById("profilePic").innerText = ""; // Clear profile icon text
}

// Show profile with initials for local authentication
window.showProfile = function() {
    const displayId = localStorage.getItem("displayId");
    const profileImageUrl = localStorage.getItem("profileImageUrl");
    const profilePic = document.getElementById("profilePic");
    const profilePicContainer = document.getElementById("profilePicContainer");

    if (displayId) {
        // Set profile circle with initials
        profilePic.style.backgroundImage = "none";
        profilePic.innerText = displayId;
    } else if (profileImageUrl) {
        // Set profile image for Google users
        profilePic.style.backgroundImage = `url('${profileImageUrl}')`;
        profilePic.innerText = "";
    }

    // Hide login button and show profile container
    document.getElementById("loginButton").style.display = "none";
    profilePicContainer.style.display = "inline-block";
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

    if (checkUserLoggedIn()) {
        showProfile();
    } else {
        document.getElementById("loginButton").style.display = "block";
    }

    // Close dropdown when clicking outside the profile container
    document.addEventListener("click", (event) => {
        if (!profilePicContainer.contains(event.target)) {
            profileDropdown.style.display = "none";
        }
    });
});
