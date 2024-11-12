(async function loadSections() {
    try {
        // Fetch sections data from JSON file in the root directory
        const response = await fetch('/sectionsData.json'); // root-level JSON file
        const sectionsData = await response.json();

        // Find the main container to which sections will be added
        const container = document.getElementById('dynamic-sections');
        if (!container) {
            console.error("Container for dynamic sections not found!");
            return;
        }

        // Loop through each section and render content
        for (const section of sectionsData) {
            // Create section element
            const sectionElement = document.createElement('section');
            sectionElement.className = 'dynamic-section';

            // Create image element (optional: use Unsplash for demo images)
            const imageElement = document.createElement('img');
            imageElement.src = `https://source.unsplash.com/featured/?${encodeURIComponent(section.query)}`;
            imageElement.alt = section.title;

            // Set inner content for the section
            sectionElement.innerHTML = `
                <h2>${section.title}</h2>
                <p>${section.description}</p>
                <a href="${section.link}" class="section-button">Learn More</a>
            `;

            // Append image as the first child
            sectionElement.prepend(imageElement);

            // Append section to the main container
            container.appendChild(sectionElement);
        }
    } catch (error) {
        console.error("Error loading sections:", error);
    }
})();

