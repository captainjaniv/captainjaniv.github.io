// פונקציה לשליפת תמונה רנדומלית מ-Unsplash עם מפתח ה-API שלך
async function fetchUnsplashImage(query) {
    const UNSPLASH_ACCESS_KEY = "tcJ3Enh1Hy6wLC1X3bziB0Rc2gZlKLPEHwy4YOPvGYQ"; // הכנס את המפתח שלך כאן
    try {
        const response = await fetch(`https://api.unsplash.com/photos/random?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}`);
        const data = await response.json();
        return data.urls.small; // מחזיר את כתובת התמונה בגודל קטן
    } catch (error) {
        console.error("Error fetching image from Unsplash:", error);
        return "images/default.jpg"; // במקרה של שגיאה, החזר תמונת ברירת מחדל מקומית
    }
}

(async function loadSections() {
    try {
        // Fetch sections data from JSON file
        const response = await fetch('/sectionsData.json');
        const sectionsData = await response.json();

        // Main container
        const container = document.getElementById('dynamic-sections');
        if (!container) {
            console.error("Container for dynamic sections not found!");
            return;
        }

        // Loop through each section
        for (const section of sectionsData) {
            // Create section container
            const sectionElement = document.createElement('section');
            sectionElement.className = 'dynamic-section';

            // Fetch image from Unsplash and create img element
            const imageUrl = await fetchUnsplashImage(section.query);
            const imageElement = document.createElement('div');
            imageElement.className = 'section-image';
            imageElement.style.backgroundImage = `url(${imageUrl})`;

            // Create text overlay
            const overlay = document.createElement('div');
            overlay.className = 'section-overlay';
            overlay.innerHTML = `
                <h2>${section.title}</h2>
                <p>${section.description}</p>
                <a href="${section.link}" class="section-button">Learn More</a>
            `;

            // Append overlay and image element to section container
            imageElement.appendChild(overlay);
            sectionElement.appendChild(imageElement);
            
            // Append the section to container
            container.appendChild(sectionElement);

            // Add a horizontal line between sections
            const hr = document.createElement('hr');
            hr.className = 'section-divider';
            container.appendChild(hr);
        }
    } catch (error) {
        console.error("Error loading sections:", error);
    }
})();
