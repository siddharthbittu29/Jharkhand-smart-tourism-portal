// =========================================================
// JHARKHAND TOURISM — TRIP COST SERVICE
// =========================================================
//
// Calculates the estimated trip cost used by:
// - Planner Budget section
// - Planner Dashboard
// - PDF Trip Report
//
// Existing calculation model is preserved:
//   Hotel Cost    = Sum of itinerary item costs
//   Food Cost     = tripDays × 800
//   Transport     = tripDays × 1000
//   Total Cost    = Hotel + Food + Transport
//
// This service provides an estimate based on the Planner's
// existing cost model. It does not claim to be a live quote.
// =========================================================


// =========================================================
// FIXED PLANNER COST ASSUMPTIONS
// =========================================================

const FOOD_COST_PER_DAY = 800;

const TRANSPORT_COST_PER_DAY = 1000;


// =========================================================
// HELPERS
// =========================================================

function toSafeNumber(value, fallback = 0) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


// =========================================================
// CALCULATE TRIP COST
// =========================================================

const calculateTripCost = (
    itinerary,
    tripDays,
    tripBudget
) => {

    // -----------------------------------------------------
    // Ensure itinerary is always safely iterable.
    // -----------------------------------------------------

    const safeItinerary =
        Array.isArray(itinerary)
            ? itinerary
            : [];


    // -----------------------------------------------------
    // Normalize trip days.
    //
    // The Planner route already validates the requested
    // number of days, but this keeps the service safe when
    // called independently.
    // -----------------------------------------------------

    const safeTripDays =
        Math.max(
            0,
            toSafeNumber(tripDays)
        );


    // -----------------------------------------------------
    // Calculate hotel cost.
    //
    // Preserve the existing contract:
    // each itinerary item contributes item.cost.
    // -----------------------------------------------------

    const hotelCost =
        safeItinerary.reduce(
            (sum, item) => {

                const itemCost =
                    toSafeNumber(item?.cost);

                return sum + itemCost;

            },
            0
        );


    // -----------------------------------------------------
    // Food cost
    // -----------------------------------------------------

    const foodCost =
        safeTripDays *
        FOOD_COST_PER_DAY;


    // -----------------------------------------------------
    // Transport cost
    // -----------------------------------------------------

    const transportCost =
        safeTripDays *
        TRANSPORT_COST_PER_DAY;


    // -----------------------------------------------------
    // Total trip cost
    // -----------------------------------------------------

    const totalCost =
        hotelCost +
        foodCost +
        transportCost;


    // -----------------------------------------------------
    // Budget comparison
    // -----------------------------------------------------

    const safeTripBudget =
        toSafeNumber(tripBudget);


    const budgetStatus =
        totalCost <= safeTripBudget

            ? "Within Budget ✅"

            : "Budget Exceeded ❌";


    // -----------------------------------------------------
    // Preserve the existing return contract.
    // -----------------------------------------------------

    return {

        hotelCost,

        foodCost,

        transportCost,

        totalCost,

        budgetStatus

    };

};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    calculateTripCost

};