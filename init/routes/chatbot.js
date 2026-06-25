const express = require("express");

const router = express.Router();

const {

    getChatbotResponse

} = require("../services/chatbotService");

router.get("/", (req, res) => {

    res.render("chatbot/index", {

        title: "AI Tourism Chatbot"

    });

});

router.post("/ask", async (req, res) => {

    const { message } = req.body;

    let reply;

    try {

        const { askGemini } =
            require("../services/chatbotAIService");

        reply =
            await askGemini(message);

    }

    catch (err) {

        console.log(
            "Gemini unavailable. Using local chatbot."
        );

        reply =
            getChatbotResponse(message);

    }

    res.json({
        reply
    });

});

module.exports = router;