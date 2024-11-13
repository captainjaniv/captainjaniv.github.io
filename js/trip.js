// משתנים כלליים של API
const GEO_DB_HOST = "wft-geo-db.p.rapidapi.com";
const GEO_DB_API_KEY = "5931b2bb47msh78700b432711641p187d55jsncc429db2ba40";

// הגדרת מחירים לכל סוג תחבורה
const transportPrices = {
    flight: 0.084, 
    boat: 0.05,
    train: 0.03,
    bus: 0.02,
    car: 0.04
};

// פונקציה לאיתור מיקום המשתמש והגדרת מיקום התחלתי בטופס
async function fetchLocation() {
    try {
        const response = await fetch("https://ipwhois.app/json/");
        const data = await response.json();
        const locationInput = document.getElementById("location");
        if (locationInput) {
            locationInput.value = `${data.city}, ${data.country}`;
        }
    } catch (error) {
        console.error("Location detection failed:", error);
        if (locationInput) {
            locationInput.placeholder = "Unable to detect location.";
        }
    }
}

// פונקציה לטעינת רשימת מטבעות עבור בחירת מטבע מועדף בטופס
async function loadCurrencies() {
    try {
        const response = await fetch("https://openexchangerates.org/api/currencies.json");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        const currencySelect = document.getElementById("currency");

        Object.entries(data).forEach(([currencyCode, currencyName]) => {
            const option = document.createElement("option");
            option.value = currencyCode;
            option.textContent = `${currencyCode} - ${currencyName}`;
            currencySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading currencies:", error);
    }
}

// פונקציה לקבלת קורדינטות של עיר עם Debug נוסף
async function getCoordinates(city) {
    try {
        const response = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(city)}&limit=1`, {
            method: "GET",
            headers: {
                "x-rapidapi-key": GEO_DB_API_KEY,
                "x-rapidapi-host": GEO_DB_HOST
            }
        });
        const data = await response.json();
        console.log(`Debug getCoordinates: Response data for city ${city}`, data);

        if (data && data.data && data.data.length > 0) {
            const cityData = data.data[0];
            return { lat: cityData.latitude, lon: cityData.longitude };
        } else {
            console.error(`City not found: ${city}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching coordinates for city ${city}:`, error);
        return null;
    }
}


// פונקציה לחישוב עלות נסיעה בין שתי ערים על ידי בקשת API ל-GeoDB
async function calculateCost(from, to, transport) {
    try {
        // בקשה ל-GeoDB כדי לקבל את המרחק בין שתי ערים
        const response = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/distances?fromCityName=${encodeURIComponent(from)}&toCityName=${encodeURIComponent(to)}`, {
            method: "GET",
            headers: {
                "x-rapidapi-key": GEO_DB_API_KEY,
                "x-rapidapi-host": GEO_DB_HOST
            }
        });
        
        const data = await response.json();
        if (data && data.data && data.data.length > 0) {
            const distance = data.data[0].distance; // מרחק בקילומטרים
            
            // חישוב העלות לפי סוג התחבורה
            const pricePerKm = transportPrices[transport];
            return distance * pricePerKm;
        } else {
            console.warn(`Distance not found between ${from} and ${to}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching distance:", error);
        return null;
    }
}

// פונקציה לבחירת עיר יעד חדשה (רנדומלית) על פי קריטריונים נוספים
async function selectNextCity(currentCity) {
    try {
        const currentCoords = await getCoordinates(currentCity);
        if (!currentCoords) return null;

        const response = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/locations/${currentCoords.lat}${currentCoords.lon}/nearbyCities?radius=20&limit=10&minPopulation=1000&sort=population`, {
            method: "GET",
            headers: {
                "x-rapidapi-key": GEO_DB_API_KEY,
                "x-rapidapi-host": GEO_DB_HOST
            }
        });

        const data = await response.json();
        if (data && data.data && data.data.length > 0) {
            // סינון התוצאות כדי לכלול רק ערים שיש להן מקומות לינה קרובים (נניח 20 ק"מ)
            const cityWithLodging = data.data.find(city => city.distance < 20);
            return cityWithLodging ? cityWithLodging.city : null;
        } else {
            console.error("No suitable nearby cities found");
            return null;
        }
    } catch (error) {
        console.error("Error selecting next city:", error);
        return null;
    }
}


// פונקציה ליצירת מסלול טיול
async function createItinerary({ startingLocation, departureDate, endDate, budget, transportOptions }) {
    const itinerary = [];
    let currentLocation = startingLocation;
    let currentDate = new Date(departureDate);
    const totalDays = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24)); // סה"כ מספר הימים

    // קבלת הערך משדה ה-input והגדרת ערכי numDestinations או dayInterval בהתאם ל-tripOption
    const tripOption = document.getElementById("tripOption").value; // ערך ה-select
    const tripOptionValue = parseInt(document.getElementById("tripOptionInput").value); // הערך בשדה input
    
    // חישוב של מספר היעדים או מספר הימים בכל יעד בהתאם לאפשרות שנבחרה
    const numDestinations = tripOption === "destinations" ? tripOptionValue : Math.floor(totalDays / tripOptionValue);
    const dayInterval = tripOption === "days" ? tripOptionValue : Math.floor(totalDays / numDestinations);
    let remainingBudget = budget;

    console.log(`Debug: Trip option ${tripOption} with value ${tripOptionValue}, numDestinations: ${numDestinations}, dayInterval: ${dayInterval}`);

    // יצירת ה-itinerary לפי חישוב התקציב, זמינות היעדים ומשך הטיול
    for (let i = 0; i < numDestinations && remainingBudget > 0; i++) {
        const nextCity = await selectNextCity(currentLocation); // בוחר עיר הבאה
        if (!nextCity) break;

        const feasibleTransports = transportOptions.filter(async transport => {
            const cost = await calculateCost(currentLocation, nextCity, transport);
            return cost !== null && remainingBudget >= cost;
        });

        if (feasibleTransports.length === 0) {
            alert(`Insufficient budget to travel from ${currentLocation} to ${nextCity}. Consider increasing your budget.`);
            break;
        }

        const transport = feasibleTransports[0];
        const transportCost = await calculateCost(currentLocation, nextCity, transport);
        remainingBudget -= transportCost;

        itinerary.push({
            from: currentLocation,
            to: nextCity,
            date: currentDate.toISOString().split("T")[0],
            transport,
            duration: dayInterval,
            cost: transportCost
        });

        currentLocation = nextCity;
        currentDate.setDate(currentDate.getDate() + dayInterval);
    }

    // הוספת החזרה לנקודת ההתחלה אם התקציב מאפשר זאת
    if (currentLocation !== startingLocation && remainingBudget > await calculateCost(currentLocation, startingLocation, transportOptions[0])) {
        itinerary.push({
            from: currentLocation,
            to: startingLocation,
            date: currentDate.toISOString().split("T")[0],
            transport: transportOptions[0],
            duration: 1,
            cost: await calculateCost(currentLocation, startingLocation, transportOptions[0])
        });
    } else {
        alert("Budget exceeded for return trip. Consider increasing your budget.");
    }

    return itinerary;
}

async function fetchActivities(city) {
    try {
        const response = await fetch(`https://travel-advisor16.p.rapidapi.com/activities/list?location=${encodeURIComponent(city)}`, {
            method: "GET",
            headers: {
                "x-rapidapi-key": GEO_DB_API_KEY,
                "x-rapidapi-host": "travel-advisor16.p.rapidapi.com"
            }
        });
        const data = await response.json();
        return data.data.map(activity => activity.name) || ["No activities found for this city"];
    } catch (error) {
        console.error("Error fetching activities:", error);
        return ["No activities found"];
    }
}

// עדכון displayItinerary להצגת פעילויות ביעדים
async function displayItinerary(itinerary, container) {
    container.innerHTML = "<h2>Your Itinerary:</h2>";
    for (const [index, leg] of itinerary.entries()) {
        const activities = await fetchActivities(leg.to); // שליפת פעילויות ליעד הנוכחי
        const activityList = activities.map(activity => `<li>${activity}</li>`).join("");

        const legInfo = `
            <p>Day ${index + 1}: From ${leg.from} to ${leg.to} on ${leg.date} by ${leg.transport} - Cost: ${leg.cost.toFixed(2)}$</p>
            <ul>Activities:
                ${activityList}
            </ul>`;
        container.innerHTML += legInfo;
    }
}

// מאזין שמפעיל את הפונקציות בעמוד תכנון הטיול
document.addEventListener("DOMContentLoaded", () => {
    fetchLocation();
    loadCurrencies();

    const tripPlannerForm = document.getElementById("tripPlannerForm");
    const itineraryContainer = document.createElement("div");
    document.body.appendChild(itineraryContainer);

    if (tripPlannerForm) {
        tripPlannerForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const startingLocation = document.getElementById("location").value;
            const departureDate = new Date(document.getElementById("start-date").value);
            const endDate = new Date(document.getElementById("end-date").value);
            const budget = parseFloat(document.getElementById("budget").value);
            const transportOptions = Array.from(document.querySelectorAll("input[name='transportation']:checked")).map(el => el.value);

            const tripOption = document.querySelector("input[name='tripOption']:checked").value;
            const daysPerDestination = tripOption === "days" ? parseInt(document.getElementById("minDays").value) : null;
            const destinationsCount = tripOption === "destinations" ? parseInt(document.getElementById("numDestinations").value) : null;

            const itinerary = await createItinerary({
                startingLocation, departureDate, endDate, budget, transportOptions, daysPerDestination, destinationsCount
            });

            displayItinerary(itinerary, itineraryContainer);
        });
    }
});