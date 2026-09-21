const express = require("express");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const router = express.Router();

/* =========================================================
   DOWNLOAD CATALOGUE
========================================================= */

const DOWNLOADS = {
  guide: {
    filename: "tourist-guide.pdf",
    title: "Jharkhand Tourist Guide",
    eyebrow: "TRAVEL RESOURCE",
    description:
      "A compact reference for planning a responsible journey across Jharkhand.",
    bullets: [
      "Best season: Oct–Feb (post-monsoon to winter)",
      "Top picks: Lodh Falls, Betla National Park, Patratu Valley, Baidyanath Dham",
      "Local culture: Chhau dance, tribal crafts, weekly haats",
      "Safety: Follow park rules and check weather before treks"
    ]
  },

  "festival-calendar": {
    filename: "festival-calendar.pdf",
    title: "Jharkhand Festival Calendar",
    eyebrow: "CULTURE & HERITAGE",
    description:
      "A highlights calendar for discovering festivals and seasonal cultural experiences.",
    bullets: [
      "Makar Sankranti (Jan) • Sarhul (Mar/Apr) • Karma (Aug/Sep)",
      "Diwali/Deepotsav (Oct/Nov) • Chhath (Oct/Nov)",
      "Local melas at Deoghar, Ranchi and regional towns"
    ]
  },

  "trek-checklist": {
    filename: "safety-trek-checklist.pdf",
    title: "Safety & Trek Checklist",
    eyebrow: "RESPONSIBLE TRAVEL",
    description:
      "A practical checklist for preparing for outdoor and trekking experiences.",
    bullets: [
      "Footwear, rain jacket, torch, first-aid, charged phone and ID proof",
      "Tell someone your route and timings; avoid trekking alone",
      "Respect wildlife and carry back your waste"
    ]
  }
};

const STATIC_DIR = path.join(
  __dirname,
  "..",
  "public",
  "downloads"
);

/* =========================================================
   HELPERS
========================================================= */

function safeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
}

function safeFilename(value) {
  return String(value || "download.pdf")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

function setPdfHeaders(res, filename, cacheSeconds = 3600) {
  res.setHeader(
    "Content-Type",
    "application/pdf"
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeFilename(filename)}"`
  );

  res.setHeader(
    "Cache-Control",
    `public, max-age=${cacheSeconds}`
  );

  res.setHeader(
    "X-Content-Type-Options",
    "nosniff"
  );
}

function drawHeader(doc, item) {
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#9f7440")
    .text(
      item.eyebrow,
      50,
      45,
      {
        characterSpacing: 1.5
      }
    );

  doc
    .moveDown(1.1)
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor("#123b2a")
    .text(item.title, {
      width: 495
    });

  doc
    .moveDown(0.7)
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor("#647169")
    .text(item.description, {
      width: 495,
      lineGap: 4
    });

  doc.moveDown(1.2);

  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .strokeColor("#dfe7e1")
    .stroke();

  doc.moveDown(1.4);
}

function drawBullets(doc, bullets) {
  bullets.forEach((bullet) => {
    const startY = doc.y;

    doc
      .circle(
        57,
        startY + 5,
        2.8
      )
      .fill("#23724a");

    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#33423a")
      .text(
        bullet,
        72,
        startY - 1,
        {
          width: 465,
          lineGap: 5
        }
      );

    doc.moveDown(0.8);
  });
}

function drawInformationCard(doc) {
  const cardTop = doc.y + 10;
  const cardHeight = 115;

  doc
    .roundedRect(
      50,
      cardTop,
      495,
      cardHeight,
      14
    )
    .fill("#f8f5ed");

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#123b2a")
    .text(
      "Useful travel contacts",
      70,
      cardTop + 17
    );

  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor("#5e6b63")
    .text(
      "Tourist Helpline: 1364",
      70,
      cardTop + 40
    );

  doc.text(
    "JTDC Reservations: 0651-2438866 / 2438002",
    70,
    cardTop + 59
  );

  doc.text(
    "Email: itmanager@jharkhandtourism.com",
    70,
    cardTop + 78
  );

  doc.y =
    cardTop +
    cardHeight +
    22;
}

function drawFooter(doc, pageNumber) {
  const footerY = 790;

  doc
    .moveTo(50, footerY)
    .lineTo(545, footerY)
    .strokeColor("#dfe7e1")
    .stroke();

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#7a857e")
    .text(
      "Jharkhand Tourism • Travel resource",
      50,
      footerY + 12,
      {
        width: 350
      }
    );

  doc
    .text(
      `Page ${pageNumber}`,
      455,
      footerY + 12,
      {
        width: 90,
        align: "right"
      }
    );
}

function streamPdf(res, item) {
  setPdfHeaders(
    res,
    item.filename,
    1800
  );

  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: {
      Title: item.title,
      Author: "Jharkhand Tourism",
      Subject: item.description,
      Creator: "Jharkhand Tourism"
    }
  });

  let completed = false;

  doc.on("error", (error) => {
    console.error(
      "⚠️ PDF generation error:",
      error?.message || error
    );

    if (!res.headersSent) {
      res.status(500).send(
        "Unable to generate the requested PDF."
      );
    } else if (!res.writableEnded) {
      res.end();
    }
  });

  res.on("finish", () => {
    completed = true;
  });

  doc.pipe(res);

  /* -------------------------------------------------------
     HEADER
  ------------------------------------------------------- */

  drawHeader(doc, item);

  /* -------------------------------------------------------
     QUICK LOOK CARD
  ------------------------------------------------------- */

  doc
    .roundedRect(
      50,
      doc.y,
      495,
      58,
      12
    )
    .fill("#edf6ef");

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#23724a")
    .text(
      "PLAN WITH CONFIDENCE",
      68,
      doc.y + 15,
      {
        characterSpacing: 1
      }
    );

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#526359")
    .text(
      "Use this guide alongside the destination, hotel and trip-planning tools on the portal.",
      68,
      doc.y + 30,
      {
        width: 455
      }
    );

  doc.y += 78;

  /* -------------------------------------------------------
     CONTENT
  ------------------------------------------------------- */

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#123b2a")
    .text("Key information");

  doc.moveDown(0.9);

  drawBullets(
    doc,
    Array.isArray(item.bullets)
      ? item.bullets
      : []
  );

  drawInformationCard(doc);

  /* -------------------------------------------------------
     RESPONSIBLE TRAVEL
  ------------------------------------------------------- */

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#123b2a")
    .text("Travel responsibly");

  doc
    .moveDown(0.55)
    .font("Helvetica")
    .fontSize(9.8)
    .fillColor("#647169")
    .text(
      "Respect local communities, cultural traditions and natural environments while exploring Jharkhand. Follow local instructions and destination-specific safety guidance.",
      {
        width: 495,
        lineGap: 4
      }
    );

  /* -------------------------------------------------------
     FOOTER
  ------------------------------------------------------- */

  drawFooter(doc, 1);

  doc.end();

  return completed;
}


/* =========================================================
   DOWNLOADS LANDING PAGE
   GET /downloads
========================================================= */

router.get("/", (req, res) => {

  return res.render(
    "downloads/index",
    {
      title: "Resources & Downloads"
    }
  );

});


/* =========================================================
   DOWNLOAD RESOURCE
   GET /downloads/:slug
========================================================= */

router.get("/:slug", (req, res) => {

  const slug = safeSlug(
    req.params.slug
  );

  const item =
    DOWNLOADS[slug];

  if (!item) {

    return res.status(404).send(
      "Requested tourism resource was not found."
    );

  }

  const filePath =
    path.join(
      STATIC_DIR,
      item.filename
    );

  /*
   * Only allow catalogue filenames.
   * The path is built from our internal MAP,
   * so user input can never select an
   * arbitrary filesystem location.
   */

  fs.stat(
    filePath,
    (error, stats) => {

      if (
        !error &&
        stats &&
        stats.isFile()
      ) {

        setPdfHeaders(
          res,
          item.filename,
          3600
        );

        res.download(
          filePath,
          item.filename,
          {
            maxAge:
              3600 * 1000,

            dotfiles:
              "deny"
          },
          (downloadError) => {

            if (
              downloadError &&
              !res.headersSent
            ) {

              console.error(
                "⚠️ Static download error:",
                downloadError.message
              );

              res
                .status(500)
                .send(
                  "Unable to download the requested resource."
                );

            }

          }
        );

        return;
      }


      /*
       * Generate the resource dynamically when
       * a pre-built PDF is not present.
       */

      try {

        streamPdf(
          res,
          item
        );

      }

      catch (generationError) {

        console.error(
          "⚠️ Dynamic PDF error:",
          generationError?.message ||
            generationError
        );

        if (!res.headersSent) {

          return res
            .status(500)
            .send(
              "Unable to generate the requested resource."
            );

        }

        if (!res.writableEnded) {
          res.end();
        }

      }

    }
  );

});


/* =========================================================
   EXPORT
========================================================= */

module.exports = router;