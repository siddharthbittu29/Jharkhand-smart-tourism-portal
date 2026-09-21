// =========================================================
// JHARKHAND TOURISM
// SHARED AI SERVICE
// =========================================================
//
// Purpose:
// - Provide shared AI utilities for the application
// - Keep Gemini configuration in one reusable location
// - Provide safe text generation
// - Provide safe JSON generation
// - Handle Gemini failures without crashing the application
//
// AI-specific feature services such as:
// - aiPlannerService.js
// - chatbotAIService.js
//
// can use this shared layer when appropriate.
//
// IMPORTANT:
// This service does not replace feature-specific AI logic.
// =========================================================

const { GoogleGenAI } = require("@google/genai");


// =========================================================
// CONFIGURATION
// =========================================================

const API_KEY =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    "";


const DEFAULT_MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-3.6-flash";


// =========================================================
// AI CLIENT
// =========================================================

let ai = null;


if (API_KEY) {

    try {

        ai = new GoogleGenAI({
            apiKey: API_KEY
        });

        console.log(
            `🟢 Shared AI service initialized with ${DEFAULT_MODEL}`
        );

    } catch (error) {

        console.error(
            "⚠️ Shared AI service initialization failed:",
            error?.message || error
        );

        ai = null;
    }

} else {

    console.warn(
        "⚠️ Shared AI service running without Gemini API key."
    );

}


// =========================================================
// GET AI STATUS
// =========================================================

function isAIAvailable() {

    return Boolean(ai);

}


function getAIStatus() {

    return {

        available: Boolean(ai),

        model: DEFAULT_MODEL,

        provider: "Google Gemini"

    };

}


// =========================================================
// SAFE VALUE HELPERS
// =========================================================

function safeText(value, fallback = "") {

    if (
        typeof value !== "string"
    ) {

        return fallback;

    }

    return value.trim();

}


// =========================================================
// GENERATE TEXT
// =========================================================
//
// Generic helper for future AI features.
//
// Example:
//
// const { generateText } = require("./aiService");
//
// const answer = await generateText({
//     prompt: "Explain Jharkhand tourism."
// });
//
// Returns:
// - generated text on success
// - null when AI is unavailable or fails
// =========================================================

async function generateText({
    prompt,
    model = DEFAULT_MODEL,
    temperature = 0.5,
    maxOutputTokens = 1000
} = {}) {

    const safePrompt =
        safeText(prompt);


    if (!safePrompt) {

        return null;

    }


    if (!ai) {

        return null;

    }


    try {

        const response =
            await ai.models.generateContent({

                model,

                contents:
                    safePrompt,

                config: {

                    temperature,

                    maxOutputTokens

                }

            });


        const text =
            response?.text || "";


        if (!text.trim()) {

            return null;

        }


        return text.trim();


    } catch (error) {

        console.error(
            "⚠️ Shared AI text generation failed:",
            error?.message || error
        );

        return null;

    }

}


// =========================================================
// SAFE JSON EXTRACTION
// =========================================================

function parseJSON(text) {

    if (!text) {

        return null;

    }


    let cleaned =
        String(text).trim();


    // -----------------------------------------------------
    // Remove Markdown fences.
    // -----------------------------------------------------

    cleaned = cleaned

        .replace(
            /^```json\s*/i,
            ""
        )

        .replace(
            /^```\s*/i,
            ""
        )

        .replace(
            /\s*```$/i,
            ""
        )

        .trim();


    // -----------------------------------------------------
    // Direct JSON parse.
    // -----------------------------------------------------

    try {

        return JSON.parse(
            cleaned
        );

    } catch (error) {

        // Continue with extraction.
    }


    // -----------------------------------------------------
    // Recover JSON object surrounded by text.
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

        const jsonText =
            cleaned.slice(
                firstBrace,
                lastBrace + 1
            );


        try {

            return JSON.parse(
                jsonText
            );

        } catch (error) {

            return null;

        }

    }


    return null;

}


// =========================================================
// GENERATE JSON
// =========================================================
//
// Generic structured JSON helper.
//
// Feature-specific services should still validate and
// normalize their own returned data.
// =========================================================

async function generateJSON({
    prompt,
    schema = null,
    model = DEFAULT_MODEL,
    temperature = 0.4,
    maxOutputTokens = 1200
} = {}) {

    const safePrompt =
        safeText(prompt);


    if (!safePrompt) {

        return null;

    }


    if (!ai) {

        return null;

    }


    try {

        const config = {

            temperature,

            maxOutputTokens,

            responseMimeType:
                "application/json"

        };


        // -------------------------------------------------
        // Add a response schema when supplied.
        // -------------------------------------------------

        if (
            schema &&
            typeof schema === "object"
        ) {

            config.responseSchema =
                schema;

        }


        const response =
            await ai.models.generateContent({

                model,

                contents:
                    safePrompt,

                config

            });


        const text =
            response?.text || "";


        if (!text.trim()) {

            return null;

        }


        return parseJSON(
            text
        );


    } catch (error) {

        console.error(
            "⚠️ Shared AI JSON generation failed:",
            error?.message || error
        );

        return null;

    }

}


// =========================================================
// BUILD TOURISM PROMPT
// =========================================================
//
// Shared prompt helper for future tourism-related AI
// features.
// =========================================================

function buildTourismPrompt({
    destination = "Jharkhand",
    task = "",
    context = ""
} = {}) {

    const safeDestination =
        safeText(
            destination,
            "Jharkhand"
        );


    const safeTask =
        safeText(
            task,
            "Provide useful tourism guidance."
        );


    const safeContext =
        safeText(
            context
        );


    return `

You are a travel intelligence assistant for
Jharkhand Tourism.

Destination:
${safeDestination}

Task:
${safeTask}

Additional context:
${safeContext || "None provided."}

Guidelines:

- Provide practical and useful tourism information.
- Do not invent bookings or reservations.
- Do not invent live prices.
- Do not claim live weather unless live weather data
  has explicitly been supplied.
- Clearly distinguish recommendations from confirmed
  information.
- Keep the response relevant to Jharkhand tourism.
- Avoid unnecessary repetition.

`;

}


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    isAIAvailable,

    getAIStatus,

    generateText,

    generateJSON,

    parseJSON,

    buildTourismPrompt

};