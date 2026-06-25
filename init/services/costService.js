const calculateTripCost = (
    itinerary,
    tripDays,
    tripBudget
) => {

    const hotelCost = itinerary.reduce(

        (sum, item) => sum + item.cost,

        0

    );

    const foodCost =
        tripDays * 800;

    const transportCost =
        tripDays * 1000;

    const totalCost =

        hotelCost +

        foodCost +

        transportCost;

    const budgetStatus =

        totalCost <= tripBudget

            ? "Within Budget ✅"

            : "Budget Exceeded ❌";

    return {

        hotelCost,

        foodCost,

        transportCost,

        totalCost,

        budgetStatus

    };

};

module.exports = {

    calculateTripCost

};