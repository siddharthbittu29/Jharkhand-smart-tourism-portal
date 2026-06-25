const express = require("express");
const router = express.Router();

const {
    generateAITrip
} = require("../services/aiPlannerService");

const {
    generateItinerary
} = require("../services/itineraryService");

const {
    calculateTripCost
} = require("../services/costService");

const {
    recommendHotels
} = require("../services/hotelService");

const {
    getWeatherInfo
} = require("../services/weatherService");

const {
    generateAIRecommendation
} = require("../services/aiRecommendationService");

const {
    getTravelTips
} = require("../services/travelTipsService");

const {
    getDestinationHighlights
} = require("../services/destinationHighlightsService");

const {
    getTripInsights
} = require("../services/tripInsightsService");

router.post("/", async (req, res) => {

    const {
        destination,
        days,
        budget
    } = req.body;

    const tripDays = parseInt(days);
    const tripBudget = parseInt(budget);

    // =========================================
    // ITINERARY
    // =========================================

    const itinerary =
        generateItinerary(destination);

    // =========================================
    // ECO SCORE
    // =========================================

    const ecoScore =
        Math.floor(Math.random() * 20) + 80;

    // =========================================
    // COST ANALYSIS
    // =========================================

    const {

        hotelCost,

        foodCost,

        transportCost,

        totalCost,

        budgetStatus

    } = calculateTripCost(

        itinerary,

        tripDays,

        tripBudget

    );

    // =========================================
    // HOTEL RECOMMENDATIONS
    // =========================================

 
 const hotelRecommendations = recommendHotels(itinerary);

console.log("========== HOTELS ==========");
console.dir(hotelRecommendations, { depth: null });
console.log("============================");

    // =========================================
    // WEATHER
    // =========================================

    const weatherInfo =
        getWeatherInfo(destination);

    // =========================================
    // AI RECOMMENDATION
    // =========================================

    let aiRecommendation =
        generateAIRecommendation(

            ecoScore,

            budgetStatus

        );

    // =========================================
    // TRAVEL TIPS
    // =========================================

    let travelTips =
        getTravelTips(destination);

    // =========================================
    // DESTINATION HIGHLIGHTS
    // =========================================

    let destinationHighlights =
        getDestinationHighlights(destination);




        let packingList = [

    "Comfortable Shoes",

    "Water Bottle",

    "Camera",

    "Power Bank",

    "Sunscreen",

    "Light Jacket"

];

    // =========================================
    // AI TRIP INSIGHTS
    // =========================================

    const tripInsights =
        getTripInsights(destination);

// =========================================
// GEMINI AI
// =========================================

const aiData =
    await generateAITrip({

        destination,

        days: tripDays,

        budget: tripBudget

    });

if (aiData) {

    if (aiData.recommendation)
        aiRecommendation =
            aiData.recommendation;

    if (aiData.travelTips)
        travelTips =
            aiData.travelTips;

    if (aiData.destinationHighlights)
        destinationHighlights =
            aiData.destinationHighlights;

    if (aiData.packingList)
        packingList =
            aiData.packingList;

}

    // =========================================
    // RENDER RESULT PAGE
    // =========================================

    res.render("planner/result", {

        title: "AI Travel Plan",

        destination,

        tripDays,

        tripBudget,

        itinerary,

        ecoScore,

        hotelRecommendations,

        weatherInfo,

        aiRecommendation,

        travelTips,

        destinationHighlights,

        tripInsights,

        hotelCost,

        foodCost,

        transportCost,

        totalCost,

        budgetStatus,

        packingList,

    });

});

module.exports = router;