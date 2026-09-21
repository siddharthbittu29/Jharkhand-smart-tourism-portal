// ============================================================
// JHARKHAND TOURISM — PLACES DATABASE SEED
// File: init/seed/places_seed.js
//
// Purpose:
// - Seed the MongoDB Place collection from places_data.js
// - Keep one canonical source of destination data
// - Remove the old synthetic/placeholder dataset
// - Store local working image paths
// ============================================================

const fs =
  require("fs");

const path =
  require("path");

const mongoose =
  require("mongoose");

const Place =
  require("../models/place");

const placesData =
  require("../data/places_data");


// ============================================================
// CONFIG
// ============================================================

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/jk_tourism";

const dataDirectory =
  path.join(
    __dirname,
    "..",
    "data"
  );

const jsonOutput =
  path.join(
    dataDirectory,
    "places.json"
  );


// ============================================================
// VALIDATION
// ============================================================

if (
  !Array.isArray(
    placesData
  ) ||
  placesData.length === 0
) {

  console.error(
    "❌ No places found in places_data.js"
  );

  process.exit(1);
}


// ============================================================
// PREPARE DATA
// ============================================================

const places =
  placesData.map(
    (place) => {

      const imageUrl =
        place.image ||
        "";

      return {

        place_id:
          place.place_id,

        name:
          place.name,

        district:
          place.district,

        category:
          place.category,

        description:
          place.long_desc ||
          place.short_desc ||
          "",

        images:
          imageUrl
            ? [
                {
                  url:
                    imageUrl,

                  caption:
                    place.name
                }
              ]
            : [],

        createdAt:
          new Date(),

        updatedAt:
          new Date()

      };
    }
  );


// ============================================================
// WRITE JSON COPY
// ============================================================

try {

  if (
    !fs.existsSync(
      dataDirectory
    )
  ) {

    fs.mkdirSync(
      dataDirectory,
      {
        recursive:
          true
      }
    );
  }


  /*
   * Keep places.json synchronized
   * with the canonical places_data.js.
   */
  fs.writeFileSync(
    jsonOutput,

    JSON.stringify(
      places,
      null,
      2
    ),

    "utf8"
  );

  console.log(
    `✅ Wrote ${places.length} places to init/data/places.json`
  );

} catch (error) {

  console.error(
    "⚠️ Could not write places.json:",
    error
  );
}


// ============================================================
// SEED MONGODB
// ============================================================

async function seedPlaces() {

  try {

    await mongoose.connect(
      MONGO_URI
    );

    console.log(
      "✅ Connected to MongoDB:",
      MONGO_URI
    );


    // --------------------------------------------------------
    // Remove the previous destination catalogue.
    // --------------------------------------------------------

    await Place.deleteMany({});

    console.log(
      "🧹 Removed existing Place documents."
    );


    // --------------------------------------------------------
    // Insert canonical dataset.
    // --------------------------------------------------------

    const inserted =
      await Place.insertMany(
        places,
        {
          ordered:
            true
        }
      );


    console.log(
      `✅ Inserted ${inserted.length} destinations into MongoDB.`
    );


    // --------------------------------------------------------
    // Final count
    // --------------------------------------------------------

    const count =
      await Place.countDocuments();


    console.log(
      `📍 MongoDB now contains ${count} destinations.`
    );


    console.log(
      "✅ Places seed completed successfully."
    );

  } catch (error) {

    console.error(
      "❌ Places seed failed:",
      error
    );

    process.exitCode =
      1;

  } finally {

    await mongoose.disconnect();

    console.log(
      "🔌 MongoDB connection closed."
    );
  }
}


// ============================================================
// RUN
// ============================================================

seedPlaces();