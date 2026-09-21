// =========================================================
// JHARKHAND TOURISM
// FEEDBACK ROUTE
// =========================================================
//
// Responsibilities:
// - Receive visitor feedback
// - Validate feedback fields
// - Validate rating
// - Save feedback to MongoDB
// - Generate visitor reward code
// - Return JSON for AJAX/API requests
// - Return a friendly browser response for normal forms
//
// Existing contract preserved:
// - POST /feedback
// - name
// - email
// - phone
// - nationality
// - category
// - message
// - rating
// - rewardCode
// - rewardTier
// =========================================================

const express = require("express");
const crypto = require("crypto");
const Feedback = require("../models/Feedback");

const router = express.Router();


// =========================================================
// CONSTANTS
// =========================================================

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 160;
const MAX_PHONE_LENGTH = 30;
const MAX_NATIONALITY_LENGTH = 80;
const MAX_CATEGORY_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 3000;

const ALLOWED_CATEGORIES = new Set([
  "Hotel",
  "Transport",
  "Place",
  "Website",
  "Smart Tourism",
  "Food",
  "Other"
]);


// =========================================================
// HELPERS
// =========================================================

function cleanString(value, maxLength = 500) {

  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

}


function cleanMessage(value) {

  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);

}


function isValidEmail(email) {

  if (!email) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


function normalizeRating(value) {

  const rating = Number(value);

  if (!Number.isFinite(rating)) {
    return null;
  }

  return Math.round(rating);

}


/**
 * Generate a compact visitor reward code.
 *
 * 1–3 stars -> Bronze
 * 4 stars   -> Silver
 * 5 stars   -> Gold
 */
function rewardFor(rating = 3) {

  let tier = "BRONZE";

  if (rating === 4) {
    tier = "SILVER";
  }

  if (rating >= 5) {
    tier = "GOLD";
  }

  const token = crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase();

  return {
    tier,
    code: `JH-${tier.substring(0, 3)}-${token}`
  };

}


function getClientIp(req) {

  const forwarded =
    req.headers["x-forwarded-for"];

  if (
    typeof forwarded === "string" &&
    forwarded.trim()
  ) {

    return forwarded
      .split(",")[0]
      .trim()
      .slice(0, 100);

  }

  return (
    req.socket?.remoteAddress ||
    ""
  ).slice(0, 100);

}


function isJsonRequest(req) {

  const accept = String(
    req.get("accept") || ""
  ).toLowerCase();

  const requestedWith = String(
    req.get("x-requested-with") || ""
  ).toLowerCase();

  return (
    accept.includes("application/json") ||
    requestedWith === "xmlhttprequest"
  );

}


// =========================================================
// BROWSER ERROR PAGE
// =========================================================
//
// Instead of displaying raw text on a completely blank page,
// normal browser form submissions now receive a proper
// Jharkhand Tourism styled error screen with:
// - clear message
// - Back to contact
// - Return home
//
// JSON/API requests continue receiving JSON.
// =========================================================

function sendBrowserError(
  res,
  statusCode,
  message
) {

  const safeMessage =
    String(message || "Something went wrong.")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  return res
    .status(statusCode)
    .send(`
      <!doctype html>

      <html lang="en">

        <head>

          <meta charset="utf-8">

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          >

          <title>
            Feedback | Jharkhand Tourism
          </title>

          <style>

            * {
              box-sizing: border-box;
            }

            :root {

              --green:
                #123b2a;

              --green-2:
                #1f6648;

              --green-soft:
                #edf6ef;

              --gold:
                #c99a4a;

              --ink:
                #17372c;

              --muted:
                #687871;

              --line:
                #dfe8e2;

              --paper:
                #f5f8f6;

              --white:
                #ffffff;

            }

            html,
            body {
              min-height: 100%;
            }

            body {

              margin: 0;

              min-height: 100vh;

              display: grid;

              place-items: center;

              padding: 22px;

              font-family:
                Inter,
                system-ui,
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;

              background:
                radial-gradient(
                  circle at top,
                  #eef6f1 0%,
                  var(--paper) 48%,
                  #ffffff 100%
                );

              color:
                var(--ink);

            }

            .feedback-error-shell {

              width:
                min(100%, 650px);

              position:
                relative;

              overflow:
                hidden;

              padding:
                38px;

              border:
                1px solid var(--line);

              border-radius:
                26px;

              background:
                rgba(255,255,255,.97);

              box-shadow:
                0 25px 70px
                rgba(18,59,42,.12);

              text-align:
                center;

            }

            .feedback-error-shell::before {

              content:
                "";

              position:
                absolute;

              width:
                220px;

              height:
                220px;

              top:
                -120px;

              right:
                -110px;

              border:
                1px solid
                rgba(31,102,72,.10);

              border-radius:
                50%;

            }

            .feedback-error-icon {

              position:
                relative;

              z-index:
                1;

              width:
                68px;

              height:
                68px;

              margin:
                0 auto 20px;

              display:
                grid;

              place-items:
                center;

              border:
                1px solid
                #dbe9df;

              border-radius:
                20px;

              background:
                var(--green-soft);

              color:
                var(--green-2);

              font-size:
                27px;

              font-weight:
                900;

            }

            .feedback-error-kicker {

              display:
                inline-block;

              margin-bottom:
                10px;

              color:
                var(--gold);

              font-size:
                .68rem;

              font-weight:
                900;

              letter-spacing:
                .15em;

              text-transform:
                uppercase;

            }

            h1 {

              margin:
                0;

              color:
                var(--green);

              font-family:
                Georgia,
                "Times New Roman",
                serif;

              font-size:
                clamp(
                  2rem,
                  5vw,
                  3rem
                );

              line-height:
                1.05;

              letter-spacing:
                -.03em;

            }

            .feedback-error-message {

              max-width:
                510px;

              margin:
                15px auto 0;

              padding:
                13px 15px;

              border:
                1px solid #eadfc8;

              border-radius:
                13px;

              background:
                #fbf7ee;

              color:
                #745f3e;

              font-size:
                .86rem;

              font-weight:
                700;

              line-height:
                1.55;

            }

            .feedback-error-description {

              max-width:
                500px;

              margin:
                14px auto 0;

              color:
                var(--muted);

              font-size:
                .82rem;

              line-height:
                1.7;

            }

            .feedback-error-actions {

              display:
                flex;

              flex-wrap:
                wrap;

              justify-content:
                center;

              gap:
                9px;

              margin-top:
                24px;

            }

            .feedback-error-actions a {

              min-height:
                45px;

              display:
                inline-flex;

              align-items:
                center;

              justify-content:
                center;

              gap:
                8px;

              padding:
                10px 16px;

              border:
                1px solid
                var(--line);

              border-radius:
                12px;

              color:
                var(--green);

              background:
                #ffffff;

              font-size:
                .74rem;

              font-weight:
                800;

              text-decoration:
                none;

              transition:
                .18s ease;

            }

            .feedback-error-actions a.primary {

              border-color:
                var(--green);

              background:
                var(--green);

              color:
                #ffffff;

            }

            .feedback-error-actions a:hover {

              transform:
                translateY(-1px);

            }

            .feedback-error-actions a.primary:hover {

              background:
                #0d2f22;

              color:
                #ffffff;

            }

            .feedback-error-footer {

              margin-top:
                22px;

              padding-top:
                15px;

              border-top:
                1px solid
                var(--line);

              color:
                #93a19b;

              font-size:
                .62rem;

            }

            @media (max-width: 520px) {

              body {
                padding:
                  12px;
              }

              .feedback-error-shell {

                padding:
                  28px 20px;

                border-radius:
                  20px;

              }

              .feedback-error-actions {

                flex-direction:
                  column;

              }

              .feedback-error-actions a {

                width:
                  100%;

              }

            }

          </style>

        </head>


        <body>

          <main
            class="feedback-error-shell"
            aria-labelledby="feedbackErrorTitle"
          >

            <div
              class="feedback-error-icon"
              aria-hidden="true"
            >
              !
            </div>


            <div class="feedback-error-kicker">
              FEEDBACK NOT SUBMITTED
            </div>


            <h1 id="feedbackErrorTitle">
              Please check your feedback.
            </h1>


            <div class="feedback-error-message">
              ${safeMessage}
            </div>


            <p class="feedback-error-description">

              Your feedback has not been saved yet.
              Return to the Contact page, complete the required
              fields and submit again.

            </p>


            <div class="feedback-error-actions">

              <a
                href="/contact"
                class="primary"
              >
                ← Back to Contact
              </a>


              <a
                href="/"
              >
                Return Home
              </a>

            </div>


            <div class="feedback-error-footer">
              Jharkhand Tourism • Visitor Feedback
            </div>

          </main>

        </body>

      </html>
    `);

}


function sendError(
  res,
  req,
  statusCode,
  message
) {

  if (isJsonRequest(req)) {

    return res
      .status(statusCode)
      .json({
        ok: false,
        error: message
      });

  }

  return sendBrowserError(
    res,
    statusCode,
    message
  );

}


// =========================================================
// GET /feedback
// =========================================================
//
// Directly opening /feedback should never show a blank 404.
// Send visitors to the actual Contact/Feedback page.
// =========================================================

router.get(
  "/",
  (req, res) => {

    return res.redirect(
      "/contact"
    );

  }
);


// =========================================================
// POST /feedback
// =========================================================

router.post(
  "/",
  async (req, res) => {

    try {

      const body =
        req.body || {};


      // -----------------------------------------------------
      // CLEAN INPUTS
      // -----------------------------------------------------

      const name =
        cleanString(
          body.name,
          MAX_NAME_LENGTH
        );


      const email =
        cleanString(
          body.email,
          MAX_EMAIL_LENGTH
        ).toLowerCase();


      const phone =
        cleanString(
          body.phone,
          MAX_PHONE_LENGTH
        );


      const nationality =
        cleanString(
          body.nationality,
          MAX_NATIONALITY_LENGTH
        );


      const category =
        cleanString(
          body.category,
          MAX_CATEGORY_LENGTH
        );


      const message =
        cleanMessage(
          body.message
        );


      const rating =
        normalizeRating(
          body.rating
        );


      // -----------------------------------------------------
      // REQUIRED FIELD VALIDATION
      // -----------------------------------------------------

      if (!name) {

        return sendError(
          res,
          req,
          400,
          "Please enter your name."
        );

      }


      if (!message) {

        return sendError(
          res,
          req,
          400,
          "Please enter your feedback."
        );

      }


      /*
       * Rating remains required.
       *
       * Accepted values:
       * 1
       * 2
       * 3
       * 4
       * 5
       */

      if (rating === null) {

        return sendError(
          res,
          req,
          400,
          "Please select a rating from 1 to 5."
        );

      }


      if (
        rating < 1 ||
        rating > 5
      ) {

        return sendError(
          res,
          req,
          400,
          "Rating must be between 1 and 5."
        );

      }


      if (!isValidEmail(email)) {

        return sendError(
          res,
          req,
          400,
          "Please enter a valid email address."
        );

      }


      // -----------------------------------------------------
      // CATEGORY NORMALIZATION
      // -----------------------------------------------------

      let safeCategory =
        category;


      if (
        safeCategory &&
        !ALLOWED_CATEGORIES.has(
          safeCategory
        )
      ) {

        safeCategory =
          "Other";

      }


      // -----------------------------------------------------
      // REWARD
      // -----------------------------------------------------

      const {
        tier,
        code
      } =
        rewardFor(
          rating
        );


      // -----------------------------------------------------
      // DATABASE SAVE
      // -----------------------------------------------------

      const feedbackDocument =
        await Feedback.create({

          name,

          email,

          phone,

          nationality,

          category:
            safeCategory,

          message,

          rating,

          rewardCode:
            code,

          rewardTier:
            tier,

          userAgent:
            cleanString(
              req.get("user-agent"),
              500
            ),

          ip:
            getClientIp(req)

        });


      // -----------------------------------------------------
      // RESPONSE PAYLOAD
      // -----------------------------------------------------

      const responsePayload = {

        ok:
          true,

        rewardCode:
          feedbackDocument.rewardCode,

        rewardTier:
          feedbackDocument.rewardTier,

        message:
          "Thank you for sharing your feedback."

      };


      // -----------------------------------------------------
      // JSON / AJAX REQUEST
      // -----------------------------------------------------

      if (isJsonRequest(req)) {

        return res
          .status(201)
          .json(
            responsePayload
          );

      }


      // -----------------------------------------------------
      // NORMAL BROWSER FORM SUBMISSION
      // -----------------------------------------------------
      //
      // Keep the current successful browser behavior,
      // but provide a polished branded confirmation page.
      // -----------------------------------------------------

      return res
        .status(201)
        .send(`

          <!doctype html>

          <html lang="en">

            <head>

              <meta charset="utf-8">

              <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
              >

              <title>
                Feedback Received | Jharkhand Tourism
              </title>


              <style>

                * {
                  box-sizing:
                    border-box;
                }


                :root {

                  --green:
                    #123b2a;

                  --green-dark:
                    #0d2f22;

                  --green-soft:
                    #edf6ef;

                  --gold:
                    #c99a4a;

                  --ink:
                    #18382c;

                  --muted:
                    #647169;

                  --line:
                    #dfe8e1;

                  --paper:
                    #f4f7f4;

                  --white:
                    #ffffff;

                }


                html,
                body {
                  min-height:
                    100%;
                }


                body {

                  margin:
                    0;

                  min-height:
                    100vh;

                  display:
                    grid;

                  place-items:
                    center;

                  padding:
                    24px;

                  font-family:
                    Inter,
                    system-ui,
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    sans-serif;

                  background:
                    radial-gradient(
                      circle at top,
                      #edf6f1 0%,
                      var(--paper) 48%,
                      #ffffff 100%
                    );

                  color:
                    var(--ink);

                }


                .feedback-success {

                  position:
                    relative;

                  overflow:
                    hidden;

                  width:
                    min(100%, 650px);

                  padding:
                    40px;

                  border:
                    1px solid var(--line);

                  border-radius:
                    26px;

                  background:
                    rgba(255,255,255,.97);

                  box-shadow:
                    0 24px 70px
                    rgba(18,59,42,.12);

                  text-align:
                    center;

                }


                .feedback-success::before {

                  content:
                    "";

                  position:
                    absolute;

                  width:
                    230px;

                  height:
                    230px;

                  top:
                    -130px;

                  right:
                    -115px;

                  border:
                    1px solid
                    rgba(31,102,72,.10);

                  border-radius:
                    50%;

                }


                .feedback-icon {

                  position:
                    relative;

                  z-index:
                    1;

                  width:
                    70px;

                  height:
                    70px;

                  margin:
                    0 auto 20px;

                  display:
                    grid;

                  place-items:
                    center;

                  border:
                    1px solid
                    #d7e8dc;

                  border-radius:
                    21px;

                  background:
                    var(--green-soft);

                  color:
                    #23724a;

                  font-size:
                    28px;

                  font-weight:
                    900;

                }


                .feedback-kicker {

                  display:
                    inline-block;

                  margin-bottom:
                    9px;

                  color:
                    var(--gold);

                  font-size:
                    .67rem;

                  font-weight:
                    900;

                  letter-spacing:
                    .15em;

                  text-transform:
                    uppercase;

                }


                h1 {

                  margin:
                    0 0 12px;

                  color:
                    var(--green);

                  font-family:
                    Georgia,
                    "Times New Roman",
                    serif;

                  font-size:
                    clamp(
                      2rem,
                      5vw,
                      3rem
                    );

                  line-height:
                    1.08;

                  letter-spacing:
                    -.03em;

                }


                .feedback-description {

                  max-width:
                    510px;

                  margin:
                    0 auto;

                  color:
                    var(--muted);

                  line-height:
                    1.75;

                  font-size:
                    .84rem;

                }


                .reward {

                  max-width:
                    390px;

                  margin:
                    25px auto;

                  padding:
                    18px;

                  border:
                    1px solid
                    #eadfc8;

                  border-radius:
                    17px;

                  background:
                    #fbf7ee;

                }


                .reward small {

                  display:
                    block;

                  color:
                    #887352;

                  font-weight:
                    800;

                  letter-spacing:
                    .08em;

                  text-transform:
                    uppercase;

                  font-size:
                    .61rem;

                }


                .reward strong {

                  display:
                    block;

                  margin-top:
                    7px;

                  color:
                    var(--green);

                  font-size:
                    1.28rem;

                  letter-spacing:
                    .08em;

                }


                .feedback-actions {

                  display:
                    flex;

                  flex-wrap:
                    wrap;

                  justify-content:
                    center;

                  gap:
                    9px;

                  margin-top:
                    21px;

                }


                .feedback-actions a {

                  min-height:
                    45px;

                  display:
                    inline-flex;

                  align-items:
                    center;

                  justify-content:
                    center;

                  gap:
                    8px;

                  padding:
                    10px 16px;

                  border:
                    1px solid var(--line);

                  border-radius:
                    12px;

                  background:
                    #ffffff;

                  color:
                    var(--green);

                  font-size:
                    .74rem;

                  font-weight:
                    800;

                  text-decoration:
                    none;

                  transition:
                    .18s ease;

                }


                .feedback-actions a.primary {

                  border-color:
                    var(--green);

                  background:
                    var(--green);

                  color:
                    #ffffff;

                }


                .feedback-actions a:hover {

                  transform:
                    translateY(-1px);

                }


                .feedback-actions a.primary:hover {

                  background:
                    var(--green-dark);

                  color:
                    #ffffff;

                }


                .feedback-footer {

                  margin-top:
                    21px;

                  padding-top:
                    15px;

                  border-top:
                    1px solid
                    var(--line);

                  color:
                    #93a19b;

                  font-size:
                    .61rem;

                }


                @media (max-width: 520px) {

                  body {
                    padding:
                      12px;
                  }


                  .feedback-success {
                    padding:
                      29px 20px;

                    border-radius:
                      20px;
                  }


                  .feedback-actions {
                    flex-direction:
                      column;
                  }


                  .feedback-actions a {
                    width:
                      100%;
                  }

                }

              </style>

            </head>


            <body>

              <main
                class="feedback-success"
                aria-labelledby="feedback-title"
              >

                <div
                  class="feedback-icon"
                  aria-hidden="true"
                >
                  ✓
                </div>


                <div class="feedback-kicker">
                  FEEDBACK RECEIVED
                </div>


                <h1 id="feedback-title">
                  Thank you for sharing your feedback.
                </h1>


                <p class="feedback-description">

                  Your experience has been recorded successfully.
                  Your feedback helps improve the Jharkhand Tourism
                  digital experience.

                </p>


                <div class="reward">

                  <small>
                    Your visitor reward code
                  </small>


                  <strong>
                    ${code}
                  </strong>

                </div>


                <div class="feedback-actions">

                  <a
                    href="/contact"
                    class="primary"
                  >
                    Back to Contact
                  </a>


                  <a href="/">
                    Return Home
                  </a>

                </div>


                <div class="feedback-footer">
                  Jharkhand Tourism • Visitor Feedback
                </div>

              </main>

            </body>

          </html>

        `);

    }

    catch (error) {

      console.error(
        "⚠️ Feedback route error:",
        error?.message || error
      );


      return sendError(
        res,
        req,
        500,
        "We could not save your feedback right now. Please try again."
      );

    }

  }
);


// =========================================================
// EXPORT
// =========================================================

module.exports = router;