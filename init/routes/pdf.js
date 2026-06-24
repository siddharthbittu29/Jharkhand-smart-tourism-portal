const express = require("express");
const PDFDocument = require("pdfkit");
const path = require("path");

const router = express.Router();

router.get("/", (req, res) => {

    const {
        destination   = "Waterfall",
        days          = 4,
        budget        = 20000,
        ecoScore      = 92,
        totalCost     = 17200,
        hotelCost     = 10000,
        foodCost      = 3200,
        transportCost = 4000,
        budgetStatus  = "Within Budget"
    } = req.query;

    const savings = budget - totalCost;

    const doc = new PDFDocument({ size: "A4", margin: 0 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=AI_Travel_Report.pdf");
    doc.pipe(res);

    // ─── constants ─────────────────────────────────────────────────────────────
    const W = 595;
    const H = 842;

    // ─── helpers ───────────────────────────────────────────────────────────────
    function card(x, y, w, h, r, fill, stroke) {
        if (stroke) doc.roundedRect(x, y, w, h, r).fillAndStroke(fill, stroke);
        else        doc.roundedRect(x, y, w, h, r).fill(fill);
    }

    function badge(label, x, y, badgeW) {
        card(x, y, badgeW, 20, 4, "#0F5C30");
        doc.fillColor("white").fontSize(8.5)
           .font("Helvetica-Bold")
           .text(label, x, y + 6, { width: badgeW, align: "center" });
        doc.font("Helvetica");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 1. BACKGROUND
    // ═══════════════════════════════════════════════════════════════════════════
    try {
        doc.image(
            path.join(__dirname, "../public/images/pdf/report-bg.jpg"),
            0, 0, { width: W, height: H }
        );
    } catch (_) {}

    // Soft overlay for readability
    doc.rect(0, 0, W, H).fillOpacity(0.55).fill("#f0f4ee");
    doc.fillOpacity(1);

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. HEADER BAND
    // ═══════════════════════════════════════════════════════════════════════════
    doc.rect(0, 0, W, 108).fill("#0a3d20");
    doc.rect(0, 108, W, 4).fill("#4CAF50");

    // Decorative corner circles
    doc.circle(0, 0, 80).fill("#0F5C30");
    doc.circle(W, 0, 60).fill("#0F5C30");

    // Logos
    try { doc.image(path.join(__dirname, "../public/images/pdf/gov.logo.png"),            18,  12, { width: 62 }); } catch (_) {}
    try { doc.image(path.join(__dirname, "../public/images/pdf/jharkhand_logo_small.png"), 510,  8, { width: 68 }); } catch (_) {}

    // Title
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(24)
       .text("Jharkhand Smart Tourism", 0, 22, { align: "center" });
    doc.fillColor("#a8d5b5").font("Helvetica").fontSize(12)
       .text("AI-Powered Personalised Travel Report", 0, 52, { align: "center" });

    // Date pill
    const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    doc.roundedRect(225, 70, 145, 20, 10).fill("#1a5c35");
    doc.fillColor("#c8e6c9").font("Helvetica").fontSize(8)
       .text("Generated: " + dateStr, 230, 76, { width: 135, align: "center" });

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. STATUS PILL BAR
    // ═══════════════════════════════════════════════════════════════════════════
    const sbY = 118;

    const ecoColor = ecoScore >= 80 ? "#166534" : ecoScore >= 60 ? "#854d0e" : "#7f1d1d";
    const ecoBg    = ecoScore >= 80 ? "#dcfce7"  : ecoScore >= 60 ? "#fef9c3"  : "#fee2e2";
    doc.roundedRect(40,  sbY, 155, 28, 6).fill(ecoBg);
    doc.fillColor(ecoColor).font("Helvetica-Bold").fontSize(9)
       .text("Eco Score: " + ecoScore + "/100", 40, sbY + 10, { width: 155, align: "center" });

    const budgetColor = budgetStatus === "Within Budget" ? "#166534" : "#7f1d1d";
    const budgetBg    = budgetStatus === "Within Budget" ? "#dcfce7"  : "#fee2e2";
    doc.roundedRect(208, sbY, 180, 28, 6).fill(budgetBg);
    doc.fillColor(budgetColor).font("Helvetica-Bold").fontSize(9)
       .text("Budget: " + budgetStatus, 208, sbY + 10, { width: 180, align: "center" });

    doc.roundedRect(401, sbY, 154, 28, 6).fill("#e0f2fe");
    doc.fillColor("#075985").font("Helvetica-Bold").fontSize(9)
       .text("Duration: " + days + " Days", 401, sbY + 10, { width: 154, align: "center" });

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. TRIP SUMMARY  (left)  +  DESTINATION IMAGE & HIGHLIGHTS  (right)
    // ═══════════════════════════════════════════════════════════════════════════
    const sec1Y = 158;

    // LEFT card
    card(40, sec1Y, 248, 200, 10, "#ffffff", "#c8e6c9");
    badge("TRIP SUMMARY", 50, sec1Y + 8, 130);

    const rows = [
        ["Destination",  destination],
        ["Duration",     days + " Days"],
        ["Budget",       "Rs " + Number(budget).toLocaleString("en-IN")],
        ["Eco Score",    ecoScore + " / 100"],
        ["Est. Cost",    "Rs " + Number(totalCost).toLocaleString("en-IN")],
        ["You Save",     "Rs " + Number(savings).toLocaleString("en-IN")],
    ];

    let ry = sec1Y + 36;
    rows.forEach(function(row, i) {
        if (i % 2 === 0) doc.rect(50, ry - 2, 228, 20).fill("#f0faf4");
        doc.fillColor("#374151").font("Helvetica").fontSize(9)
           .text(row[0], 55, ry + 3, { width: 105 });
        doc.fillColor("#0a3d20").font("Helvetica-Bold").fontSize(9)
           .text(row[1], 160, ry + 3, { width: 115, align: "right" });
        ry += 22;
    });

    doc.font("Helvetica").fontSize(8).fillColor("#6b7280")
       .text(
           "Experience the raw beauty of Jharkhand — where ancient waterfalls meet tribal culture and untouched forests.",
           52, ry + 6, { width: 228, align: "justify" }
       );

    // RIGHT: image
    const imgX = 300, imgY = sec1Y, imgW = 255, imgH = 125;
    try {
        doc.save();
        doc.roundedRect(imgX, imgY, imgW, imgH, 10).clip();
        doc.image(
            path.join(__dirname, "../public/images/pdf/waterfall.jpg"),
            imgX, imgY, { width: imgW, height: imgH, cover: [imgW, imgH] }
        );
        doc.restore();
    } catch (_) {
        card(imgX, imgY, imgW, imgH, 10, "#d1fae5", "#6ee7b7");
        doc.fillColor("#065f46").font("Helvetica-Bold").fontSize(12)
           .text("[ Destination Photo ]", imgX, imgY + 52, { width: imgW, align: "center" });
    }

    // Image caption strip
    doc.rect(imgX, imgY + imgH - 26, imgW, 26).fillOpacity(0.75).fill("#0a3d20");
    doc.fillOpacity(1);
    doc.fillColor("white").font("Helvetica-Bold").fontSize(9)
       .text(destination + "  —  Jharkhand, India", imgX + 8, imgY + imgH - 17, { width: imgW - 16 });

    // RIGHT: highlights card
    const hlY = sec1Y + imgH + 8;
    card(300, hlY, 255, 64, 10, "#ffffff", "#c8e6c9");
    badge("DESTINATION HIGHLIGHTS", 310, hlY + 7, 185);

    const hlItems = ["Famous Waterfalls", "Eco Tourism", "Adventure Sports", "Wildlife Trails"];
    hlItems.forEach(function(h, i) {
        const hx = (i % 2 === 0) ? 314 : 435;
        const hy = hlY + 32 + Math.floor(i / 2) * 16;
        doc.fillColor("#166534").font("Helvetica-Bold").fontSize(9).text("✓", hx, hy);
        doc.fillColor("#1f2937").font("Helvetica").fontSize(8.5).text(h, hx + 12, hy, { width: 108 });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // 5. COST ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════════
    const costSecY = 373;
    card(40, costSecY, 515, 122, 10, "#ffffff", "#c8e6c9");
    badge("COST ANALYSIS & BUDGET BREAKDOWN", 50, costSecY + 8, 225);

    const costItems = [
        { label: "Hotel / Stay",  amount: hotelCost,     color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", pct: Math.round(hotelCost     / totalCost * 100) },
        { label: "Food & Dining", amount: foodCost,      color: "#b45309", bg: "#fffbeb", border: "#fde68a", pct: Math.round(foodCost      / totalCost * 100) },
        { label: "Transport",     amount: transportCost, color: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe", pct: Math.round(transportCost / totalCost * 100) },
        { label: "Total Cost",    amount: totalCost,     color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7", pct: 100 },
    ];

    const cW = 113, cH = 74, cGap = 11;
    let cx = 50;

    costItems.forEach(function(item) {
        card(cx, costSecY + 32, cW, cH, 8, item.bg, item.border);

        // coloured top accent strip
        doc.rect(cx, costSecY + 32, cW, 4).fill(item.color);

        doc.fillColor(item.color).font("Helvetica-Bold").fontSize(8)
           .text(item.label, cx + 6, costSecY + 42, { width: cW - 12, align: "center" });

        doc.fillColor("#111827").font("Helvetica-Bold").fontSize(14)
           .text("Rs " + Number(item.amount).toLocaleString("en-IN"), cx + 4, costSecY + 57, { width: cW - 8, align: "center" });

        // progress bar
        const barW = cW - 16;
        doc.rect(cx + 8, costSecY + 83, barW, 5).fill("#e5e7eb");
        doc.rect(cx + 8, costSecY + 83, Math.round(barW * item.pct / 100), 5).fill(item.color);
        doc.fillColor(item.color).font("Helvetica").fontSize(7)
           .text(item.pct + "%", cx + cW - 22, costSecY + 90, { width: 18, align: "right" });

        cx += cW + cGap;
    });

    // Savings note
    doc.rect(50, costSecY + 112, 495, 0.5).strokeColor("#d1fae5").lineWidth(0.5).stroke();
    doc.fillColor("#064e3b").font("Helvetica-Bold").fontSize(8.5)
       .text(
           "You are saving Rs " + Number(savings).toLocaleString("en-IN") + " from your total budget of Rs " + Number(budget).toLocaleString("en-IN"),
           50, costSecY + 114, { width: 495, align: "center" }
       );

    // ═══════════════════════════════════════════════════════════════════════════
    // 6. TOP ATTRACTIONS
    // ═══════════════════════════════════════════════════════════════════════════
    const attrY = 508;
    card(40, attrY, 515, 82, 10, "#ffffff", "#c8e6c9");
    badge("TOP ATTRACTIONS OF JHARKHAND", 50, attrY + 8, 218);

    const attractions = [
        { name: "Hundru Falls",   desc: "80m plunge, monsoon magic" },
        { name: "Dassam Falls",   desc: "Cascading 44m waterfall"   },
        { name: "Patratu Valley", desc: "Scenic valley & reservoir"  },
        { name: "Betla Natl. Park", desc: "Tigers, leopards & more" },
        { name: "Netarhat",       desc: "Queen of Chotanagpur"      },
    ];

    const atW = 97;
    attractions.forEach(function(a, i) {
        const ax = 46 + i * (atW + 6);
        const ay = attrY + 30;
        card(ax, ay, atW, 44, 6, "#f0fdf4", "#86efac");
        doc.fillColor("#065f46").font("Helvetica-Bold").fontSize(7.5)
           .text(a.name, ax + 4, ay + 6, { width: atW - 8, align: "center" });
        doc.fillColor("#374151").font("Helvetica").fontSize(7)
           .text(a.desc, ax + 4, ay + 20, { width: atW - 8, align: "center" });
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // 7. BOTTOM ROW: TRAVEL TIPS | BEST TIME | ABOUT JHARKHAND
    // ═══════════════════════════════════════════════════════════════════════════
    const botY = 602;

    // ── Travel Tips ──
    card(40, botY, 160, 142, 10, "#ffffff", "#c8e6c9");
    badge("TRAVEL TIPS", 50, botY + 8, 112);

    const tips = [
        "Carry reusable water bottles",
        "Pre-book hotels in peak season",
        "Respect tribal customs & culture",
        "Prefer eco-friendly transport",
        "Carry light rainwear (Jun-Sep)",
        "Hire certified local guides",
    ];
    tips.forEach(function(tip, i) {
        doc.circle(55, botY + 36 + i * 17, 3).fill("#16a34a");
        doc.fillColor("#1f2937").font("Helvetica").fontSize(8)
           .text(tip, 64, botY + 30 + i * 17, { width: 128 });
    });

    // ── Best Time to Visit ──
    card(212, botY, 163, 142, 10, "#ffffff", "#c8e6c9");
    badge("BEST TIME TO VISIT", 222, botY + 8, 133);

    const seasons = [
        { range: "Oct - Feb", name: "Winter",  note: "Ideal — cool & clear skies", color: "#1d4ed8" },
        { range: "Mar - May", name: "Summer",  note: "Hot but fewer crowds",        color: "#b45309" },
        { range: "Jun - Sep", name: "Monsoon", note: "Lush falls, scenic beauty",   color: "#065f46" },
    ];
    seasons.forEach(function(s, i) {
        const sy = botY + 34 + i * 35;
        card(222, sy, 143, 28, 5, "#f8fafc", "#e2e8f0");
        doc.rect(222, sy, 4, 28).fill(s.color);
        doc.fillColor(s.color).font("Helvetica-Bold").fontSize(8.5)
           .text(s.range + "  |  " + s.name, 232, sy + 4, { width: 128 });
        doc.fillColor("#6b7280").font("Helvetica").fontSize(7.5)
           .text(s.note, 232, sy + 15, { width: 128 });
    });

    // ── About Jharkhand ──
    card(387, botY, 168, 142, 10, "#ffffff", "#c8e6c9");
    badge("ABOUT JHARKHAND", 397, botY + 8, 132);

    doc.fillColor("#1f2937").font("Helvetica").fontSize(8.2)
       .text(
           "Jharkhand — 'Land of Forests' — is nestled in eastern India, celebrated for its spectacular waterfalls, rich tribal heritage, verdant national parks and thriving eco-tourism.\n\nHome to 30+ major waterfalls, dense Sal forests and the indigenous Santali, Munda and Ho tribes, Jharkhand offers an immersive nature-and-culture experience unlike any other destination in India.",
           397, botY + 34,
           { width: 150, align: "justify", lineGap: 1.5 }
       );

    // ═══════════════════════════════════════════════════════════════════════════
    // 8. FOOTER
    // ═══════════════════════════════════════════════════════════════════════════
    doc.rect(0, 757, W, 85).fill("#0a3d20");
    doc.rect(0, 757, W, 3).fill("#4CAF50");

    doc.circle(0, H, 55).fillOpacity(0.15).fill("#4CAF50");
    doc.circle(W, H, 40).fillOpacity(0.15).fill("#4CAF50");
    doc.fillOpacity(1);

    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(13)
       .text("Jharkhand Smart Tourism Portal", 0, 768, { align: "center" });
    doc.fillColor("#a8d5b5").font("Helvetica").fontSize(9)
       .text("Department of Tourism, Government of Jharkhand", 0, 785, { align: "center" });

    // Footer pills
    ["Nature", "Culture", "Adventure"].forEach(function(label, i) {
        const px = 158 + i * 100;
        doc.roundedRect(px, 799, 88, 17, 8).fill("#1a5c35");
        doc.fillColor("#c8e6c9").font("Helvetica").fontSize(8)
           .text(label, px, 804, { width: 88, align: "center" });
    });

    doc.fillColor("#6b9e7a").font("Helvetica").fontSize(7.5)
       .text(
           "Generated by AI Smart Travel Planner  |  Powered by Jharkhand Tourism AI",
           0, 820, { align: "center" }
       );

    doc.end();
});

module.exports = router;