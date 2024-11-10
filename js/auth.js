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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

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
