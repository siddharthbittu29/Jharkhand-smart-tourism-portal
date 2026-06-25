const getWeatherInfo = (destination) => {

    let weatherInfo = {

        season: "Winter",

        temperature: "26°C",

        condition: "Pleasant",

        humidity: "65%",

        rainfall: "15%",

        bestTime: "October - February",

        advice:
            "Pleasant weather for sightseeing and outdoor activities.",

        packing: [
            "Light Jacket",
            "Water Bottle",
            "Comfortable Shoes"
        ]

    };

    if (
        destination &&
        destination.toLowerCase().includes("waterfall")
    ) {

        weatherInfo = {

            season: "Post Monsoon",

            temperature: "24°C",

            condition: "Cool & Pleasant",

            humidity: "72%",

            rainfall: "20%",

            bestTime: "October - February",

            advice:
                "Best season to visit waterfalls. Wear non-slip shoes and carry a rain jacket.",

            packing: [
                "Trekking Shoes",
                "Rain Jacket",
                "Water Bottle"
            ]

        };

    }

    else if (
        destination &&
        destination.toLowerCase().includes("wildlife")
    ) {

        weatherInfo = {

            season: "Winter",

            temperature: "29°C",

            condition: "Sunny",

            humidity: "58%",

            rainfall: "10%",

            bestTime: "November - March",

            advice:
                "Morning safaris are recommended. Carry water, a cap and sunscreen.",

            packing: [
                "Cap",
                "Sunglasses",
                "Water Bottle"
            ]

        };

    }

    return weatherInfo;

};

module.exports = {

    getWeatherInfo

};