// =========================================================
// JHARKHAND TOURISM
// AI CHATBOT ROUTE
// =========================================================
//
// Responsibilities:
// - Render the chatbot page
// - Receive chatbot questions
// - Use the local + AI chatbot service
// - Return a consistent JSON response
//
// Flow:
//
// Browser
//    ↓
// POST /chatbot/ask
//    ↓
// chatbotService
//    ↓
// Local knowledge match
//    ↓
// Gemini AI if needed
//    ↓
// Fallback response
// =========================================================

const express = require("express");

const router =
    express.Router();


const {

    getSmartChatbotResponse

} = require("../services/chatbotService");


// =========================================================
// CHATBOT PAGE
// =========================================================

router.get("/", (req, res) => {

    res.render("chatbot/index", {

        title: "AI Tourism Chatbot"

    });

});


// =========================================================
// ASK CHATBOT
// =========================================================

router.post("/ask", async (req, res) => {

    try {

        const {

            message,

            history,

            destination

        } = req.body || {};


        // -------------------------------------------------
        // Validate message
        // -------------------------------------------------

        if (
            typeof message !== "string" ||
            !message.trim()
        ) {

            return res.status(400).json({

                success: false,

                reply:
                    "Please enter a question about Jharkhand Tourism."

            });

        }


        // -------------------------------------------------
        // Generate response
        //
        // chatbotService handles:
        //
        // 1. Local knowledge
        // 2. AI response
        // 3. Final fallback
        // -------------------------------------------------

        const reply =
            await getSmartChatbotResponse({

                message:
                    message.trim(),

                history:
                    Array.isArray(history)
                        ? history
                        : [],

                destination:
                    typeof destination === "string"
                        ? destination.trim()
                        : ""

            });


        // -------------------------------------------------
        // Return consistent API response
        // -------------------------------------------------

        return res.json({

            success: true,

            reply:
                reply ||
                "Sorry, I don't have information about that yet."

        });

    }

    catch (error) {

        console.error(
            "⚠️ Chatbot route error:",
            error?.message || error
        );


        // -------------------------------------------------
        // Final route-level fallback
        // -------------------------------------------------

        return res.status(500).json({

            success: false,

            reply:
                "I'm having trouble responding right now. Please try again."

        });

    }

});


// =========================================================
// EXPORT
// =========================================================

module.exports = router;