// =========================================================
// JHARKHAND TOURISM
// CHATBOT KNOWLEDGE BASE
// =========================================================
//
// This file contains deterministic tourism information used
// by chatbotService.js.
//
// IMPORTANT:
// - Existing keywords are preserved.
// - Existing answers are preserved.
// - New entries extend the chatbot's local knowledge.
// - This data is static application knowledge, not live data.
// =========================================================

const tourismData = [

    // =====================================================
    // JHARKHAND
    // =====================================================

    {
        keywords: [
            "jharkhand",
            "about jharkhand",
            "what is jharkhand"
        ],

        answer:
            "Jharkhand is a beautiful state in eastern India, famous for waterfalls, forests, wildlife, tribal culture, temples and rich mineral resources. Ranchi is its capital city."
    },


    // =====================================================
    // RANCHI
    // =====================================================

    {
        keywords: [
            "ranchi",
            "capital"
        ],

        answer:
            "Ranchi is the capital of Jharkhand. It is known for Hundru Falls, Dassam Falls, Rock Garden, Tagore Hill, Ranchi Lake and Kanke Dam."
    },


    // =====================================================
    // WATERFALLS
    // =====================================================

    {
        keywords: [
            "waterfall",
            "waterfalls",
            "fall",
            "falls"
        ],

        answer:
            "Popular waterfalls include Hundru Falls, Dassam Falls, Jonha Falls, Lodh Falls, Hirni Falls and Panchghagh Falls."
    },


    // =====================================================
    // WILDLIFE
    // =====================================================

    {
        keywords: [
            "wildlife",
            "national park",
            "forest",
            "wildlife sanctuary",
            "tiger reserve"
        ],

        answer:
            "Jharkhand is home to Betla National Park, Dalma Wildlife Sanctuary, Hazaribagh Wildlife Sanctuary and Palamu Tiger Reserve."
    },


    // =====================================================
    // HOTELS / ACCOMMODATION
    // =====================================================

    {
        keywords: [
            "hotel",
            "hotels",
            "stay",
            "accommodation",
            "where to stay"
        ],

        answer:
            "Recommended hotels include Radisson Blu Ranchi, Capitol Hill, Prabhat Vihar Netarhat and Hotel Yuvraj Palace."
    },


    // =====================================================
    // FESTIVALS
    // =====================================================

    {
        keywords: [
            "festival",
            "festivals",
            "culture",
            "cultural festival"
        ],

        answer:
            "Major festivals celebrated in Jharkhand are Sarhul, Karma, Sohrai, Tusu, Mage Parab and Chhath."
    },


    // =====================================================
    // FOOD
    // =====================================================

    {
        keywords: [
            "food",
            "dish",
            "dishes",
            "cuisine",
            "eat",
            "local food"
        ],

        answer:
            "Popular foods include Dhuska, Rugra, Chilka Roti, Thekua, Bamboo Shoot Curry, Malpua and Handia."
    },


    // =====================================================
    // BEST TIME
    // =====================================================

    {
        keywords: [
            "best time",
            "best season",
            "when to visit",
            "visit",
            "travel season"
        ],

        answer:
            "The best time to visit Jharkhand is from October to March when the weather is pleasant for sightseeing."
    },


    // =====================================================
    // TOURISM / PLANNING
    // =====================================================

    {
        keywords: [
            "tourism",
            "tourist places",
            "tourist attractions",
            "places to visit",
            "places",
            "what to see"
        ],

        answer:
            "Jharkhand offers a mix of waterfalls, forests, wildlife, cultural experiences and heritage sites. Popular destinations include Ranchi, Netarhat, Patratu Valley, Deoghar and several protected natural areas."
    },


    // =====================================================
    // PATRATU
    // =====================================================

    {
        keywords: [
            "patratu",
            "patratu valley"
        ],

        answer:
            "Patratu Valley is known for its scenic hills, winding roads, greenery and reservoir views. It is a popular destination for nature, photography and scenic drives."
    },


    // =====================================================
    // NETARHAT
    // =====================================================

    {
        keywords: [
            "netarhat"
        ],

        answer:
            "Netarhat is a scenic hill destination known for forests, viewpoints and peaceful landscapes. It is often associated with sunrise and sunset experiences."
    },


    // =====================================================
    // DEOGHAR
    // =====================================================

    {
        keywords: [
            "deoghar",
            "baidyanath",
            "baidyanath dham"
        ],

        answer:
            "Deoghar is an important destination in Jharkhand, known for the Baidyanath temple complex and its religious and cultural significance."
    },


    // =====================================================
    // HERITAGE / CULTURE
    // =====================================================

    {
        keywords: [
            "heritage",
            "tribal culture",
            "tribal",
            "tradition",
            "traditions"
        ],

        answer:
            "Jharkhand has a rich tribal and cultural heritage reflected in its festivals, traditions, crafts, music, dance and community celebrations."
    },


    // =====================================================
    // NATURE
    // =====================================================

    {
        keywords: [
            "nature",
            "natural beauty",
            "landscape",
            "forests",
            "greenery"
        ],

        answer:
            "Jharkhand is known for forests, hills, waterfalls, valleys and diverse natural landscapes, making it suitable for nature-focused travel and outdoor experiences."
    },


    // =====================================================
    // ADVENTURE
    // =====================================================

    {
        keywords: [
            "adventure",
            "trekking",
            "trek",
            "hiking",
            "outdoor activities"
        ],

        answer:
            "Jharkhand offers opportunities for outdoor experiences around its hills, forests, waterfalls and scenic destinations. Visitors should follow local safety guidance, especially near waterfalls and forest areas."
    },


    // =====================================================
    // ECO TOURISM
    // =====================================================

    {
        keywords: [
            "eco tourism",
            "ecotourism",
            "sustainable tourism",
            "eco friendly",
            "responsible tourism"
        ],

        answer:
            "Responsible tourism in Jharkhand includes respecting local communities and traditions, avoiding litter, protecting natural areas and following rules in forests and wildlife destinations."
    },


    // =====================================================
    // TRAVEL TIPS
    // =====================================================

    {
        keywords: [
            "travel tips",
            "tips",
            "travel advice",
            "what should i carry"
        ],

        answer:
            "Carry identification documents, comfortable footwear, drinking water and appropriate clothing. For outdoor destinations, check local conditions and follow safety guidance."
    },


    // =====================================================
    // WATERFALL SAFETY
    // =====================================================

    {
        keywords: [
            "waterfall safety",
            "safe at waterfall",
            "waterfall precautions"
        ],

        answer:
            "Near waterfalls, wear suitable non-slip footwear, avoid slippery rocks and cliff edges, follow local safety instructions and be cautious during wet conditions."
    },


    // =====================================================
    // WILDLIFE SAFETY
    // =====================================================

    {
        keywords: [
            "wildlife safety",
            "safari rules",
            "forest rules",
            "wildlife precautions"
        ],

        answer:
            "In wildlife and protected areas, maintain silence, do not feed animals, follow forest department guidelines and respect designated visitor routes and timings."
    },


    // =====================================================
    // EMERGENCY / GENERAL PREPARATION
    // =====================================================

    {
        keywords: [
            "emergency",
            "emergency tips",
            "travel emergency"
        ],

        answer:
            "Keep important identification documents and emergency contacts with you while travelling. For destination-specific emergencies, follow local authorities and official guidance."
    }

];


// =========================================================
// EXPORT
// =========================================================

module.exports = tourismData;