const generateItinerary = (destination) => {

    let itinerary = [];

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

    return itinerary;

};

module.exports = {
    generateItinerary
};