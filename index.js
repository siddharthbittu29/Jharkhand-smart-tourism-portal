// =======================================================
// JHARKHAND TOURISM — EXPRESS + EJS SERVER
// File: index.js
// =======================================================

require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const morgan = require("morgan");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");

const app = express();


// =======================================================
// MIDDLEWARE
// =======================================================

app.use(cookieParser());

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(express.json());

app.use(
  methodOverride("_method")
);

app.use(morgan("dev"));


// =======================================================
// VIEWS + STATIC ASSETS
// =======================================================

const VIEWS_DIR = path.join(
  __dirname,
  "init",
  "views"
);

const PUBLIC_DIR = path.join(
  __dirname,
  "init",
  "public"
);

app.set(
  "view engine",
  "ejs"
);

app.set(
  "views",
  VIEWS_DIR
);

app.use(expressLayouts);

app.set(
  "layout",
  "layout"
);

app.use(
  express.static(PUBLIC_DIR)
);


// =======================================================
// GLOBAL TRANSLATION DEFAULTS
// =======================================================

const T = {

  en: {

    sitemap:
      "Sitemap",

    skip:
      "Skip To Main Content",

    access:
      "Accessibility",

    about:
      "About Us",

    contact:
      "Contact Us",

    reservations:
      "JTDC Reservations",

    helpline:
      "Tourism Helpline"

  },

  hi: {

    sitemap:
      "साइटमैप",

    skip:
      "मुख्य सामग्री पर जाएँ",

    access:
      "सुलभता",

    about:
      "हमारे बारे में",

    contact:
      "संपर्क करें",

    reservations:
      "जे टी डी सी आरक्षण",

    helpline:
      "पर्यटन हेल्पलाइन"

  }

};


// =======================================================
// GLOBAL VIEW LOCALS
// =======================================================

app.use((req, res, next) => {

  const cookieLang =
    req.cookies?.lang;

  const lang =
    cookieLang === "hi"
      ? "hi"
      : "en";

  res.locals.lang =
    lang;

  res.locals.t =
    T[lang];

  res.locals.currentPath =
    req.path;

  res.locals.logoPath =
    "/images/jharkhand_tourism_logo_final.png";

  next();

});


// =======================================================
// LANGUAGE SWITCH
// =======================================================

app.post(
  "/lang",
  (req, res) => {

    const lang =
      req.body?.lang === "hi"
        ? "hi"
        : "en";

    res.cookie(
      "lang",
      lang,
      {
        httpOnly: false,
        maxAge: 31536000000,
        sameSite: "lax"
      }
    );

    return res.redirect(
      req.get("Referer") || "/"
    );

  }
);


// =======================================================
// ROUTER MOUNTER
// =======================================================

function tryMount(
  mountPath,
  relativeRouterPath
) {

  try {

    const router =
      require(relativeRouterPath);

    app.use(
      mountPath,
      router
    );

    console.log(
      `✅ Mounted ${mountPath} from ${relativeRouterPath}`
    );

  } catch (error) {

    console.error(
      `⚠️ MOUNT ERROR for ${mountPath}`
    );

    console.error(
      error?.message || error
    );

  }

}


// =======================================================
// APPLICATION ROUTERS
// =======================================================

tryMount(
  "/listings",
  "./init/routes/listings"
);

tryMount(
  "/places",
  "./init/routes/places"
);

tryMount(
  "/feedback",
  "./init/routes/feedback"
);

tryMount(
  "/downloads",
  "./init/routes/downloads"
);

tryMount(
  "/likes",
  "./init/routes/likes"
);

tryMount(
  "/auth",
  "./init/routes/auth"
);

tryMount(
  "/smart-tourism",
  "./init/routes/smart-tourism"
);

tryMount(
  "/hotels",
  "./init/routes/hotels"
);

tryMount(
  "/dashboard",
  "./init/routes/dashboard"
);

tryMount(
  "/wishlist",
  "./init/routes/wishlist"
);

tryMount(
  "/planner",
  "./init/routes/planner"
);

tryMount(
  "/chatbot",
  "./init/routes/chatbot"
);

tryMount(
  "/pdf",
  "./init/routes/pdf"
);


// =======================================================
// HOME
// =======================================================

app.get(
  "/",
  (req, res) => {

    return res.render(
      "home",
      {
        title:
          "Explore Jharkhand",

        description:
          "Discover destinations, culture, nature, stays and smart travel experiences across Jharkhand."
      }
    );

  }
);


// =======================================================
// ABOUT
// =======================================================

app.get(
  "/about",
  (req, res) => {

    return res.render(
      "about",
      {
        title:
          "About Jharkhand Tourism"
      }
    );

  }
);


// =======================================================
// ACCESSIBILITY
// =======================================================

app.get(
  "/accessibility",
  (req, res) => {

    return res.render(
      "accessibility",
      {
        title:
          "Accessibility"
      }
    );

  }
);


// =======================================================
// CONTACT
// =======================================================
// The Contact page is a separate page route.
// Form submission/business logic remains handled by
// the existing /feedback router.

app.get(
  "/contact",
  (req, res) => {

    return res.render(
      "contact",
      {
        title:
          "Contact Jharkhand Tourism"
      }
    );

  }
);


// =======================================================
// BOOK HOTELS
// Use the approved top-level page
// =======================================================

app.get(
  "/book-hotels",
  (req, res) => {

    return res.render(
      "book-hotels",
      {
        title:
          "Book Hotels"
      }
    );

  }
);


// =======================================================
// FESTIVALS
// =======================================================

app.get(
  "/festivals",
  (req, res) => {

    return res.render(
      "festivals/index",
      {
        title:
          "Festivals of Jharkhand"
      }
    );

  }
);


// =======================================================
// GALLERY
// =======================================================

app.get(
  "/gallery",
  (req, res) => {

    return res.render(
      "gallery/index",
      {
        title:
          "Jharkhand Gallery"
      }
    );

  }
);


// =======================================================
// SITEMAP
// =======================================================

app.get(
  "/sitemap.xml",
  (req, res) => {

    const baseUrl =
      String(
        process.env.BASE_URL ||
        "http://localhost:8080"
      ).replace(/\/+$/, "");

    const publicRoutes = [

      "/",

      "/about",

      "/accessibility",

      "/contact",

      "/places",

      "/listings",

      "/hotels",

      "/book-hotels",

      "/festivals",

      "/gallery",

      "/smart-tourism",

      "/planner",

      "/chatbot",

      "/downloads"

    ];

    const urls =
      publicRoutes
        .map(
          (route) =>
            `  <url><loc>${baseUrl}${route}</loc></url>`
        )
        .join("\n");

    const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return res
      .type("application/xml")
      .send(xml);

  }
);


// =======================================================
// HEALTH
// =======================================================

app.get(
  "/health",
  (req, res) => {

    return res.json({

      ok:
        true,

      service:
        "Jharkhand Tourism",

      timestamp:
        new Date().toISOString()

    });

  }
);


// =======================================================
// 404
// =======================================================

app.use(
  (req, res) => {

    return res
      .status(404)
      .render(
        "404",
        {
          title:
            "Page Not Found"
        }
      );

  }
);


// =======================================================
// DATABASE
// =======================================================

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/jk_tourism";

mongoose
  .connect(MONGO_URI)
  .then(() => {

    console.log(
      "✅ Mongo connected"
    );

  })
  .catch((error) => {

    console.error(
      "⚠️ Mongo connection error:",
      error?.message || error
    );

  });


// =======================================================
// SERVER
// =======================================================

const PORT =
  process.env.PORT || 8080;

app.listen(
  PORT,
  () => {

    console.log(
      `🚀 Server is listening on http://localhost:${PORT}`
    );

  }
);


// =======================================================
// EXPORT
// =======================================================

module.exports = app;