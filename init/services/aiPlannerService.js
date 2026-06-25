const { GoogleGenAI } = require("@google/genai");
console.log("API KEY =", process.env.GEMINI_API_KEY);
console.log("Length =", process.env.GEMINI_API_KEY?.length);

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generateAITrip({

    destination,

    days,

    budget

}) {

    console.log("generateAITrip() called");

    const prompt = `

You are an expert Jharkhand Tourism Planner.

Destination: ${destination}

Days: ${days}

Budget: ₹${budget}

Return ONLY valid JSON.

{
  "recommendation":"",
  "travelTips":[],
  "destinationHighlights":[],
  "packingList":[],
  "summary":""
}

`;

    try {

        console.log("Sending prompt to Gemini...");

        const response =
            await ai.models.generateContent({

                 model: "gemini-2.0-flash",

                contents: prompt

            });

        console.log("Gemini response received");

        const text = response.text;

        const clean = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsed = JSON.parse(clean);

            console.log("=========== GEMINI RESPONSE ===========");
            console.dir(parsed, { depth: null });
            console.log("=======================================");

            return parsed;

                }

    catch (err) {

    console.error("Gemini Error:", err);

    return null;

}

}



module.exports = {

    generateAITrip

};