// =========================================================
// JHARKHAND TOURISM — WEATHER & TRIP CONDITIONS SERVICE
// =========================================================
//
// Purpose:
// - Provide deterministic destination weather guidance
// - Supply travel-condition information to the Planner
// - Keep the Planner functional without depending on an
//   external weather API
//
// IMPORTANT:
// This service provides planning guidance/static destination
// conditions. It does NOT claim to provide live weather data.
// =========================================================


// =========================================================
// DEFAULT WEATHER PROFILE
// =========================================================

const DEFAULT_WEATHER = {
    season: "Winter",
    temperature: "26°C",
    condition: "Pleasant",
    humidity: "65%",
    rainfall: "15%",
    bestTime: "October - February",

    advice:
        "Pleasant weather for sightseeing and outdoor activities.",

    packing: [
        "Light Jacket",
        "Water Bottle",
        "Comfortable Shoes"
    ],

    recommendedTransport: "Car / Cab",

    crowdLevel: "Moderate",

    travelDifficulty: "Easy",

    sustainabilityScore: 82
};


// =========================================================
// WATERFALL PROFILE
// =========================================================

const WATERFALL_WEATHER = {
    season: "Post Monsoon",
    temperature: "24°C",
    condition: "Cool & Pleasant",
    humidity: "72%",
    rainfall: "20%",
    bestTime: "October - February",

    advice:
        "Best season to visit waterfalls. Wear non-slip shoes and carry a rain jacket.",

    packing: [
        "Trekking Shoes",
        "Rain Jacket",
        "Water Bottle"
    ],

    recommendedTransport: "Car / Cab",

    crowdLevel: "Moderate",

    travelDifficulty: "Moderate",

    sustainabilityScore: 88
};


// =========================================================
// WILDLIFE PROFILE
// =========================================================

const WILDLIFE_WEATHER = {
    season: "Winter",
    temperature: "29°C",
    condition: "Sunny",
    humidity: "58%",
    rainfall: "10%",
    bestTime: "November - March",

    advice:
        "Morning safaris are recommended. Carry water, a cap and sunscreen.",

    packing: [
        "Cap",
        "Sunglasses",
        "Water Bottle"
    ],

    recommendedTransport: "Safari / Jeep",

    crowdLevel: "Low to Moderate",

    travelDifficulty: "Moderate",

    sustainabilityScore: 91
};


// =========================================================
// NORMALIZE DESTINATION
// =========================================================

function normalizeDestination(destination) {

    if (
        typeof destination !== "string"
    ) {
        return "";
    }

    return destination
        .trim()
        .toLowerCase();

}


// =========================================================
// GET WEATHER INFORMATION
// =========================================================

const getWeatherInfo = (destination) => {

    const normalizedDestination =
        normalizeDestination(destination);


    // -----------------------------------------------------
    // Start with the default profile.
    // -----------------------------------------------------

    let weatherInfo = {
        ...DEFAULT_WEATHER,
        packing: [
            ...DEFAULT_WEATHER.packing
        ]
    };


    // -----------------------------------------------------
    // Waterfall destinations
    // -----------------------------------------------------

    if (
        normalizedDestination.includes("waterfall")
    ) {

        weatherInfo = {
            ...WATERFALL_WEATHER,
            packing: [
                ...WATERFALL_WEATHER.packing
            ]
        };

    }


    // -----------------------------------------------------
    // Wildlife destinations
    // -----------------------------------------------------

    else if (
        normalizedDestination.includes("wildlife")
    ) {

        weatherInfo = {
            ...WILDLIFE_WEATHER,
            packing: [
                ...WILDLIFE_WEATHER.packing
            ]
        };

    }


    // -----------------------------------------------------
    // Return a fresh object so callers cannot accidentally
    // mutate the service's default profiles.
    // -----------------------------------------------------

    return {

        season: weatherInfo.season,

        temperature: weatherInfo.temperature,

        condition: weatherInfo.condition,

        humidity: weatherInfo.humidity,

        rainfall: weatherInfo.rainfall,

        bestTime: weatherInfo.bestTime,

        advice: weatherInfo.advice,

        packing: [
            ...weatherInfo.packing
        ],

        recommendedTransport:
            weatherInfo.recommendedTransport,

        crowdLevel:
            weatherInfo.crowdLevel,

        travelDifficulty:
            weatherInfo.travelDifficulty,

        sustainabilityScore:
            weatherInfo.sustainabilityScore

    };

};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    getWeatherInfo

};