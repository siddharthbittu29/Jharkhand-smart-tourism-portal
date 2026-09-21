// ============================================================
// JHARKHAND TOURISM — PLANNER CONTROLLER
// File: init/controllers/plannerController.js
//
// Responsibilities:
// - Render planner landing page
// - Validate planner input
// - Generate itinerary
// - Calculate cost
// - Recommend hotels
// - Load weather
// - Generate local AI recommendations
// - Load travel tips
// - Load destination highlights
// - Load trip insights
// - Apply Gemini enhancement when available
// - Render planner result
//
// Existing service contracts are preserved.
// ============================================================


const {
  generateAITrip
} =
  require(
    "../services/aiPlannerService"
  );


const {
  generateItinerary
} =
  require(
    "../services/itineraryService"
  );


const {
  calculateTripCost
} =
  require(
    "../services/costService"
  );


const {
  recommendHotels
} =
  require(
    "../services/hotelService"
  );


const {
  getWeatherInfo
} =
  require(
    "../services/weatherService"
  );


const {
  generateAIRecommendation
} =
  require(
    "../services/aiRecommendationService"
  );


const {
  getTravelTips
} =
  require(
    "../services/travelTipsService"
  );


const {
  getDestinationHighlights
} =
  require(
    "../services/destinationHighlightsService"
  );


const {
  getTripInsights
} =
  require(
    "../services/tripInsightsService"
  );


// ============================================================
// GET /planner
// Render planner landing page
// ============================================================

exports.showPlanner =
  (req, res) => {

    try {

      return res.render(
        "planner/index",
        {
          title:
            "AI Trip Planner"
        }
      );

    } catch (error) {

      console.error(
        "❌ GET /planner error:",
        error
      );

      return res.status(500).send(
        "Unable to load the AI Trip Planner right now."
      );
    }
  };


// ============================================================
// POST /planner
// Generate travel plan
// ============================================================

exports.generatePlan =
  async (req, res) => {

    try {

      // ======================================================
      // INPUT
      // ======================================================

      const destination =
        String(
          req.body?.destination || ""
        ).trim();


      const tripDays =
        parseInt(
          req.body?.days,
          10
        );


      const tripBudget =
        parseInt(
          req.body?.budget,
          10
        );


      // ======================================================
      // VALIDATION
      // ======================================================

      if (!destination) {

        return res.status(400).send(
          "Please enter a destination or trip preference."
        );
      }


      if (
        !Number.isFinite(tripDays) ||
        tripDays < 1 ||
        tripDays > 15
      ) {

        return res.status(400).send(
          "Trip duration must be between 1 and 15 days."
        );
      }


      if (
        !Number.isFinite(tripBudget) ||
        tripBudget <= 0
      ) {

        return res.status(400).send(
          "Please enter a valid travel budget."
        );
      }


      // ======================================================
      // ITINERARY
      // ======================================================

      const itinerary =
        generateItinerary(
          destination
        );


      // ======================================================
      // ECO SCORE
      // ======================================================

      const ecoScore =
        Math.floor(
          Math.random() * 20
        ) + 80;


      // ======================================================
      // COST ANALYSIS
      // ======================================================

      const {
        hotelCost,
        foodCost,
        transportCost,
        totalCost,
        budgetStatus
      } =
        calculateTripCost(
          itinerary,
          tripDays,
          tripBudget
        );


      // ======================================================
      // HOTEL RECOMMENDATIONS
      // ======================================================

      const hotelRecommendations =
        recommendHotels(
          itinerary
        );


      // ======================================================
      // WEATHER
      // ======================================================

      const weatherInfo =
        getWeatherInfo(
          destination
        );


      // ======================================================
      // LOCAL AI RECOMMENDATION
      // ======================================================

      let aiRecommendation =
        generateAIRecommendation(
          ecoScore,
          budgetStatus
        );


      // ======================================================
      // TRAVEL TIPS
      // ======================================================

      let travelTips =
        getTravelTips(
          destination
        );


      // ======================================================
      // DESTINATION HIGHLIGHTS
      // ======================================================

      let destinationHighlights =
        getDestinationHighlights(
          destination
        );


      // ======================================================
      // DEFAULT PACKING LIST
      // ======================================================

      let packingList = [

        "Comfortable Shoes",

        "Water Bottle",

        "Camera",

        "Power Bank",

        "Sunscreen",

        "Light Jacket"

      ];


      // ======================================================
      // TRIP INSIGHTS
      // ======================================================

      const tripInsights =
        getTripInsights(
          destination
        );


      // ======================================================
      // GEMINI ENHANCEMENT
      // ======================================================

      /*
       * Gemini is optional enhancement.
       *
       * The deterministic planner must still work when:
       *
       * - API key is unavailable
       * - quota is exhausted
       * - request is rate-limited
       * - service fails
       * - response is empty
       */

      let aiData =
        null;


      try {

        aiData =
          await generateAITrip({

            destination,

            days:
              tripDays,

            budget:
              tripBudget

          });

      } catch (error) {

        console.error(
          "⚠️ Gemini AI enhancement unavailable:",
          error?.message ||
            error
        );

        aiData =
          null;
      }


      // ======================================================
      // APPLY AI ENHANCEMENTS
      // ======================================================

      if (
        aiData &&
        typeof aiData ===
          "object"
      ) {

        if (
          aiData.recommendation
        ) {

          aiRecommendation =
            aiData.recommendation;
        }


        if (
          aiData.travelTips
        ) {

          travelTips =
            aiData.travelTips;
        }


        if (
          aiData.destinationHighlights
        ) {

          destinationHighlights =
            aiData.destinationHighlights;
        }


        if (
          Array.isArray(
            aiData.packingList
          ) &&
          aiData.packingList.length
        ) {

          packingList =
            aiData.packingList;
        }
      }


      // ======================================================
      // RENDER RESULT
      // ======================================================

      return res.render(
        "planner/result",
        {

          title:
            "AI Travel Plan",

          destination,

          tripDays,

          tripBudget,

          itinerary,

          ecoScore,

          hotelRecommendations,

          weatherInfo,

          aiRecommendation,

          travelTips,

          destinationHighlights,

          tripInsights,

          hotelCost,

          foodCost,

          transportCost,

          totalCost,

          budgetStatus,

          packingList

        }
      );

    } catch (error) {

      // ======================================================
      // ERROR
      // ======================================================

      console.error(
        "❌ POST /planner error:",
        error
      );


      return res.status(500).send(`
        <div
          style="
            max-width:760px;
            margin:60px auto;
            padding:32px;
            font-family:Arial,sans-serif;
            color:#17372c;
          "
        >

          <h1>
            Unable to generate your travel plan
          </h1>

          <p>
            Something went wrong while preparing
            your itinerary. Please try again.
          </p>

          <a
            href="/planner"
            style="
              display:inline-block;
              margin-top:16px;
              padding:12px 20px;
              border-radius:8px;
              background:#185843;
              color:#fff;
              text-decoration:none;
            "
          >
            Back to Trip Planner
          </a>

        </div>
      `);
    }
  };