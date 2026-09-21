// =========================================================
// JHARKHAND TOURISM — DESTINATION HIGHLIGHTS SERVICE
// =========================================================
//
// Provides destination highlights for:
// - Planner Highlights section
// - PDF Trip Report
// - AI Planner fallback data
//
// Existing destination groups and values are preserved.
// =========================================================


// =========================================================
// DEFAULT HIGHLIGHTS
// =========================================================

const DEFAULT_HIGHLIGHTS = [

    "Patratu Valley",

    "Netarhat",

    "Deoghar",

    "Ranchi Lake"

];


// =========================================================
// WATERFALL HIGHLIGHTS
// =========================================================

const WATERFALL_HIGHLIGHTS = [

    "Hundru Falls",

    "Dassam Falls",

    "Jonha Falls",

    "Lodh Falls"

];


// =========================================================
// WILDLIFE HIGHLIGHTS
// =========================================================

const WILDLIFE_HIGHLIGHTS = [

    "Betla National Park",

    "Dalma Sanctuary",

    "Hazaribagh Wildlife Sanctuary",

    "Palamu Tiger Reserve"

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
// GET DESTINATION HIGHLIGHTS
// =========================================================

const getDestinationHighlights = (destination) => {

    const normalizedDestination =
        normalizeDestination(destination);


    // -----------------------------------------------------
    // Waterfall destinations
    // -----------------------------------------------------

    if (
        normalizedDestination.includes("waterfall")
    ) {

        return [
            ...WATERFALL_HIGHLIGHTS
        ];

    }


    // -----------------------------------------------------
    // Wildlife destinations
    // -----------------------------------------------------

    if (
        normalizedDestination.includes("wildlife")
    ) {

        return [
            ...WILDLIFE_HIGHLIGHTS
        ];

    }


    // -----------------------------------------------------
    // General tourism
    // -----------------------------------------------------

    return [
        ...DEFAULT_HIGHLIGHTS
    ];

};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    getDestinationHighlights

};