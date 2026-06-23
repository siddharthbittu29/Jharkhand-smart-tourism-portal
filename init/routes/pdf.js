const express = require("express");
const PDFDocument = require("pdfkit");

const router = express.Router();

router.get("/", (req, res) => {

    const {
        destination,
        days,
        budget,
        ecoScore,
        totalCost,
        hotelCost,
        foodCost,
        transportCost,
        budgetStatus
    } = req.query;

    const doc = new PDFDocument({
        size: "A4",
        margin: 50
    });

    res.setHeader(
        "Content-Type",
        "application/pdf"
    );

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=AI_Travel_Report.pdf"
    );

    doc.pipe(res);

    // HEADER

    doc
        .fillColor("#198754")
        .fontSize(26)
        .text(
            "Jharkhand Smart Tourism",
            {
                align: "center"
            }
        );

    doc.moveDown(0.5);

    doc
        .fillColor("#0d6efd")
        .fontSize(18)
        .text(
            "AI Generated Travel Report",
            {
                align: "center"
            }
        );

    doc.moveDown(2);

    // SUMMARY

    doc
        .fillColor("black")
        .fontSize(20)
        .text("Trip Summary");

    doc.moveDown();

    doc.fontSize(14);

    doc.text(`Destination: ${destination}`);
    doc.text(`Days: ${days}`);
    doc.text(`Budget: ₹${budget}`);
    doc.text(`Eco Score: ${ecoScore}/100`);
    doc.text(`Estimated Cost: ₹${totalCost}`);

    doc.moveDown(2);

    // COST ANALYSIS

    doc
        .fillColor("#dc3545")
        .fontSize(20)
        .text("Cost Analysis");

    doc.moveDown();

    doc
        .fillColor("black")
        .fontSize(14);

    doc.text(`Hotel Cost: ₹${hotelCost}`);
    doc.text(`Food Cost: ₹${foodCost}`);
    doc.text(`Transport Cost: ₹${transportCost}`);
    doc.text(`Total Cost: ₹${totalCost}`);

    doc.moveDown();

    doc
        .fillColor("#198754")
        .fontSize(15)
        .text(`Budget Status: ${budgetStatus}`);

    doc.moveDown(2);

    // TRAVEL TIPS

    doc
        .fillColor("#fd7e14")
        .fontSize(20)
        .text("Travel Tips");

    doc.moveDown();

    doc
        .fillColor("black")
        .fontSize(14);

    doc.text("• Carry water bottles");
    doc.text("• Book hotels in advance");
    doc.text("• Best season: October to February");
    doc.text("• Respect local culture and nature");
    doc.text("• Keep emergency contacts handy");

    doc.moveDown(3);

    // FOOTER

    doc
        .fillColor("gray")
        .fontSize(12)
        .text(
            "Generated using AI Smart Trip Planner",
            {
                align: "center"
            }
        );

    doc.text(
        "Jharkhand Smart Tourism Portal",
        {
            align: "center"
        }
    );

    doc.end();

});

module.exports = router;