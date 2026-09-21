// =========================================================
// JHARKHAND TOURISM — AI RECOMMENDATION SERVICE
// =========================================================
//
// Generates a deterministic recommendation using:
// - Eco Score
// - Budget Status
//
// This service acts as a reliable fallback/recommendation
// layer and does not require an external AI API.
// =========================================================


// =========================================================
// GENERATE AI RECOMMENDATION
// =========================================================

const generateAIRecommendation = (
    ecoScore,
    budgetStatus
) => {

    // -----------------------------------------------------
    // Normalize inputs safely.
    // -----------------------------------------------------

    const safeEcoScore =
        Number.isFinite(Number(ecoScore))
            ? Number(ecoScore)
            : 0;


    const safeBudgetStatus =
        typeof budgetStatus === "string"
            ? budgetStatus
            : "";


    // -----------------------------------------------------
    // Excellent eco-friendly trip + within budget
    // -----------------------------------------------------

    if (
        safeEcoScore >= 90 &&
        safeBudgetStatus.includes("Within")
    ) {

        return (
            "Excellent eco-friendly itinerary with minimal environmental impact."
        );

    }


    // -----------------------------------------------------
    // Strong sustainability
    // -----------------------------------------------------

    if (
        safeEcoScore >= 80
    ) {

        return (
            "Balanced trip with strong sustainability and tourism experience."
        );

    }


    // -----------------------------------------------------
    // Improvement recommendation
    // -----------------------------------------------------

    return (
        "Consider reducing transportation and choosing eco-friendly accommodations to improve your trip."
    );

};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    generateAIRecommendation

};