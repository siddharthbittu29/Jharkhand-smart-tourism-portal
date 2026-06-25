const express = require("express");
const router = express.Router();

const hotels = require("../models/hotels");

router.post("/", (req, res) => {

    const { destination, days, budget } = req.body;

    let itinerary = [];

    const tripDays = parseInt(days);
    const tripBudget = parseInt(budget);

    // WATERFALL TRIP
    if (
        destination &&
        destination.toLowerCase().includes("waterfall")
    ) {

        itinerary = [
            {
                day: 1,
                place: "Patratu Valley",
                image: "/images/discover/patratu.jpg",
                cost: 2500,
                hotelDistrict: "Ranchi"
            },
            {
                day: 2,
                place: "Lodh Falls",
                image: "/images/discover/lodh-falls.jpg",
                cost: 3500,
                hotelDistrict: "Latehar"
            },
            {
                day: 3,
                place: "Hundru Falls",
                image: "/images/discover/lodh-falls.jpg",
                cost: 4000,
                hotelDistrict: "Ranchi"
            }
        ];

    }

    // WILDLIFE TRIP
    else if (
        destination &&
        destination.toLowerCase().includes("wildlife")
    ) {

        itinerary = [
            {
                day: 1,
                place: "Betla National Park",
                image: "/images/discover/betla.jpg",
                cost: 3000,
                hotelDistrict: "Palamu"
            },
            {
                day: 2,
                place: "Dalma Wildlife Sanctuary",
                image: "/images/discover/betla.jpg",
                cost: 3500,
                hotelDistrict: "Jamshedpur"
            },
            {
                day: 3,
                place: "Hazaribagh Wildlife Sanctuary",
                image: "/images/discover/betla.jpg",
                cost: 4500,
                hotelDistrict: "Ranchi"
            }
        ];

    }

    // DEFAULT TRIP
    else {

        itinerary = [
            {
                day: 1,
                place: "Patratu Valley",
                image: "/images/discover/patratu.jpg",
                cost: 2500,
                hotelDistrict: "Ranchi"
            },
            {
                day: 2,
                place: "Netarhat",
                image: "/images/discover/patratu.jpg",
                cost: 3500,
                hotelDistrict: "Latehar"
            },
            {
                day: 3,
                place: "Deoghar",
                image: "/images/discover/patratu.jpg",
                cost: 4000,
                hotelDistrict: "Deoghar"
            }
        ];

    }

    const ecoScore =
        Math.floor(Math.random() * 20) + 80;

        // COST CALCULATOR

            const hotelCost = itinerary.reduce(
                (sum, item) => sum + item.cost,
                0
            );

            const foodCost = tripDays * 800;

            const transportCost = tripDays * 1000;

            const totalCost =
                hotelCost +
                foodCost +
                transportCost;

            const budgetStatus =
                totalCost <= tripBudget
                    ? "Within Budget ✅"
                    : "Budget Exceeded ❌";

           let aiRecommendation = "";

if (ecoScore >= 95) {

    aiRecommendation =
        "Excellent eco-friendly itinerary with minimal environmental impact.";

}
else if (ecoScore >= 85) {

    aiRecommendation =
        "Balanced trip with strong sustainability and tourism experience.";

}
else {

    aiRecommendation =
        "Consider eco-friendly transport and accommodations to improve sustainability.";

}         
// ===============================
// ECO INTELLIGENCE
// ===============================

const budgetPercentage = Math.min(
    Math.round((totalCost / tripBudget) * 100),
    100
);

let carbonImpact = "";
let travelDifficulty = "";
let bestSeason = "";
let crowdLevel = "";
let weather = "";
let recommendedStay = `${tripDays} Days`;

if (
    destination &&
    destination.toLowerCase().includes("waterfall")
) {

    carbonImpact = "Low";
    travelDifficulty = "Moderate";
    bestSeason = "October - February";
    crowdLevel = "Low";
    weather = "Pleasant";

}
else if (
    destination &&
    destination.toLowerCase().includes("wildlife")
) {

    carbonImpact = "Medium";
    travelDifficulty = "Easy";
    bestSeason = "November - March";
    crowdLevel = "Medium";
    weather = "Cool";

}
else {

    carbonImpact = "Low";
    travelDifficulty = "Easy";
    bestSeason = "All Year";
    crowdLevel = "Moderate";
    weather = "Pleasant";

}



    // HOTEL RECOMMENDATIONS
            const hotelRecommendations = itinerary.map(item => {

    const districtHotels = hotels.filter(
        h => h.district === item.hotelDistrict
    );

    districtHotels.sort(
        (a, b) =>
            b.rating - a.rating
    );

    let recommendedHotel;

    if (tripBudget <= 10000) {

        recommendedHotel =
            districtHotels.find(
                h => h.price_from <= 3000
            ) || districtHotels[0];

    }

    else if (tripBudget <= 20000) {

        recommendedHotel =
            districtHotels.find(
                h => h.price_from <= 5000
            ) || districtHotels[0];

    }

    else {

        recommendedHotel =
            districtHotels[0];

    }

    return {
        place: item.place,
        hotel: recommendedHotel
    };

});
let travelTips = [];
// =========================================
// DESTINATION HIGHLIGHTS
// =========================================

let destinationHighlights = [];

if (
    destination &&
    destination.toLowerCase().includes("waterfall")
) {

    destinationHighlights = [
        "Hundru Falls",
        "Dassam Falls",
        "Lodh Falls",
        "Jonha Falls",
        "Nature Photography",
        "Scenic Valleys"
    ];

}
else if (
    destination &&
    destination.toLowerCase().includes("wildlife")
) {

    destinationHighlights = [
        "Betla National Park",
        "Dalma Wildlife Sanctuary",
        "Jungle Safari",
        "Bird Watching",
        "Nature Trails",
        "Forest Adventure"
    ];

}
else {

    destinationHighlights = [
        "Netarhat",
        "Patratu Valley",
        "Deoghar",
        "Tribal Culture",
        "Local Cuisine",
        "Eco Tourism"
    ];

}

if (
    destination &&
    destination.toLowerCase().includes("waterfall")
) {

    travelTips = [
        "Wear non-slip shoes near waterfalls",
        "Carry rain protection and extra clothes",
        "Avoid slippery rocks and cliff edges",
        "Keep drinking water with you"
    ];

}
else if (
    destination &&
    destination.toLowerCase().includes("wildlife")
) {

    travelTips = [
        "Do not feed wild animals",
        "Carry binoculars and camera",
        "Follow forest department guidelines",
        "Avoid making loud noises"
    ];

}
else {

    travelTips = [
        "Book hotels in advance",
        "Carry identification documents",
        "Respect local traditions",
        "Keep emergency contacts handy"
    ];

}

// ========================================
// WEATHER INFORMATION
// ========================================

let weatherInfo = {

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
    ]

};

if (
    destination &&
    destination.toLowerCase().includes("waterfall")
) {

   weatherInfo = {

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
    ]

};

}
// =========================================
// AI TRIP INSIGHTS
// =========================================

let tripInsights = {

    difficulty: "Easy",

    adventure: "★★★★☆",

    photography: "★★★★★",

    walkingDistance: "18 km",

    carbonFootprint: "Low 🌱",

    suitableFor: "Families, Couples",

    connectivity: "Good",

    mobileNetwork: "Jio, Airtel",

    crowdLevel: "Moderate",

    comfortScore: "9.2 / 10"

};

if (
    destination &&
    destination.toLowerCase().includes("waterfall")
) {

    tripInsights = {

        difficulty: "Moderate",

        adventure: "★★★★★",

        photography: "★★★★★",

        walkingDistance: "21 km",

        carbonFootprint: "Very Low 🌱",

        suitableFor: "Adventure Lovers",

        connectivity: "Average",

        mobileNetwork: "Jio, Airtel",

        crowdLevel: "Low",

        comfortScore: "8.8 / 10"

    };

}

else if (
    destination &&
    destination.toLowerCase().includes("wildlife")
) {

    tripInsights = {

        difficulty: "Easy",

        adventure: "★★★★☆",

        photography: "★★★★☆",

        walkingDistance: "12 km",

        carbonFootprint: "Low 🌱",

        suitableFor: "Families & Nature Lovers",

        connectivity: "Good",

        mobileNetwork: "Jio, Airtel, BSNL",

        crowdLevel: "Medium",

        comfortScore: "9.4 / 10"

    };

}

else if (
    destination &&
    destination.toLowerCase().includes("wildlife")
) {

   weatherInfo = {

    season: "Winter",

    temperature: "29°C",

    condition: "Sunny",

    humidity: "58%",

    rainfall: "10%",

    bestTime: "November - March",

    advice:
        "Morning safaris are recommended. Carry water, a cap, and sunscreen.",

    packing: [
        "Cap",
        "Sunglasses",
        "Water Bottle"
    ]

};

}

console.log("travelTips =", travelTips);
console.log("aiRecommendation =", aiRecommendation);


res.render("planner/result", {
    title: "AI Travel Plan",
    destination,
    tripDays,
    tripBudget,
    itinerary,
    ecoScore,

    hotelRecommendations,
    aiRecommendation,
    travelTips,
    destinationHighlights,

    weatherInfo,
    tripInsights,

    hotelCost,
    foodCost,
    transportCost,
    totalCost,
    budgetStatus
});

});

module.exports = router;