const generateAIRecommendation = (
    ecoScore,
    budgetStatus
) => {

    let aiRecommendation = "";

    if (
        ecoScore >= 90 &&
        budgetStatus.includes("Within")
    ) {

        aiRecommendation =
            "Excellent eco-friendly itinerary with minimal environmental impact.";

    }

    else if (
        ecoScore >= 80
    ) {

        aiRecommendation =
            "Balanced trip with strong sustainability and tourism experience.";

    }

    else {

        aiRecommendation =
            "Consider reducing transportation and choosing eco-friendly accommodations to improve your trip.";

    }

    return aiRecommendation;

};

module.exports = {

    generateAIRecommendation

};