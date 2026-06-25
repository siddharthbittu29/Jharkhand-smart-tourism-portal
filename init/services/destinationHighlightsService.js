const getDestinationHighlights = (destination) => {

    if (
        destination &&
        destination.toLowerCase().includes("waterfall")
    ) {

        return [

            "Hundru Falls",

            "Dassam Falls",

            "Jonha Falls",

            "Lodh Falls"

        ];

    }

    if (
        destination &&
        destination.toLowerCase().includes("wildlife")
    ) {

        return [

            "Betla National Park",

            "Dalma Sanctuary",

            "Hazaribagh Wildlife Sanctuary",

            "Palamu Tiger Reserve"

        ];

    }

    return [

        "Patratu Valley",

        "Netarhat",

        "Deoghar",

        "Ranchi Lake"

    ];

};

module.exports = {

    getDestinationHighlights

};