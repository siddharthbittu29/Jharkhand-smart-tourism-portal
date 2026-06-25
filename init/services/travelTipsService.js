const getTravelTips = (destination) => {

    if (
        destination &&
        destination.toLowerCase().includes("waterfall")
    ) {

        return [

            "Wear non-slip shoes near waterfalls",

            "Carry rain protection and extra clothes",

            "Avoid slippery rocks and cliff edges",

            "Keep drinking water with you"

        ];

    }

    if (
        destination &&
        destination.toLowerCase().includes("wildlife")
    ) {

        return [

            "Do not feed wild animals",

            "Maintain silence inside protected areas",

            "Carry binoculars",

            "Follow forest department guidelines"

        ];

    }

    return [

        "Carry identification documents",

        "Respect local traditions",

        "Keep emergency contacts handy"

    ];

};

module.exports = {

    getTravelTips

};