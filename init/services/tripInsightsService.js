// =========================================================
// JHARKHAND TOURISM — TRIP INSIGHTS SERVICE
// =========================================================
//
// Provides destination-based planning insights used by:
// - Planner Dashboard
// - Weather / Conditions section
// - Trip Insights section
// - PDF Trip Report
//
// This is a deterministic planning service.
// It does not claim to provide live analytics.
// =========================================================


// =========================================================
// DEFAULT PROFILE
// =========================================================

const DEFAULT_INSIGHTS = {

    budgetEfficiency: "Good",

    ecoFriendliness: "High",

    recommendedTransport: "Private Vehicle",

    tripCategory: "General Tourism",

    difficulty: "Easy",

    photography: "Excellent",

    walkingDistance: "Moderate",

    carbonFootprint: "Low",

    suitableFor:
        "Families, Friends & Solo Travelers",

    connectivity: "Good",

    mobileNetwork: "4G Available",

    adventure: "Medium",

    comfortScore: "90%",

    crowdLevel: "Moderate",

    bestSeason: "October - March",

    travelDifficulty: "Easy"

};


// =========================================================
// WATERFALL PROFILE
// =========================================================

const WATERFALL_INSIGHTS = {

    budgetEfficiency: "Excellent",

    ecoFriendliness: "Very High",

    recommendedTransport:
        "Cab / Private Vehicle",

    tripCategory:
        "Nature & Adventure",

    difficulty: "Moderate",

    photography: "Outstanding",

    walkingDistance: "High",

    carbonFootprint: "Very Low",

    suitableFor:
        "Adventure Lovers",

    connectivity: "Moderate",

    mobileNetwork: "Limited",

    adventure: "High",

    comfortScore: "88%",

    crowdLevel: "Moderate",

    bestSeason: "July - February",

    travelDifficulty: "Moderate"

};


// =========================================================
// WILDLIFE PROFILE
// =========================================================

const WILDLIFE_INSIGHTS = {

    budgetEfficiency: "Good",

    ecoFriendliness: "Excellent",

    recommendedTransport:
        "Safari Vehicle",

    tripCategory:
        "Wildlife Tourism",

    difficulty: "Moderate",

    photography: "Excellent",

    walkingDistance: "Medium",

    carbonFootprint: "Low",

    suitableFor:
        "Nature Enthusiasts",

    connectivity: "Limited",

    mobileNetwork: "Weak",

    adventure: "High",

    comfortScore: "86%",

    crowdLevel: "Low",

    bestSeason: "November - March",

    travelDifficulty: "Moderate"

};


// =========================================================
// DESTINATION NORMALIZATION
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
// GET TRIP INSIGHTS
// =========================================================

const getTripInsights = (destination) => {

    const normalizedDestination =
        normalizeDestination(destination);


    // -----------------------------------------------------
    // Start with the general tourism profile.
    // -----------------------------------------------------

    let insights = {
        ...DEFAULT_INSIGHTS
    };


    // -----------------------------------------------------
    // Waterfall destinations
    // -----------------------------------------------------

    if (
        normalizedDestination.includes("waterfall")
    ) {

        insights = {
            ...WATERFALL_INSIGHTS
        };

    }


    // -----------------------------------------------------
    // Wildlife destinations
    // -----------------------------------------------------

    else if (
        normalizedDestination.includes("wildlife")
    ) {

        insights = {
            ...WILDLIFE_INSIGHTS
        };

    }


    // -----------------------------------------------------
    // Return a fresh object.
    // -----------------------------------------------------

    return {

        budgetEfficiency:
            insights.budgetEfficiency,

        ecoFriendliness:
            insights.ecoFriendliness,

        recommendedTransport:
            insights.recommendedTransport,

        tripCategory:
            insights.tripCategory,

        difficulty:
            insights.difficulty,

        photography:
            insights.photography,

        walkingDistance:
            insights.walkingDistance,

        carbonFootprint:
            insights.carbonFootprint,

        suitableFor:
            insights.suitableFor,

        connectivity:
            insights.connectivity,

        mobileNetwork:
            insights.mobileNetwork,

        adventure:
            insights.adventure,

        comfortScore:
            insights.comfortScore,

        crowdLevel:
            insights.crowdLevel,

        bestSeason:
            insights.bestSeason,

        travelDifficulty:
            insights.travelDifficulty

    };

};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    getTripInsights

};