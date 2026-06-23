const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {

    const { destination, days, budget } = req.body;

    let itinerary = [];

    const tripDays = parseInt(days);
    const tripBudget = parseInt(budget);

    if (
        destination.toLowerCase().includes("waterfall")
    ) {

        itinerary = [
            {
                day: 1,
                place: "Patratu Valley",
                image: "/images/discover/patratu.jpg",
                cost: 2500
            },
            {
                day: 2,
                place: "Lodh Falls",
                image: "/images/discover/lodh-falls.jpg",
                cost: 3500
            },
            {
                day: 3,
                place: "Hundru Falls",
                image: "/images/discover/lodh-falls.jpg",
                cost: 4000
            }
        ];

    }

    else if (
        destination.toLowerCase().includes("wildlife")
    ) {

        itinerary = [
            {
                day: 1,
                place: "Betla National Park",
                image: "/images/discover/betla.jpg",
                cost: 3000
            },
            {
                day: 2,
                place: "Dalma Wildlife Sanctuary",
                image: "/images/discover/betla.jpg",
                cost: 3500
            },
            {
                day: 3,
                place: "Hazaribagh Wildlife Sanctuary",
                image: "/images/discover/betla.jpg",
                cost: 4500
            }
        ];

    }

    else {

        itinerary = [
            {
                day: 1,
                place: "Patratu Valley",
                image: "/images/discover/patratu.jpg",
                cost: 2500
            },
            {
                day: 2,
                place: "Netarhat",
                image: "/images/discover/patratu.jpg",
                cost: 3500
            },
            {
                day: 3,
                place: "Deoghar",
                image: "/images/discover/patratu.jpg",
                cost: 4000
            }
        ];

    }

    const ecoScore = Math.floor(
        Math.random() * 20
    ) + 80;

    res.render("planner/result", {
        title: "AI Travel Plan",
        destination,
        tripDays,
        tripBudget,
        itinerary,
        ecoScore
    });

});

module.exports = router;