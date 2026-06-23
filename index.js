// index.js
// =======================================================
// JK Tourism — Express + EJS (with layouts) base server
// - Fixes duplicate router declarations
// - Provides global navbar + logoPath
// - Adds routes: /, /places, /book-hotels, /festivals, /gallery, /smart-tourism, /contact
// - Keeps existing routers in init/routes/* if present (optional mounts)
// =======================================================

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const morgan = require("morgan");
const expressLayouts = require("express-ejs-layouts"); // ✅ ensure installed
require("dotenv").config();

const app = express();

// -------------------- MIDDLEWARE -----------------------
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(morgan("dev"));

// -------------------- VIEWS + STATIC -------------------
// Views live in: init/views
// Public assets (css/js/img) live in: init/public
const VIEWS_DIR = path.join(__dirname, "init", "views");
const PUBLIC_DIR = path.join(__dirname, "init", "public");

app.set("view engine", "ejs");
app.set("views", VIEWS_DIR);

// EJS layouts (uses views/layout.ejs)
app.use(expressLayouts);
app.set("layout", "layout");

// Serve static files
app.use(express.static(PUBLIC_DIR)); // e.g. /images/logo.png maps to init/public/images/logo.png

// -------------------- GLOBAL LOCALS --------------------
// Basic i18n-safe defaults (prevents EJS ReferenceError)
const T = {
  en: {
    sitemap: "Sitemap",
    skip: "Skip To Main Content",
    access: "Accessibility",
    about: "About Us",
    contact: "Contact Us",
    reservations: "JTDC Reservations",
    helpline: "Tourism Helpline",
  },
  hi: {
    sitemap: "साइटमैप",
    skip: "मुख्य सामग्री पर जाएँ",
    access: "सुलभता",
    about: "हमारे बारे में",
    contact: "संपर्क करें",
    reservations: "जे टी डी सी आरक्षण",
    helpline: "पर्यटन हेल्पलाइन",
  },
};

// Make lang, t, currentPath, and logoPath globally available in every view
app.use((req, res, next) => {
  const cookieLang = req.cookies?.lang;
  const lang = cookieLang === "hi" ? "hi" : "en";
  res.locals.lang = lang;
  res.locals.t = T[lang];

  // Active nav highlighting
  res.locals.currentPath = req.path;

  // ✅ Global logo (put your file at init/public/images/jharkhand_tourism_logo_final.png)
  res.locals.logoPath = "/images/jharkhand_tourism_logo_final.png";

  next();
});

// -------------------- LANGUAGE SWITCH ------------------
app.post("/lang", (req, res) => {
  const lang = req.body?.lang === "hi" ? "hi" : "en";
  res.cookie("lang", lang, { httpOnly: false, maxAge: 31536000000 });
  res.redirect(req.get("Referer") || "/");
});

// -------------------- OPTIONAL ROUTERS -----------------
// These are mounted only if files exist, so you won’t crash if a router is missing.
function tryMount(mountPath, relPathFromRoot) {
  try {
    const router = require(relPathFromRoot);
    app.use(mountPath, router);
    console.log(`✅ Mounted ${mountPath} from ${relPathFromRoot}`);
  } 
  catch (e) {
  console.error("MOUNT ERROR:");
  console.error(e);
}
}

// Mount once — DO NOT duplicate variable names
tryMount("/listings", "./init/routes/listings");
tryMount("/places", "./init/routes/places");
tryMount("/feedback", "./init/routes/feedback");
tryMount("/downloads", "./init/routes/downloads");
tryMount("/likes", "./init/routes/likes");
tryMount("/auth", "./init/routes/auth");
tryMount("/smart-tourism", "./init/routes/smart-tourism");
tryMount("/hotels", "./init/routes/hotels");
tryMount("/dashboard", "./init/routes/dashboard");
tryMount("/wishlist", "./init/routes/wishlist");
tryMount("/planner", "./init/routes/planner");
tryMount("/pdf", "./init/routes/pdf");


// -------------------- BASIC PAGES ----------------------
// Use render callback to provide a simple fallback HTML if the view file is missing.
// That way, you never get 500s during development.

app.get("/", (req, res) => {
  res.render("home", {}, (err, html) => {
    if (err) return res.send("<h1>Home</h1><p>Welcome to JK Tourism.</p>");
    res.send(html);
  });
});

// app.get("/places", (req, res) => {
//   res.render("places/index", {}, (err, html) => {
//     if (err) return res.send("<h1>Places</h1><p>Explore destinations in Jharkhand.</p>");
//     res.send(html);
//   });
// });

app.get("/book-hotels", (req, res) => {
  res.render("book-hotels/index", {}, (err, html) => {
    if (err) {
      return res.send(`
        <h1>Book Hotels</h1>
        <p>Hotel booking integration coming soon.</p>
      `);
    }
    res.send(html);
  });
});

app.get("/festivals", (req, res) => {
  res.render("festivals/index", {}, (err, html) => {
    if (err) return res.send("<h1>Festivals</h1><p>Discover cultural festivals of Jharkhand.</p>");
    res.send(html);
  });
});

app.get("/gallery", (req, res) => {
  res.render("gallery/index", {}, (err, html) => {
    if (err) return res.send("<h1>Gallery</h1><p>Photos and videos showcasing Jharkhand.</p>");
    res.send(html);
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {}, (err, html) => {
    if (err) return res.send("<h1>Contact Us</h1><p>Email: itmanager@jharkhandtourism.com</p>");
    res.send(html);
  });
});

// Your “smart tourism” page (so /smart-tourism doesn’t 404)
app.get("/smart-tourism", (req, res) => {
  res.render("smart-tourism/index", {}, (err, html) => {
    if (err) {
      return res.send(`
        <h1>Smart Tourism</h1>
        <p>Digital platform for eco & cultural tourism in Jharkhand.</p>
      `);
    }
    res.send(html);
  });
});

// -------------------- SITEMAP + HEALTH -----------------
app.get("/sitemap.xml", (req, res) => {
  const BASE = process.env.BASE_URL || "http://localhost:8080";
  res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE}/</loc><priority>1.0</priority></url>
  <url><loc>${BASE}/places</loc><priority>0.8</priority></url>
  <url><loc>${BASE}/book-hotels</loc><priority>0.7</priority></url>
  <url><loc>${BASE}/festivals</loc><priority>0.6</priority></url>
  <url><loc>${BASE}/gallery</loc><priority>0.6</priority></url>
  <url><loc>${BASE}/smart-tourism</loc><priority>0.6</priority></url>
  <url><loc>${BASE}/contact</loc><priority>0.5</priority></url>
</urlset>`);
});

app.get("/health", (req, res) => res.json({ ok: true }));


// // Objectives & Government Vision page
// app.get('/smart-tourism/objectives', (req, res) => {
//   res.render('smart-tourism/objectives', { title: 'Objectives & Government Vision' });
// });

// Features page
// app.get("/smart-tourism/features", (req, res) => {
//   res.render("smart-tourism/features", { title: "Smart Tourism Platform – Features" });
// });

// // 

// // -------------- Tourist User Journey page
// app.get('/smart-tourism/journey', (req, res) => {
//   res.render('smart-tourism/journey', { title: 'Tourist User Journey' });
// });

// app.get('/smart-tourism/journey', (req, res) => {
//   res.render('smart-tourism/journey', { title: 'Tourist User Journey' });
// });

// // Slide 6 — Architecture + System Flow
// app.get('/smart-tourism/architecture', (req, res) => {
//   res.render('smart-tourism/architecture', { title: 'Implementation Architecture + System Flow' });
// });



// const placesRouter = require('./init/routes/places');
// app.use('/places', placesRouter);




const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jk_tourism';
mongoose.connect(MONGO_URI).then(()=>console.log('Mongo connected')).catch(err=>console.error(err));

// -------------------- 404 (LAST) -----------------------
app.use((req, res) => {
  res.status(404).render("404", {}, (err, html) => {
    if (err) {
      return res
        .status(404)
        .send("<h1>Page not found</h1><p>We couldn't find what you were looking for.</p>");
    }
    res.send(html);
  });
});

// -------------------- START SERVER ---------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});
module.exports = app;
