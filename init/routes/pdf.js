const express = require("express");
const PDFDocument = require("pdfkit");
const path = require("path");

const router = express.Router();

/* ============================================================
   JHARKHAND TOURISM — PREMIUM DYNAMIC TRAVEL REPORT
   ============================================================

   Preferred:
   POST /pdf

   Compatibility:
   GET /pdf

   The POST version receives the complete planner result.

   Supported data:
   - destination
   - tripDays
   - tripBudget
   - ecoScore
   - hotelCost
   - foodCost
   - transportCost
   - totalCost
   - budgetStatus
   - itinerary
   - hotelRecommendations
   - weatherInfo
   - aiRecommendation
   - travelTips
   - destinationHighlights
   - tripInsights
   - packingList
============================================================ */


/* ============================================================
   CONSTANTS
============================================================ */

const PAGE = {
    width: 595.28,
    height: 841.89
};

const COLORS = {
    forest: "#0B3D2E",
    deepForest: "#06291F",
    green: "#1B7A4B",
    brightGreen: "#4CAF50",
    mint: "#DFF3E7",
    paleGreen: "#F1F8F4",

    cream: "#F7F3E8",
    warmWhite: "#FFFDF8",
    sand: "#E9DFC9",

    charcoal: "#18231E",
    dark: "#25322C",
    muted: "#68756E",
    lightText: "#A9BEB2",

    white: "#FFFFFF",
    border: "#D9E5DD",

    blue: "#2563EB",
    blueSoft: "#EFF6FF",

    amber: "#B7791F",
    amberSoft: "#FFF8E7",

    purple: "#6D4ACB",
    purpleSoft: "#F5F1FF",

    red: "#B42318",
    redSoft: "#FEF0EF"
};


/* ============================================================
   GENERIC HELPERS
============================================================ */

function cleanString(value, fallback = "") {
    if (value === null || value === undefined) {
        return fallback;
    }

    return String(value).trim() || fallback;
}


function safeNumber(value, fallback = 0) {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}


function safeArray(value) {
    return Array.isArray(value)
        ? value
        : [];
}


function safeObject(value) {
    return value &&
        typeof value === "object" &&
        !Array.isArray(value)
        ? value
        : {};
}


function money(value) {
    return `Rs ${Math.round(safeNumber(value)).toLocaleString("en-IN")}`;
}


function percentage(value) {
    return `${Math.round(safeNumber(value))}%`;
}


function safeFileName(value) {
    return cleanString(value, "Jharkhand")
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
        .replace(/\s+/g, "_")
        .slice(0, 80);
}


function parseSerialized(value, fallback) {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    try {
        return JSON.parse(
            decodeURIComponent(String(value))
        );
    } catch (_) {
        try {
            return JSON.parse(String(value));
        } catch (_) {
            return fallback;
        }
    }
}


function normalizePlannerData(source = {}) {
    const data = source || {};

    return {
        destination: cleanString(
            data.destination,
            "Jharkhand"
        ),

        tripDays: Math.max(
            1,
            Math.round(
                safeNumber(
                    data.tripDays ?? data.days,
                    1
                )
            )
        ),

        tripBudget: Math.max(
            0,
            safeNumber(
                data.tripBudget ?? data.budget
            )
        ),

        ecoScore: Math.min(
            100,
            Math.max(
                0,
                safeNumber(data.ecoScore)
            )
        ),

        hotelCost: Math.max(
            0,
            safeNumber(data.hotelCost)
        ),

        foodCost: Math.max(
            0,
            safeNumber(data.foodCost)
        ),

        transportCost: Math.max(
            0,
            safeNumber(data.transportCost)
        ),

        totalCost: Math.max(
            0,
            safeNumber(data.totalCost)
        ),

        budgetStatus: cleanString(
            data.budgetStatus,
            "Not specified"
        ),

        itinerary: safeArray(
            data.itinerary
        ),

        hotelRecommendations: safeArray(
            data.hotelRecommendations
        ),

        weatherInfo: safeObject(
            data.weatherInfo
        ),

        aiRecommendation:
            typeof data.aiRecommendation === "object"
                ? safeObject(data.aiRecommendation)
                : cleanString(
                    data.aiRecommendation,
                    "No AI recommendation was generated."
                ),

        travelTips: safeArray(
            data.travelTips
        ),

        destinationHighlights: safeArray(
            data.destinationHighlights
        ),

        tripInsights: safeObject(
            data.tripInsights
        ),

        packingList: safeArray(
            data.packingList
        )
    };
}


/* ============================================================
   ASSETS
============================================================ */

function asset(fileName) {
    return path.join(
        __dirname,
        "../public/images/pdf",
        fileName
    );
}


/* ============================================================
   PDF ROUTE
============================================================ */

function generatePDF(req, res, source) {
    try {
        const data = normalizePlannerData(source);

        const doc = new PDFDocument({
            size: "A4",
            margin: 0,
            bufferPages: true,
            info: {
                Title:
                    `Jharkhand Tourism — ${data.destination} Travel Report`,

                Author:
                    "Jharkhand Tourism",

                Subject:
                    "Personalised AI Travel Report",

                Keywords:
                    "Jharkhand Tourism, Travel Planner, AI, Tourism"
            }
        });

        const fileName =
            `Jharkhand_Tourism_${safeFileName(
                data.destination
            )}_Travel_Report.pdf`;

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}"`
        );

        doc.pipe(res);


        /* ====================================================
           DRAWING HELPERS
        ==================================================== */

        function background(fileName = "report-bg.jpg") {
            try {
                doc.image(
                    asset(fileName),
                    0,
                    0,
                    {
                        width: PAGE.width,
                        height: PAGE.height
                    }
                );

                return true;
            } catch (_) {
                doc
                    .rect(
                        0,
                        0,
                        PAGE.width,
                        PAGE.height
                    )
                    .fill(COLORS.cream);

                return false;
            }
        }


        function addImage(
            fileName,
            x,
            y,
            options = {}
        ) {
            try {
                doc.image(
                    asset(fileName),
                    x,
                    y,
                    options
                );

                return true;
            } catch (_) {
                return false;
            }
        }


        function newPage() {
            doc.addPage({
                size: "A4",
                margin: 0
            });
        }


        function roundedCard(
            x,
            y,
            width,
            height,
            fill = COLORS.white,
            stroke = COLORS.border,
            radius = 14
        ) {
            doc.roundedRect(
                x,
                y,
                width,
                height,
                radius
            );

            if (stroke) {
                doc.fillAndStroke(
                    fill,
                    stroke
                );
            } else {
                doc.fill(fill);
            }
        }


        function label(
            value,
            x,
            y,
            width = 120
        ) {
            doc
                .roundedRect(
                    x,
                    y,
                    width,
                    20,
                    10
                )
                .fill(COLORS.mint);

            doc
                .fillColor(COLORS.green)
                .font("Helvetica-Bold")
                .fontSize(7)
                .text(
                    cleanString(value).toUpperCase(),
                    x,
                    y + 6,
                    {
                        width,
                        align: "center"
                    }
                );
        }


        function divider(
            x,
            y,
            width
        ) {
            doc
                .moveTo(x, y)
                .lineTo(x + width, y)
                .strokeColor(COLORS.border)
                .lineWidth(0.7)
                .stroke();
        }


        function pill(
            value,
            x,
            y,
            width,
            fill,
            color = COLORS.white
        ) {
            doc
                .roundedRect(
                    x,
                    y,
                    width,
                    23,
                    11.5
                )
                .fill(fill);

            doc
                .fillColor(color)
                .font("Helvetica-Bold")
                .fontSize(7)
                .text(
                    value,
                    x,
                    y + 8,
                    {
                        width,
                        align: "center"
                    }
                );
        }


        function statCard(
            x,
            y,
            width,
            title,
            value,
            accent
        ) {
            roundedCard(
                x,
                y,
                width,
                82,
                COLORS.white,
                COLORS.border,
                13
            );

            doc
                .roundedRect(
                    x,
                    y,
                    5,
                    82,
                    3
                )
                .fill(accent);

            doc
                .fillColor(COLORS.muted)
                .font("Helvetica-Bold")
                .fontSize(7)
                .text(
                    title.toUpperCase(),
                    x + 16,
                    y + 15,
                    {
                        width: width - 25
                    }
                );

            doc
                .fillColor(COLORS.charcoal)
                .font("Helvetica-Bold")
                .fontSize(16)
                .text(
                    value,
                    x + 16,
                    y + 36,
                    {
                        width: width - 25
                    }
                );
        }


        function bodyText(
            value,
            x,
            y,
            width,
            size = 8.5,
            color = COLORS.muted,
            options = {}
        ) {
            doc
                .fillColor(color)
                .font(
                    options.bold
                        ? "Helvetica-Bold"
                        : "Helvetica"
                )
                .fontSize(size)
                .text(
                    cleanString(value),
                    x,
                    y,
                    {
                        width,
                        lineGap:
                            options.lineGap ?? 2,
                        align:
                            options.align || "left"
                    }
                );
        }


        function title(
            value,
            x,
            y,
            width,
            size = 22,
            color = COLORS.charcoal
        ) {
            doc
                .fillColor(color)
                .font("Helvetica-Bold")
                .fontSize(size)
                .text(
                    cleanString(value),
                    x,
                    y,
                    {
                        width,
                        lineGap: 3
                    }
                );
        }


        function sectionHeader(
            eyebrow,
            heading,
            description
        ) {
            label(
                eyebrow,
                40,
                34,
                145
            );

            title(
                heading,
                40,
                70,
                515,
                24
            );

            if (description) {
                bodyText(
                    description,
                    40,
                    108,
                    500,
                    8.5
                );
            }
        }


        function getHotel(item) {
            if (
                item &&
                item.hotel &&
                typeof item.hotel === "object"
            ) {
                return item.hotel;
            }

            return safeObject(item);
        }


        function getHotelPlace(item) {
            if (
                item &&
                item.place &&
                typeof item.place === "object"
            ) {
                return item.place;
            }

            return {};
        }


        function getTextValue(
            object,
            keys,
            fallback = "Not available"
        ) {
            for (const key of keys) {
                if (
                    object &&
                    object[key] !== undefined &&
                    object[key] !== null &&
                    String(object[key]).trim()
                ) {
                    return String(object[key]);
                }
            }

            return fallback;
        }


        function drawFooter() {
            const range =
                doc.bufferedPageRange();

            for (
                let pageIndex = range.start;
                pageIndex < range.start + range.count;
                pageIndex++
            ) {
                doc.switchToPage(
                    pageIndex
                );

                const y =
                    PAGE.height - 34;

                doc
                    .rect(
                        0,
                        y,
                        PAGE.width,
                        34
                    )
                    .fill(COLORS.deepForest);

                doc
                    .fillColor("#B9D8C6")
                    .font("Helvetica")
                    .fontSize(6.5)
                    .text(
                        "JHARKHAND TOURISM  •  AI SMART TRAVEL PLANNER",
                        32,
                        y + 12,
                        {
                            width: 300
                        }
                    );

                doc
                    .fillColor("#86A993")
                    .font("Helvetica")
                    .fontSize(6.5)
                    .text(
                        `Page ${
                            pageIndex + 1
                        } of ${range.count}`,
                        465,
                        y + 12,
                        {
                            width: 95,
                            align: "right"
                        }
                    );
            }
        }


        /* ====================================================
           PAGE 1 — COVER
        ==================================================== */

        background();

        doc
            .rect(
                0,
                0,
                PAGE.width,
                PAGE.height
            )
            .fillOpacity(0.62)
            .fill(COLORS.deepForest);

        doc.fillOpacity(1);

        addImage(
            "gov.logo.png",
            32,
            30,
            {
                width: 58
            }
        );

        addImage(
            "jharkhand_logo_small.png",
            505,
            25,
            {
                width: 58
            }
        );

        doc
            .fillColor(COLORS.white)
            .font("Helvetica-Bold")
            .fontSize(9)
            .text(
                "JHARKHAND TOURISM",
                105,
                40
            );

        doc
            .fillColor("#C6DFCF")
            .font("Helvetica")
            .fontSize(7)
            .text(
                "PERSONALISED SMART TRAVEL",
                105,
                54
            );

        doc
            .fillColor("#CBE7D4")
            .font("Helvetica-Bold")
            .fontSize(8)
            .text(
                "AI GENERATED TRAVEL REPORT",
                45,
                275
            );

        title(
            data.destination,
            45,
            305,
            505,
            39,
            COLORS.white
        );

        bodyText(
            "A personalised journey built around your time, budget and travel preferences.",
            45,
            372,
            440,
            13,
            "#D6E9DD",
            {
                lineGap: 4
            }
        );

        pill(
            `${data.tripDays} DAYS`,
            45,
            435,
            90,
            COLORS.green
        );

        pill(
            `BUDGET ${money(data.tripBudget)}`,
            145,
            435,
            140,
            "#174F38"
        );

        pill(
            `ECO ${data.ecoScore}/100`,
            295,
            435,
            105,
            "#286B4B"
        );

        roundedCard(
            45,
            505,
            505,
            150,
            COLORS.white,
            null,
            18
        );

        label(
            "YOUR JOURNEY",
            65,
            528,
            105
        );

        title(
            "Everything you need, in one travel companion.",
            65,
            562,
            430,
            18
        );

        bodyText(
            "Your itinerary, stays, weather conditions, budget intelligence, AI guidance, highlights, packing list and travel insights are organised into one report.",
            65,
            595,
            425,
            8.5,
            COLORS.muted,
            {
                lineGap: 3
            }
        );

        divider(
            65,
            633,
            425
        );

        bodyText(
            "Generated by Jharkhand Tourism AI",
            65,
            642,
            250,
            7.5,
            COLORS.green,
            {
                bold: true
            }
        );

        bodyText(
            new Date().toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            ),
            430,
            642,
            60,
            7,
            COLORS.muted,
            {
                align: "right"
            }
        );

        bodyText(
            "NATURE  •  CULTURE  •  ADVENTURE",
            45,
            790,
            300,
            7.5,
            "#D2E5D8",
            {
                bold: true
            }
        );


        /* ====================================================
           PAGE 2 — DASHBOARD
        ==================================================== */

        newPage();

        doc
            .rect(
                0,
                0,
                PAGE.width,
                PAGE.height
            )
            .fill(COLORS.cream);

        doc
            .rect(
                0,
                0,
                PAGE.width,
                120
            )
            .fill(COLORS.deepForest);

        bodyText(
            "JHARKHAND TOURISM  /  TRIP DASHBOARD",
            40,
            30,
            400,
            7.5,
            "#BBDAC5",
            {
                bold: true
            }
        );

        title(
            "Your journey at a glance",
            40,
            51,
            500,
            25,
            COLORS.white
        );

        bodyText(
            `${data.destination} • ${data.tripDays}-day personalised travel plan`,
            40,
            88,
            480,
            8.5,
            "#B6D0BF"
        );

        statCard(
            40,
            145,
            120,
            "Trip Budget",
            money(data.tripBudget),
            COLORS.green
        );

        statCard(
            174,
            145,
            120,
            "Estimated Cost",
            money(data.totalCost),
            COLORS.blue
        );

        statCard(
            308,
            145,
            120,
            "Remaining",
            money(
                Math.max(
                    0,
                    data.tripBudget -
                    data.totalCost
                )
            ),
            COLORS.brightGreen
        );

        statCard(
            442,
            145,
            113,
            "Eco Score",
            `${data.ecoScore}/100`,
            COLORS.green
        );

        roundedCard(
            40,
            250,
            515,
            235,
            COLORS.white,
            COLORS.border,
            15
        );

        label(
            "BUDGET INTELLIGENCE",
            60,
            272,
            145
        );

        title(
            "Where your travel budget goes",
            60,
            310,
            430,
            17
        );

        const expenses = [
            {
                name: "Hotel / Stay",
                value: data.hotelCost,
                color: COLORS.blue
            },
            {
                name: "Food & Dining",
                value: data.foodCost,
                color: COLORS.amber
            },
            {
                name: "Transport",
                value: data.transportCost,
                color: COLORS.purple
            }
        ];

        let expenseY = 350;

        expenses.forEach((expense) => {
            const share =
                data.totalCost > 0
                    ? Math.min(
                        100,
                        (
                            expense.value /
                            data.totalCost
                        ) * 100
                    )
                    : 0;

            bodyText(
                expense.name,
                62,
                expenseY,
                200,
                8,
                COLORS.dark,
                {
                    bold: true
                }
            );

            bodyText(
                `${money(expense.value)}  •  ${Math.round(share)}%`,
                400,
                expenseY,
                100,
                7.5,
                COLORS.muted,
                {
                    align: "right"
                }
            );

            doc
                .roundedRect(
                    62,
                    expenseY + 18,
                    465,
                    8,
                    4
                )
                .fill("#E7EEE9");

            doc
                .roundedRect(
                    62,
                    expenseY + 18,
                    Math.max(
                        6,
                        465 * share / 100
                    ),
                    8,
                    4
                )
                .fill(expense.color);

            expenseY += 50;
        });

        const withinBudget =
            data.tripBudget >=
            data.totalCost;

        pill(
            withinBudget
                ? "WITHIN PLANNED BUDGET"
                : "BUDGET NEEDS ATTENTION",
            60,
            445,
            205,
            withinBudget
                ? COLORS.green
                : COLORS.red
        );

        roundedCard(
            40,
            510,
            250,
            205,
            COLORS.forest,
            null,
            15
        );

        bodyText(
            "SUSTAINABILITY SNAPSHOT",
            60,
            535,
            190,
            7.5,
            "#BFE2CA",
            {
                bold: true
            }
        );

        doc
            .fillColor(COLORS.white)
            .font("Helvetica-Bold")
            .fontSize(35)
            .text(
                String(data.ecoScore),
                60,
                563
            );

        bodyText(
            "/ 100 eco score",
            115,
            580,
            110,
            10,
            "#A8CDB4"
        );

        doc
            .roundedRect(
                60,
                625,
                210,
                9,
                4
            )
            .fill("#285E45");

        doc
            .roundedRect(
                60,
                625,
                Math.max(
                    7,
                    210 *
                    data.ecoScore /
                    100
                ),
                9,
                4
            )
            .fill(COLORS.brightGreen);

        bodyText(
            data.ecoScore >= 80
                ? "Strong sustainable travel profile."
                : data.ecoScore >= 60
                    ? "Good sustainable travel profile."
                    : "Consider more sustainable choices.",
            60,
            652,
            205,
            7.5,
            "#D1E7D8",
            {
                lineGap: 2
            }
        );

        roundedCard(
            305,
            510,
            250,
            205,
            COLORS.white,
            COLORS.border,
            15
        );

        label(
            "TRIP PROFILE",
            325,
            535,
            100
        );

        const profile = [
            ["Destination", data.destination],
            ["Duration", `${data.tripDays} days`],
            ["Budget", money(data.tripBudget)],
            ["Estimated", money(data.totalCost)],
            ["Status", data.budgetStatus]
        ];

        let profileY = 573;

        profile.forEach((item, index) => {
            if (index > 0) {
                divider(
                    325,
                    profileY - 8,
                    210
                );
            }

            bodyText(
                item[0],
                325,
                profileY,
                75,
                7,
                COLORS.muted
            );

            bodyText(
                item[1],
                400,
                profileY,
                135,
                7.5,
                COLORS.charcoal,
                {
                    bold: true,
                    align: "right"
                }
            );

            profileY += 27;
        });


        /* ====================================================
           PAGE 3 — ITINERARY
        ==================================================== */

        newPage();

        doc
            .rect(
                0,
                0,
                PAGE.width,
                PAGE.height
            )
            .fill(COLORS.warmWhite);

        sectionHeader(
            "YOUR ITINERARY",
            "A day-by-day journey",
            "Your generated route and activities, organised in the same sequence as your planner."
        );

        const itinerary =
            data.itinerary;

        if (!itinerary.length) {
            roundedCard(
                40,
                165,
                515,
                120,
                COLORS.white,
                COLORS.border
            );

            bodyText(
                "No detailed itinerary is available for this plan.",
                65,
                205,
                465,
                9,
                COLORS.muted,
                {
                    align: "center"
                }
            );
        } else {
            let y = 160;

            itinerary
                .slice(0, 10)
                .forEach((item, index) => {
                    if (y > 735) {
                        newPage();

                        doc
                            .rect(
                                0,
                                0,
                                PAGE.width,
                                PAGE.height
                            )
                            .fill(COLORS.warmWhite);

                        sectionHeader(
                            "ITINERARY CONTINUED",
                            "More of your journey",
                            ""
                        );

                        y = 160;
                    }

                    const day =
                        getTextValue(
                            item,
                            [
                                "day",
                                "dayNumber",
                                "date"
                            ],
                            `Day ${index + 1}`
                        );

                    const place =
                        getTextValue(
                            item,
                            [
                                "place",
                                "name",
                                "destination",
                                "title"
                            ],
                            "Destination stop"
                        );

                    const description =
                        getTextValue(
                            item,
                            [
                                "description",
                                "desc",
                                "short_desc",
                                "details"
                            ],
                            "Travel activity planned for this stop."
                        );

                    const cost =
                        item &&
                        (
                            item.cost ??
                            item.estimatedCost
                        );

                    roundedCard(
                        40,
                        y,
                        515,
                        105,
                        COLORS.white,
                        COLORS.border,
                        13
                    );

                    doc
                        .circle(
                            70,
                            y + 30,
                            16
                        )
                        .fill(COLORS.mint);

                    bodyText(
                        String(index + 1).padStart(
                            2,
                            "0"
                        ),
                        58,
                        y + 26,
                        24,
                        7,
                        COLORS.green,
                        {
                            bold: true,
                            align: "center"
                        }
                    );

                    bodyText(
                        day,
                        100,
                        y + 17,
                        90,
                        7,
                        COLORS.green,
                        {
                            bold: true
                        }
                    );

                    title(
                        place,
                        100,
                        y + 34,
                        315,
                        12
                    );

                    bodyText(
                        description,
                        100,
                        y + 57,
                        330,
                        7.5,
                        COLORS.muted,
                        {
                            lineGap: 2
                        }
                    );

                    if (
                        cost !== undefined &&
                        cost !== null &&
                        String(cost).trim()
                    ) {
                        pill(
                            money(cost),
                            430,
                            y + 18,
                            95,
                            COLORS.paleGreen,
                            COLORS.green
                        );
                    }

                    y += 120;
                });
        }


        /* ====================================================
           PAGE 4 — STAYS + WEATHER
        ==================================================== */

        newPage();

        doc
            .rect(
                0,
                0,
                PAGE.width,
                PAGE.height
            )
            .fill(COLORS.cream);

        sectionHeader(
            "STAY & CONDITIONS",
            "Where you stay and how you travel",
            "Useful accommodation and travel-condition information generated for this plan."
        );

        /* Hotels */

        label(
            "RECOMMENDED STAYS",
            40,
            155,
            135
        );

        const hotels =
            data.hotelRecommendations;

        if (!hotels.length) {
            roundedCard(
                40,
                190,
                515,
                90,
                COLORS.white,
                COLORS.border
            );

            bodyText(
                "No hotel recommendation was generated.",
                60,
                225,
                475,
                8,
                COLORS.muted,
                {
                    align: "center"
                }
            );
        } else {
            let hotelY = 190;

            hotels
                .slice(0, 3)
                .forEach((item) => {
                    const hotel =
                        getHotel(item);

                    const place =
                        getHotelPlace(item);

                    const name =
                        getTextValue(
                            hotel,
                            ["name"],
                            "Recommended stay"
                        );

                    const district =
                        getTextValue(
                            hotel,
                            ["district", "address"],
                            getTextValue(
                                place,
                                ["district", "name"],
                                "Jharkhand"
                            )
                        );

                    const rating =
                        getTextValue(
                            hotel,
                            ["rating"],
                            "Not rated"
                        );

                    const price =
                        hotel.price_from ??
                        hotel.price ??
                        null;

                    roundedCard(
                        40,
                        hotelY,
                        515,
                        92,
                        COLORS.white,
                        COLORS.border,
                        12
                    );

                    doc
                        .circle(
                            68,
                            hotelY + 30,
                            15
                        )
                        .fill(COLORS.blueSoft);

                    bodyText(
                        "STAY",
                        50,
                        hotelY + 26,
                        36,
                        6,
                        COLORS.blue,
                        {
                            bold: true,
                            align: "center"
                        }
                    );

                    title(
                        name,
                        98,
                        hotelY + 15,
                        275,
                        11
                    );

                    bodyText(
                        district,
                        98,
                        hotelY + 38,
                        260,
                        7.5,
                        COLORS.muted
                    );

                    bodyText(
                        `Rating: ${rating}`,
                        98,
                        hotelY + 57,
                        130,
                        7,
                        COLORS.green,
                        {
                            bold: true
                        }
                    );

                    if (price !== null) {
                        bodyText(
                            `${money(price)} onwards`,
                            390,
                            hotelY + 25,
                            135,
                            8,
                            COLORS.charcoal,
                            {
                                bold: true,
                                align: "right"
                            }
                        );
                    }

                    hotelY += 105;
                });
        }


        /* Weather */

        label(
            "TRAVEL CONDITIONS",
            40,
            525,
            130
        );

        roundedCard(
            40,
            560,
            515,
            185,
            COLORS.white,
            COLORS.border,
            15
        );

        const weather =
            data.weatherInfo;

        const insights =
            data.tripInsights;

        const weatherRows = [
            [
                "Condition",
                getTextValue(
                    weather,
                    [
                        "condition",
                        "weather",
                        "summary"
                    ]
                )
            ],
            [
                "Best season",
                getTextValue(
                    weather,
                    [
                        "bestSeason",
                        "bestTime",
                        "season"
                    ]
                )
            ],
            [
                "Recommended transport",
                getTextValue(
                    weather,
                    [
                        "recommendedTransport",
                        "transport"
                    ]
                )
            ],
            [
                "Crowd level",
                getTextValue(
                    weather,
                    ["crowdLevel"],
                    getTextValue(
                        insights,
                        ["crowdLevel"]
                    )
                )
            ],
            [
                "Travel difficulty",
                getTextValue(
                    weather,
                    ["travelDifficulty"],
                    getTextValue(
                        insights,
                        [
                            "difficulty",
                            "travelDifficulty"
                        ]
                    )
                )
            ]
        ];

        let weatherY = 585;

        weatherRows.forEach(
            (row, index) => {
                if (index > 0) {
                    divider(
                        60,
                        weatherY - 8,
                        455
                    );
                }

                bodyText(
                    row[0],
                    60,
                    weatherY,
                    165,
                    7.5,
                    COLORS.muted
                );

                bodyText(
                    row[1],
                    225,
                    weatherY,
                    290,
                    7.5,
                    COLORS.charcoal,
                    {
                        bold: true,
                        align: "right"
                    }
                );

                weatherY += 30;
            }
        );


        /* ====================================================
           PAGE 5 — AI + HIGHLIGHTS + TIPS
        ==================================================== */

        newPage();

        doc
            .rect(
                0,
                0,
                PAGE.width,
                PAGE.height
            )
            .fill(COLORS.warmWhite);

        sectionHeader(
            "SMART GUIDANCE",
            "Travel smarter, not harder",
            "The following guidance comes directly from the generated planner result."
        );

        /* AI Recommendation */

        roundedCard(
            40,
            150,
            515,
            150,
            COLORS.forest,
            null,
            16
        );

        label(
            "AI RECOMMENDATION",
            62,
            173,
            135
        );

        let aiText = "";

        if (
            typeof data.aiRecommendation ===
            "string"
        ) {
            aiText =
                data.aiRecommendation;
        } else {
            aiText =
                getTextValue(
                    data.aiRecommendation,
                    [
                        "summary",
                        "recommendation",
                        "message"
                    ],
                    "No AI recommendation was generated."
                );
        }

        bodyText(
            aiText,
            62,
            212,
            460,
            9,
            COLORS.white,
            {
                lineGap: 4
            }
        );

        bodyText(
            "AI-assisted guidance • Verify local conditions before travel",
            62,
            274,
            450,
            6.5,
            "#B9D8C6"
        );


        /* Highlights */

        label(
            "DESTINATION HIGHLIGHTS",
            40,
            330,
            150
        );

        const highlights =
            data.destinationHighlights;

        if (highlights.length) {
            let hx = 40;
            let hy = 365;

            highlights
                .slice(0, 6)
                .forEach(
                    (highlight, index) => {
                        if (index === 3) {
                            hx = 40;
                            hy += 72;
                        }

                        roundedCard(
                            hx,
                            hy,
                            250,
                            58,
                            COLORS.white,
                            COLORS.border,
                            11
                        );

                        doc
                            .circle(
                                hx + 25,
                                hy + 29,
                                12
                            )
                            .fill(COLORS.mint);

                        bodyText(
                            String(
                                index + 1
                            ).padStart(
                                2,
                                "0"
                            ),
                            hx + 14,
                            hy + 25,
                            22,
                            6.5,
                            COLORS.green,
                            {
                                bold: true,
                                align: "center"
                            }
                        );

                        bodyText(
                            typeof highlight ===
                                "string"
                                ? highlight
                                : getTextValue(
                                    highlight,
                                    [
                                        "name",
                                        "title",
                                        "place"
                                    ],
                                    "Destination highlight"
                                ),
                            hx + 48,
                            hy + 21,
                            185,
                            8,
                            COLORS.charcoal,
                            {
                                bold: true
                            }
                        );

                        hx += 265;
                    }
                );
        } else {
            bodyText(
                "No destination highlights were generated.",
                40,
                370,
                500,
                8,
                COLORS.muted
            );
        }


        /* Tips */

        label(
            "TRAVEL TIPS",
            40,
            530,
            95
        );

        const tips =
            data.travelTips;

        if (tips.length) {
            let tipY = 565;

            tips
                .slice(0, 8)
                .forEach((tip) => {
                    doc
                        .circle(
                            48,
                            tipY + 4,
                            3
                        )
                        .fill(COLORS.green);

                    bodyText(
                        typeof tip === "string"
                            ? tip
                            : getTextValue(
                                tip,
                                [
                                    "text",
                                    "tip",
                                    "description"
                                ],
                                "Travel tip"
                            ),
                        60,
                        tipY,
                        470,
                        7.5,
                        COLORS.dark
                    );

                    tipY += 22;
                });
        } else {
            bodyText(
                "No travel tips were generated.",
                40,
                565,
                500,
                8,
                COLORS.muted
            );
        }


        /* ====================================================
           PAGE 6 — PACKING + INSIGHTS
        ==================================================== */

        newPage();

        doc
            .rect(
                0,
                0,
                PAGE.width,
                PAGE.height
            )
            .fill(COLORS.cream);

        sectionHeader(
            "TRIP READINESS",
            "Pack well. Travel prepared.",
            "A compact checklist and destination intelligence section for your journey."
        );

        /* Packing */

        roundedCard(
            40,
            155,
            250,
            500,
            COLORS.white,
            COLORS.border,
            15
        );

        label(
            "PACKING LIST",
            60,
            180,
            105
        );

        const packing =
            data.packingList;

        if (!packing.length) {
            bodyText(
                "No custom packing list was generated.",
                60,
                225,
                210,
                8,
                COLORS.muted
            );
        } else {
            let packY = 220;

            packing
                .slice(0, 16)
                .forEach((item) => {
                    const value =
                        typeof item === "string"
                            ? item
                            : getTextValue(
                                item,
                                [
                                    "name",
                                    "item",
                                    "text"
                                ],
                                "Travel essential"
                            );

                    doc
                        .roundedRect(
                            60,
                            packY,
                            16,
                            16,
                            5
                        )
                        .fill(COLORS.mint);

                    bodyText(
                        "✓",
                        63,
                        packY + 4,
                        10,
                        6.5,
                        COLORS.green,
                        {
                            bold: true,
                            align: "center"
                        }
                    );

                    bodyText(
                        value,
                        86,
                        packY + 3,
                        180,
                        7.5,
                        COLORS.dark
                    );

                    packY += 27;
                });
        }


        /* Insights */

        roundedCard(
            305,
            155,
            250,
            500,
            COLORS.white,
            COLORS.border,
            15
        );

        label(
            "TRIP INSIGHTS",
            325,
            180,
            105
        );

        const insightRows = [
            [
                "Difficulty",
                getTextValue(
                    insights,
                    [
                        "difficulty",
                        "travelDifficulty"
                    ]
                )
            ],
            [
                "Photography",
                getTextValue(
                    insights,
                    ["photography"]
                )
            ],
            [
                "Carbon footprint",
                getTextValue(
                    insights,
                    ["carbonFootprint"]
                )
            ],
            [
                "Walking distance",
                getTextValue(
                    insights,
                    ["walkingDistance"]
                )
            ],
            [
                "Mobile network",
                getTextValue(
                    insights,
                    ["mobileNetwork"]
                )
            ],
            [
                "Connectivity",
                getTextValue(
                    insights,
                    ["connectivity"]
                )
            ],
            [
                "Suitable for",
                getTextValue(
                    insights,
                    ["suitableFor"]
                )
            ],
            [
                "Adventure",
                getTextValue(
                    insights,
                    ["adventure"]
                )
            ],
            [
                "Crowd level",
                getTextValue(
                    insights,
                    ["crowdLevel"]
                )
            ]
        ];

        let insightY = 220;

        insightRows.forEach(
            (row, index) => {
                if (index > 0) {
                    divider(
                        325,
                        insightY - 8,
                        210
                    );
                }

                bodyText(
                    row[0],
                    325,
                    insightY,
                    95,
                    7,
                    COLORS.muted
                );

                bodyText(
                    row[1],
                    420,
                    insightY,
                    105,
                    7.5,
                    COLORS.charcoal,
                    {
                        bold: true,
                        align: "right"
                    }
                );

                insightY += 38;
            }
        );

        const comfortScore =
            safeNumber(
                insights.comfortScore,
                90
            );

        bodyText(
            "OVERALL COMFORT",
            325,
            575,
            120,
            6.5,
            COLORS.green,
            {
                bold: true
            }
        );

        bodyText(
            `${comfortScore}%`,
            450,
            572,
            75,
            13,
            COLORS.green,
            {
                bold: true,
                align: "right"
            }
        );

        doc
            .roundedRect(
                325,
                600,
                200,
                8,
                4
            )
            .fill("#E7EEE9");

        doc
            .roundedRect(
                325,
                600,
                Math.max(
                    5,
                    200 *
                    Math.min(
                        100,
                        Math.max(
                            0,
                            comfortScore
                        )
                    ) / 100
                ),
                8,
                4
            )
            .fill(COLORS.green);

        bodyText(
            "Use these insights as planning guidance and verify conditions locally before departure.",
            325,
            625,
            200,
            6.8,
            COLORS.muted,
            {
                lineGap: 2
            }
        );


        /* ====================================================
           FINAL PAGE — CLOSING
        ==================================================== */

        newPage();

        background();

        doc
            .rect(
                0,
                0,
                PAGE.width,
                PAGE.height
            )
            .fillOpacity(0.72)
            .fill(COLORS.deepForest);

        doc.fillOpacity(1);

        addImage(
            "jharkhand_logo_small.png",
            42,
            38,
            {
                width: 68
            }
        );

        bodyText(
            "YOUR JHARKHAND TRAVEL COMPANION",
            125,
            50,
            400,
            7.5,
            "#C8E1CF",
            {
                bold: true
            }
        );

        title(
            "Travel beautifully.",
            40,
            135,
            515,
            27,
            COLORS.white
        );

        bodyText(
            "Travel responsibly. Discover deeply.",
            40,
            178,
            500,
            10,
            "#C9DED0"
        );

        roundedCard(
            40,
            225,
            515,
            240,
            COLORS.white,
            null,
            18
        );

        label(
            "YOUR TRIP SUMMARY",
            65,
            250,
            115
        );

        title(
            data.destination,
            65,
            288,
            440,
            22
        );

        bodyText(
            `${data.tripDays}-day journey • ${money(data.tripBudget)} planned budget`,
            65,
            321,
            430,
            8.5,
            COLORS.muted
        );

        divider(
            65,
            350,
            465
        );

        const finalStats = [
            [
                "ESTIMATED COST",
                money(data.totalCost)
            ],
            [
                "REMAINING",
                money(
                    Math.max(
                        0,
                        data.tripBudget -
                        data.totalCost
                    )
                )
            ],
            [
                "ECO SCORE",
                `${data.ecoScore}/100`
            ]
        ];

        finalStats.forEach(
            (stat, index) => {
                const x =
                    65 +
                    index * 155;

                bodyText(
                    stat[0],
                    x,
                    375,
                    130,
                    6.5,
                    COLORS.muted,
                    {
                        bold: true
                    }
                );

                bodyText(
                    stat[1],
                    x,
                    397,
                    140,
                    15,
                    COLORS.green,
                    {
                        bold: true
                    }
                );
            }
        );

        bodyText(
            "This report brings your generated itinerary, stays, conditions, budget intelligence, AI guidance and preparation details together as one travel companion.",
            65,
            435,
            450,
            8,
            COLORS.muted,
            {
                lineGap: 3
            }
        );


        const pillars = [
            [
                "NATURE",
                "Protect the landscapes you came to experience."
            ],
            [
                "CULTURE",
                "Respect communities, traditions and local stories."
            ],
            [
                "ADVENTURE",
                "Explore thoughtfully and make every journey count."
            ]
        ];

        pillars.forEach(
            (pillar, index) => {
                const x =
                    40 +
                    index * 167;

                roundedCard(
                    x,
                    505,
                    150,
                    115,
                    COLORS.white,
                    null,
                    13
                );

                bodyText(
                    pillar[0],
                    x + 16,
                    528,
                    118,
                    7.5,
                    COLORS.green,
                    {
                        bold: true
                    }
                );

                bodyText(
                    pillar[1],
                    x + 16,
                    553,
                    118,
                    7.5,
                    COLORS.dark,
                    {
                        lineGap: 3
                    }
                );
            }
        );

        title(
            "Welcome to Jharkhand.",
            40,
            670,
            515,
            19,
            COLORS.white
        );

        bodyText(
            "May your journey be filled with forests, stories, discoveries and memories worth carrying home.",
            75,
            705,
            445,
            8.5,
            "#C5DCCE",
            {
                align: "center",
                lineGap: 3
            }
        );

        doc
            .roundedRect(
                160,
                760,
                275,
                38,
                19
            )
            .fill("#164C36");

        bodyText(
            "JHARKHAND TOURISM",
            160,
            771,
            275,
            7.5,
            "#D2E7D9",
            {
                bold: true,
                align: "center"
            }
        );

        bodyText(
            "Nature • Culture • Adventure • Responsible Travel",
            160,
            784,
            275,
            6,
            "#8FB79D",
            {
                align: "center"
            }
        );


        /* ====================================================
           FOOTERS
        ==================================================== */

        drawFooter();

        doc.end();

    } catch (error) {
        console.error(
            "❌ PDF generation error:",
            error
        );

        if (!res.headersSent) {
            return res
                .status(500)
                .send(
                    "Unable to generate the travel report right now."
                );
        }

        try {
            res.end();
        } catch (_) {}
    }
}


/* ============================================================
   POST — FULL PLANNER DATA
============================================================ */

router.post("/", (req, res) => {
    try {
        const body = req.body || {};

        const plannerData = {
            destination:
                body.destination,

            tripDays:
                body.tripDays,

            tripBudget:
                body.tripBudget,

            ecoScore:
                body.ecoScore,

            hotelCost:
                body.hotelCost,

            foodCost:
                body.foodCost,

            transportCost:
                body.transportCost,

            totalCost:
                body.totalCost,

            budgetStatus:
                body.budgetStatus,

            itinerary:
                parseSerialized(
                    body.itinerary,
                    []
                ),

            hotelRecommendations:
                parseSerialized(
                    body.hotelRecommendations,
                    []
                ),

            weatherInfo:
                parseSerialized(
                    body.weatherInfo,
                    {}
                ),

            aiRecommendation:
                parseSerialized(
                    body.aiRecommendation,
                    body.aiRecommendation || ""
                ),

            travelTips:
                parseSerialized(
                    body.travelTips,
                    []
                ),

            destinationHighlights:
                parseSerialized(
                    body.destinationHighlights,
                    []
                ),

            tripInsights:
                parseSerialized(
                    body.tripInsights,
                    {}
                ),

            packingList:
                parseSerialized(
                    body.packingList,
                    []
                )
        };

        return generatePDF(
            req,
            res,
            plannerData
        );

    } catch (error) {
        console.error(
            "❌ POST /pdf error:",
            error
        );

        return res
            .status(500)
            .send(
                "Unable to generate the travel report."
            );
    }
});


/* ============================================================
   GET — BACKWARD COMPATIBILITY
============================================================ */

router.get("/", (req, res) => {
    return generatePDF(
        req,
        res,
        req.query || {}
    );
});


module.exports = router;