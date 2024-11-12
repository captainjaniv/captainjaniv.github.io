(async function loadSections() {
    const response = await fetch('sectionsData.json');
    const sectionsData = await response.json();
    const container = document.getElementById('dynamic-sections');

    for (const section of sectionsData) {
        const sectionElement = document.createElement('section');
        sectionElement.className = 'dynamic-section';

        const imageElement = document.createElement('img');
        imageElement.src = `https://source.unsplash.com/featured/?${section.query}`; // Quick image based on query
        imageElement.alt = section.title;

        sectionElement.innerHTML = `
            <h2>${section.title}</h2>
            <p>${section.description}</p>
            <a href="${section.link}" class="section-button">Learn More</a>
        `;
        sectionElement.prepend(imageElement);
        container.appendChild(sectionElement);
    }
})();
