// =========================================================
// JHARKHAND TOURISM — TRAVEL TIPS SERVICE
// =========================================================
//
// Provides destination-specific travel guidance for:
// - Planner Travel Tips section
// - PDF Trip Report
//
// The existing tip content and destination rules are preserved.
// =========================================================


// =========================================================
// DEFAULT TIPS
// =========================================================

const DEFAULT_TIPS = [

    "Carry identification documents",

    "Respect local traditions",

    "Keep emergency contacts handy"

];


// =========================================================
// WATERFALL TIPS
// =========================================================

const WATERFALL_TIPS = [

    "Wear non-slip shoes near waterfalls",

    "Carry rain protection and extra clothes",

    "Avoid slippery rocks and cliff edges",

    "Keep drinking water with you"

];


// =========================================================
// WILDLIFE TIPS
// =========================================================

const WILDLIFE_TIPS = [

    "Do not feed wild animals",

    "Maintain silence inside protected areas",

    "Carry binoculars",

    "Follow forest department guidelines"

];


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
// GET TRAVEL TIPS
// =========================================================

const getTravelTips = (destination) => {

    const normalizedDestination =
        normalizeDestination(destination);


    // -----------------------------------------------------
    // Waterfall destinations
    // -----------------------------------------------------

    if (
        normalizedDestination.includes("waterfall")
    ) {

        return [
            ...WATERFALL_TIPS
        ];

    }


    // -----------------------------------------------------
    // Wildlife destinations
    // -----------------------------------------------------

    if (
        normalizedDestination.includes("wildlife")
    ) {

        return [
            ...WILDLIFE_TIPS
        ];

    }


    // -----------------------------------------------------
    // General tourism
    // -----------------------------------------------------

    return [
        ...DEFAULT_TIPS
    ];

};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    getTravelTips

};