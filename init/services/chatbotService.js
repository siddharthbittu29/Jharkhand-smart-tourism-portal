// =========================================================
// JHARKHAND TOURISM
// CHATBOT SERVICE
// =========================================================
//
// Responsibilities:
// - Local tourism knowledge lookup
// - Specific keyword matching
// - AI-enhanced responses when local knowledge is insufficient
// - Reliable fallback when Gemini is unavailable
//
// Existing API preserved:
//     getChatbotResponse(message)
//
// AI-aware API:
//     getSmartChatbotResponse(options)
//
// =========================================================

const tourismData =
    require("./chatbotData");

const {
    generateChatbotResponse
} = require("./chatbotAIService");


// =========================================================
// CONSTANTS
// =========================================================

const FALLBACK_MESSAGE =
    "Sorry, I don't have information about that yet.";


const MIN_KEYWORD_LENGTH_FOR_SCORE = 3;


// =========================================================
// NORMALIZE MESSAGE
// =========================================================

function normalizeMessage(message) {

    if (
        typeof message !== "string"
    ) {

        return "";

    }


    return message
        .trim()
        .toLowerCase();

}


// =========================================================
// NORMALIZE KEYWORD
// =========================================================

function normalizeKeyword(keyword) {

    if (
        typeof keyword !== "string"
    ) {

        return "";

    }


    return keyword
        .trim()
        .toLowerCase();

}


// =========================================================
// CALCULATE KEYWORD SCORE
// =========================================================
//
// Longer and more specific phrases receive a higher score.
//
// Examples:
//
// "visit"
//       → low specificity
//
// "when to visit"
//       → higher specificity
//
// "netarhat"
//       → highly relevant to a Netarhat question
//
// =========================================================

function calculateKeywordScore(
    query,
    keyword
) {

    const normalizedKeyword =
        normalizeKeyword(
            keyword
        );


    if (
        !normalizedKeyword ||
        normalizedKeyword.length <
            MIN_KEYWORD_LENGTH_FOR_SCORE
    ) {

        return 0;

    }


    if (
        !query.includes(
            normalizedKeyword
        )
    ) {

        return 0;

    }


    let score = 0;


    // -----------------------------------------------------
    // Base score based on keyword length.
    // -----------------------------------------------------

    score +=
        normalizedKeyword.length * 2;


    // -----------------------------------------------------
    // Phrase bonus.
    //
    // Multi-word keywords are generally more specific.
    // -----------------------------------------------------

    const wordCount =
        normalizedKeyword
            .split(/\s+/)
            .filter(Boolean)
            .length;


    if (
        wordCount > 1
    ) {

        score +=
            wordCount * 15;

    }


    // -----------------------------------------------------
    // Exact query match gets a strong bonus.
    // -----------------------------------------------------

    if (
        query ===
        normalizedKeyword
    ) {

        score += 100;

    }


    // -----------------------------------------------------
    // Word-boundary bonus.
    //
    // Prevents very short keywords from receiving the same
    // value as a clearly separated phrase.
    // -----------------------------------------------------

    const escapedKeyword =
        normalizedKeyword.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    const boundaryRegex =
        new RegExp(
            `(^|\\s)${escapedKeyword}(?=\\s|$|[?.!,])`,
            "i"
        );


    if (
        boundaryRegex.test(
            query
        )
    ) {

        score += 20;

    }


    return score;

}


// =========================================================
// FIND BEST LOCAL KNOWLEDGE MATCH
// =========================================================

function findBestLocalMatch(message) {

    const query =
        normalizeMessage(
            message
        );


    if (!query) {

        return null;

    }


    let bestMatch = null;


    for (
        let index = 0;
        index < tourismData.length;
        index++
    ) {

        const item =
            tourismData[index];


        if (
            !item ||
            !Array.isArray(
                item.keywords
            ) ||
            typeof item.answer !== "string"
        ) {

            continue;

        }


        let entryScore = 0;

        let matchedKeywords = 0;


        for (
            const keyword of item.keywords
        ) {

            const score =
                calculateKeywordScore(
                    query,
                    keyword
                );


            if (
                score > 0
            ) {

                matchedKeywords++;

                entryScore += score;

            }

        }


        if (
            matchedKeywords === 0
        ) {

            continue;

        }


        // -------------------------------------------------
        // Small bonus when multiple keywords from the same
        // knowledge entry match the user's question.
        // -------------------------------------------------

        entryScore +=
            matchedKeywords * 10;


        // -------------------------------------------------
        // Keep the strongest result.
        // -------------------------------------------------

        if (
            !bestMatch ||
            entryScore >
                bestMatch.score
        ) {

            bestMatch = {

                item,

                score: entryScore,

                matchedKeywords

            };

        }

    }


    return bestMatch;

}


// =========================================================
// LOCAL CHATBOT RESPONSE
// =========================================================
//
// This remains synchronous for compatibility with existing
// chatbot routes.
// =========================================================

function getChatbotResponse(message) {

    const bestMatch =
        findBestLocalMatch(
            message
        );


    if (
        !bestMatch
    ) {

        return FALLBACK_MESSAGE;

    }


    return bestMatch.item.answer;

}


// =========================================================
// CHECK LOCAL KNOWLEDGE
// =========================================================

function hasLocalChatbotAnswer(message) {

    return Boolean(
        findBestLocalMatch(
            message
        )
    );

}


// =========================================================
// GET LOCAL MATCH DETAILS
// =========================================================
//
// Useful for debugging/admin testing without exposing
// internal details to normal chatbot users.
// =========================================================

function getLocalChatbotMatch(message) {

    const bestMatch =
        findBestLocalMatch(
            message
        );


    if (
        !bestMatch
    ) {

        return null;

    }


    return {

        answer:
            bestMatch.item.answer,

        score:
            bestMatch.score,

        matchedKeywords:
            bestMatch.matchedKeywords

    };

}


// =========================================================
// SMART CHATBOT RESPONSE
// =========================================================
//
// Priority:
//
// 1. Local knowledge
// 2. Gemini AI
// 3. Generic fallback
//
// =========================================================

async function getSmartChatbotResponse({

    message,

    history = [],

    destination = ""

} = {}) {

    const safeMessage =
        typeof message === "string"
            ? message.trim()
            : "";


    if (
        !safeMessage
    ) {

        return FALLBACK_MESSAGE;

    }


    // -----------------------------------------------------
    // First use the deterministic tourism knowledge base.
    // -----------------------------------------------------

    const localMatch =
        findBestLocalMatch(
            safeMessage
        );


    if (
        localMatch
    ) {

        return localMatch.item.answer;

    }


    // -----------------------------------------------------
    // No local answer.
    //
    // Give the AI layer an opportunity to answer.
    // -----------------------------------------------------

    try {

        const aiResponse =
            await generateChatbotResponse({

                message:
                    safeMessage,

                history,

                destination

            });


        if (
            typeof aiResponse === "string" &&
            aiResponse.trim()
        ) {

            return aiResponse.trim();

        }

    } catch (error) {

        console.error(
            "⚠️ Smart chatbot AI failed:",
            error?.message || error
        );

    }


    // -----------------------------------------------------
    // Final deterministic fallback.
    // -----------------------------------------------------

    return FALLBACK_MESSAGE;

}


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    getChatbotResponse,

    getSmartChatbotResponse,

    hasLocalChatbotAnswer,

    getLocalChatbotMatch

};