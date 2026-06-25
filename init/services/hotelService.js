const hotels = require("../models/hotels");

const recommendHotels = (itinerary) => {

    const usedHotels = new Set();

    return itinerary.map(item => {

        const districtHotels = hotels.filter(

            hotel => hotel.district === item.hotelDistrict

        );

        if (districtHotels.length === 0) {

            return {

                place: item.place,

                hotel: null

            };

        }

        // Prefer hotels that haven't been used yet
        let availableHotels = districtHotels.filter(

            hotel => !usedHotels.has(hotel.id)

        );

        // If every hotel has already been used,
        // allow reuse.
        if (availableHotels.length === 0) {

            availableHotels = districtHotels;

        }

        // Highest rated hotel first
        availableHotels.sort((a, b) => {

    // Higher rating first
    if (b.rating !== a.rating) {
        return b.rating - a.rating;
    }

    // If same rating, cheaper hotel first
    return a.price_from - b.price_from;

});

        const recommendedHotel = availableHotels[0];
        console.log(
    `Recommended for ${item.place}: ${recommendedHotel.name}`
);

        usedHotels.add(recommendedHotel.id);

        return {

            place:item.place,

            hotel:recommendedHotel

        };

    });

};


module.exports = {

    recommendHotels

};