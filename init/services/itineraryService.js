// =========================================================
// JHARKHAND TOURISM
// ITINERARY SERVICE
// =========================================================
//
// Responsibilities:
// - Generate the deterministic base itinerary
// - Provide destination, image, cost and hotel-district data
// - Serve as the foundation for:
//      • Hotel recommendations
//      • Cost calculation
//      • Planner timeline
//      • Interactive map
//      • PDF report
//
// Existing destination data and Planner contract are preserved.
// =========================================================


// =========================================================
// ITINERARY PROFILES
// =========================================================

const WATERFALL_ITINERARY = [

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


const WILDLIFE_ITINERARY = [

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


const GENERAL_ITINERARY = [

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
// CLONE ITINERARY
// =========================================================
//
// Return fresh objects so another service cannot accidentally
// mutate the original profile data.
// =========================================================

function cloneItinerary(itinerary) {

    return itinerary.map((item) => ({

        day: item.day,

        place: item.place,

        image: item.image,

        cost: item.cost,

        hotelDistrict: item.hotelDistrict

    }));

}


// =========================================================
// GENERATE ITINERARY
// =========================================================

const generateItinerary = (destination) => {

    const normalizedDestination =
        normalizeDestination(
            destination
        );


    // -----------------------------------------------------
    // Waterfall itinerary
    // -----------------------------------------------------

    if (
        normalizedDestination.includes(
            "waterfall"
        )
    ) {

        return cloneItinerary(
            WATERFALL_ITINERARY
        );

    }


    // -----------------------------------------------------
    // Wildlife itinerary
    // -----------------------------------------------------

    if (
        normalizedDestination.includes(
            "wildlife"
        )
    ) {

        return cloneItinerary(
            WILDLIFE_ITINERARY
        );

    }


    // -----------------------------------------------------
    // General tourism itinerary
    // -----------------------------------------------------

    return cloneItinerary(
        GENERAL_ITINERARY
    );

};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    generateItinerary

};