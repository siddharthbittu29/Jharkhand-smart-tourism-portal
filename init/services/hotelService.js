// =========================================================
// JHARKHAND TOURISM — HOTEL RECOMMENDATION SERVICE
// =========================================================
//
// Responsibilities:
// - Recommend hotels for itinerary destinations
// - Match hotels by district
// - Prefer unused hotels
// - Prefer higher-rated hotels
// - Use lower price as the tie-breaker
// - Preserve the existing { place, hotel } contract
//
// Data source:
// - ../models/hotels
//
// No production hotel data is created here.
// =========================================================

const hotels = require("../models/hotels");


// =========================================================
// HELPERS
// =========================================================

function getRating(hotel) {
    const rating = Number(hotel?.rating);

    return Number.isFinite(rating)
        ? rating
        : 0;
}


function getPrice(hotel) {
    const price = Number(hotel?.price_from);

    return Number.isFinite(price)
        ? price
        : Number.POSITIVE_INFINITY;
}


function getHotelId(hotel) {
    return String(hotel?.id || "");
}


// =========================================================
// RECOMMEND HOTELS
// =========================================================

const recommendHotels = (itinerary) => {

    // Always return an array.
    if (!Array.isArray(itinerary)) {
        return [];
    }


    // Track hotels already recommended during this plan.
    const usedHotels = new Set();


    return itinerary.map((item) => {

        const hotelDistrict =
            String(item?.hotelDistrict || "").trim();


        // -----------------------------------------------------
        // No district available
        // -----------------------------------------------------

        if (!hotelDistrict) {

            return {
                place: item?.place || "",
                hotel: null
            };

        }


        // -----------------------------------------------------
        // Find hotels in the itinerary destination district
        // -----------------------------------------------------

        const districtHotels = hotels.filter((hotel) => {

            return (
                String(hotel?.district || "").trim() ===
                hotelDistrict
            );

        });


        // -----------------------------------------------------
        // No matching hotel
        // -----------------------------------------------------

        if (districtHotels.length === 0) {

            return {
                place: item?.place || "",
                hotel: null
            };

        }


        // -----------------------------------------------------
        // Prefer hotels that have not already been used
        // -----------------------------------------------------

        let availableHotels =
            districtHotels.filter((hotel) => {

                return !usedHotels.has(
                    getHotelId(hotel)
                );

            });


        // -----------------------------------------------------
        // If every hotel in this district was already used,
        // allow reuse.
        //
        // This keeps the planner functional even when a district
        // has fewer hotels than itinerary days.
        // -----------------------------------------------------

        if (availableHotels.length === 0) {

            availableHotels = [
                ...districtHotels
            ];

        }


        // -----------------------------------------------------
        // Ranking logic
        //
        // 1. Higher rating
        // 2. Lower starting price when ratings match
        //
        // The source dataset is never mutated.
        // -----------------------------------------------------

        availableHotels.sort((a, b) => {

            const ratingDifference =
                getRating(b) - getRating(a);


            if (ratingDifference !== 0) {

                return ratingDifference;

            }


            return (
                getPrice(a) -
                getPrice(b)
            );

        });


        // -----------------------------------------------------
        // Select recommendation
        // -----------------------------------------------------

        const recommendedHotel =
            availableHotels[0] || null;


        // -----------------------------------------------------
        // Track selected hotel
        // -----------------------------------------------------

        if (recommendedHotel) {

            const hotelId =
                getHotelId(recommendedHotel);


            if (hotelId) {

                usedHotels.add(hotelId);

            }

        }


        // -----------------------------------------------------
        // Preserve existing service contract
        // -----------------------------------------------------

        return {

            place: item?.place || "",

            hotel: recommendedHotel

        };

    });

};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    recommendHotels

};