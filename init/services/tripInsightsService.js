const getTripInsights = (destination) => {
let tripInsights = {

    budgetEfficiency: "Good",

    ecoFriendliness: "High",

    recommendedTransport: "Private Vehicle",

    tripCategory: "General Tourism",

    difficulty: "Easy",

    photography: "Excellent",

    walkingDistance: "Moderate",

    carbonFootprint: "Low",

    suitableFor: "Families, Friends & Solo Travelers",

    connectivity: "Good",

    mobileNetwork: "4G Available",

    adventure: "Medium",

    comfortScore: "90%",

    crowdLevel: "Moderate",

    bestSeason: "October - March",

    travelDifficulty: "Easy"

};

if (

    destination &&

    destination.toLowerCase().includes("waterfall")

){

    tripInsights = {

        budgetEfficiency: "Excellent",

        ecoFriendliness: "Very High",

        recommendedTransport: "Cab / Private Vehicle",

        tripCategory: "Nature & Adventure",

        difficulty: "Moderate",

        photography: "Outstanding",

        walkingDistance: "High",

        carbonFootprint: "Very Low",

        suitableFor: "Adventure Lovers",

        connectivity: "Moderate",

        mobileNetwork: "Limited",

        adventure: "High",

        comfortScore: "88%",

        crowdLevel: "Moderate",

        bestSeason: "July - February",

        travelDifficulty: "Moderate"

    };

}

else if(

    destination &&

    destination.toLowerCase().includes("wildlife")

){

    tripInsights = {

        budgetEfficiency: "Good",

        ecoFriendliness: "Excellent",

        recommendedTransport: "Safari Vehicle",

        tripCategory: "Wildlife Tourism",

        difficulty: "Moderate",

        photography: "Excellent",

        walkingDistance: "Medium",

        carbonFootprint: "Low",

        suitableFor: "Nature Enthusiasts",

        connectivity: "Limited",

        mobileNetwork: "Weak",

        adventure: "High",

        comfortScore: "86%",

        crowdLevel: "Low",

        bestSeason: "November - March",

        travelDifficulty: "Moderate"

    };

}

return tripInsights;

};

module.exports = {
    getTripInsights
};