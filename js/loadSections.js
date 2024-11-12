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
        // בקשה לנתוני החלקים מקובץ JSON בנתיב הראשי
        const response = await fetch('/sectionsData.json');
        const sectionsData = await response.json();

        // איתור הקונטיינר הראשי להוספת החלקים הדינמיים
        const container = document.getElementById('dynamic-sections');
        if (!container) {
            console.error("Container for dynamic sections not found!");
            return;
        }

        // לולאה על כל חלק כדי לייצר ולהציג את התוכן
        for (const section of sectionsData) {
            // יצירת אלמנט חדש עבור החלק
            const sectionElement = document.createElement('section');
            sectionElement.className = 'dynamic-section';

            // שליפת תמונה מ-Unsplash על פי השאילתה
            const imageUrl = await fetchUnsplashImage(section.query); // שימוש בפונקציה לשליפת תמונה
            const imageElement = document.createElement('img');
            imageElement.src = imageUrl;
            imageElement.alt = section.title;

            // יצירת תוכן פנימי עבור החלק
            sectionElement.innerHTML = `
                <h2>${section.title}</h2>
                <p>${section.description}</p>
                <a href="${section.link}" class="section-button">Learn More</a>
            `;

            // הוספת התמונה כאלמנט ראשון בתוך החלק
            sectionElement.prepend(imageElement);

            // הוספת החלק לקונטיינר הראשי
            container.appendChild(sectionElement);
        }
    } catch (error) {
        console.error("Error loading sections:", error);
    }
})();
