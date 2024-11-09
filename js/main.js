// main.js - פונקציות בסיסיות עבור אינטראקטיביות באתר
function submitForm() {
    alert("Form submitted successfully!");
}

// Display or hide login form
function showLoginForm() {
    document.getElementById("loginForm").style.display = "block";
}

function hideLoginForm() {
    document.getElementById("loginForm").style.display = "none";
}

// Generate random username
function generateUser() {
    const username = `User${Math.floor(100000 + Math.random() * 900000)}`;
    document.getElementById("username").value = username;
}

// Password validation
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

// Load profile on page

