const tourismData =
    require("./chatbotData");

function getChatbotResponse(message) {

    const query =
        message.toLowerCase();

    for (const item of tourismData) {

        for (const keyword of item.keywords) {

            if (query.includes(keyword)) {

                return item.answer;

            }

        }

    }

    return "Sorry, I don't have information about that yet.";

}

module.exports = {

    getChatbotResponse

};