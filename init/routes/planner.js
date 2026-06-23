const express = require("express");
const router = express.Router();

const hotels = require("../models/hotels");

router.post("/", (req, res) => {

    const { destination, days, budget } = req.body;

    let itinerary = [];

    const tripDays = parseInt(days);
    const tripBudget = parseInt(budget);

    // WATERFALL TRIP
    if (
        destination &&
        destination.toLowerCase().includes("waterfall")
    ) {

        itinerary = [
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

    }

    // WILDLIFE TRIP
    else if (
        destination &&
        destination.toLowerCase().includes("wildlife")
    ) {

        itinerary = [
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

    }

    // DEFAULT TRIP
    else {

        itinerary = [
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

    }

    const ecoScore =
        Math.floor(Math.random() * 20) + 80;

    // HOTEL RECOMMENDATIONS

    const hotelRecommendations = itinerary.map(item => {

        const hotel = hotels.find(
            h => h.district === item.hotelDistrict
        );

        return {
            place: item.place,
            hotel
        };

    });

    res.render("planner/result", {
        title: "AI Travel Plan",
        destination,
        tripDays,
        tripBudget,
        itinerary,
        ecoScore,
        hotelRecommendations
    });

});

module.exports = router;