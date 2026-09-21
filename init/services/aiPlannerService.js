// =========================================================
// JHARKHAND TOURISM
// AI TRIP PLANNER SERVICE
// =========================================================
//
// Responsibilities:
// - Generate optional AI-enhanced travel guidance
// - Return structured Planner data
// - Never make Gemini a single point of failure
//
// Gemini provides:
//   recommendation
//   travelTips
//   destinationHighlights
//   packingList
//
// If Gemini is unavailable, this service returns null and
// the deterministic Planner services continue normally.
// =========================================================

const { GoogleGenAI } = require("@google/genai");


// =========================================================
// CONFIGURATION
// =========================================================

const API_KEY =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    "";


const GEMINI_MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-3.6-flash";


let ai = null;


// =========================================================
// GEMINI INITIALIZATION
// =========================================================

if (API_KEY) {

    try {

        ai = new GoogleGenAI({
            apiKey: API_KEY
        });

        console.log(
            `🟢 Gemini AI initialized with ${GEMINI_MODEL}`
        );

    } catch (error) {

        console.error(
            "⚠️ Gemini initialization failed:",
            error?.message || error
        );

        ai = null;
    }

} else {

    console.warn(
        "⚠️ GEMINI_API_KEY not configured. Planner will use local intelligence."
    );

}


// =========================================================
// AI RESPONSE SCHEMA
// =========================================================
//
// Explicit structured output helps keep Gemini responses
// compatible with the Planner's expected data contract.
// =========================================================

const AI_RESPONSE_SCHEMA = {

    type: "object",

    properties: {

        recommendation: {
            type: "string"
        },

        travelTips: {
            type: "array",
            items: {
                type: "string"
            }
        },

        destinationHighlights: {
            type: "array",
            items: {
                type: "string"
            }
        },

        packingList: {
            type: "array",
            items: {
                type: "string"
            }
        }

    },

    required: [
        "recommendation",
        "travelTips",
        "destinationHighlights",
        "packingList"
    ]

};


// =========================================================
// SAFE JSON PARSER
// =========================================================

function parseAIJson(text) {

    if (!text) {
        return null;
    }


    let cleaned = String(text)
        .trim();


    // Remove Markdown code fences if returned despite
    // the structured JSON configuration.

    cleaned = cleaned
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();


    // -----------------------------------------------------
    // Direct JSON parse
    // -----------------------------------------------------

    try {

        return JSON.parse(cleaned);

    } catch (error) {

        // Continue with recovery below.

    }


    // -----------------------------------------------------
    // Attempt to extract an object from surrounding text
    // -----------------------------------------------------

    const firstBrace =
        cleaned.indexOf("{");


    const lastBrace =
        cleaned.lastIndexOf("}");


    if (
        firstBrace !== -1 &&
        lastBrace !== -1 &&
        lastBrace > firstBrace
    ) {

        const possibleJson =
            cleaned.slice(
                firstBrace,
                lastBrace + 1
            );


        try {

            return JSON.parse(possibleJson);

        } catch (error) {

            console.warn(
                "⚠️ Gemini response contained invalid JSON."
            );

        }

    }


    return null;

}


// =========================================================
// NORMALIZE STRING ARRAY
// =========================================================

function normalizeStringArray(
    value,
    maxItems
) {

    if (!Array.isArray(value)) {
        return [];
    }


    return value

        .filter(
            item =>
                typeof item === "string" &&
                item.trim().length > 0
        )

        .map(
            item => item.trim()
        )

        .slice(0, maxItems);

}


// =========================================================
// NORMALIZE AI DATA
// =========================================================

function normalizeAIData(data) {

    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {

        return null;

    }


    const recommendation =
        typeof data.recommendation === "string"
            ? data.recommendation.trim()
            : "";


    const travelTips =
        normalizeStringArray(
            data.travelTips,
            6
        );


    const destinationHighlights =
        normalizeStringArray(
            data.destinationHighlights,
            6
        );


    const packingList =
        normalizeStringArray(
            data.packingList,
            8
        );


    // -----------------------------------------------------
    // A recommendation is required for a useful AI result.
    // -----------------------------------------------------

    if (!recommendation) {
        return null;
    }


    return {

        recommendation,

        travelTips,

        destinationHighlights,

        packingList

    };

}


// =========================================================
// NORMALIZE PLANNER INPUT
// =========================================================

function normalizePlannerInput({
    destination,
    days,
    budget
}) {

    const safeDestination =
        String(destination || "Jharkhand")
            .trim()
            .slice(0, 120);


    const parsedDays =
        Number(days);


    const safeDays =
        Number.isFinite(parsedDays) &&
        parsedDays > 0

            ? Math.min(
                Math.floor(parsedDays),
                15
            )

            : 4;


    const parsedBudget =
        Number(budget);


    const safeBudget =
        Number.isFinite(parsedBudget) &&
        parsedBudget > 0

            ? Math.min(
                parsedBudget,
                10000000
            )

            : 20000;


    return {

        safeDestination,

        safeDays,

        safeBudget

    };

}


// =========================================================
// BUILD PROMPT
// =========================================================

function buildPrompt({
    destination,
    days,
    budget
}) {

    return `

You are the AI travel intelligence layer for
Jharkhand Tourism.

Create useful travel guidance for a visitor planning
a trip within Jharkhand.

Destination / travel preference:
${destination}

Trip duration:
${days} days

Travel budget:
Rs ${budget}

Return ONLY the requested JSON structure.

Rules:

- Keep the recommendation concise and useful.
- Keep travel tips practical and destination-relevant.
- Keep destination highlights relevant to the requested
  destination or travel theme.
- Keep the packing list practical.
- Do not invent hotel bookings.
- Do not invent live prices.
- Do not claim live weather.
- Do not fabricate reservations.
- Do not present uncertain information as confirmed.
- Do not include Markdown.
- Do not include explanations outside the JSON object.

Focus on helping the traveler plan a realistic
Jharkhand tourism experience.

`;

}


// =========================================================
// GENERATE AI TRIP
// =========================================================

async function generateAITrip({
    destination,
    days,
    budget
}) {

    // -----------------------------------------------------
    // Gemini is optional.
    // -----------------------------------------------------

    if (!ai) {

        return null;

    }


    const {

        safeDestination,

        safeDays,

        safeBudget

    } = normalizePlannerInput({
        destination,
        days,
        budget
    });


    const prompt =
        buildPrompt({

            destination:
                safeDestination,

            days:
                safeDays,

            budget:
                safeBudget

        });


    // =====================================================
    // GEMINI REQUEST
    // =====================================================

    try {

        const response =
            await ai.models.generateContent({

                model:
                    GEMINI_MODEL,

                contents:
                    prompt,

                config: {

                    temperature: 0.55,

                    maxOutputTokens: 1200,

                    responseMimeType:
                        "application/json",

                    responseSchema:
                        AI_RESPONSE_SCHEMA

                }

            });


        const responseText =
            response?.text || "";


        if (!responseText) {

            console.warn(
                "⚠️ Gemini returned an empty Planner response."
            );

            return null;

        }


        const parsed =
            parseAIJson(
                responseText
            );


        const normalized =
            normalizeAIData(
                parsed
            );


        if (!normalized) {

            console.warn(
                "⚠️ Gemini Planner response could not be normalized."
            );

            return null;

        }


        return normalized;


    } catch (error) {

        const status =
            error?.status ||
            error?.code ||
            "unknown";


        console.error(
            `⚠️ Gemini Planner request failed (${status}):`,
            error?.message || error
        );


        // -------------------------------------------------
        // IMPORTANT:
        //
        // Never allow an AI failure to break the Planner.
        // Deterministic services continue to provide:
        //
        // - itinerary
        // - hotels
        // - weather
        // - costs
        // - insights
        // - tips
        // - highlights
        //
        // -------------------------------------------------

        return null;

    }

}


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    generateAITrip

};