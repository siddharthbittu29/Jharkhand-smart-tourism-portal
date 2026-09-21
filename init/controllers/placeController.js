// ============================================================
// JHARKHAND TOURISM — PLACE CONTROLLER
// File: init/controllers/placeController.js
//
// Responsibilities:
// - List tourism destinations
// - Show a single destination
//
// Existing route/view contracts are preserved.
// ============================================================

const Place =
  require("../models/place");


// ============================================================
// GET /places
// List all destinations
// ============================================================

exports.listPlaces = async (req, res) => {

  try {

    /*
     * Keep the existing data contract.
     *
     * The current Place schema does not use a `published`
     * filter, so all stored places are returned.
     */
    const places =
      await Place
        .find()
        .sort({
          createdAt: -1
        })
        .lean();


    return res.render(
      "places/index",
      {
        places
      }
    );

  } catch (error) {

    console.error(
      "❌ Error loading places:",
      error
    );

    return res.status(500).send(
      "Unable to load destinations right now."
    );
  }
};


// ============================================================
// GET /places/:id
// Show one destination
//
// Accepts:
// - place_id
// - slug
// - name
// ============================================================

exports.showPlace = async (req, res) => {

  try {

    const id =
      String(
        req.params.id || ""
      ).trim();


    if (!id) {

      return res.status(404).send(
        "Place not found"
      );
    }


    /*
     * Preserve compatibility with the
     * existing Place schema.
     */
    const place =
      await Place
        .findOne({
          $or: [
            {
              place_id: id
            },
            {
              slug: id
            },
            {
              name: id
            }
          ]
        })
        .lean();


    if (!place) {

      return res.status(404).send(
        "Place not found"
      );
    }


    return res.render(
      "places/show",
      {
        place
      }
    );

  } catch (error) {

    console.error(
      "❌ Error loading destination:",
      error
    );

    return res.status(500).send(
      "Unable to load this destination right now."
    );
  }
};