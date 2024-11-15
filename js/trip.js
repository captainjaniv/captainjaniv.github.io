// Transport cost rates per km
const transportPrices = {
  flight: 0.084,
  boat: 0.05,
  train: 0.03,
  bus: 0.02,
  car: 0.04,
  taxi: 0.1,
};

// Over-touristed cities list (this list can be extended or modified)
const overTouristedCities = [
  "Barcelona",
  "Venice",
  "Amsterdam",
  "Dubrovnik",
  "Reykjavik",
  "Florence",
  "Bruges",
  "Santorini",
  "Kyoto",
  "Prague",
  "Lisbon",
  "Dublin",
  "Siem Reap",
  "Havana",
  "Phuket",
  "Cusco",
  "Bali",
  "Mykonos",
  "Cancun",
  "Paris",
  "Vienna",
  "Budapest",
  "Salzburg",
];

// Function to get user's location for starting point
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

// Load preferred currency (optional for advanced settings)
async function loadCurrencies() {
  try {
    const response = await fetch(
      "https://openexchangerates.org/api/currencies.json"
    );
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

// Function to calculate transport cost between cities
async function calculateCost(fromCity, toCity, transport) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${fromCity}&format=json&limit=1`
    );
    const fromData = await response.json();
    const responseTo = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${toCity}&format=json&limit=1`
    );
    const toData = await responseTo.json();

    const fromCoords = [
      parseFloat(fromData[0].lat),
      parseFloat(fromData[0].lon),
    ];
    const toCoords = [parseFloat(toData[0].lat), parseFloat(toData[0].lon)];

    const distance = haversineDistance(fromCoords, toCoords);
    return distance * (transportPrices[transport] || 0);
  } catch (error) {
    console.error("Error calculating cost:", error);
    return null;
  }
}

// Calculate distance between two lat-lon coordinates
function haversineDistance(coords1, coords2) {
  const R = 6371; // Earth's radius in km
  const [lat1, lon1] = coords1.map((deg) => deg * (Math.PI / 180));
  const [lat2, lon2] = coords2.map((deg) => deg * (Math.PI / 180));

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getNextCityWithinBudget(
  currentCity,
  transport,
  budget,
  minDistanceKm = 100
) {
  try {
    console.log(
      `Finding next city from: ${currentCity} within budget: ${budget} using transport: ${transport}`
    );

    const maxDistanceKm = transport === "flight" ? 5000 : 1000;

    // Fetch coordinates for the current city
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${currentCity}&format=json&limit=1`
    );
    const currentCityData = await response.json();
    if (!currentCityData.length) {
      console.error("Current city coordinates not found");
      return null;
    }
    const currentCoords = [
      parseFloat(currentCityData[0].lat),
      parseFloat(currentCityData[0].lon),
    ];

    // Search for cities within max distance radius
    const nearbyCitiesData = [];
    let searchRadius = minDistanceKm;

    while (searchRadius <= maxDistanceKm && !nearbyCitiesData.length) {
      const responseNearby = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=50&viewbox=${
          currentCoords[1] - 5
        },${currentCoords[0] + 5},${currentCoords[1] + 5},${
          currentCoords[0] - 5
        }`
      );
      const nearbyCities = await responseNearby.json();

      nearbyCities.forEach((city) => {
        const cityCoords = [parseFloat(city.lat), parseFloat(city.lon)];
        const distance = haversineDistance(currentCoords, cityCoords);
        const travelCost = distance * (transportPrices[transport] || 0);

        if (
          distance >= minDistanceKm &&
          distance <= searchRadius &&
          travelCost <= budget
        ) {
          nearbyCitiesData.push({
            name: city.display_name,
            distance: distance,
            cost: travelCost,
          });
        }
      });

      searchRadius += 100; // Expand the search radius incrementally
    }

    // Sort cities by distance in descending order and select the farthest one within budget
    if (nearbyCitiesData.length) {
      nearbyCitiesData.sort((a, b) => b.distance - a.distance);
      const selectedCity = nearbyCitiesData[0];
      console.log(
        `Selected next city: ${selectedCity.name}, Distance: ${selectedCity.distance} km, Cost: ${selectedCity.cost}`
      );
      return selectedCity;
    } else {
      console.warn("No cities found within budget and distance constraints");
      return null;
    }
  } catch (error) {
    console.error("Error fetching next city:", error);
    return null;
  }
}

// Then, modify the createItinerary function slightly to ensure no repetition:
// Create itinerary with flexibility in distances based on transport
async function createItinerary({
  startingLocation,
  departureDate,
  endDate,
  budget,
  transportOptions,
}) {
  const itinerary = [];
  let currentLocation = startingLocation;
  let currentDate = new Date(departureDate);
  const totalDays = Math.ceil(
    (new Date(endDate) - currentDate) / (1000 * 60 * 60 * 24)
  );
  const dayInterval = 2; // Minimum days per destination
  const numDestinations = Math.floor(totalDays / dayInterval);
  let remainingBudget = budget;

  console.log(
    `Starting itinerary from ${startingLocation} with total days: ${totalDays} and budget: ${budget}`
  );

  for (let i = 0; i < numDestinations && remainingBudget > 0; i++) {
    const transport = transportOptions.includes("flight")
      ? "flight"
      : transportOptions[0];
    const nextCityData = await getNextCityWithinBudget(
      currentLocation,
      transport,
      remainingBudget
    );

    if (!nextCityData) break;

    remainingBudget -= nextCityData.cost;
    itinerary.push({
      from: currentLocation,
      to: nextCityData.name,
      date: currentDate.toISOString().split("T")[0],
      transport,
      duration: dayInterval,
      cost: nextCityData.cost,
    });

    currentLocation = nextCityData.name;
    currentDate.setDate(currentDate.getDate() + dayInterval);
  }

  // Return to starting location if budget permits
  if (remainingBudget > 0) {
    const returnCost = await calculateCost(
      currentLocation,
      startingLocation,
      transportOptions[0]
    );
    if (returnCost <= remainingBudget) {
      itinerary.push({
        from: currentLocation,
        to: startingLocation,
        date: currentDate.toISOString().split("T")[0],
        transport: transportOptions[0],
        duration: 1,
        cost: returnCost,
      });
    }
  }

  return itinerary;
}

// Display itinerary to user
async function displayItinerary(itinerary, container) {
  container.innerHTML = "<h2>Your Itinerary:</h2>";
  itinerary.forEach((leg, index) => {
    container.innerHTML += `
            <p>Day ${index + 1}: From ${leg.from} to ${leg.to} on ${
      leg.date
    } by ${leg.transport} - Cost: ${leg.cost.toFixed(2)}$</p>
        `;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchLocation();
  loadCurrencies(); // קריאת מטבעות מתווספת כאן

  // הפעלת טווח תאריכים
  flatpickr("#date-range", {
    mode: "range",
    dateFormat: "d/m/Y",
    onChange: function (selectedDates) {
      if (selectedDates.length === 2) {
        document.getElementById("start-date").value =
          selectedDates[0].toISOString();
        document.getElementById("end-date").value =
          selectedDates[1].toISOString();
      }
    },
  });

  // הצגת תפריט הגדרות מתקדמות
  const advancedSettingsToggle = document.getElementById(
    "advancedSettingsToggle"
  );
  const advancedSettings = document.getElementById("advancedSettings");

  advancedSettingsToggle.addEventListener("click", () => {
    if (
      advancedSettings.style.display === "none" ||
      !advancedSettings.style.display
    ) {
      advancedSettings.style.display = "block";
      advancedSettingsToggle.innerHTML = "Hide Advanced Settings &#9650;";
    } else {
      advancedSettings.style.display = "none";
      advancedSettingsToggle.innerHTML = "Advanced Settings &#9660;";
    }
  });

  // טיפול בטופס - שליחת נתונים
  document
    .getElementById("trip-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      // שליפת ערכים מהטופס
      const startingLocation = document.getElementById("location").value;
      const departureDate = document.getElementById("start-date").value;
      const endDate = document.getElementById("end-date").value;
      const budget = parseFloat(document.getElementById("budget").value);
      const transportOptions = Array.from(
        document.querySelectorAll("input[name='transport']:checked")
      ).map((el) => el.value);

      const tripOption = document.getElementById("tripOption").value;
      const tripOptionValue =
        parseInt(document.getElementById("tripOptionInput").value) || 2;
      const returnToStart = document.getElementById("returnToStart").checked;
      const preferredCurrency = document.getElementById("currency").value;

      const daysPerDestination = tripOption === "days" ? tripOptionValue : null;
      const destinationsCount =
        tripOption === "destinations" ? tripOptionValue : null;

      // יצירת המסלול
      const itinerary = await createItinerary({
        startingLocation,
        departureDate,
        endDate,
        budget,
        transportOptions,
        daysPerDestination,
        destinationsCount,
        returnToStart,
        preferredCurrency,
      });

      displayItinerary(
        itinerary,
        document.getElementById("itineraryContainer")
      );
    });
});
